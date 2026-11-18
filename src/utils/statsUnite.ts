// إحصاء بالوحدة (P2.4) — «الأقوى / الأضعف» بالكلمات، مع رابط مباشر إلى العمل المفيد.
// الإشارات المحلّية فقط: الدروس المُنهاة، الدروس الهشّة (SM-2)، تغطية التدريبات (عناصر مُجابة / كلّ عناصر محاور الوحدة)،
// ونتيجة اختبار التموضع إن وُجدت. لا نسبة تُعرض للتلميذ — تُستعمل داخليًّا للترتيب فقط.

import type { Etat, Unite } from '../types';
import { UNITES } from '../data/programme';
import { AXES } from '../data/drills/axes';
import { niveauUnite } from './diagnostic';

export interface StatUnite {
  uniteId: string;
  numero: number;
  titre: string;
  lecons: number;
  terminees: number;
  fragiles: string[];
  drillsFaits: number;
  drillsTotal: number;
  /** 0..1 — داخلي */
  couverture: number;
  diagnostic: 'force' | 'moyen' | 'fragile' | null;
  /** هل بدأ التلميذ الوحدة فعلًا؟ (درس مُنهى أو تدريب مُجاب) */
  commencee: boolean;
}

function idsLecons(u: Unite): string[] {
  return [...(u.prerequis ?? []), ...u.lessonIds];
}

export function statsParUnite(etat: Etat): StatUnite[] {
  const faits = etat.drills ?? {};
  return UNITES.map((u) => {
    const ids = idsLecons(u);
    const terminees = ids.filter((id) => etat.progression[id]?.statut === 'terminee').length;
    const fragiles = ids.filter((id) => etat.progression[id]?.statut === 'terminee' && etat.progression[id]?.fragile);
    const axes = AXES.filter((a) => a.u === u.numero);
    const drillsTotal = axes.reduce((n, a) => n + a.ids.length, 0);
    const drillsFaits = axes.reduce((n, a) => n + a.ids.filter((id) => faits[id]).length, 0);
    const d = etat.diagnostic?.parUnite[u.id];
    return {
      uniteId: u.id,
      numero: u.numero,
      titre: u.titre,
      lecons: ids.length,
      terminees,
      fragiles,
      drillsFaits,
      drillsTotal,
      couverture: drillsTotal ? drillsFaits / drillsTotal : 0,
      diagnostic: d ? niveauUnite(d) : null,
      commencee: terminees > 0 || drillsFaits > 0,
    };
  });
}

/** درجة داخلية للترتيب: الهشاشة تُثقل، التغطية والإنهاء يرفعان. */
function score(s: StatUnite): number {
  const avancement = s.lecons ? s.terminees / s.lecons : 0;
  const malusDiag = s.diagnostic === 'fragile' ? 0.15 : s.diagnostic === 'force' ? -0.05 : 0;
  return avancement * 0.4 + s.couverture * 0.4 - (s.terminees ? s.fragiles.length / s.terminees : 0) * 0.6 - malusDiag;
}

export interface ForcesFaiblesses {
  plusForte: StatUnite | null;
  plusFaible: StatUnite | null;
}

/** تُحسب على الوحدات المبدوءة فقط؛ وحدة واحدة مبدوءة → تظهر كأقوى فقط إن لم تكن هشّة، وإلا كأضعف. */
export function forcesFaiblesses(etat: Etat): ForcesFaiblesses {
  const commencees = statsParUnite(etat).filter((s) => s.commencee);
  if (!commencees.length) return { plusForte: null, plusFaible: null };
  const tri = [...commencees].sort((a, b) => score(b) - score(a));
  if (tri.length === 1) {
    const seule = tri[0];
    return seule.fragiles.length ? { plusForte: null, plusFaible: seule } : { plusForte: seule, plusFaible: null };
  }
  const forte = tri[0];
  const faible = tri[tri.length - 1];
  return { plusForte: forte, plusFaible: faible.uniteId === forte.uniteId ? null : faible };
}

/** جملة الأضعف — تسمّي العمل لا العجز. */
export function conseilPourFaible(s: StatUnite): string {
  if (s.fragiles.length) return `${s.fragiles.length === 1 ? 'درس هشّ واحد' : 'دروس هشّة'} في هذه الوحدة — جلسة استرجاع قصيرة تثبّتها.`;
  if (s.drillsTotal && s.couverture < 0.3) return 'تدريبات هذه الوحدة لم تُطرق بعد — جولة واحدة تكفي للبداية.';
  if (s.diagnostic === 'fragile') return 'اختبار التموضع أشار إليها — حين يأتي دورها في الطريق، امنحها وقتًا أطول.';
  return 'الأقلّ تقدّمًا بين ما بدأت — خطوة فيها هذا الأسبوع.';
}
