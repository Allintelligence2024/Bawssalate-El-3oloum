import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// PWA يدوية: public/manifest.webmanifest + public/sw.js + src/utils/pwa.ts
// لا vite-plugin-pwa (تفادي تعارض الإصدارات)، لا d3/jspdf/motion (تطبيق خفيف 100%).

/** Manifeste versionné des chunks et ressources locales : taille approximative non compressée.
 *  Le worker et le HTML reçoivent le même identifiant après génération du bundle. */
function precacheManifest(): Plugin {
  let identifiant = '';
  return {
    name: 'kunz-precache-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle)
        .filter((f) => /^assets\/.+\.(js|css)$/.test(f)).sort().map((f) => `/${f}`);
      const statiques = ['boussole/index.html', 'boussole/cahier-bac-2022.pdf', 'boussole/memo.pdf', 'icon.svg', 'manifest.webmanifest', 'mascotte.png', 'personnage-pirate.png',
        'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-180.png',
        ...readdirSync('public/lecons').filter(f => f.endsWith('.html')).sort().map(f => `lecons/${f}`)];
      const hash = createHash('sha256').update(assets.join('\n'))
        .update(readFileSync('public/sw.js')).update(readFileSync('index.html'));
      for (const f of statiques) hash.update(f).update(readFileSync(join('public', f)));
      identifiant = hash.digest('hex').slice(0, 20);
      const octets = statiques.reduce((s, f) => s + statSync(join('public', f)).size, 0) +
        Object.entries(bundle).filter(([f]) => /^assets\/.+\.(js|css)$/.test(f)).reduce((s, [, item]) =>
          s + Buffer.byteLength(item.type === 'asset' ? item.source : item.code), 0);
      this.emitFile({ type: 'asset', fileName: 'precache-manifest.json',
        source: JSON.stringify({ version: identifiant, assets, statiques: statiques.map(f => `/${f}`), octets }, null, 2) });
    },
    writeBundle(options) {
      const dir = options.dir ?? 'dist';
      for (const fichier of ['sw.js', 'index.html']) {
        const chemin = join(dir, fichier);
        writeFileSync(chemin, readFileSync(chemin, 'utf8').replaceAll('__KUNZ_BUILD_ID__', identifiant));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), precacheManifest()],
  server: { host: true, port: 3000, allowedHosts: true },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
