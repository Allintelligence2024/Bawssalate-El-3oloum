// صيّاد الفخاخ : les énoncés viennent uniquement de QCM écrits à la main
// (options[0] = vrai, les autres = distracteurs voulus). 2 XP par bon jugement,
// +4 par série complète. Une erreur ne retire rien.
import { describe, expect, it } from 'vitest';
import { QCM_LECONS } from '../data/qcmLecons';
import { UNITE_PAR_ID, UNITES } from '../data/programme';
import { etatVierge, type Etat } from '../types';
import { VALEURS, xpDe } from '../utils/xp';
import {
  avancementSerie,
  enoncesDeUnite,
  piegesOfficiels,
  serieFakh,
  unitesJouables,
} from '../utils/fakh';

const u1 = UNITE_PAR_ID.u1;

describe('صيّاد الفخاخ', () => {
  it('ne fabrique aucun énoncé : tout vient d’un QCM existant', () => {
    const enonces = enoncesDeUnite('u1');
    expect(enonces.length).toBeGreaterThan(0);
    const pool = new Set<string>();
    for (const id of u1.lessonIds) {
      const q = QCM_LECONS[id];
      if (!q) continue;
      [...q.rappel.options, ...q.synthese.options].forEach((o) => pool.add(o));
    }
    expect(enonces.every((e) => pool.has(e.enonce))).toBe(true);
    // `vrai` correspond bien à la première option de la banque.
    const vrai = enonces.find((e) => e.vrai)!;
    expect(vrai.enonce).toBeTruthy();
  });

  it('compose une série stable de 8, avec des vrais et des pièges', () => {
    const a = serieFakh('u1').map((p) => p.cle);
    const b = serieFakh('u1').map((p) => p.cle);
    expect(a).toEqual(b);
    expect(a).toHaveLength(8);
    const serie = serieFakh('u1');
    expect(serie.some((p) => p.vrai)).toBe(true);
    expect(serie.some((p) => !p.vrai)).toBe(true);
    expect(new Set(a).size).toBe(a.length);
  });

  it('écarte les fragments de liste : chaque énoncé se juge seul', () => {
    for (const u of UNITES) {
      for (const p of serieFakh(u.id)) {
        expect(p.enonce).not.toContain(' / ');
        expect(p.enonce.trim().length).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('rend une série vide pour une unité sans QCM', () => {
    expect(serieFakh('unite-inexistante')).toEqual([]);
    expect(unitesJouables().length).toBeGreaterThan(0);
  });

  it('expose les pièges officiels du programme', () => {
    const off = piegesOfficiels();
    expect(off.length).toBeGreaterThanOrEqual(10);
    expect(off.reduce((s, o) => s + o.items.length, 0)).toBe(
      UNITES.reduce((s, u) => s + (u.piegesAr?.length ?? 0), 0),
    );
  });

  it('compte 2 XP par piège et 4 XP par série', () => {
    const base = etatVierge();
    const serie = serieFakh('u1');
    const deux: Etat = { ...base, fakh: { [serie[0].cle]: true, [serie[1].cle]: true } };
    expect(xpDe(deux)).toBe(2 * VALEURS.fakh);
    expect(avancementSerie(deux, 'u1')).toEqual({ trouves: 2, total: 8, finie: false });

    const fini: Etat = {
      ...deux,
      fakhSeries: { u1: true },
    };
    expect(xpDe(fini)).toBe(2 * VALEURS.fakh + VALEURS.fakhSerie);
    expect(avancementSerie(fini, 'u1').finie).toBe(false); // 2 pièges sur 8 seulement
  });

  it('une série complète est marquée finie', () => {
    const serie = serieFakh('u1');
    const tous: Etat = {
      ...etatVierge(),
      fakh: Object.fromEntries(serie.map((p) => [p.cle, true as const])),
    };
    expect(avancementSerie(tous, 'u1')).toEqual({ trouves: 8, total: 8, finie: true });
  });
});
