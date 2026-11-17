// «أنا» — الأقوى / الأضعف بالوحدة (P2.4): كلمات لا أرقام، ورابط مباشر إلى العمل المفيد.

import type { Etat } from '../types';
import { conseilPourFaible, forcesFaiblesses } from '../utils/statsUnite';
import { nb } from '../utils/dates';

interface Props {
  etat: Etat;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onAllerExercices: () => void;
}

export default function CarteForcesFaiblesses({ etat, onDemarrerRevision, onAllerExercices }: Props) {
  const { plusForte, plusFaible } = forcesFaiblesses(etat);
  if (!plusForte && !plusFaible) return null;
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">الأقوى والأضعف بين وحداتي</p>
      <p className="mt-1 text-[11px] text-mute">يُحسب على ما بدأته فقط، من دروسك الهشّة وتدريباتك — لا مقارنة بأحد.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {plusForte && (
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-4">
            <p className="text-xs font-bold text-forest">الأقوى</p>
            <p className="mt-1 text-sm font-bold">الوحدة {nb(plusForte.numero)} · {plusForte.titre}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {plusForte.terminees} من {plusForte.lecons} دروس مُنهاة{plusForte.fragiles.length === 0 ? '، بلا درس هشّ' : ''}.
            </p>
          </div>
        )}
        {plusFaible && (
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
            <p className="text-xs font-bold text-forest-deep">تستحقّ انتباهًا</p>
            <p className="mt-1 text-sm font-bold">الوحدة {nb(plusFaible.numero)} · {plusFaible.titre}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{conseilPourFaible(plusFaible)}</p>
            {plusFaible.fragiles.length > 0 ? (
              <button type="button" onClick={() => onDemarrerRevision(plusFaible.fragiles)} className="btn btn-primary mt-3 w-full text-xs">
                راجع دروسها الهشّة الآن
              </button>
            ) : (
              <button type="button" onClick={onAllerExercices} className="btn btn-ghost mt-3 w-full border border-line text-xs">
                افتح تدريباتها
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
