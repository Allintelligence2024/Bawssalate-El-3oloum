// جولة التصحيح — « tour de réparation » d'un nœud raté.
//
// Principe (plan directeur §3.2) : jamais d'écran d'échec. Quand une porte ne passe pas, la
// porte se ferme et cette courte série s'ouvre : 2 à 3 items très courts, tirés des pièges de
// la leçon (`QCM_LECONS[id].pieges`) ou, à défaut, du rappel et de la synthèse. À la fin, la
// porte se rouvre — l'élève ne perd rien, il répare.
//
// Aucun point, aucun chrono, aucun « Game Over ». La réussite de la réparation n'est pas une
// complétion de nœud : seule la porte écrit `progression.phases`.

import { useMemo, useState } from 'react';
import { QCM_LECONS } from '../data/qcmLecons';
import { titreLecon } from '../data/programme';
import { nb } from '../utils/dates';
import MascotteKunz from './MascotteKunz';

interface Props {
  lessonId: string;
  onTermine: () => void;
  onFermer: () => void;
}

interface ItemReparation {
  cle: string;
  question: string;
  options: string[];
  bonne: string;
  explication: string;
}

/** Mélange déterministe : la même leçon donne toujours le même ordre. */
function melange<T>(liste: T[], graine: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < graine.length; i++) h = (h ^ graine.charCodeAt(i)) * 16777619;
  const sortie = [...liste];
  for (let i = sortie.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [sortie[i], sortie[j]] = [sortie[j], sortie[i]];
  }
  return sortie;
}

export function itemsReparation(lessonId: string): ItemReparation[] {
  const qcm = QCM_LECONS[lessonId];
  if (!qcm) return [];
  const sources = [
    ...(qcm.pieges ?? []).map((q, i) => ({ q, cle: `repar:${lessonId}:p${i}` })),
    { q: qcm.rappel, cle: `repar:${lessonId}:r` },
    { q: qcm.synthese, cle: `repar:${lessonId}:s` },
  ].slice(0, 3);
  return sources.map(({ q }, i) => ({
    cle: `repar:${lessonId}:${i}`,
    question: q.question,
    options: melange(q.options, `${lessonId}:${i}`),
    bonne: q.options[0],
    explication: q.explication,
  }));
}

export default function JourneeReparation({ lessonId, onTermine, onFermer }: Props) {
  const items = useMemo(() => itemsReparation(lessonId), [lessonId]);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState<string | null>(null);
  const item = items[index];

  if (!items.length) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8">
        <p className="oeil">جولة التصحيح</p>
        <h1 className="titre-1 mt-1">ما فماش أسئلة لهذا الدرس</h1>
        <p className="petit doux mt-1">نرجعو للبوّابة مباشرة — بلا حساب، بلا عجلة.</p>
        <button type="button" className="btn--primaire mt-4 w-full" onClick={onTermine}>
          رجوع إلى البوّابة
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8">
        <p className="oeil">جولة التصحيح · تمّت</p>
        <h1 className="titre-1 mt-1">أصلحنا ما كان ناقصًا</h1>
        <p className="petit doux mt-1">{titreLecon(lessonId)} — نرجعو للبوّابة، وهذه المرّة تعرف الجواب.</p>
        <button type="button" className="btn--primaire mt-4 w-full" onClick={onTermine}>
          أعد المحاولة في البوّابة
        </button>
        <button type="button" className="btn-mini mt-2 w-full" onClick={onFermer}>
          يكفي اليوم
        </button>
      </div>
    );
  }

  const correct = choix === item.bonne;

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="rangee rangee--entre">
        <p className="oeil">جولة التصحيح · {nb(index + 1)} من {nb(items.length)}</p>
        <button type="button" className="btn-mini" onClick={onFermer}>
          يكفي اليوم
        </button>
      </div>
      <h1 className="titre-1 mt-1">{titreLecon(lessonId)}</h1>
      <p className="petit doux mt-1">سؤالان قصيران قبل ما نرجعو — هذا ليس اختبارًا.</p>

      <section className="carte mt-4 p-5">
        <p className="text-sm font-bold leading-relaxed">{item.question}</p>
        <div className="mt-3 space-y-2">
          {item.options.map((option) => {
            const estChoisie = choix === option;
            const estBonne = option === item.bonne;
            const style = !choix
              ? 'border-line bg-paper hover:border-forest'
              : estBonne
                ? 'border-forest bg-sage text-forest-deep'
                : estChoisie
                  ? 'border-honey-line bg-honey-soft text-honey-ink'
                  : 'border-line bg-paper opacity-70';
            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(choix)}
                onClick={() => setChoix(option)}
                className={`w-full rounded-2xl border px-4 py-3 text-right text-sm font-bold leading-relaxed transition ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {choix && (
          <div className="mt-3 rounded-xl border border-line bg-bg px-3 py-2">
            <p className="text-[13px] font-bold leading-relaxed text-ink">
              {correct ? 'صحيح — ' : 'نوضّح — '}
              {item.explication}
            </p>
          </div>
        )}
      </section>

      {choix && (
        <button
          type="button"
          className="btn--primaire mt-3 w-full"
          onClick={() => {
            setChoix(null);
            setIndex(index + 1);
          }}
        >
          {index + 1 < items.length ? 'التالي' : 'رجوع إلى البوّابة'}
        </button>
      )}

      <div className="mt-4">
        <MascotteKunz compact message="الخطأ هاذ هو الطريق — نمشيو بالشوية ونصلحو." />
      </div>
    </div>
  );
}
