// PWA : le manifeste doit annoncer des icônes PNG réelles (Android n'installe pas
// proprement une app qui n'a qu'un SVG), le service worker doit accepter ces
// fichiers dans son cache, et le HTML doit pointer vers l'icône iOS.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const racine = new URL('../../', import.meta.url).pathname;
const lire = (chemin: string) => readFileSync(racine + chemin, 'utf8');

describe('images de l’application installée', () => {
  const manifeste = JSON.parse(lire('public/manifest.webmanifest')) as {
    theme_color: string;
    background_color: string;
    icons: { src: string; sizes: string; purpose?: string }[];
  };

  it('déclare une icône 192, une 512 et une maskable, toutes présentes', () => {
    const sources = manifeste.icons.map((i) => i.src);
    expect(sources).toContain('/icons/icon-192.png');
    expect(sources).toContain('/icons/icon-512.png');
    expect(sources).toContain('/icons/maskable-512.png');
    expect(manifeste.icons.find((i) => i.src === '/icons/maskable-512.png')?.purpose).toBe('maskable');
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
    expect(sw).toContain("'/icons/icon-192.png'");
    expect(sw).toContain("'/icons/icon-512.png'");
    // La maskable et l'icône iOS ne servent qu'à l'installation (en ligne) :
    // les précacher coûtait 37 ko de coquille pour rien.
    expect(sw).not.toContain("'/icons/maskable-512.png'");
    expect(sw).not.toContain("'/icons/apple-touch-180.png'");
    // Le pré-cache de Vite doit lister exactement les mêmes fichiers.
    expect(lire('vite.config.ts')).toContain("'icons/icon-192.png'");
    expect(lire('vite.config.ts')).toContain("'icons/icon-512.png'");
  });

  it('donne à iOS une icône opaque de 180 px', () => {
    expect(lire('index.html')).toContain('/icons/apple-touch-180.png');
    expect(existsSync(`${racine}public/icons/apple-touch-180.png`)).toBe(true);
  });
});
