// « سبرينت ٣ دقائق » — جلسة ميكرو-تركيز (6 أسئلة: تذكّر + فخاخ الباك + منهجية).
// مؤقّت اختياري قابل للتحويل فورًا إلى «بلا ضغط»، تغذية راجعة مزدوجة (أيقونة SVG + شرح)،
// ولهجة عربية واضحة محفّزة بلمسة جزائرية طبيعية.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Etat } from '../types';
import { aujourdhui, nb } from '../utils/dates';
import { composerSprint3Min } from '../utils/sprint3Min';
import { IcoAide, IcoChrono, IcoRetour, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  modeZenInitial?: boolean;
  onItemReussi?: (id: string, erreurs?: number) => void;
  onTermine: () => void;
  onFermer: () => void;
}

const DUREE_SECONDES = 180;

function formatMinuteur(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Sprint3Min({
  etat,
  modeZenInitial = false,
  onItemReussi,
  onTermine,
  onFermer,
}: Props) {
  const [serie, setSerie] = useState(0);
  const items = useMemo(
    () => composerSprint3Min(etat, `${aujourdhui()}:s${serie}`),
    [etat, serie],
  );
  const [index, setIndex] = useState(0);
  const [modeZen, setModeZen] = useState(modeZenInitial);
  const [secondes, setSecondes] = useState(DUREE_SECONDES);
  const [choix, setChoix] = useState<string | null>(null);
  const [justesDirects, setJustesDirects] = useState(0);
  const [termine, setTermine] = useState(false);
  const termineNotifie = useRef(false);

  useEffect(() => {
    if (modeZen || termine || secondes <= 0) return;
    const id = window.setInterval(() => {
      setSecondes((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [modeZen, termine, secondes]);

  const courant = items[index];
  const estJuste = choix !== null && courant && choix === courant.bonneReponse;

  function choisir(option: string): void {
    if (choix !== null || !courant) return;
    setChoix(option);
    if (option === courant.bonneReponse) {
      setJustesDirects((n) => n + 1);
      onItemReussi?.(courant.id, 0);
    }
  }

  function suivant(): void {
    if (index + 1 >= items.length) {
      setTermine(true);
      if (!termineNotifie.current) {
        termineNotifie.current = true;
        onTermine();
      }
      return;
    }
    setIndex((i) => i + 1);
    setChoix(null);
  }

  function rejouer(): void {
    termineNotifie.current = false;
    setSerie((s) => s + 1);
    setIndex(0);
    setChoix(null);
    setJustesDirects(0);
    setSecondes(DUREE_SECONDES);
    setTermine(false);
  }

  const progressionPct = items.length > 0 ? Math.round(((index + (choix ? 1 : 0)) / items.length) * 100) : 0;

  return (
    <div dir="rtl" className="min-h-dvh bg-bg pb-12">
      {/* شريط علوي هادئ */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onFermer}
            aria-label="رجوع"
            className="flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border border-line bg-paper px-3 text-xs font-extrabold text-ink-soft hover:border-forest"
          >
            <span className="block h-4 w-4">
              <IcoRetour />
            </span>
            <span>رجوع</span>
          </button>

          <div className="text-center">
            <p className="text-xs font-extrabold text-forest-deep">سبرينت ٣ دقائق</p>
            <p className="tnum text-[11px] font-bold text-mute">
              {termine ? `${nb(items.length)} / ${nb(items.length)}` : `${nb(index + 1)} من ${nb(items.length)}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModeZen((z) => !z)}
            aria-pressed={modeZen}
            className={`flex h-11 min-w-[44px] items-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition ${
              modeZen
                ? 'border-forest bg-sage-soft text-forest-deep'
                : 'border-line bg-paper text-ink-soft hover:border-forest'
            }`}
          >
            <span className="block h-4 w-4">
              <IcoChrono />
            </span>
            <span className="tnum">{modeZen ? 'بلا ضغط' : formatMinuteur(secondes)}</span>
          </button>
        </div>
        <div className="h-1 w-full bg-line">
          <div
            className="h-full bg-forest transition-all duration-300"
            style={{ width: `${progressionPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        {!termine && courant && (
          <section className="carte space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <span className="oeil">{courant.categorieAr}</span>
              <span className="text-xs font-bold text-mute">{courant.uniteTitre}</span>
            </div>

            {secondes === 0 && !modeZen && (
              <p role="status" className="rounded-xl border border-gold-soft bg-gold-soft/30 px-3 py-2 text-xs font-bold text-forest-deep">
                انتهت الـ 3 دقائق — ما كاينش عقاب، كمّل بتركيزك العادي!
              </p>
            )}

            <h1 className="font-naskh text-lg font-bold leading-relaxed text-ink">
              {courant.question}
            </h1>

            <div className="space-y-2.5" role="group" aria-label="اختيارات الإجابة">
              {courant.options.map((opt, i) => {
                const selectionne = choix === opt;
                const estBonneOption = opt === courant.bonneReponse;
                let style = 'border-line bg-paper text-ink hover:border-forest';
                if (choix !== null) {
                  if (estBonneOption) style = 'border-forest bg-sage-soft text-forest-deep font-extrabold';
                  else if (selectionne) style = 'border-clay bg-clay-soft/60 text-clay font-bold';
                  else style = 'border-line bg-paper/60 text-mute opacity-70';
                }
                return (
                  <button
                    key={`${courant.id}-${i}`}
                    type="button"
                    disabled={choix !== null}
                    onClick={() => choisir(opt)}
                    className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start text-sm leading-relaxed transition ${style}`}
                  >
                    <span className="flex-1">{opt}</span>
                    {choix !== null && estBonneOption && (
                      <span className="block h-5 w-5 shrink-0 text-forest" aria-hidden="true">
                        <IcoVerifie />
                      </span>
                    )}
                    {choix !== null && selectionne && !estBonneOption && (
                      <span className="block h-5 w-5 shrink-0 text-clay" aria-hidden="true">
                        <IcoAide />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {choix !== null && (
              <div
                role="status"
                className={`rounded-2xl border p-4 ${
                  estJuste
                    ? 'border-forest/40 bg-sage-soft/50 text-forest-deep'
                    : 'border-gold-soft bg-gold-soft/30 text-ink'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <span className="block h-5 w-5 shrink-0 text-forest" aria-hidden="true">
                    {estJuste ? <IcoVerifie /> : <IcoAide />}
                  </span>
                  <span>
                    {estJuste
                      ? 'يعطيك الصحّة! جواب دقيق.'
                      : 'فخّ مشهور — مليح اللي طحت فيه هنا قبل يوم الباك.'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{courant.explication}</p>
                <button
                  type="button"
                  onClick={suivant}
                  className="btn btn-primary mt-4 min-h-[44px] w-full text-sm"
                >
                  {index + 1 >= items.length ? 'إنهاء السبرينت' : 'السؤال التالي ←'}
                </button>
              </div>
            )}
          </section>
        )}

        {termine && (
          <section className="carte space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-forest/30 bg-sage-soft text-forest">
              <span className="block h-7 w-7">
                <IcoVerifie />
              </span>
            </div>
            <div>
              <p className="oeil">انتهت الجولة السريعة</p>
              <h1 className="font-naskh mt-1 text-2xl font-black text-forest-deep">
                راك في الطريق الصحيح!
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                أكملت <span className="tnum font-extrabold text-forest-deep">{nb(items.length)}</span> أسئلة
                ({nb(justesDirects)} من أول محاولة). خطوة صغيرة كل يوم خير من ساعات ضغط ليلة الامتحان.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={rejouer}
                className="btn btn-primary min-h-[44px] flex-1 text-sm"
              >
                جولة جديدة (3 دقائق)
              </button>
              <button
                type="button"
                onClick={onFermer}
                className="btn btn-ghost min-h-[44px] flex-1 text-sm"
              >
                رجوع
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
