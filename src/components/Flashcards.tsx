// البطاقات — شاشة كاملة (lazy). اقلب، ثم «عرفتها / لم أعرفها». لا علامة ولا نسبة.

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import { titreLecon, uniteDeLecon } from '../data/programme';
import { libelleType, repondreCarte, resumeCartes, sessionDuJour, TAILLE_SESSION, type Carte, type EtatCarte } from '../utils/flashcards';
import { nb } from '../utils/dates';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onReponse: (carteId: string, etatCarte: EtatCarte) => void;
  onOuvrirLecon: (lessonId: string) => void;
  onFermer: () => void;
}

export default function Flashcards({ etat, onReponse, onOuvrirLecon, onFermer }: Props) {
  // الجلسة تُثبَّت عند الفتح كي لا تتغيّر البطاقات تحت الأصابع بعد كل إجابة
  const session = useMemo(() => sessionDuJour(etat), []); // eslint-disable-line react-hooks/exhaustive-deps
  const resume = resumeCartes(etat);
  const [i, setI] = useState(0);
  const [retourne, setRetourne] = useState(false);
  const [connues, setConnues] = useState(0);
  const [aRevoir, setARevoir] = useState<Carte[]>([]);

  const carte = session[i];
  const fini = !carte;

  function repondre(connue: boolean) {
    if (!carte) return;
    onReponse(carte.id, repondreCarte(etat.flashcards?.[carte.id], connue));
    if (connue) setConnues((n) => n + 1);
    else setARevoir((l) => [...l, carte]);
    setRetourne(false);
    setI((k) => k + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="sticky top-0 z-20 border-b border-line bg-paper px-4 pb-3 pt-4">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            onClick={onFermer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-mute transition-colors hover:bg-sage-soft"
            aria-label="رجوع"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-mute">البطاقات</p>
            <h1 className="truncate text-base font-bold">
              {fini ? 'انتهت جلسة اليوم' : `بطاقة ${nb(i + 1)} من ${nb(session.length)}`}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 pt-4">
        <div className="mx-auto max-w-xl">
          {resume.disponibles === 0 && (
            <section className="card p-6 text-center">
              <p className="font-naskh text-xl font-bold">لا بطاقات بعد</p>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                تُفتح بطاقات كل درس بعد إنهاء بروتوكوله — أو أضف درسًا إلى المفضّلة (☆) لتظهر بطاقاته هنا. ثلاث بطاقات لكل درس:
                استرجاع، دليل، فخّ.
              </p>
              <button type="button" onClick={onFermer} className="btn btn-primary mt-5 w-full text-sm">
                إلى طريقي
              </button>
            </section>
          )}

          {resume.disponibles > 0 && !fini && (
            <>
              <p className="mb-3 text-[11px] text-mute">
                {nb(resume.dues)} مستحقّة اليوم من {nb(resume.disponibles)} · الجلسة حتى {nb(TAILLE_SESSION)} بطاقة
              </p>
              <button
                type="button"
                onClick={() => setRetourne((r) => !r)}
                className="card w-full p-6 text-right"
                aria-pressed={retourne}
                aria-label={retourne ? 'الوجه الخلفي' : 'اقلب البطاقة'}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-sage-soft px-2.5 py-1 text-[11px] font-bold text-forest-deep">
                    {libelleType(carte.type)}
                  </span>
                  <span className="truncate text-[11px] text-mute">
                    {(() => {
                      const u = uniteDeLecon(carte.lessonId);
                      return `${u ? `الوحدة ${nb(u.numero)} · ` : ''}${titreLecon(carte.lessonId)}`;
                    })()}
                  </span>
                </div>
                {!retourne ? (
                  <>
                    <p className="font-naskh mt-4 text-xl font-bold leading-snug">{carte.recto}</p>
                    <p className="mt-6 text-center text-xs text-mute">المس البطاقة لقلبها</p>
                  </>
                ) : (
                  <ol className="mt-4 space-y-2 text-sm leading-relaxed">
                    {carte.verso.map((l, k) => (
                      <li key={k} className="flex gap-2">
                        {carte.verso.length > 1 && <span className="shrink-0 font-bold text-forest tnum">{nb(k + 1)}.</span>}
                        <span>{l}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </button>

              {retourne && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => repondre(false)} className="btn btn-ghost border border-line text-sm">
                    لم أعرفها — غدًا
                  </button>
                  <button type="button" onClick={() => repondre(true)} className="btn btn-primary text-sm">
                    عرفتها
                  </button>
                </div>
              )}
              {retourne && (
                <button
                  type="button"
                  onClick={() => onOuvrirLecon(carte.lessonId)}
                  className="mt-3 w-full text-center text-xs font-bold text-forest hover:underline"
                >
                  افتح الدرس للقراءة
                </button>
              )}
            </>
          )}

          {resume.disponibles > 0 && fini && (
            <section className="card p-6">
              <p className="eyebrow">حصيلة الجلسة</p>
              <p className="font-naskh mt-2 text-xl font-bold">
                {session.length === 0
                  ? 'لا بطاقة مستحقّة اليوم — عد غدًا.'
                  : connues === session.length
                    ? 'كلّها معروفة. تنتقل إلى صناديق أبعد.'
                    : `${nb(connues)} معروفة · ${nb(aRevoir.length)} تعود غدًا`}
              </p>
              {aRevoir.length > 0 && (
                <ul className="mt-3 divide-y divide-line text-sm">
                  {aRevoir.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                      <span className="min-w-0 truncate">{libelleType(c.type)} · {titreLecon(c.lessonId)}</span>
                      <button type="button" onClick={() => onOuvrirLecon(c.lessonId)} className="shrink-0 text-xs font-bold text-forest">
                        اقرأ
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-mute">
                الصناديق: {nb(resume.parBoite[1])} غدًا · {nb(resume.parBoite[2])} بعد ثلاثة أيام · {nb(resume.parBoite[3])} بعد أسبوع.
                البطاقات لا تغيّر حالة الدروس ولا مواعيد استرجاعها.
              </p>
              <button type="button" onClick={onFermer} className="btn btn-primary mt-5 w-full text-sm">
                رجوع
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
