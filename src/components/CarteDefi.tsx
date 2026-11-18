// «اليوم» — تحدّي الأسبوع (P3.2): يختاره التلميذ، يُقاس محلّيًّا، ولا يُقارَن بأحد.

import type { Etat } from '../types';
import { avancementDefi, DEFIS, type TypeDefi } from '../utils/defis';
import { nb } from '../utils/dates';

interface Props {
  etat: Etat;
  onChoisir: (type: TypeDefi) => void;
}

export default function CarteDefi({ etat, onChoisir }: Props) {
  const av = avancementDefi(etat);
  if (!av) {
    return (
      <section className="card mt-5 p-5">
        <p className="eyebrow">تحدّي الأسبوع · أنت تختار</p>
        <p className="mt-1 text-xs leading-relaxed text-mute">
          تحدٍّ واحد في الأسبوع، يكافئ الانتظام لا العلامة. لا يُبدَّل بعد الاختيار، ولا يُحتسب ضدّك إن لم يكتمل.
        </p>
        <div className="mt-3 grid gap-2">
          {DEFIS.map((d) => (
            <button
              key={d.type}
              type="button"
              onClick={() => onChoisir(d.type)}
              className="rounded-2xl border border-line bg-paper p-3 text-start transition-colors hover:border-forest hover:bg-sage-soft/40"
            >
              <p className="text-sm font-bold">{d.titre}</p>
              <p className="mt-0.5 text-[11px] text-mute">{d.detail}</p>
            </button>
          ))}
        </div>
      </section>
    );
  }
  const def = DEFIS.find((d) => d.type === av.defi.type)!;
  return (
    <section className={`card mt-5 p-5 ${av.accompli ? 'border-2 border-sage bg-sage-soft/40' : ''}`}>
      <p className="eyebrow">تحدّي الأسبوع</p>
      <p className="font-naskh mt-1 text-lg font-bold leading-snug text-forest-deep">{def.titre}</p>
      {av.accompli ? (
        <p className="mt-2 text-sm font-bold text-forest">أُنجز هذا الأسبوع — الشارة في «أنا».</p>
      ) : av.cible > 1 ? (
        <>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/40" aria-hidden="true">
            <div className="h-full rounded-full bg-forest transition-[width]" style={{ width: `${(av.fait / av.cible) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-mute">
            {nb(av.fait)} من {nb(av.cible)} — {av.fait === 0 ? 'لم تبدأ بعد، والأسبوع طويل.' : 'الباقي يُنجز بجولة أو جولتين.'}
          </p>
        </>
      ) : (
        <p className="mt-2 text-xs text-mute">{def.detail}</p>
      )}
    </section>
  );
}
