// Flashcards — dérivées des fiches existantes, ouvertes après le protocole, boîtes de Leitner indépendantes du SM-2
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  cartesDeLecon,
  cartesDisponibles,
  leconsOuvertes,
  sessionDuJour,
  repondreCarte,
  resumeCartes,
  TAILLE_SESSION,
} from '../flashcards';
import { CHEMIN } from '../../data/programme';
import { prochainItem, revisionsDues } from '../moteur';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-16T09:00:00'));
});
afterEach(() => vi.useRealTimers());

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, modeIntensif: 'off', ...extra,
  };
}
const terminee = { statut: 'terminee' as const, phases: [1, 2, 3, 4, 5, 6], minutes: 40, repetitions: 1, intervalle: 3, facilite: 2.5, prochaineRevision: '2026-11-19' };

describe('flashcards', () => {
  it('chaque leçon du chemin possède ses 3 cartes (استرجاع / دليل / فخّ), sans contenu inventé', () => {
    const lecons = CHEMIN.filter((c) => c.type === 'lecon') as { type: 'lecon'; id: string }[];
    const sans = lecons.filter((c) => cartesDeLecon(c.id).length < 3);
    expect(sans.map((c) => c.id)).toEqual([]);
    const c = cartesDeLecon(lecons[0].id);
    expect(c.map((x) => x.type)).toEqual(['rappel', 'preuve', 'piege']);
    expect(c.every((x) => x.recto.length > 5 && x.verso.length > 0)).toBe(true);
  });

  it("rien n'est ouvert sur un état vierge ; une leçon terminée ou favorite ouvre ses cartes", () => {
    expect(cartesDisponibles(vierge())).toEqual([]);
    const id = (CHEMIN[0] as { id: string }).id;
    expect(leconsOuvertes(vierge({ progression: { [id]: terminee } }))).toEqual([id]);
    expect(leconsOuvertes(vierge({ favoris: [id] }))).toEqual([id]);
    expect(cartesDisponibles(vierge({ favoris: [id] })).length).toBe(3);
  });

  it('Leitner : connue → boîte +1 (1→3 j→7 j, plafond 3) ; inconnue → boîte 1, demain', () => {
    const a = repondreCarte(undefined, true);
    expect(a).toEqual({ boite: 1, prochaine: '2026-11-17', vues: 1 });
    const b = repondreCarte(a, true);
    expect(b).toEqual({ boite: 2, prochaine: '2026-11-19', vues: 2 });
    const c = repondreCarte(b, true);
    expect(c.boite).toBe(3);
    expect(c.prochaine).toBe('2026-11-23');
    expect(repondreCarte(c, true).boite).toBe(3);
    const e = repondreCarte(c, false);
    expect(e).toEqual({ boite: 1, prochaine: '2026-11-17', vues: 4 });
  });

  it('session : dues (boîte 1 avant 2 avant 3) puis nouvelles, plafonnée à TAILLE_SESSION ; résumé cohérent', () => {
    const ids = (CHEMIN.filter((c) => c.type === 'lecon').slice(0, 6) as { id: string }[]).map((c) => c.id);
    const progression = Object.fromEntries(ids.map((id) => [id, terminee]));
    const etat = vierge({
      progression,
      flashcards: {
        [`${ids[0]}#rappel`]: { boite: 3, prochaine: '2026-11-16', vues: 3 }, // due aujourd'hui, boîte 3
        [`${ids[1]}#rappel`]: { boite: 1, prochaine: '2026-11-15', vues: 1 }, // en retard, boîte 1
        [`${ids[2]}#rappel`]: { boite: 2, prochaine: '2026-11-20', vues: 2 }, // pas due
      },
    });
    const s = sessionDuJour(etat);
    expect(s.length).toBe(TAILLE_SESSION);
    expect(s[0].id).toBe(`${ids[1]}#rappel`);
    expect(s[1].id).toBe(`${ids[0]}#rappel`);
    expect(s.some((c) => c.id === `${ids[2]}#rappel`)).toBe(false);
    const r = resumeCartes(etat);
    expect(r.disponibles).toBe(18);
    expect(r.dues).toBe(17);
    expect(r.parBoite).toEqual({ 1: 1, 2: 1, 3: 1 });
  });

  it('indépendance : répondre à des cartes ne change ni le chemin ni les révisions SM-2 des leçons', () => {
    const id = (CHEMIN[0] as { id: string }).id;
    const avant = vierge({ progression: { [id]: terminee } });
    const apres = { ...avant, flashcards: { [`${id}#rappel`]: repondreCarte(undefined, false) } };
    expect(prochainItem(apres)).toEqual(prochainItem(avant));
    expect(revisionsDues(apres)).toEqual(revisionsDues(avant));
    expect(apres.progression[id].prochaineRevision).toBe('2026-11-19');
  });
});
