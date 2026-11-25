// @vitest-environment jsdom
// Corrections du « premier écran » (audit d'utilisabilité, round 4).
// Trois promesses affichées avant le premier contenu utile doivent dire la vérité :
//   - la durée de l'épreuve (4 h 30 = 270 min, lue sur les 18 en-têtes 2013→2026, cf.
//     plans/sources/REGISTRE.md) n'est écrite qu'une fois : l'en-tête la dérive de la constante ;
//   - la mission « 3 minutes » ne s'ouvre pas sur « بقيت 24 دقيقة » ;
//   - un libellé de bouton n'utilise pas un chiffre arabo-indien isolé (illisible à côté du reste).

import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SujetsOfficiels from '../components/SujetsOfficiels';
import MicroNoeuds from '../components/MicroNoeuds';
import { DUREE_BAC_MIN } from '../utils/simulation';
import { SUJETS_OFFICIELS } from '../data/sujetsOfficiels';
import { libelleMission } from '../utils/planDuJour';
import { migrerEtat } from '../utils/etat';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

function monter(element: React.ReactElement) {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  return act(async () => root!.render(element));
}

describe('durée de l’épreuve — une seule source de vérité', () => {
  it('la constante vaut 270 min (4 h 30) et chaque sujet la reprend', () => {
    expect(DUREE_BAC_MIN).toBe(270);
    for (const s of SUJETS_OFFICIELS) expect(s.dureeMin).toBe(DUREE_BAC_MIN);
  });

  it('l’en-tête des sujets est dérivé de la constante (4 سا 30 د)', async () => {
    await monter(
      createElement(SujetsOfficiels, {
        onOuvrirSynthese: () => {},
        onOuvrirRecherche: () => {},
        onFermer: () => {},
      }),
    );
    const texte = zone!.textContent ?? '';
    const heures = Math.floor(DUREE_BAC_MIN / 60);
    const minutes = DUREE_BAC_MIN % 60;
    expect(texte).toContain(`${heures} سا ${minutes} د`);
  });

  it('l’en-tête ne se présente plus comme un simple « squelette » de sujet', async () => {
    await monter(
      createElement(SujetsOfficiels, {
        onOuvrirSynthese: () => {},
        onOuvrirRecherche: () => {},
        onFermer: () => {},
      }),
    );
    expect(zone!.textContent).not.toContain('بنية الموضوع، لا الموضوع نفسه');
  });
});

describe('micro-nœuds — la promesse de 3 minutes est tenue', () => {
  it('affiche la durée du prochain nœud, pas la séance entière', async () => {
    const etat = migrerEtat({});
    const lessonId = 'u1-l1';
    await monter(
      createElement(MicroNoeuds, {
        etat,
        lessonId,
        onOuvrirNoeud: () => {},
        onOuvrirSeanceComplete: () => {},
        onReparation: () => {},
        onLireLecon: () => {},
        onFermer: () => {},
      }),
    );
    const texte = zone!.textContent ?? '';
    expect(texte).toMatch(/\d+ دقائق الآن/);
    expect(texte).not.toMatch(/بقيت \d+ دقيقة/);
    // La séance complète reste annoncée, mais comme option secondaire.
    expect(texte).toContain('الجلسة الكاملة');
  });
});

describe('libellés de mission — chiffres lisibles', () => {
  it('le bouton « nœud » reprend la durée en chiffres latins', () => {
    const libelle = libelleMission({
      type: 'noeud',
      minutes: 4,
      titre: 't',
      savoirFaire: 's',
      pourquoi: 'p',
      cle: 'c',
    });
    expect(libelle).toBe('ابدأ 4 دقائق');
  });
});
