// المراجعة المتقاطعة الأسبوعية (P2.4) — مرّة في الأسبوع، درس مُنهى واحد من كلّ مجال (≤ 3)،
// تُقدَّم بجلسة الاسترجاع المعتادة (استرجاع → مصطلحات → اختيار → تقييم ذاتي يغذّي SM-2).
// الهدف: التداخل بين المجالات — الاسترجاع اليومي يأخذ الدروس حين تحين، أمّا هذه فتخلط عمدًا.
// بطاقة الكفاءة (المنهجية) تبقى ببطاقتها الخاصّة المسقوفة بـ kafaaSemaine — لا نضاعفها هنا.

import type { Etat } from '../types';
import { DOMAINES, UNITE_PAR_ID } from '../data/programme';
import { aujourdhui } from './dates';
import { debutSemaine, revisionsDues } from './moteur';

export const MAX_LECONS_CROISEES = 3;

export interface RevueCroisee {
  semaine: string; // ISO du début de semaine (dimanche)
  lessonIds: string[];
  faiteLe?: string;
}

export type DisponibiliteCroisee = 'prete' | 'faite' | 'indisponible';

/** Leçons terminées d'un domaine, triées : fragiles d'abord, puis la moins récemment vue. */
export function candidatesDomaine(etat: Etat, domaineId: string, exclure: Set<string> = new Set()): string[] {
  const d = DOMAINES.find((x) => x.id === domaineId);
  if (!d) return [];
  const ids = d.unites.flatMap((u) => {
    const unite = UNITE_PAR_ID[u];
    return unite ? [...(unite.prerequis ?? []), ...unite.lessonIds] : [];
  });
  return ids
    .filter((id) => etat.progression[id]?.statut === 'terminee' && !exclure.has(id))
    .sort((a, b) => {
      const pa = etat.progression[a];
      const pb = etat.progression[b];
      if (!!pa.fragile !== !!pb.fragile) return pa.fragile ? -1 : 1;
      return (pa.derniereSession ?? '').localeCompare(pb.derniereSession ?? '');
    });
}

/** Une leçon par domaine (celles déjà dues aujourd'hui sont laissées à l'استرجاع quotidien). */
export function composerRevueCroisee(etat: Etat): string[] {
  const dues = new Set(revisionsDues(etat));
  return DOMAINES.map((d) => candidatesDomaine(etat, d.id, dues)[0])
    .filter((id): id is string => Boolean(id))
    .slice(0, MAX_LECONS_CROISEES);
}

export function disponibiliteCroisee(etat: Etat, auj: string = aujourdhui()): DisponibiliteCroisee {
  const semaine = debutSemaine(auj);
  const r = etat.revueCroisee;
  if (r && r.semaine === semaine) {
    if (r.faiteLe) return 'faite';
    // revue entamée cette semaine mais pas finie : toujours prête tant que ses leçons existent
    return r.lessonIds.length >= 2 ? 'prete' : 'indisponible';
  }
  // croisée = au moins deux domaines représentés
  return composerRevueCroisee(etat).length >= 2 ? 'prete' : 'indisponible';
}

/** Fige la composition de la semaine (stable jusqu'à ce qu'elle soit faite) et la retourne. */
export function demarrerRevueCroisee(etat: Etat, auj: string = aujourdhui()): { etat: Etat; lessonIds: string[] } {
  const semaine = debutSemaine(auj);
  const r = etat.revueCroisee;
  if (r && r.semaine === semaine && !r.faiteLe && r.lessonIds.length >= 2) {
    return { etat, lessonIds: r.lessonIds };
  }
  const lessonIds = composerRevueCroisee(etat);
  return { etat: { ...etat, revueCroisee: { semaine, lessonIds } }, lessonIds };
}

export function terminerRevueCroisee(etat: Etat, auj: string = aujourdhui()): Etat {
  const semaine = debutSemaine(auj);
  const r = etat.revueCroisee;
  const lessonIds = r && r.semaine === semaine ? r.lessonIds : [];
  return { ...etat, revueCroisee: { semaine, lessonIds, faiteLe: auj } };
}

/** Titre court du domaine d'une leçon (sans « المجال الأول: »). */
export function nomDomaine(lessonId: string): string {
  const d = DOMAINES.find((x) =>
    x.unites.some((u) => {
      const unite = UNITE_PAR_ID[u];
      return unite?.lessonIds.includes(lessonId) || unite?.prerequis?.includes(lessonId);
    })
  );
  return d ? d.titre.replace(/^المجال \S+: /, '') : '';
}
