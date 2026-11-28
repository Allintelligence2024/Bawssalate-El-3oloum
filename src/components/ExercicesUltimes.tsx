// التمارين القصوى — مساحة تدريب عليا بوثائق ومنحنيات أصلية (SVG) واستدلال علمي من 3 خطوات.

import { useState } from 'react';
import { EXERCICES_ULTIMES, type ExerciceUltime } from '../data/exercicesUltimes';
import type { Etat } from '../types';
import { nb } from '../utils/dates';
import { sonFaux, sonJuste } from '../utils/son';
import { IcoChevron, IcoCible, IcoRetour, IcoVerifie } from './Icones';
import SchemasUltimesSvg from './SchemasUltimesSvg';

interface Props {
  etat: Etat;
  onItemReussi: (id: string, erreurs?: number) => void;
  onFermer: () => void;
}

export default function ExercicesUltimes({ etat, onItemReussi, onFermer }: Props) {
  const [actifId, setActifId] = useState<string | null>(null);
  const faits = etat.drills ?? {};
  const nbReussis = EXERCICES_ULTIMES.filter((e) => Boolean(faits[e.id])).length;

  const exoActif = EXERCICES_ULTIMES.find((e) => e.id === actifId) ?? null;

  if (exoActif) {
    return (
      <AtelierExerciceUltime
        key={exoActif.id}
        exo={exoActif}
        dejaReussi={Boolean(faits[exoActif.id])}
        onReussi={(erreurs) => onItemReussi(exoActif.id, erreurs)}
        onRetourListe={() => setActifId(null)}
        onSuivant={() => {
          const idx = EXERCICES_ULTIMES.findIndex((x) => x.id === exoActif.id);
          const next = EXERCICES_ULTIMES[(idx + 1) % EXERCICES_ULTIMES.length];
          setActifId(next.id);
          window.scrollTo({ top: 0, behavior: 'auto' });
        }}
      />
    );
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-bg px-4 pb-16 pt-5">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onFermer}
            className="btn btn-ghost min-h-[44px] gap-1.5 px-3 text-xs"
          >
            <span className="block h-4 w-4" aria-hidden="true">
              <IcoRetour />
            </span>
            <span>رجوع إلى تدريباتي</span>
          </button>
          <span className="tnum rounded-full border border-forest/30 bg-sage-soft px-3 py-1 text-xs font-extrabold text-forest-deep">
            أنجزت {nb(nbReussis)} من {nb(EXERCICES_ULTIMES.length)}
          </span>
        </header>

        <section className="card mb-5 overflow-hidden border-forest/25">
          <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper sm:p-6">
            <p className="text-[11px] font-extrabold tracking-wide text-gold-soft">
              تحدّي المستوى العالي · بالوثائق والمنحنيات
            </p>
            <h1 className="font-naskh mt-1.5 text-2xl font-black leading-tight sm:text-3xl">
              التمارين القصوى
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper/85">
              ستّة تمارين تجريبية أصلية بوثائق ومنحنيات مرسومة بدقّة: تحلّل الدليل، تستدلّ علميًا،
              وتبني التركيب الكامل خطوة بخطوة بلا حشو.
            </p>
          </div>
        </section>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {EXERCICES_ULTIMES.map((exo, index) => {
            const fait = Boolean(faits[exo.id]);
            return (
              <article
                key={exo.id}
                className={`card flex flex-col justify-between p-4 transition-colors ${
                  fait ? 'border-forest/40 bg-sage-soft/25' : 'border-line bg-paper'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-forest">
                      تمرين {nb(index + 1)} · {exo.domaine}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-gold-soft/50 px-2 py-0.5 text-[10px] font-extrabold text-forest-deep">
                        {exo.niveau}
                      </span>
                      {fait && (
                        <span
                          className="inline-flex items-center gap-1 rounded-lg bg-forest px-2 py-0.5 text-[10px] font-extrabold text-paper"
                          aria-label="مُنجز"
                        >
                          <span className="block h-3 w-3" aria-hidden="true">
                            <IcoVerifie />
                          </span>
                          مُنجز
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className="font-naskh mt-2 text-lg font-extrabold leading-snug text-ink">
                    {exo.titre}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{exo.accroche}</p>
                  <p className="mt-2.5 text-[11px] font-bold text-mute tnum">
                    وثيقتان أصليّتان · 3 خطوات استدلال · ~{nb(exo.dureeMin)} دقائق
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActifId(exo.id)}
                  className="btn btn-primary mt-4 min-h-[44px] w-full text-xs"
                >
                  {fait ? 'أعد التمرين الأقصى' : 'ابدأ التمرين الأقصى'}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AtelierExerciceUltime({
  exo,
  dejaReussi,
  onReussi,
  onRetourListe,
  onSuivant,
}: {
  exo: ExerciceUltime;
  dejaReussi: boolean;
  onReussi: (erreurs: number) => void;
  onRetourListe: () => void;
  onSuivant: () => void;
}) {
  const [etapeIdx, setEtapeIdx] = useState(0);
  const [docActif, setDocActif] = useState<0 | 1>(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [valide, setValide] = useState(false);
  const [faux, setFaux] = useState<number | null>(null);
  const [erreurs, setErreurs] = useState(0);
  const [termine, setTermine] = useState(false);

  const etape = exo.etapes[etapeIdx];
  const progress = termine ? 100 : Math.round(((etapeIdx + (valide ? 1 : 0)) / exo.etapes.length) * 100);

  function verifier(): void {
    if (choix === null || valide) return;
    if (choix === etape.bonne) {
      sonJuste();
      setValide(true);
      setFaux(null);
      if (etapeIdx === exo.etapes.length - 1) {
        onReussi(erreurs);
      }
    } else {
      sonFaux();
      setFaux(choix);
      setErreurs((n) => n + 1);
      setChoix(null);
    }
  }

  function avancer(): void {
    if (etapeIdx < exo.etapes.length - 1) {
      setEtapeIdx((i) => i + 1);
      setChoix(null);
      setValide(false);
      setFaux(null);
      return;
    }
    setTermine(true);
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-bg px-4 pb-16 pt-4">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* شريط علوي مضغوط + تقدّم */}
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetourListe}
            className="btn btn-ghost min-h-[44px] shrink-0 gap-1.5 px-3 text-xs"
          >
            <span className="block h-4 w-4" aria-hidden="true">
              <IcoRetour />
            </span>
            <span>التمارين القصوى</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div
                className="h-full rounded-full bg-forest transition-all duration-300"
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>
          </div>
          <span className="tnum shrink-0 text-xs font-extrabold text-forest-deep">
            {termine ? 'مكتمل ✓' : `${nb(etapeIdx + 1)} / ${nb(exo.etapes.length)}`}
          </span>
        </header>

        {/* بطاقة السياق العلمي */}
        <section className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-forest">{exo.domaine}</span>
            <span className="rounded-lg bg-gold-soft/60 px-2.5 py-0.5 text-[11px] font-extrabold text-forest-deep">
              مستوى {exo.niveau}
            </span>
          </div>
          <h1 className="font-naskh mt-1.5 text-xl font-black leading-snug text-ink sm:text-2xl">
            {exo.titre}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{exo.contexte}</p>
        </section>

        {/* الوثائق الأصلية (SVG) — على الشاشات الواسعة جنبًا إلى جنب، وعلى الهاتف بتبديل سلس */}
        <section aria-label="الوثائق التجريبية" className="card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-naskh text-base font-extrabold text-ink">الوثائق التجريبية</h2>
            <div className="flex gap-1 rounded-xl border border-line bg-bg p-1 lg:hidden" role="tablist">
              {exo.documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  role="tab"
                  aria-selected={docActif === idx}
                  onClick={() => setDocActif(idx as 0 | 1)}
                  className={`min-h-[38px] rounded-lg px-3 text-xs font-extrabold transition-colors ${
                    docActif === idx ? 'bg-forest text-paper' : 'text-ink-soft'
                  }`}
                >
                  {doc.numero}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {exo.documents.map((doc, idx) => (
              <figure
                key={doc.id}
                className={`space-y-2 ${idx === docActif ? 'block' : 'hidden lg:block'}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-extrabold text-forest">{doc.numero}</span>
                  <span className="text-xs font-bold text-ink">{doc.titre}</span>
                </div>
                <SchemasUltimesSvg id={doc.id} />
                <figcaption className="text-[11px] leading-relaxed text-mute">
                  {doc.legende}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* منطقة الاستدلال التفاعلي أو شاشة الحلّ النهائي */}
        {!termine ? (
          <section className="card border-forest/30 p-4 sm:p-6" aria-label="خطوة الاستدلال">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-extrabold text-forest-deep">
                <span className="block h-3.5 w-3.5" aria-hidden="true">
                  <IcoCible />
                </span>
                الخطوة {nb(etapeIdx + 1)} · {etape.badge}
              </span>
              <span className="text-xs font-extrabold text-honey-ink">الفعل: {etape.verbe}</span>
            </div>

            <h2 className="font-naskh mt-3 text-lg font-extrabold leading-snug text-ink">
              {etape.question}
            </h2>

            <div className="mt-4 space-y-2.5">
              {etape.options.map((opt, idx) => {
                const estBonneAffichee = valide && idx === etape.bonne;
                const estFausse = faux === idx;
                const estSelectionnee = choix === idx;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={valide}
                    onClick={() => {
                      setChoix(idx);
                      setFaux(null);
                    }}
                    className={`flex min-h-[52px] w-full items-start gap-3 rounded-2xl border p-3.5 text-right text-sm font-bold leading-relaxed transition-colors ${
                      estBonneAffichee
                        ? 'border-forest bg-sage-soft text-forest-deep'
                        : estFausse
                          ? 'border-clay bg-clay-soft text-clay'
                          : estSelectionnee
                            ? 'border-forest bg-sage-soft/50 text-ink'
                            : 'border-line bg-paper text-ink hover:border-forest/50'
                    }`}
                  >
                    <span className="tnum mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-extrabold">
                      {nb(idx + 1)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {faux !== null && !valide && (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-xs font-bold leading-relaxed text-clay"
              >
                قراءة غير دقيقة للدليل — ارجع للوثيقتين وقارن القيم أو الآلية بدقّة ثمّ أعد الاختيار.
              </p>
            )}

            {valide && (
              <div className="mt-4 rounded-2xl border border-forest/30 bg-sage-soft/60 p-4">
                <p className="text-xs font-extrabold text-forest-deep">إجابة دقيقة ✓</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">{etape.explication}</p>
              </div>
            )}

            <div className="mt-4">
              {!valide ? (
                <button
                  type="button"
                  disabled={choix === null}
                  onClick={verifier}
                  className="btn btn-primary min-h-[48px] w-full text-sm"
                >
                  تحقّق من الاستدلال
                </button>
              ) : (
                <button
                  type="button"
                  onClick={avancer}
                  className="btn btn-primary min-h-[48px] w-full text-sm"
                >
                  {etapeIdx < exo.etapes.length - 1 ? 'الخطوة التالية ←' : 'اعرض الحلّ النموذجي الكامل ←'}
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className="card border-forest bg-paper p-5 sm:p-6" aria-label="الحل النموذجي">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest text-paper">
                <span className="block h-6 w-6" aria-hidden="true">
                  <IcoVerifie />
                </span>
              </span>
              <div>
                <p className="text-xs font-extrabold text-forest">
                  أتممت التمرين الأقصى {dejaReussi ? '· مراجعة مثبّتة' : '· +XP محفوظ'}
                </p>
                <h2 className="font-naskh text-xl font-black text-ink">الحلّ النموذجي المفصّل</h2>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-2xl border border-line bg-bg p-4">
              {exo.modeleComplet.map((ligne, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink">
                  {ligne}
                </p>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/45 p-4">
              <p className="text-xs font-extrabold text-forest-deep">القاعدة الذهبية للحفظ</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-ink">{exo.regleOr}</p>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={onSuivant}
                className="btn btn-primary min-h-[48px] w-full text-sm"
              >
                التمرين الأقصى التالي ←
              </button>
              <button
                type="button"
                onClick={onRetourListe}
                className="btn btn-ghost min-h-[48px] w-full text-sm"
              >
                كلّ التمارين القصوى
              </button>
            </div>
          </section>
        )}

        {/* تلميح سريع للحل النموذجي أثناء العمل لمن أراد مراجعته */}
        {!termine && (
          <details className="card group p-4">
            <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-2 text-xs font-extrabold text-ink-soft">
              <span>إطلالة سريعة على القاعدة المنهجية لهذا التمرين</span>
              <span className="block h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true">
                <IcoChevron />
              </span>
            </summary>
            <p className="mt-2.5 border-t border-line pt-2.5 text-xs leading-relaxed text-ink">
              {exo.regleOr}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
