import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// PWA يدوية: public/manifest.webmanifest + public/sw.js + src/utils/pwa.ts
// لا vite-plugin-pwa (تفادي تعارض الإصدارات)، لا d3/jspdf/motion (تطبيق خفيف 100%).

/** Manifeste versionné des chunks et ressources locales : taille approximative non compressée.
 *  Le worker et le HTML reçoivent le même identifiant après génération du bundle.
 *
 *  Deux niveaux, pour qu'une app « Lite » le reste sur un forfait mobile :
 *   - `statiques` : la COQUILLE. Interface, image de démarrage, icône. Toujours téléchargée.
 *   - `contenu`   : le CONTENU LOURD (leçons HTML pré-rendues, laboratoire Boussole, PDF).
 *                   Jamais téléchargé automatiquement : seulement par le bouton explicite
 *                   de téléchargement hors ligne, qui affiche son poids avant de commencer.
 *
 *  Le découpage est délibéré : sans lui le précache dépassait 8 Mio, dont ~4,2 Mio de
 *  contenu que beaucoup d'élèves n'ouvriront jamais. */
// Les icônes PNG de l'app installée font partie de la coquille : le manifeste les
// annonce, et l'écran d'accueil doit les afficher même hors ligne.
// Hors ligne, on ne garde que ce que l'écran d'accueil utilise vraiment :
// les deux icônes du manifeste. La maskable et l'icône iOS ne servent qu'à
// l'installation (en ligne) et pèseraient 37 ko de plus dans la coquille.
const COQUILLE = [
  'icon.svg',
  'manifest.webmanifest',
  'mascotte.webp',
  'personnage-pirate.webp',
  'icons/icon-192.png',
  'icons/icon-512.png',
];
const CONTENU_FIXE = ['boussole/index.html', 'boussole/cahier-bac-2022.pdf', 'boussole/memo.pdf'];

function precacheManifest(): Plugin {
  let identifiant = '';
  return {
    name: 'kunz-precache-manifest',
    apply: 'build',
    generateBundle(_options, bundle) {
      // N'entrent dans le précache que les chunks réellement nécessaires hors ligne :
      //  - les assets de démarrage (ceux que le HTML charge) ;
      //  - les écrans lourds déjà chargés paresseusement, qui doivent s'ouvrir sans réseau.
      // Les données de sujets de bac (`SujetsOfficiels`) sont volontairement EXCLUES : c'est le
      // plus gros chunk (≈ 490 ko) et il reste consultable en ligne ; le mettre en cache coûtait
      // 20 % du poids pour un écran qui n'a pas à fonctionner hors connexion en priorité.
      const HORS_PRECACHE = [/^assets\/SujetsOfficiels-/];
      const assets = Object.keys(bundle)
        .filter((f) => /^assets\/.+\.(js|css)$/.test(f))
        .filter((f) => !HORS_PRECACHE.some((r) => r.test(f)))
        .sort().map((f) => `/${f}`);
      const statiques = COQUILLE;
      const contenu = [...CONTENU_FIXE,
        ...readdirSync('public/lecons').filter(f => f.endsWith('.html')).sort().map(f => `lecons/${f}`)];
      const octetsDe = (liste: string[]) => liste.reduce((s, f) => s + statSync(join('public', f)).size, 0);
      const inclus = new Set(assets.map((a) => a.replace(/^\//, '')));
      const octetsAssets = Object.entries(bundle)
        .filter(([f]) => inclus.has(f)).reduce((s, [, item]) =>
          s + Buffer.byteLength(item.type === 'asset' ? item.source : item.code), 0);
      const octetsCoquille = octetsDe(statiques) + octetsAssets;
      const octetsContenu = octetsDe(contenu);

      const hash = createHash('sha256').update(assets.join('\n'))
        .update(readFileSync('public/sw.js')).update(readFileSync('index.html'));
      for (const f of [...statiques, ...contenu]) hash.update(f).update(readFileSync(join('public', f)));
      identifiant = hash.digest('hex').slice(0, 20);
      this.emitFile({ type: 'asset', fileName: 'precache-manifest.json',
        source: JSON.stringify({
          version: identifiant,
          assets,
          statiques: statiques.map(f => `/${f}`),
          contenu: contenu.map(f => `/${f}`),
          octets: octetsCoquille + octetsContenu,
          octetsCoquille,
          octetsContenu,
        }, null, 2) });
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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss(), precacheManifest()],
  server: { host: true, port: 3000, allowedHosts: true },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
