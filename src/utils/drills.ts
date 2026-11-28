// تحميل بنك التدريبات — ثلاثة أجزاء تُحمّل عند الطلب فقط (لا شيء يُحمّل دفعة واحدة).
// كل جزء يغطي مجالًا من البرنامج؛ `ITEMS` تصفّ البنك نفسه (صحيح دائمًا في o[0]).

import type { ItemDrill } from '../data/drills/types';
import type { DrillRecord } from '../types';
import { ajouterJours, aujourdhui } from './dates';

/** Indique si un drill a déjà été réussi (format historique `true` ou objet enrichi). */
export function estDrillFait(rec?: DrillRecord): boolean {
  return rec === true || (typeof rec === 'object' && rec !== null && rec.done === true);
}

/** Retourne le nombre d'erreurs cumulées pour un drill (0 pour le format historique `true`). */
export function erreursDrill(rec?: DrillRecord): number {
  return typeof rec === 'object' && rec !== null ? rec.errors : 0;
}

/** Enregistre la réussite d'un drill en conservant la rétrocompatibilité et en planifiant une revue courte si erreur. */
export function enregistrerDrillReussi(
  drills: Record<string, DrillRecord> | undefined,
  id: string,
  erreursSession = 0,
  auj: string = aujourdhui(),
): Record<string, DrillRecord> {
  const courant = drills?.[id];
  const prevErrors = typeof courant === 'object' && courant !== null ? courant.errors : 0;
  const prevAttempts = typeof courant === 'object' && courant !== null ? courant.attempts : courant === true ? 1 : 0;
  const errors = prevErrors + Math.max(0, Math.floor(erreursSession));
  const attempts = prevAttempts + 1;
  const nextReview = ajouterJours(auj, erreursSession > 0 ? 1 : 3);
  return {
    ...(drills ?? {}),
    [id]: { done: true, errors, attempts, lastSeen: auj, nextReview },
  };
}

export type NumeroDomaine = 1 | 2 | 3;

const PARTIES: Record<NumeroDomaine, () => Promise<{ ITEMS: ItemDrill[] }>> = {
  1: () => import('../data/drills/domaine1'),
  2: () => import('../data/drills/domaine2'),
  3: () => import('../data/drills/domaine3'),
};

const cache: Partial<Record<NumeroDomaine, Promise<ItemDrill[]>>> = {};

export function reinitialiserCacheDrills(): void {
  delete cache[1];
  delete cache[2];
  delete cache[3];
}

export function chargerDomaine(n: NumeroDomaine): Promise<ItemDrill[]> {
  // عناصر المستوى 3 (P1.5) في ملف واحد مكتوب يدويًّا؛ تُضمّ إلى مجال وحدتها عند التحميل
  if (!cache[n]) {
    cache[n] = Promise.all([PARTIES[n](), import('../data/drills/niveau3')])
      .then(([m, n3]) => [
        ...m.ITEMS,
        ...n3.ITEMS_N3.filter((i) => domaineDeUnite(i.u) === n),
      ])
      .catch((err) => {
        delete cache[n];
        throw err;
      });
  }
  return cache[n] as Promise<ItemDrill[]>;
}

// المجال الذي تنتمي إليه وحدة (1..11)
export function domaineDeUnite(u: number): NumeroDomaine {
  if (u <= 5) return 1;
  if (u <= 8) return 2;
  return 3;
}

export async function chargerDomaineDeUnite(u: number): Promise<ItemDrill[]> {
  return chargerDomaine(domaineDeUnite(u));
}

// بناء جولة: العناصر غير المُجابة أولًا، ثم العناصر المستحقّة للمراجعة/ذات الأخطاء، ثم الباقي.
export function composerJoueur(
  tous: ItemDrill[],
  dejaFait: Set<string>,
  taille: number,
  niveauMax?: 1 | 2 | 3,
  drillsMap?: Record<string, DrillRecord>,
  auj: string = aujourdhui(),
): ItemDrill[] {
  const eligibles = niveauMax ? tous.filter((i) => i.n <= niveauMax) : tous;
  let pool = eligibles.filter((i) => !dejaFait.has(i.id));
  if (pool.length === 0 && drillsMap) {
    const aRevoir = eligibles.filter((i) => {
      const rec = drillsMap[i.id];
      if (!rec || rec === true) return false;
      return rec.errors > 0 || (rec.nextReview !== undefined && rec.nextReview <= auj);
    });
    if (aRevoir.length > 0) pool = aRevoir;
  }
  const base = pool.length > 0 ? pool : eligibles;
  const melange = [...base];
  for (let i = melange.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melange[i], melange[j]] = [melange[j], melange[i]];
  }
  return melange.slice(0, taille);
}
