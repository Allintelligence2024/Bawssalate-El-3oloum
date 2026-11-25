// @vitest-environment jsdom
// «الموضوع كاملًا · 1-2-3» — les boutons font vraiment quelque chose.
//
// Ce test clique le parcours entier du sujet 2022-1 comme un élève : افهم → تحقّق → اكتب → قارن.
// Il protège trois promesses : les quatre temps s'enchaînent, l'auto-évaluation enregistre la
// bonne clé et fait avancer, et les éléments officiels ne s'affichent qu'après la demande.
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SujetGuide from '../components/SujetGuide';
import { parcoursSujet } from '../utils/parcoursSujet';
import { etatVierge } from '../types';
import type { NiveauMaitrise } from '../utils/entrainement';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

function monter(element: ReturnType<typeof createElement>) {
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  return act(async () => root!.render(element));
}

const texte = () => zone!.textContent ?? '';

/** Clique le premier bouton dont le texte contient `motif`. */
async function cliquer(motif: string) {
  const bouton = [...zone!.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes(motif));
  expect(bouton, `bouton « ${motif} » introuvable`).toBeTruthy();
  await act(async () => {
    bouton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  return bouton!;
}

const parcours = parcoursSujet('2022-1')!;

describe('parcours guidé du sujet 2022-1', () => {
  it('les quatre temps s’enchaînent et l’auto-évaluation fait avancer', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const evaluees: { cle: string; niveau: NiveauMaitrise }[] = [];
    const brouillons: { cle: string; texte: string }[] = [];
    let ferme = 0;

    await monter(
      createElement(SujetGuide, {
        sujetId: '2022-1',
        parcoursImpose: parcours,
        maitrise: {},
        brouillons: {},
        etat: etatVierge(),
        onEvaluer: (cle: string, niveau: NiveauMaitrise) => evaluees.push({ cle, niveau }),
        onBrouillon: (cle: string, texte2: string) => brouillons.push({ cle, texte: texte2 }),
        onFermer: () => {
          ferme += 1;
        },
      }),
    );

    // En-tête : le sujet, l'exercice et le rang de la consigne.
    expect(texte()).toContain('التعليمة 1');
    expect(texte()).toContain(parcours.etapes[0].texte.slice(0, 20));

    // Temps 1 → 2
    await cliquer('تحقّق');
    const coches = [...zone!.querySelectorAll('button[aria-pressed]')];
    expect(coches.length).toBeGreaterThanOrEqual(3);
    await act(async () => {
      coches[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(coches[0].getAttribute('aria-pressed')).toBe('true');

    // Temps 2 → 3 : on écrit, le brouillon est remonté à l'appelant.
    await cliquer('اكتب');
    const zoneTexte = zone!.querySelector('textarea')!;
    expect(zoneTexte).toBeTruthy();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(zoneTexte, 'ملاحظة: الغشاء فسيفسائي…');
      zoneTexte.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(brouillons.at(-1)?.cle).toBe(parcours.etapes[0].cle);

    // Temps 3 → 4 : les éléments officiels sont cachés tant qu'on ne les demande pas.
    await cliquer('قارن');
    const premierElement = parcours.etapes[0].elements[0];
    expect(texte()).not.toContain(premierElement);
    await cliquer('أظهر عناصر الإجابة');
    expect(texte()).toContain(premierElement);

    // Auto-évaluation : la bonne clé, et on passe à la consigne suivante.
    await cliquer('كتبتُ جوابًا كاملًا');
    expect(evaluees).toEqual([{ cle: parcours.etapes[0].cle, niveau: 2 }]);
    expect(texte()).toContain('التعليمة 2');

    // La sortie explicite fonctionne aussi.
    await cliquer('خروج');
    expect(ferme).toBe(1);
  });

  it('une consigne sans éléments de réponse le dit, sans rien inventer', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const sansElements = {
      ...parcours,
      etapes: [{ ...parcours.etapes[0], elements: [], sourceCorrige: undefined }],
      exercices: [{ ...parcours.exercices[0], etapes: [] }],
    };
    await monter(
      createElement(SujetGuide, {
        sujetId: '2022-1',
        parcoursImpose: sansElements,
        maitrise: {},
        brouillons: {},
        etat: etatVierge(),
        onEvaluer: () => {},
        onBrouillon: () => {},
        onFermer: () => {},
      }),
    );
    await cliquer('قارن');
    expect(texte()).toContain('لا تتوفّر عناصر إجابة مسجّلة');
  });

  it('le dernier temps mène à l’écran de fin, sans note ni pourcentage', async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const uneSeule = {
      ...parcours,
      etapes: [parcours.etapes[0]],
      exercices: [{ ...parcours.exercices[0], etapes: [parcours.etapes[0]] }],
    };
    await monter(
      createElement(SujetGuide, {
        sujetId: '2022-1',
        parcoursImpose: uneSeule,
        maitrise: {},
        brouillons: {},
        etat: etatVierge(),
        onEvaluer: () => {},
        onBrouillon: () => {},
        onFermer: () => {},
      }),
    );
    await cliquer('قارن');
    await cliquer('كتبتُ جوابًا ناقصًا');
    expect(texte()).toContain('الموضوع كامل');
    expect(texte()).not.toMatch(/\/\s*20|%|Game Over/i);
  });
});
