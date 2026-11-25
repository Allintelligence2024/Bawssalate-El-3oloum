import { describe, expect, it } from 'vitest';
import {
  MINUTES_MAX_MISSION,
  MINUTES_MIN_MISSION,
  libelleMission,
  missionDuJour,
  revisionsDuesPlafonnees,
  sousTitreMission,
} from '../planDuJour';
import { PLAFOND_DETTE } from '../bridge';
import { etatVierge, type Etat, type ProgressionLecon } from '../../types';
import { UNITES } from '../../data/programme';

/** Toutes les leçons réelles du programme, dans l'ordre. */
const LECONS = UNITES.flatMap((u) => u.lessonIds);

/** Date sûrement due : dans le passé. */
const PASSE = '2020-01-01';

function progressionDue(): ProgressionLecon {
  return {
    statut: 'terminee',
    phases: [1, 2, 3, 4, 5, 6],
    minutes: 46,
    repetitions: 1,
    intervalle: 3,
    facilite: 2.5,
    prochaineRevision: PASSE,
  };
}

function etatAvec(ids: string[], p: ProgressionLecon = progressionDue()): Etat {
  const etat = etatVierge();
  for (const id of ids) etat.progression[id] = { ...p };
  return etat;
}

describe('plafond de révisions — la dette ne s’accumule pas', () => {
  it('le plafond produit est 5', () => {
    expect(PLAFOND_DETTE).toBe(5);
  });

  it('8 révisions dues → 5 retenues, 3 reportées (jamais supprimées)', () => {
    const etat = etatAvec(LECONS.slice(0, 8));
    const { retenues, reportees, toutes } = revisionsDuesPlafonnees(etat);
    expect(toutes).toHaveLength(8);
    expect(retenues).toHaveLength(5);
    expect(reportees).toBe(3);
  });

  it('moins de 5 dues → tout passe, rien à reporter', () => {
    const etat = etatAvec(LECONS.slice(0, 3));
    const r = revisionsDuesPlafonnees(etat);
    expect(r.retenues).toHaveLength(3);
    expect(r.reportees).toBe(0);
  });

  it('aucune due → aucune retenue, aucun report négatif', () => {
    const r = revisionsDuesPlafonnees(etatVierge());
    expect(r.retenues).toEqual([]);
    expect(r.reportees).toBe(0);
  });
});

describe('la mission du jour tient toujours entre 3 et 5 minutes', () => {
  const cas: Array<[string, Etat]> = [
    ['état vierge (début de parcours)', etatVierge()],
    ['révisions en attente', etatAvec(LECONS.slice(0, 8))],
    ['leçon en cours', (() => {
      const e = etatVierge();
      e.progression[LECONS[0]] = {
        statut: 'en_cours', phases: [1, 2], minutes: 7,
        repetitions: 0, intervalle: 1, facilite: 2.5,
      };
      return e;
    })()],
  ];

  it.each(cas)('%s → une seule mission, 3 à 5 minutes', (_nom, etat) => {
    const { mission } = missionDuJour(etat);
    expect(mission.minutes).toBeGreaterThanOrEqual(MINUTES_MIN_MISSION);
    expect(mission.minutes).toBeLessThanOrEqual(MINUTES_MAX_MISSION);
    expect(mission.titre.length).toBeGreaterThan(0);
    expect(mission.savoirFaire.length).toBeGreaterThan(0);
    expect(mission.cle.length).toBeGreaterThan(0);
  });

  it('une mission de révision utilise les révisions déjà plafonnées', () => {
    const etat = etatAvec(LECONS.slice(0, 8));
    const { mission, reportees } = missionDuJour(etat);
    if (mission.type === 'revision') {
      expect(mission.lessonIds?.length).toBeLessThanOrEqual(PLAFOND_DETTE);
      expect(reportees).toBe(3);
    }
  });

  it('aucun écran ne parle de note, de /20 ni de série à casser', () => {
    for (const [, etat] of cas) {
      const { mission } = missionDuJour(etat);
      const texte = [mission.titre, mission.savoirFaire, mission.pourquoi, libelleMission(mission), sousTitreMission({ mission, reportees: 0, plan: { actions: [] } as never })].join(' ');
      expect(texte).not.toMatch(/\/\s*20|%|streak|سلسلة/i);
    }
  });
});

describe('libellés — un seul verbe d’action par état', () => {
  it('chaque type de mission a un libellé non vide, distinct', () => {
    const types = ['noeud', 'jalon', 'revision', 'entrainement_sujet', 'repos', 'fini'] as const;
    const libelles = types.map((type) =>
      libelleMission({ type, minutes: 4, titre: 't', savoirFaire: 's', pourquoi: 'p', cle: 'c' }),
    );
    expect(new Set(libelles).size).toBe(types.length);
    for (const l of libelles) expect(l.length).toBeGreaterThan(0);
  });

  it('le sous-titre des révisions reportées est sobre : elles attendent, on ne les reproche pas', () => {
    const texte = sousTitreMission({
      mission: { type: 'revision', minutes: 4, titre: 't', savoirFaire: 's', pourquoi: 'p', cle: 'c' },
      reportees: 7,
      plan: { actions: [] } as never,
    });
    expect(texte).toContain('7');
    expect(texte).toMatch(/بلا عجلة/);
  });
});
