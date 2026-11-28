// مسار الدرس السريع بأسلوب Duolingo BAC — 3 خطوات مباشرة (~8 دقائق)
// الخطوة 1: افهم الفكرة (3 د) — السؤال العلمي + الآلية + الدليل والشكل + الصوت الاختياري
// الخطوة 2: ثبّت بالتمرين (3 د) — 3 بطاقات تفاعلية سريعة (آلية · دليل علمي · فخّ الباك)
// الخطوة 3: جملة الباك + البطاقة + الملخّص الصوتي القصير (2 د) — تثبيت الصياغة، بطاقة الدرس، والملخّص الصوتي

import { useEffect, useMemo, useState } from 'react';
import { getLessonGoldSummary, type LessonGoldSummary } from '../data/lessonGoldSummaries';
import { titreLecon, uniteDeLecon } from '../data/programme';
import { aContenuLecon, questionLecon } from '../data/leconsPassives';
import { aujourdhui, nb } from '../utils/dates';
import { premiereRevision } from '../utils/srs';
import { noterReponse } from '../utils/stats';
import { sonFaux, sonJuste } from '../utils/son';
import { qcmPourLecon } from '../utils/qcm';
import { prechaufferSchemasSvt } from '../utils/schemasSvtChargeur';
import {
  chargerAudioLecons,
  lireAudioLeconsCache,
  prechaufferAudioLecons,
} from '../utils/audioLeconsChargeur';
import {
  DUREE_LECON_RAPIDE_MIN,
  ETAPES_LECON,
  construireCarteBac,
  construireCartesExercice,
  construireResumeCourtAr,
  etapeInitialeDepuisProgression,
  phasesPourEtape,
  type CarteExerciceRapide,
} from '../utils/leconRapide';
import type { ProgressionLecon } from '../types';
import { IcoDocument, IcoRetour, IcoVerifie } from './Icones';
import IllustrationsLecon from './IllustrationsLecon';
import LecteurAudioResume from './LecteurAudioResume';
import CarteLecon from './CarteLecon';

interface Props {
  lessonId: string;
  progression: ProgressionLecon | undefined;
  onProgresse: (p: ProgressionLecon) => void;
  onTerminer: (p: ProgressionLecon, minutes: number) => void;
  onLireLecon: () => void;
  leconLue: boolean;
  onFermer: () => void;
  onAllerMethodo?: () => void;
}

function progressionBase(p?: ProgressionLecon): ProgressionLecon {
  return (
    p ?? {
      statut: 'en_cours',
      phases: [],
      minutes: 0,
      repetitions: 0,
      intervalle: 0,
      facilite: 2.5,
      reponses: {},
    }
  );
}

/**
 * مشغّل الملخّص الصوتي القصير في نهاية الدرس:
 * - يستعمل تلقائيًا الملف الصوتي المسجّل بصوت المُرشد (55/55 درس رسمي) عبر LecteurAudioResume.
 * - ولأيّ درس إضافي دون ملف MP3 (مثل مكتسبات 2AS)، يوفّر قراءة صوتية عربية عبر Web Speech API
 *   مع النصّ المختصر المقروء لضمان تغطية 100% من الدروس.
 */
function ResumeAudioFinLecon({
  lessonId,
  lecon,
  titre,
}: {
  lessonId: string;
  lecon: LessonGoldSummary;
  titre: string;
}) {
  const [aPisteMp3, setAPisteMp3] = useState<boolean | null>(() => {
    const cache = lireAudioLeconsCache();
    return cache ? cache.some((p) => p.lessonId === lessonId) : null;
  });
  const [enLectureTts, setEnLectureTts] = useState(false);

  const texteCourt = useMemo(() => construireResumeCourtAr(lecon, titre), [lecon, titre]);
  const ttsDisponible =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  useEffect(() => {
    let actif = true;
    const cache = lireAudioLeconsCache();
    if (cache) {
      setAPisteMp3(cache.some((p) => p.lessonId === lessonId));
      return;
    }
    void chargerAudioLecons()
      .then((liste) => {
        if (actif) setAPisteMp3(liste.some((p) => p.lessonId === lessonId));
      })
      .catch(() => {
        if (actif) setAPisteMp3(false);
      });
    return () => {
      actif = false;
    };
  }, [lessonId]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lessonId]);

  function basculerTts() {
    if (!ttsDisponible) return;
    if (enLectureTts) {
      window.speechSynthesis.cancel();
      setEnLectureTts(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texteCourt);
    u.lang = 'ar-DZ';
    u.rate = 0.98;
    u.onend = () => setEnLectureTts(false);
    u.onerror = () => setEnLectureTts(false);
    setEnLectureTts(true);
    window.speechSynthesis.speak(u);
  }

  if (aPisteMp3 !== false) {
    return <LecteurAudioResume lessonId={lessonId} />;
  }

  return (
    <section
      dir="rtl"
      aria-label={`ملخّص صوتي قصير للدرس: ${titre}`}
      className="rounded-2xl border border-sage bg-sage-soft/50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold text-forest-deep">ملخّص صوتي قصير للدرس</p>
          <p className="text-[11px] text-mute">استمع للخلاصة السريعة بالعربية في أقلّ من دقيقة</p>
        </div>
        {ttsDisponible && (
          <button
            type="button"
            onClick={basculerTts}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest px-3.5 py-2 text-xs font-extrabold text-paper transition-colors hover:bg-forest-deep"
          >
            <span>{enLectureTts ? 'إيقاف القراءة' : 'استمع للملخّص القصير'}</span>
          </button>
        )}
      </div>
      <p className="mt-2.5 rounded-xl border border-line bg-paper p-3 text-xs leading-relaxed text-ink">
        {texteCourt}
      </p>
    </section>
  );
}

/** بطاقة سؤال تفاعلية بأسلوب Duolingo: تغذية راجعة فورية خضراء/حمراء + شرح موجز. */
function CarteQuestionDuolingo({
  carte,
  choix,
  validee,
  onChoisir,
}: {
  carte: CarteExerciceRapide;
  choix: string | null;
  validee: boolean;
  onChoisir: (option: string) => void;
}) {
  const estJuste = choix === carte.bonneReponse;

  return (
    <div className="carte p-4 sm:p-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
            carte.categorie === 'piege'
              ? 'bg-honey-soft text-honey-ink'
              : 'bg-primary-soft text-forest'
          }`}
        >
          {carte.badgeAr}
        </span>
        {validee && (
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-forest">
            <span className="block h-4 w-4">
              <IcoVerifie />
            </span>
            <span>إجابة صحيحة</span>
          </span>
        )}
      </div>

      <h3 className="font-naskh text-base font-extrabold leading-relaxed text-ink sm:text-lg">
        {carte.question}
      </h3>

      <div className="mt-4 flex flex-col gap-2.5">
        {carte.options.map((opt, idx) => {
          const selectionne = choix === opt;
          const bonne = opt === carte.bonneReponse;
          let etatStyle = 'border-line bg-paper text-ink hover:border-forest/50 hover:bg-sage-soft/50';
          if (validee && bonne) {
            etatStyle = 'border-2 border-forest bg-primary-soft text-ink font-extrabold';
          } else if (selectionne && !bonne) {
            etatStyle = 'border-2 border-error bg-error-soft text-ink';
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={validee}
              onClick={() => onChoisir(opt)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-right text-sm leading-snug transition-colors disabled:cursor-default ${etatStyle}`}
            >
              <span
                className={`tnum grid h-7 w-7 flex-none place-items-center rounded-lg text-xs font-black ${
                  validee && bonne
                    ? 'bg-forest text-paper'
                    : selectionne && !bonne
                      ? 'bg-error text-white'
                      : 'border border-line bg-bg text-mute'
                }`}
                aria-hidden="true"
              >
                {validee && bonne ? (
                  <span className="block h-3.5 w-3.5">
                    <IcoVerifie />
                  </span>
                ) : (
                  nb(idx + 1)
                )}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {choix !== null && (
        <div
          role="status"
          className={`mt-4 rounded-2xl border p-3.5 text-xs leading-relaxed ${
            estJuste
              ? 'border-forest/35 bg-primary-soft text-ink'
              : 'border-error/40 bg-error-soft text-ink'
          }`}
        >
          <p className={`font-extrabold ${estJuste ? 'text-forest' : 'text-error'}`}>
            {estJuste ? 'ممتاز — ثبّتّ الفكرة بدقّة.' : 'ليست هذه — انتبه للفخّ وجرّب خيارًا آخر.'}
          </p>
          {estJuste && <p className="mt-1 text-ink-soft">{carte.explication}</p>}
        </div>
      )}
    </div>
  );
}

export default function ProtocoleRunner({
  lessonId,
  progression,
  onProgresse,
  onTerminer,
  onLireLecon,
  onFermer,
  onAllerMethodo,
}: Props) {
  const lecon = getLessonGoldSummary(lessonId);
  const unite = uniteDeLecon(lessonId);
  const titre = titreLecon(lessonId);
  const qcmLecon = useMemo(() => qcmPourLecon(lessonId, lecon), [lessonId, lecon]);

  const cartes = useMemo(
    () => (lecon ? construireCartesExercice(lessonId, lecon, qcmLecon ?? undefined) : []),
    [lessonId, lecon, qcmLecon]
  );
  const carteBac = useMemo(
    () => (lecon ? construireCarteBac(lessonId, lecon, qcmLecon ?? undefined) : null),
    [lessonId, lecon, qcmLecon]
  );

  const [etape, setEtape] = useState<0 | 1 | 2>(() => etapeInitialeDepuisProgression(progression));
  const [carteIndex, setCarteIndex] = useState(0);
  const [choixCarte, setChoixCarte] = useState<string | null>(null);
  const [carteValidee, setCarteValidee] = useState(false);

  const [choixBac, setChoixBac] = useState<string | null>(null);
  const [bacValide, setBacValide] = useState(() => (progression?.phases?.length ?? 0) >= 6);
  const [erreurs, setErreurs] = useState(0);

  useEffect(() => {
    prechaufferSchemasSvt();
    prechaufferAudioLecons();
  }, [lessonId]);

  if (!lecon) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 pt-20 text-center">
        <p className="text-mute">الدرس المطلوب غير متوفّر في قاعدة البيانات.</p>
        <button type="button" onClick={onFermer} className="btn btn-ghost mt-4">
          رجوع
        </button>
      </div>
    );
  }

  const questionPrincipale = questionLecon(lessonId)?.trim() || lecon.missionAr;
  const metaEtape = ETAPES_LECON[etape];
  const fragile = erreurs >= 2;

  // نسبة التقدّم البصرية في شريط Duolingo العلوي
  const progressionBarre =
    etape === 0
      ? 24
      : etape === 1
        ? 38 + Math.round(((carteIndex + (carteValidee ? 1 : 0)) / Math.max(cartes.length, 1)) * 34)
        : bacValide
          ? 100
          : 82;

  function passerEtape2() {
    const base = progressionBase(progression);
    onProgresse({
      ...base,
      statut: 'en_cours',
      phases: phasesPourEtape(0),
      minutes: Math.max(base.minutes, 3),
      derniereSession: aujourdhui(),
    });
    setCarteIndex(0);
    setChoixCarte(null);
    setCarteValidee(false);
    setEtape(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function choisirOptionCarte(option: string) {
    const courante = cartes[carteIndex];
    if (!courante || carteValidee) return;
    setChoixCarte(option);
    if (option === courante.bonneReponse) {
      sonJuste();
      noterReponse('phase', true);
      setCarteValidee(true);
    } else {
      sonFaux();
      noterReponse('phase', false);
      setErreurs((e) => e + 1);
    }
  }

  function carteSuivante() {
    if (carteIndex < cartes.length - 1) {
      setCarteIndex((i) => i + 1);
      setChoixCarte(null);
      setCarteValidee(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const base = progressionBase(progression);
    onProgresse({
      ...base,
      statut: 'en_cours',
      phases: phasesPourEtape(1),
      minutes: Math.max(base.minutes, 6),
      derniereSession: aujourdhui(),
    });
    setEtape(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function choisirOptionBac(option: string) {
    if (!carteBac || bacValide) return;
    setChoixBac(option);
    if (option === carteBac.bonneReponse) {
      sonJuste();
      noterReponse('phase', true);
      setBacValide(true);
      const base = progressionBase(progression);
      onProgresse({
        ...base,
        statut: 'en_cours',
        phases: phasesPourEtape(2),
        minutes: Math.max(base.minutes, DUREE_LECON_RAPIDE_MIN),
        derniereSession: aujourdhui(),
        fragile,
      });
    } else {
      sonFaux();
      noterReponse('phase', false);
      setErreurs((e) => e + 1);
    }
  }

  function cloturerLecon() {
    const base = progressionBase(progression);
    const maj = premiereRevision(
      {
        ...base,
        statut: 'terminee',
        phases: [1, 2, 3, 4, 5, 6],
        minutes: Math.max(base.minutes, DUREE_LECON_RAPIDE_MIN),
        derniereSession: aujourdhui(),
        fragile,
      },
      fragile
    );
    onTerminer(maj, DUREE_LECON_RAPIDE_MIN);
  }

  const carteActuelle = cartes[carteIndex];

  return (
    <div dir="rtl" className="min-h-dvh bg-bg pb-24">
      {/* شريط علوي ثابت بأسلوب Duolingo: رجوع + شريط تقدّم + الدرس الكامل (اختياري) */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onFermer}
            aria-label="العودة إلى المسار"
            className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-line bg-bg text-ink transition-colors hover:border-forest/40"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate font-extrabold text-ink">
                {nb(etape + 1)} / 3 · {metaEtape.titreAr}
              </span>
              <span className="tnum flex-none font-bold text-forest">{metaEtape.dureeAr}</span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressionBarre}
              aria-label="تقدّم الدرس"
            >
              <div
                className="h-full rounded-full bg-leaf transition-all duration-300"
                style={{ width: `${progressionBarre}%` }}
              />
            </div>
          </div>

          {aContenuLecon(lessonId) && (
            <button
              type="button"
              onClick={onLireLecon}
              aria-label="عرض الدرس الكامل"
              className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-xs font-bold text-forest transition-colors hover:border-forest/40"
            >
              <span className="block h-4 w-4" aria-hidden="true">
                <IcoDocument />
              </span>
              <span className="hidden sm:inline">الدرس الكامل</span>
            </button>
          )}
        </div>

        {/* مؤشّر الخطوات الثلاث القابل للنقر للرجوع السريع */}
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-1.5 px-4 pb-2.5">
          {ETAPES_LECON.map((e) => {
            const active = e.index === etape;
            const passee = e.index < etape;
            return (
              <button
                key={e.index}
                type="button"
                disabled={e.index > etape && !(e.index === 2 && bacValide)}
                onClick={() => setEtape(e.index)}
                className={`rounded-xl px-2 py-1 text-center text-[11px] font-extrabold transition-colors disabled:opacity-60 ${
                  active
                    ? 'bg-primary-soft text-forest'
                    : passee
                      ? 'bg-bg text-ink-soft hover:text-forest'
                      : 'bg-transparent text-mute'
                }`}
              >
                {nb(e.index + 1)}. {e.titreAr}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5">
        {/* عنوان الدرس وموقعه */}
        <div className="mb-4">
          {unite && (
            <p className="oeil">
              الوحدة {nb(unite.numero)} · {unite.titre}
            </p>
          )}
          <h1 className="font-naskh mt-1 text-xl font-extrabold leading-snug text-ink sm:text-2xl">
            {titre}
          </h1>
          <p className="mt-1 text-xs text-mute">{metaEtape.sousTitreAr}</p>
        </div>

        {/* ─────────────── الخطوة 1: افهم الفكرة (3 دقائق) ─────────────── */}
        {etape === 0 && (
          <div className="space-y-4">
            {/* المشكل العلمي للدرس */}
            <section className="rounded-2xl border border-honey-line bg-honey-soft p-4">
              <p className="text-[11px] font-extrabold text-honey-ink">سؤال الدرس (المشكل العلمي)</p>
              <p className="font-naskh mt-1.5 text-base font-extrabold leading-relaxed text-ink">
                {questionPrincipale}
              </p>
            </section>

            {/* الآلية العلمية بخطوات واضحة ومباشرة */}
            <section className="carte p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-extrabold text-ink">الآلية الأساسية بخطوات واضحة</h2>
                <span className="tnum text-[11px] font-bold text-forest">
                  {nb(lecon.mechanismAr.length)} خطوات
                </span>
              </div>
              <ol className="space-y-2.5">
                {lecon.mechanismAr.map((ligne, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl bg-bg p-3">
                    <span className="tnum mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-primary-soft text-xs font-black text-forest">
                      {nb(i + 1)}
                    </span>
                    <p className="text-sm leading-relaxed text-ink">{ligne}</p>
                  </li>
                ))}
              </ol>

              {/* الدليل التجريبي والوثيقة */}
              <div className="mt-4 rounded-xl border border-forest/25 bg-primary-soft/60 p-3.5">
                <p className="text-[11px] font-extrabold text-forest">الدليل الوثائقي في البكالوريا</p>
                <p className="mt-1 text-xs leading-relaxed text-ink">{lecon.evidenceAr}</p>
              </div>

              {/* الرسومات التوضيحية الرسمية إن وُجدت */}
              <div className="mt-3">
                <IllustrationsLecon lessonId={lessonId} compacte />
              </div>

              {/* مصطلحات مفتاحية */}
              {lecon.vocabulary.length > 0 && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="mb-2 text-[11px] font-extrabold text-mute">المصطلحات المفتاحية</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lecon.vocabulary.map((mot) => (
                      <span
                        key={mot}
                        className="rounded-lg border border-line bg-bg px-2.5 py-1 text-xs font-bold text-ink-soft"
                      >
                        {mot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ملخّص صوتي اختياري أثناء الفهم */}
            <LecteurAudioResume lessonId={lessonId} compact masquerTexte />

            <button
              type="button"
              onClick={passerEtape2}
              className="btn btn-primary min-h-12 w-full text-sm font-extrabold"
            >
              فهمت الفكرة — نطبّق الآن
            </button>
          </div>
        )}

        {/* ─────────────── الخطوة 2: ثبّت بالتمرين (3 دقائق) ─────────────── */}
        {etape === 1 && carteActuelle && (
          <div className="space-y-4">
            {/* مؤشّر البطاقات الثلاث */}
            <div className="flex items-center justify-between gap-2">
              <span className="tnum text-xs font-extrabold text-ink-soft">
                بطاقة {nb(carteIndex + 1)} من {nb(cartes.length)}
              </span>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {cartes.map((c, idx) => (
                  <span
                    key={c.id}
                    className={`h-2 rounded-full transition-all ${
                      idx < carteIndex || (idx === carteIndex && carteValidee)
                        ? 'w-7 bg-leaf'
                        : idx === carteIndex
                          ? 'w-7 bg-forest'
                          : 'w-2.5 bg-line'
                    }`}
                  />
                ))}
              </div>
            </div>

            <CarteQuestionDuolingo
              carte={carteActuelle}
              choix={choixCarte}
              validee={carteValidee}
              onChoisir={choisirOptionCarte}
            />

            {carteValidee && (
              <button
                type="button"
                onClick={carteSuivante}
                className="btn btn-primary min-h-12 w-full text-sm font-extrabold"
              >
                {carteIndex < cartes.length - 1
                  ? 'البطاقة التالية'
                  : 'إلى جملة الباك والملخّص الصوتي'}
              </button>
            )}
          </div>
        )}

        {/* ─────────────── الخطوة 3: جملة الباك + البطاقة + الملخّص الصوتي (2 د) ─────────────── */}
        {etape === 2 && carteBac && (
          <div className="space-y-4">
            {/* قالب الصياغة الرسمية للبكالوريا */}
            {lecon.bacSentenceFrameAr && (
              <section className="rounded-2xl border border-forest/30 bg-primary-soft/70 p-4">
                <p className="text-[11px] font-extrabold text-forest">
                  قالب الإجابة النموذجية في الباك (جملة الباك)
                </p>
                <p className="font-naskh mt-1.5 text-sm font-bold leading-relaxed text-ink">
                  {lecon.bacSentenceFrameAr}
                </p>
              </section>
            )}

            {/* سؤال تثبيت جملة الباك */}
            <CarteQuestionDuolingo
              carte={carteBac}
              choix={choixBac}
              validee={bacValide}
              onChoisir={choisirOptionBac}
            />

            {/* بعد التحقّق: فتح بطاقة الدرس + الملخّص الصوتي القصير في نهاية الدرس */}
            {bacValide && (
              <div className="space-y-4 pt-1">
                <CarteLecon lessonId={lessonId} compact />

                {/* الملخّص الصوتي القصير للدرس بالعربية (نهاية كلّ درس) */}
                <div>
                  <p className="oeil mb-2">ختام الدرس · ملخّص صوتي قصير بالعربية</p>
                  <ResumeAudioFinLecon lessonId={lessonId} lecon={lecon} titre={titre} />
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={cloturerLecon}
                    className="btn btn-primary min-h-12 w-full text-sm font-extrabold"
                  >
                    أنهيت الدرس — تثبيت التقدّم والعودة
                  </button>
                  {onAllerMethodo && (
                    <button
                      type="button"
                      onClick={onAllerMethodo}
                      className="btn btn-ghost min-h-11 w-full text-xs font-bold"
                    >
                      طبّق المنهجية الآن على تمرين باك
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
