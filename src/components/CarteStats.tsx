// بطاقة إحصاء المُرشد — كم إجابة صحيحة وكم ليست صحيحة، بلا نسبة مئوية وبلا لوم.

import { SOURCES, messageTuteur, statsSemaine, useStats, totalReponses } from '../utils/stats';
import { nb } from '../utils/dates';
import { Morceau } from './Communs';

interface Props {
  complet?: boolean; // true في «أنا»: تفصيل حسب المصدر
}

export default function CarteStats({ complet = false }: Props) {
  const stats = useStats();
  const sem = statsSemaine(stats);
  const total = totalReponses(stats);
  const totalSem = sem.justes + sem.fausses;

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">المُرشد · إحصاء الجواب</p>
          <p className="mt-1 text-xs leading-relaxed text-mute">
            يقيس محاولاتك بلا ضغط: الخطأ هنا معلومة، لا حكم.
          </p>
        </div>
        <span className="text-2xl">🌿</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5 text-center">
          <p className="font-naskh text-3xl font-black text-forest">{nb(stats.justes)}</p>
          <p className="mt-1 text-[11px] font-bold text-forest-deep">صحيحة</p>
        </div>
        <div className="rounded-2xl border border-clay-soft bg-clay-soft/50 p-3.5 text-center">
          <p className="font-naskh text-3xl font-black text-clay">{nb(stats.fausses)}</p>
          <p className="mt-1 text-[11px] font-bold text-clay">ليست صحيحة</p>
        </div>
        <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5 text-center">
          <p className="font-naskh text-3xl font-black text-forest-deep">{nb(total)}</p>
          <p className="mt-1 text-[11px] font-bold text-forest-deep">محاولة</p>
        </div>
      </div>

      <p className="mt-3 text-xs font-bold text-ink-soft">
        هذا الأسبوع:{' '}
        {totalSem === 0
          ? 'بلا محاولات — الراحة جزء من الخطة.'
          : `${nb(sem.justes)} صحيحة · ${nb(sem.fausses)} ليست صحيحة`}
      </p>

      {/* إضافة عرض تقدم الدروس */}
      {complet && (
        <div className="mt-4 p-4 bg-gradient-to-b from-sage-soft to-sage-soft/10 rounded-2xl border border-sage/20">
          <p className="font-naskh font-bold text-forest mb-3">تقدم الدروس</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>مكتملة</span>
              <span className="text-forest">{nb(stats?.parSource?.phase?.justes ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>فاشلة</span>
              <span className="text-clay">{nb(stats?.parSource?.phase?.fausses ?? 0)}</span>
            </div>
          </div>
        </div>
      )}

      {complet && (
        <ul className="mt-4 space-y-2">
          {SOURCES.map((src) => {
            const c = stats.parSource[src.id];
            const vu = c.justes + c.fausses > 0;
            return (
              <li
                key={src.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-cream/50 px-3.5 py-2.5"
              >
                <span className="text-sm font-bold text-ink-soft">{src.label}</span>
                <span
                  className={`shrink-0 text-xs font-black ${vu ? 'text-ink' : 'text-mute'}`}
                  dir="ltr"
                >
                  {nb(c.justes)} ✓ · {nb(c.fausses)} ✕
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4">
        <Morceau ton={total > 0 && stats.fausses === 0 ? 'gold' : 'sage'}>
          {messageTuteur(stats)}
        </Morceau>
      </div>
    </section>
  );
}


