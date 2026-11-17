// P3.1 — quiz adaptatif borné : transitions, bornes, choix d'items, session « montée puis descente »
import { describe, it, expect } from 'vitest';
import type { ItemDrill } from '../../data/drills/types';
import {
  demarrerAdaptatif,
  appliquerReponse,
  prochainItemAdaptatif,
  bilanAdaptatif,
  niveauxDisponibles,
  TAILLE_SESSION_ADAPTATIVE,
} from '../adaptatif';

function item(id: string, n: 1 | 2 | 3): ItemDrill {
  return { id, u: 1, a: 0, n, q: id, o: ['a', 'b', 'c', 'd'] } as ItemDrill;
}
const pool3 = [
  ...[1, 2, 3, 4, 5].map((k) => item(`n1-${k}`, 1)),
  ...[1, 2, 3, 4, 5].map((k) => item(`n2-${k}`, 2)),
  ...[1, 2, 3, 4, 5].map((k) => item(`n3-${k}`, 3)),
];
const pool2 = pool3.filter((i) => i.n < 3);

describe('adaptatif (P3.1)', () => {
  it('démarre toujours au bas de l\'escalier ; bornes = niveaux réellement présents', () => {
    expect(niveauxDisponibles(pool3)).toEqual([1, 2, 3]);
    expect(demarrerAdaptatif(pool3)).toMatchObject({ niveau: 1, min: 1, max: 3 });
    expect(demarrerAdaptatif(pool2)).toMatchObject({ niveau: 1, min: 1, max: 2 });
    expect(TAILLE_SESSION_ADAPTATIVE).toBe(10);
  });

  it('2 réussites consécutives → +1 ; 2 échecs consécutifs → −1 + invitation au cours ; un succès isolé ne monte pas', () => {
    let e = demarrerAdaptatif(pool3);
    let t = appliquerReponse(e, item('x', 1), true);
    expect(t.evenement).toBeNull();
    expect(t.etat.niveau).toBe(1);
    t = appliquerReponse(t.etat, item('y', 1), true);
    expect(t.evenement).toBe('montee');
    expect(t.etat.niveau).toBe(2);
    expect(t.etat.serieReussites).toBe(0);
    // échec, succès, échec : séries interrompues → rien ne bouge
    t = appliquerReponse(t.etat, item('z', 2), false);
    t = appliquerReponse(t.etat, item('w', 2), true);
    t = appliquerReponse(t.etat, item('v', 2), false);
    expect(t.etat.niveau).toBe(2);
    expect(t.inviterCours).toBe(false);
    t = appliquerReponse(t.etat, item('u', 2), false);
    expect(t.evenement).toBe('descente');
    expect(t.inviterCours).toBe(true);
    expect(t.etat.niveau).toBe(1);
  });

  it('bornes : jamais au-dessus du max disponible, jamais sous 1 ; au plancher, 2 échecs → invitation sans chute', () => {
    let e = demarrerAdaptatif(pool2);
    for (let k = 0; k < 6; k++) e = appliquerReponse(e, item(`ok${k}`, e.niveau), true).etat;
    expect(e.niveau).toBe(2); // max = 2 dans ce pool
    let f = demarrerAdaptatif(pool2);
    const t1 = appliquerReponse(f, item('e1', 1), false);
    const t2 = appliquerReponse(t1.etat, item('e2', 1), false);
    expect(t2.evenement).toBe('plancher');
    expect(t2.inviterCours).toBe(true);
    expect(t2.etat.niveau).toBe(1);
    f = t2.etat;
    // le compteur est remis à zéro après l'invitation : un seul nouvel échec ne ré-invite pas
    expect(appliquerReponse(f, item('e3', 1), false).inviterCours).toBe(false);
  });

  it('prochainItem : niveau courant, jamais le même item deux fois, non faits d\'abord, repli sur le niveau voisin', () => {
    const e = demarrerAdaptatif(pool3);
    const alea = () => 0;
    const faits = new Set(['n1-1', 'n1-2']);
    const i1 = prochainItemAdaptatif(pool3, e, faits, alea)!;
    expect(i1.n).toBe(1);
    expect(faits.has(i1.id)).toBe(false);
    // épuiser le niveau 1 → repli : niveau 2 (voisin supérieur, car 0 n'existe pas)
    let f = e;
    for (const it of pool3.filter((i) => i.n === 1)) f = appliquerReponse(f, it, false).etat;
    f = { ...f, niveau: 1 };
    expect(prochainItemAdaptatif(pool3, f, new Set(), alea)!.n).toBe(2);
    // tout épuisé → null
    let g = e;
    for (const it of pool3) g = appliquerReponse(g, it, true).etat;
    expect(prochainItemAdaptatif(pool3, g, new Set(), alea)).toBeNull();
  });

  it('session enregistrée « montée puis descente » : bilan en mots, sans pourcentage', () => {
    let e = demarrerAdaptatif(pool3);
    const reponses = [true, true, true, true, false, false, true, false, false, true]; // 1→2→3, puis 3→2→1
    reponses.forEach((j, k) => {
      e = appliquerReponse(e, item(`s${k}`, e.niveau), j).etat;
    });
    expect(e.historique.length).toBe(10);
    expect(e.historique.map((h) => h.niveau)).toEqual([1, 1, 2, 2, 3, 3, 2, 2, 2, 1]);
    const b = bilanAdaptatif(e);
    expect(b.sommet).toBe(3);
    expect(b.finale).toBe(1);
    expect(b.justes).toBe(6);
    expect(b.phrase).not.toMatch(/%|\d/);
    expect(b.phrase).toMatch(/القمّة/);
  });
});
