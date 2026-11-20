// «المُرشد الموسّع» (P3.5) — شجرة بالنقر: فرع → سؤال → جواب + «انظر أيضًا». غير متّصل، بلا توليد.

import { useState } from 'react';
import { BRANCHES, QUESTIONS, questionParId, questionsDeBranche, type LienMourchid } from '../data/mourchid';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';

interface Props {
  onAller: (vers: LienMourchid) => void;
  onFermer: () => void;
}

export default function Mourchid({ onAller, onFermer }: Props) {
  const [branche, setBranche] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const question = questionId ? questionParId(questionId) : undefined;
  const brancheCourante = BRANCHES.find((b) => b.id === (question?.branche ?? branche));

  function retour() {
    if (question) setQuestionId(null);
    else if (branche) setBranche(null);
    else onFermer();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={retour} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft" aria-label="رجوع">
            <span className="block h-5 w-5"><IcoRetour /></span>
          </button>
          <div className="min-w-0">
            <p className="eyebrow">المُرشد · {nb(QUESTIONS.length)} سؤالًا في المنهجية</p>
            <h1 className="font-naskh truncate text-xl font-black">{question ? brancheCourante?.titre : brancheCourante?.titre ?? 'اسأل المُرشد'}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-3xl">
          {!branche && !question && (
            <>
              <div className="card flex items-center gap-4 p-5">
                <img src="/mascotte.png" alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div>
                  <p className="font-naskh text-lg font-bold leading-snug">اختر ما يشغلك، وسأجيب بما يُفيد يوم الامتحان.</p>
                  <p className="mt-1 text-xs text-mute">أجوبة مكتوبة ومراجَعة، تعمل بلا إنترنت. ليس روبوت محادثة — ولا يدّعي ذلك.</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-2">
                {BRANCHES.map((b) => (
                  <li key={b.id}>
                    <button type="button" onClick={() => setBranche(b.id)} className="card w-full p-4 text-start transition-colors hover:border-forest">
                      <p className="text-sm font-bold">{b.titre}</p>
                      <p className="mt-0.5 text-xs text-mute">{b.accroche} · {nb(questionsDeBranche(b.id).length)} أسئلة</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {branche && !question && (
            <ul className="grid gap-2">
              {questionsDeBranche(branche).map((q) => (
                <li key={q.id}>
                  <button type="button" onClick={() => setQuestionId(q.id)} className="card w-full p-4 text-start text-sm font-bold transition-colors hover:border-forest">
                    {q.question}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {question && (
            <article className="card p-5">
              <div className="flex items-start gap-3">
                <img src="/mascotte.png" alt="" className="h-12 w-12 shrink-0 object-contain" />
                <h2 className="font-naskh text-lg font-bold leading-snug">{question.question}</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed">
                {question.reponse.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {question.lien && (
                <button type="button" onClick={() => onAller(question.lien!.vers)} className="btn btn-primary mt-5 w-full text-sm">
                  {question.lien.libelle} ←
                </button>
              )}
              {question.voirAussi && question.voirAussi.length > 0 && (
                <div className="mt-5 border-t border-line pt-3">
                  <p className="eyebrow">انظر أيضًا</p>
                  <ul className="mt-2 space-y-1">
                    {question.voirAussi.map((id) => {
                      const q = questionParId(id);
                      return q ? (
                        <li key={id}>
                          <button type="button" onClick={() => { setBranche(q.branche); setQuestionId(q.id); }} className="text-sm font-bold text-forest hover:underline">
                            {q.question}
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
