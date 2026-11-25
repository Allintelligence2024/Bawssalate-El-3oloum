// @vitest-environment jsdom
// « ملفّي » : la fiche A4 imprimable. Elle doit refléter l'état réel et rester
// anti-anxiété (aucune note, aucun pourcentage affiché).
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import FicheEleve from '../components/FicheEleve';
import { etatVierge, type Etat } from '../types';
import { TOTAL_LECONS } from '../data/programme';
import { xpDe } from '../utils/xp';

let root: Root | undefined;
let zone: HTMLDivElement | undefined;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  zone?.remove();
  zone = undefined;
});

async function rendre(etat = etatVierge()) {
  zone = document.createElement('div');
  document.body.append(zone);
  root = createRoot(zone);
  await act(async () => {
    root!.render(createElement(FicheEleve, { etat, onFermer: () => {} }));
  });
  return zone;
}

describe('ملفّي — la fiche A4', () => {
  it('affiche l’identité et la progression réelles', async () => {
    const etat: Etat = {
      ...etatVierge(),
      nom: 'أمينة',
      compte: { email: 'amina@example.invalid', motDePasse: '', jeton: 'j', wilaya: '31', daira: '01', creeLe: '2026-09-01' },
      progression: {
        a: { statut: 'terminee' as const, phases: [1, 2, 3, 4, 5, 6], minutes: 60, repetitions: 1, intervalle: 2, facilite: 2.5 },
      },
    };
    const el = await rendre(etat);
    const texte = el.textContent ?? '';
    expect(texte).toContain('أمينة');
    expect(texte).toContain(`1 من ${TOTAL_LECONS}`);
    expect(texte).toContain('وهران');
    // Anti-anxiété : la fiche le dit elle-même, et n'affiche jamais « /20 ».
    expect(texte).toContain('لا علامة على 20');
    expect(texte).not.toContain('/20');
  });

  it('compte les étapes du Bac et les cartes kafaa', async () => {
    const etat: Etat = {
      ...etatVierge(),
      bacEtapes: { 'a:1:0:0': 3 as const, 'a:1:0:1': 2 as const },
      kafaa: {
        methodo0: { verbe: 'فسّر', exercice: 'وثيقة', erreur: 'خلط', repetitions: 1, intervalle: 2, facilite: 2.5, fragile: true },
      },
    };
    const el = await rendre(etat);
    const texte = el.textContent ?? '';
    expect(texte).toContain('2 خطوة');
    expect(texte).toContain('1 بطاقة');
    expect(texte).toContain('1 هشّة');
  });

  it('offre l’impression sans jamais calculer de note', async () => {
    const etat = etatVierge();
    const el = await rendre(etat);
    const bouton = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('A4'));
    expect(bouton).toBeDefined();
    // L'XP affiché est celui du moteur, pas un chiffre inventé par la fiche.
    expect(el.textContent).toContain(`${xpDe(etat)} XP`);
  });
});
