// PWA : le manifeste doit annoncer de vraies images matricielles (Android n'installe pas
// proprement une app qui n'a qu'un SVG), le service worker doit accepter ces fichiers dans son
// cache, et le HTML doit pointer vers l'icône iOS.
//
// v0.13 : les icônes 192/512 passent en WebP (39 ko au lieu de 44 ko, 10 ko au lieu de 9 ko,
// mais surtout une qualité photographique impossible en PNG8). iOS, qui exige un PNG opaque,
// garde son `apple-touch-180.png`, jamais précaché. Le visuel officiel remplace le pirate :
// plus aucune vidéo de 2 Mo dans `public/`.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';

const racine = new URL('../../', import.meta.url).pathname;
const lire = (chemin: string) => readFileSync(racine + chemin, 'utf8');
const poids = (chemin: string) => statSync(racine + chemin).size;

describe('images de l’application installée', () => {
  const manifeste = JSON.parse(lire('public/manifest.webmanifest')) as {
    theme_color: string;
    background_color: string;
    icons: { src: string; sizes: string; type?: string; purpose?: string }[];
  };

  it('déclare une icône 192, une 512 et une maskable, toutes présentes', () => {
    const sources = manifeste.icons.map((i) => i.src);
    expect(sources).toContain('/icons/icon-192.webp');
    expect(sources).toContain('/icons/icon-512.webp');
    expect(sources).toContain('/icons/maskable-512.webp');
    expect(manifeste.icons.find((i) => i.src === '/icons/maskable-512.webp')?.purpose).toBe('maskable');
    expect(manifeste.icons.find((i) => i.src === '/icons/icon-192.webp')?.sizes).toBe('192x192');
    // Le type annoncé doit correspondre au format réel : un .webp annoncé image/png
    // empêche l'installation sur certains launchers Android.
    for (const icone of manifeste.icons) {
      if (icone.src.endsWith('.webp')) expect(icone.type).toBe('image/webp');
    }
    for (const i of manifeste.icons) {
      expect(existsSync(`${racine}public${i.src}`), `absent : ${i.src}`).toBe(true);
    }
  });

  it('reprend les couleurs de la peau (papier au démarrage, pas du noir)', () => {
    expect(manifeste.background_color).toBe('#fffef8');
    expect(manifeste.theme_color).toBe('#225342');
    expect(lire('index.html')).toContain('content="#225342"');
  });

  it('précache les deux icônes du manifeste, pas les autres', () => {
    const sw = lire('public/sw.js');
    // La coquille hors ligne embarque ce que l'écran d'accueil affiche.
    expect(sw).toContain("'/icons/icon-192.webp'");
    expect(sw).toContain("'/icons/icon-512.webp'");
    // La maskable et l'icône iOS ne servent qu'à l'installation (en ligne) :
    // les précacher coûtait de la coquille pour rien.
    expect(sw).not.toContain("'/icons/maskable-512.webp'");
    expect(sw).not.toContain("'/icons/apple-touch-180.png'");
    // Le pré-cache de Vite doit lister exactement les mêmes fichiers.
    expect(lire('vite.config.ts')).toContain("'icons/icon-192.webp'");
    expect(lire('vite.config.ts')).toContain("'icons/icon-512.webp'");
  });

  it('donne à iOS une icône opaque de 180 px', () => {
    expect(lire('index.html')).toContain('/icons/apple-touch-180.png');
    expect(existsSync(`${racine}public/icons/apple-touch-180.png`)).toBe(true);
  });
});

describe('poids des visuels (le téléphone de l’élève n’a pas de fibre)', () => {
  it('le portrait de la mascotte reste sous 35 ko et les deux guides sous 100 ko chacun', () => {
    expect(poids('public/mascotte.webp')).toBeLessThanOrEqual(35_000);
    expect(poids('public/guide-clair.webp')).toBeLessThanOrEqual(100_000);
    expect(poids('public/guide-sombre.webp')).toBeLessThanOrEqual(100_000);
  });

  it('aucune vidéo ni ancien visuel pirate ne subsiste dans les fichiers publics', () => {
    for (const mort of [
      'public/ouverture.mp4',
      'public/personnage-pirate.webp',
      'public/personnage-pirate.png',
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/maskable-512.png',
    ]) {
      expect(existsSync(racine + mort), `encore présent : ${mort}`).toBe(false);
    }
  });

  it('le code ne référence plus les fichiers supprimés', () => {
    for (const source of ['src/App.tsx', 'public/sw.js', 'vite.config.ts']) {
      const texte = lire(source);
      expect(texte, `${source} référence ouverture.mp4`).not.toContain('ouverture.mp4');
      expect(texte, `${source} référence personnage-pirate`).not.toContain('personnage-pirate');
    }
  });
});
