// التركيب الحرّ — اختيار الوحدة (P1.3) : 11 وضعية، واحدة لكلّ وحدة. يفتح SyntheseLibre.
import { SITUATIONS_SYNTHESE, type SituationSynthese } from '../data/syntheses';
import { UNITES } from '../data/programme';
import { nb } from '../utils/dates';
import type { Etat } from '../types';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onChoisir: (s: SituationSynthese) => void;
  onFermer: () => void;
}

export default function ChoixSynthese({ etat, onChoisir, onFermer }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={onFermer} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft" aria-label="رجوع">
            <span className="block h-5 w-5"><IcoRetour /></span>
          </button>
          <div className="min-w-0">
            <p className="eyebrow">التركيب الحرّ · الجزء الثالث</p>
            <h1 className="font-naskh truncate text-xl font-black">اختر وحدة</h1>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm leading-relaxed text-mute">
            وضعية واحدة لكلّ وحدة: تقرأ السند، تكتب بنفسك، ثمّ تقارن بعناصر الإجابة. لا علامة، لا نسبة — الهدف أن تُنتج الجملة لا أن تتعرّف عليها.
          </p>
          <ul className="mt-4 grid gap-2">
            {SITUATIONS_SYNTHESE.map((s) => {
              const u = UNITES.find((x) => x.id === s.uniteId);
              const carte = etat.kafaa?.[`synthese${s.uniteId.toUpperCase()}`];
              const terminee = (u?.lessonIds ?? []).some((id) => etat.progression[id]?.statut === 'terminee');
              return (
                <li key={s.uniteId}>
                  <button type="button" onClick={() => onChoisir(s)} className="card flex w-full items-center justify-between gap-3 p-4 text-start transition-colors hover:border-forest">
                    <span className="min-w-0">
                      <p className="eyebrow">الوحدة {nb(u?.numero ?? 0)}</p>
                      <p className="mt-0.5 truncate text-sm font-bold">{u?.titre}</p>
                      <p className="mt-1 text-xs text-mute">
                        {carte ? `كُتبت · مراجعة ${carte.prochaineRevision ?? ''}` : terminee ? 'جاهزة — أنهيت درسًا من هذه الوحدة' : 'يُستحسن إنهاء درس من الوحدة أولًا'}
                      </p>
                    </span>
                    <span className="shrink-0 text-mute">←</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-mute">الوضعيات وعناصر الإجابة قيد المراجعة من طرف الأساتذة.</p>
        </div>
      </main>
    </div>
  );
}
