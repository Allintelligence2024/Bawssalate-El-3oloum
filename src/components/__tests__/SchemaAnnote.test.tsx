// @vitest-environment jsdom
// Architecture d'annotation (Étape 0) — le contrat qui rend la règle « zéro texte IA » tenable :
// le fichier visuel est muet, et TOUT ce qui se lit (numéros, termes arabes, précisions) est
// produit ici, en HTML, à partir du registre.
//
// Ce que ce fichier prouve :
//  - une pastille par annotation, positionnée en pourcentage (donc juste à toute largeur) ;
//  - la légende arabe ordonnée, en RTL, avec les mêmes numéros que les pastilles ;
//  - l'image reste `loading="lazy"` + dimensions déclarées (pas de saut de mise en page) ;
//  - un visuel sans annotation n'affiche ni pastille ni légende vide.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { LegendeAnnotations, VisuelAnnote } from '../SchemaAnnote';
import { ILLUSTRATIONS_LECONS, type IllustrationLecon } from '../../data/illustrationsLecons';
import { SCHEMAS_SVT } from '../../data/schemasSvt';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => racine!.render(noeud));
  return hote;
}

const avecAnnotations = (fichier: string): IllustrationLecon => {
  const entree = ILLUSTRATIONS_LECONS.find((i) => i.fichier === fichier);
  if (!entree) throw new Error(`illustration absente du registre : ${fichier}`);
  return entree;
};

describe('VisuelAnnote — image muette + pastilles numérotées', () => {
  it('pose une pastille par annotation, aux coordonnées du registre', async () => {
    const illustration = avecAnnotations('u3-specificite.svg');
    const zone = await rendre(<VisuelAnnote illustration={illustration} />);

    const pastilles = [...zone.querySelectorAll('span[style]')].filter((s) =>
      /left:\s*[\d.]+%/.test(s.getAttribute('style') ?? ''),
    );
    expect(pastilles).toHaveLength(illustration.annotations!.length);

    illustration.annotations!.forEach((a, index) => {
      const style = pastilles[index].getAttribute('style') ?? '';
      expect(style).toContain(`left: ${a.x}%`);
      expect(style).toContain(`top: ${a.y}%`);
      expect(pastilles[index].textContent).toBe(String(a.num));
    });
  });

  it('garde l’image en chargement différé, dimensionnée et décrite en arabe', async () => {
    const illustration = avecAnnotations('u1-traduction.webp');
    const zone = await rendre(<VisuelAnnote illustration={illustration} />);
    const img = zone.querySelector('img')!;
    expect(img.getAttribute('src')).toContain('u1-traduction.webp');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.getAttribute('width')).toBe(String(illustration.largeur));
    expect(img.getAttribute('height')).toBe(String(illustration.hauteur));
    expect(img.getAttribute('alt')).toBe(illustration.altAr);
    // Le calque de pastilles est décoratif : le lecteur d'écran lit la légende, pas les numéros.
    expect(img.parentElement!.querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });

  it('sert aussi les schémas vectoriels (même contrat, autre fichier)', async () => {
    const zone = await rendre(<VisuelAnnote illustration={avecAnnotations('u3-michaelis.svg')} />);
    expect(zone.querySelector('img')!.getAttribute('src')).toMatch(/u3-michaelis\.svg$/);
  });
});

describe('LegendeAnnotations — la parole arabe est dans l’application', () => {
  it('affiche les 8 légendes de u1-traduction dans l’ordre, en RTL', async () => {
    const illustration = avecAnnotations('u1-traduction.webp');
    const zone = await rendre(<LegendeAnnotations illustration={illustration} />);
    const liste = zone.querySelector('ol')!;
    expect(liste.getAttribute('dir')).toBe('rtl');
    expect(liste.getAttribute('aria-label')).toBe('مفتاح المخطط');
    const items = [...liste.querySelectorAll('li')];
    expect(items).toHaveLength(illustration.annotations!.length);
    items.forEach((li, index) => {
      const a = illustration.annotations![index];
      expect(li.textContent).toContain(String(a.num));
      expect(li.textContent).toContain(a.labelAr);
      if (a.detailAr) expect(li.textContent).toContain(a.detailAr);
    });
  });

  it('rend toutes les légendes des 15 schémas sans exception', async () => {
    for (const illustration of SCHEMAS_SVT) {
      expect(illustration.annotations!.length).toBeGreaterThan(0);
      const zone = await rendre(<LegendeAnnotations illustration={illustration} />);
      const items = [...zone.querySelectorAll('li')];
      expect(items, illustration.fichier).toHaveLength(illustration.annotations!.length);
      // Chaque terme officiel apparaît tel quel : aucune traduction à la volée côté UI.
      for (const a of illustration.annotations!) {
        expect(items.some((li) => li.textContent?.includes(a.labelAr)), `${illustration.fichier} #${a.num}`).toBe(true);
      }
      act(() => racine?.unmount());
      hote?.remove();
      racine = null;
      hote = null;
    }
  });

  it('ne rend rien pour un visuel sans annotation (les 21 WebP du manuel)', async () => {
    const legacy = ILLUSTRATIONS_LECONS.find((i) => i.typeVisuel === 'webp_legacy')!;
    const zone = await rendre(<LegendeAnnotations illustration={legacy} />);
    expect(zone.innerHTML).toBe('');
  });
});
