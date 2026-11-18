// اختبار التموضع (P2.1) — 22 سؤالًا، ≈ 12 دقيقة، قابل للرفض بلمسة واحدة.
// قياس لا تدريب: جواب واحد لكل سؤال، لا تصحيح فوري، لا كشف للجواب الصحيح (الاختبار قابل للإعادة لاحقًا).
// النتيجة بالكلمات (قوّة / متوسّط / للتثبيت) لكل وحدة — لا علامة، لا نسبة، لا مقارنة، ولا يفتح الطريق.

import { useMemo, useState } from 'react';
import { UNITE_PAR_ID } from '../data/programme';
import {
  DUREE_DIAGNOSTIC_MIN,
  bilanDiagnostic,
  evaluerDiagnostic,
  type Diagnostic as ResultatDiagnostic,
} from '../utils/diagnostic';
import { questionsDiagnostic } from '../utils/diagnosticQuestions';
import { melange } from '../utils/melange';
import { nb } from '../utils/dates';

interface Props {
  /** إن وُجد نتيجة سابقة: نعرض البيان مباشرة مع إمكانية الإعادة */
  precedent?: ResultatDiagnostic;
  onTerminer: (d: ResultatDiagnostic) => void;
  onRefuser: () => void;
  onFermer: () => void;
}

type Etape = { type: 'intro' } | { type: 'question'; i: number } | { type: 'bilan'; d: ResultatDiagnostic };

export default function Diagnostic({ precedent, onTerminer, onRefuser, onFermer }: Props) {
  const questions = useMemo(() => questionsDiagnostic(), []);
  // ترتيب عرض الخيارات لكل سؤال (ثابت طوال الجلسة): مصفوفة فهارس البنك
  const ordres = useMemo(() => questions.map((q) => melange(q.options.map((_, k) => k))), [questions]);
  const [reponses, setReponses] = useState<Array<number | null>>(() => questions.map(() => null));
  const [etape, setEtape] = useState<Etape>(() => (precedent ? { type: 'bilan', d: precedent } : { type: 'intro' }));

  function repondre(i: number, indexBanque: number) {
    const suivantes = [...reponses];
    suivantes[i] = indexBanque;
    setReponses(suivantes);
    if (i + 1 < questions.length) {
      setEtape({ type: 'question', i: i + 1 });
    } else {
      const d = evaluerDiagnostic(questions, suivantes, new Date().toISOString());
      onTerminer(d);
      setEtape({ type: 'bilan', d });
    }
  }

  function passer(i: number) {
    repondreNull(i);
  }
  function repondreNull(i: number) {
    const suivantes = [...reponses];
    suivantes[i] = null;
    setReponses(suivantes);
    if (i + 1 < questions.length) setEtape({ type: 'question', i: i + 1 });
    else {
      const d = evaluerDiagnostic(questions, suivantes, new Date().toISOString());
      onTerminer(d);
      setEtape({ type: 'bilan', d });
    }
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-cream">
      <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-8">
        {etape.type === 'intro' && (
          <section className="card p-6">
            <p className="eyebrow">اختبار التموضع</p>
            <h1 className="font-naskh mt-2 text-3xl font-black leading-tight">أين تقف اليوم؟</h1>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              {nb(questions.length)} سؤالًا، نحو {nb(DUREE_DIAGNOSTIC_MIN)} دقيقة. جواب واحد لكل سؤال، ولا تصحيح أثناءه —
              هذا قياس هادئ لا تدريب. في النهاية ترى بالكلمات ما هو متين عندك وما يستحقّ تثبيتًا.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />لا علامة ولا ترتيب — ولا يُقارن بأحد.</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />لا يغيّر طريقك: الدروس تُفتح بترتيبها كما هي.</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />يمكنك تأجيله وإعادته متى شئت من «أنا».</li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" className="btn btn-primary text-sm" onClick={() => setEtape({ type: 'question', i: 0 })}>
                أبدأ الآن
              </button>
              <button type="button" className="btn btn-ghost text-sm text-forest-deep" onClick={onRefuser}>
                لاحقًا
              </button>
            </div>
          </section>
        )}

        {etape.type === 'question' && (() => {
          const i = etape.i;
          const q = questions[i];
          const u = UNITE_PAR_ID[q.uniteId];
          return (
            <section className="card p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">سؤال {nb(i + 1)} من {nb(questions.length)}</p>
                <button type="button" onClick={onFermer} className="text-xs font-bold text-mute hover:text-ink">
                  إيقاف
                </button>
              </div>
              <p className="mt-2 text-[11px] font-bold text-forest">الوحدة {nb(u?.numero ?? 0)} · {u?.titre}</p>
              <h2 className="font-naskh mt-3 text-xl font-bold leading-snug">{q.question}</h2>
              <div className="mt-4 flex flex-col gap-2">
                {ordres[i].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => repondre(i, k)}
                    className="rounded-2xl border border-line bg-paper px-4 py-3 text-right text-sm leading-relaxed transition-colors hover:border-forest"
                  >
                    {q.options[k]}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => passer(i)} className="mt-4 text-xs font-bold text-mute hover:text-ink">
                لا أعرف — التالي
              </button>
            </section>
          );
        })()}

        {etape.type === 'bilan' && (() => {
          const b = bilanDiagnostic(etape.d);
          const bloc = (titre: string, ids: string[], ton: string) =>
            ids.length ? (
              <div className={`mt-4 rounded-2xl border p-4 ${ton}`}>
                <p className="text-xs font-bold">{titre}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {ids.map((id) => (
                    <li key={id}>الوحدة {nb(UNITE_PAR_ID[id].numero)} · {UNITE_PAR_ID[id].titre}</li>
                  ))}
                </ul>
              </div>
            ) : null;
          return (
            <section className="card p-6">
              <p className="eyebrow">بيان التموضع</p>
              <h1 className="font-naskh mt-2 text-2xl font-black leading-tight">صورتك اليوم، بالكلمات</h1>
              <p className="mt-2 text-xs text-mute">
                {new Date(etape.d.date).toLocaleDateString('ar-DZ')} · يمكنك الإعادة متى شئت.
              </p>
              {bloc('متين عندك', b.fortes, 'border-sage bg-sage-soft/60 text-forest-deep')}
              {bloc('متوسّط — سيترسّخ في الطريق', b.moyennes, 'border-line bg-paper text-ink')}
              {bloc('يستحقّ تثبيتًا هادئًا حين يأتي دوره', b.fragiles, 'border-gold-soft bg-gold-soft/50 text-forest-deep')}
              <p className="mt-4 text-xs leading-relaxed text-mute">
                الطريق لا يتغيّر: الدروس تُفتح بترتيبها، والمحرّك يعرض مهمّة واحدة كل يوم. هذا البيان يذكّرك فقط أين تضع
                انتباهك الزائد.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" className="btn btn-primary text-sm" onClick={onFermer}>
                  إلى طريقي
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-sm text-forest-deep"
                  onClick={() => {
                    setReponses(questions.map(() => null));
                    setEtape({ type: 'question', i: 0 });
                  }}
                >
                  إعادة الاختبار
                </button>
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
