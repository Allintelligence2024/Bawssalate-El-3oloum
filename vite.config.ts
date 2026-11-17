import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// PWA يدوية: public/manifest.webmanifest + public/sw.js + src/utils/pwa.ts
// لا vite-plugin-pwa (تفادي تعارض الإصدارات)، لا d3/jspdf/motion (تطبيق خفيف 100%).

/**
 * P0.7 — manifeste de précache des chunks.
 * `index.html` ne référence que le chunk d'entrée : les chunks chargés à la demande
 * (Methodologie, domaine1/2/3, supabase) n'y figurent pas. Le service worker ne peut donc
 * pas les découvrir en lisant le HTML. Ce plugin écrit `dist/precache-manifest.json` avec
 * la liste exacte des fichiers `assets/*.js|css` produits par le build ; `public/sw.js` la lit
 * à l'installation et met tous les chunks en cache avant la première ouverture hors ligne.
 * Les PDF, vidéos et autres fichiers de `public/` n'y sont volontairement pas (budget de poids).
 */
function precacheManifest(): Plugin {
  return {
    name: 'kunz-precache-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle)
        .filter((f) => /^assets\/.+\.(js|css)$/.test(f))
        .sort()
        .map((f) => `/${f}`);
      this.emitFile({
        type: 'asset',
        fileName: 'precache-manifest.json',
        source: JSON.stringify({ genere: new Date().toISOString(), assets }, null, 2),
      });
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
