// «أنا» — سجلّ الامتحانات التجريبية (P1.4): تاريخ، مدّة، الوحدات التي تعثّرت فيها — أعداد لا نسب، وأخطاؤها في كرّاسة الأخطاء.

import type { Etat } from '../types';
import { UNITES } from '../data/programme';
import { formatJourAr, nb } from '../utils/dates';

function duree(secondes: number): string {
  const m = Math.round(secondes / 60);
  if (m < 1) return 'أقلّ من دقيقة';
  if (m < 60) return `${nb(m)} دقيقة`;
  return `${nb(Math.floor(m / 60))} س ${nb(m % 60)} د`;
}

export default function CarteExamens({ etat, onAllerExercices }: { etat: Etat; onAllerExercices: () => void }) {
  const examens = [...(etat.examens ?? [])].reverse().slice(0, 5);
  if (!examens.length) return null;
  const faiblesRecentes = [...new Set(examens.slice(0, 2).flatMap((e) => e.unitesFaibles))].sort((a, b) => a - b);
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">امتحاناتي التجريبية</p>
      <p className="mt-1 text-[11px] text-mute">آخر {nb(examens.length)} — أخطاؤها مسجَّلة سؤالًا بسؤال في كرّاسة الأخطاء أسفله.</p>
      <ul className="mt-3 divide-y divide-line">
        {examens.map((e) => (
          <li key={e.date} className="py-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{formatJourAr(e.date.slice(0, 10))}</span>
              <span className="tnum text-xs text-mute">
                {duree(e.secondes)}
                {e.chrono ? ' · بمؤقّت' : ''}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft">
              الجزء الأول: {nb(e.directs)} من {nb(e.qcm)} من أول محاولة
              {e.erreursEnquete ? ` · الوثائق: ${nb(e.erreursEnquete)} ${e.erreursEnquete === 1 ? 'عثرة' : 'عثرات'}` : ' · الوثائق: بلا عثرة'}
            </p>
            {e.unitesFaibles.length > 0 && (
              <p className="mt-0.5 text-xs text-mute">
                تعثّر في: {e.unitesFaibles.map((n) => `الوحدة ${nb(n)}`).join('، ')}
              </p>
            )}
          </li>
        ))}
      </ul>
      {faiblesRecentes.length > 0 && (
        <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-3">
          <p className="text-xs font-bold text-forest-deep">
            تعود في آخر امتحانين: {faiblesRecentes.map((n) => UNITES.find((u) => u.numero === n)?.titre ?? `الوحدة ${nb(n)}`).join(' · ')}
          </p>
          <button type="button" onClick={onAllerExercices} className="mt-2 text-xs font-bold text-forest hover:underline">
            افتح تدريبات هذه الوحدات ←
          </button>
        </div>
      )}
    </section>
  );
}
