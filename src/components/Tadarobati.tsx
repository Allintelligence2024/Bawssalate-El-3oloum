// تدريباتي — البوّابة الموحّدة للتمارين اليومية السريعة والتمارين القصوى.
// تدمج «كويست» و«التمارين القصوى» ومختبر الفضول في شاشة واحدة منظّمة بفلتر واضح.

import { useState } from 'react';
import { TOTAL_DEFS, TOTAL_QCM } from '../data/drills/axes';
import { EXERCICES_ULTIMES } from '../data/exercicesUltimes';
import { titreLecon } from '../data/programme';
import type { Etat } from '../types';
import { nb } from '../utils/dates';
import type { TypeDefi } from '../utils/defis';
import { etapesKouest, etapesReussies, leconDeLaQuete } from '../utils/kouest';
import { competenceDue, prochaineAction } from '../utils/moteur';
import { composerRevueCroisee, disponibiliteCroisee, nomDomaine } from '../utils/revueCroisee';
import type { Qualite } from '../utils/srs';
import { VERSION_APP } from '../utils/sync';
import CarteDefi from './CarteDefi';
import { IcoChevron, IcoChrono, IcoCible } from './Icones';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  // تمارين يومية وكويست
  onResultatKafaa?: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue?: boolean,
  ) => void;
  onDemarrerRevueCroisee?: () => void;
  onChoisirDefi?: (type: TypeDefi) => void;
  onDemarrerKouest?: (lessonId: string) => void;
  onDefi60?: () => void;
  onSprint3Min?: () => void;
  onAllerExercices?: () => void;
  // التمارين القصوى والمنهجية
  onOuvrirUltimes: () => void;
  onOuvrirMethodo: () => void;
  onOuvrirSchemas: () => void;
  onOuvrirFakh: () => void;
}

type Filtre = 'tout' | 'quotidien' | 'ultimes';

const ETAPES_METHODE = [
  'اقرأ التعليمات وحدّد الفعل (حلِّل، فسِّر، استنتج…) قبل ما تكتب.',
  'أجب من ذاكرتك أوّلًا — حتّى لو ناقص. الخطأ هنا ما يخسّركش.',
  'قارن بعناصر الإجابة، وسجّل الفخّ اللي طحت فيه.',
];

const VERBES_CLES = [
  { verbe: 'حلّل / قارن', role: 'استخراج معطيات الوثيقة بالأرقام' },
  { verbe: 'فسّر', role: 'ربط النتيجة بالسبب والآلية العلمية' },
  { verbe: 'استنتج', role: 'القاعدة المختصرة من الدليل مباشرة' },
  { verbe: 'وضّح / اشرح', role: 'تسلسل سببي كامل من الوثائق' },
];

function LigneAction({
  titre,
  sous,
  meta,
  action,
  accent,
  onClick,
}: {
  titre: string;
  sous: string;
  meta?: string;
  action: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`carte carte__ligne ${accent ? 'border-forest/40 bg-sage-soft/35' : ''}`}>
      <div className="carte__texte mx-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="carte__titre">{titre}</p>
          {meta && <span className="tnum text-xs font-bold text-honey-ink">{meta}</span>}
        </div>
        <p className="petit doux mt-1">{sous}</p>
      </div>
      <button
        type="button"
        className={
          accent
            ? 'btn btn-primary min-h-[44px] shrink-0 whitespace-nowrap px-4 text-xs'
            : 'btn-mini min-h-[42px] shrink-0 whitespace-nowrap'
        }
        onClick={onClick}
      >
        {action}
      </button>
    </div>
  );
}

export default function Tadarobati({
  etat,
  onResultatKafaa,
  onDemarrerRevueCroisee,
  onChoisirDefi,
  onDemarrerKouest,
  onDefi60,
  onSprint3Min,
  onAllerExercices,
  onOuvrirUltimes,
  onOuvrirMethodo,
  onOuvrirSchemas,
  onOuvrirFakh,
}: Props) {
  const [filtre, setFiltre] = useState<Filtre>('tout');

  const action = prochaineAction(etat);
  const competence = onResultatKafaa ? competenceDue(etat) : null;
  const croisee = disponibiliteCroisee(etat);
  const leconsCroisees =
    croisee === 'prete'
      ? etat.revueCroisee && !etat.revueCroisee.faiteLe && etat.revueCroisee.lessonIds.length >= 2
        ? etat.revueCroisee.lessonIds
        : composerRevueCroisee(etat)
      : [];

  const leconQuete = onDemarrerKouest ? leconDeLaQuete(etat) : null;
  const etapesQuete = leconQuete ? etapesKouest(leconQuete) : [];
  const faitesQuete = leconQuete ? etapesReussies(etat, leconQuete) : 0;

  const faitsDrills = etat.drills ?? {};
  const ultimesFaits = EXERCICES_ULTIMES.filter((e) => Boolean(faitsDrills[e.id])).length;

  const voirQuotidien = filtre === 'tout' || filtre === 'quotidien';
  const voirUltimes = filtre === 'tout' || filtre === 'ultimes';

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 pb-28 pt-6 lg:pb-12">
      {/* الترويسة الموحّدة */}
      <header className="mb-4">
        <p className="oeil">التمارين اليومية · التمارين القصوى والمنهجية</p>
        <h1 className="titre-1 mt-1">تدريباتي</h1>
        <p className="petit doux mt-1">
          تمارين قصيرة لتنشيط الذاكرة، وتمارين قصوى أصلية بالوثائق والمنحنيات، مع مختبر الفضول.
        </p>
      </header>

      {/* شريط الفلترة النظيف */}
      <div
        className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-paper p-1"
        role="tablist"
        aria-label="تصفية تدريباتي"
      >
        {(
          [
            ['tout', 'الكل'],
            ['quotidien', 'تمارين يومية'],
            ['ultimes', 'التمارين القصوى'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filtre === id}
            onClick={() => setFiltre(id)}
            className={`min-h-[42px] rounded-xl px-2 text-xs font-extrabold whitespace-nowrap transition-colors ${
              filtre === id ? 'bg-forest text-paper' : 'text-ink-soft hover:text-forest'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <MascotteKunz
          compact
          humeur="reflexion"
          message="ما هو الفعل؟ أين الدليل في الوثيقة؟ قبل كل إجابة في التمرين، اسأل نفسك السؤالين."
        />
      </div>

      {/* ── القسم 1: التمارين اليومية السريعة ── */}
      {voirQuotidien && (
        <section aria-label="التمارين اليومية السريعة" className="mb-6 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-naskh text-lg font-extrabold text-ink">تمارين يومية سريعة</h2>
            <span className="text-xs font-bold text-mute">بلا ضغط · خطوة بخطوة</span>
          </div>

          {/* كويست اليوم — 3 دقائق */}
          {leconQuete && onDemarrerKouest && (
            <section className="carte">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="oeil">كويست اليوم · 3 دقائق</span>
                <span className="tnum text-xs font-extrabold text-honey-ink">
                  {nb(faitesQuete)} من {nb(etapesQuete.length)}
                </span>
              </div>
              <p className="carte__titre mt-1">{titreLecon(leconQuete)}</p>
              <p className="petit doux mt-1">
                {nb(etapesQuete.length)} أسئلة اختيار من ذاكرتك — بلا كتابة وبلا وقت محسوب.
              </p>
              <button
                type="button"
                className="btn btn-primary mt-3 min-h-[44px] w-full text-sm"
                onClick={() => onDemarrerKouest(leconQuete)}
              >
                {faitesQuete === 0
                  ? 'افتح الكويست'
                  : faitesQuete >= etapesQuete.length
                    ? 'أعد الكويست'
                    : 'كمّل الكويست'}
              </button>
            </section>
          )}

          {/* سبرينت ٣ دقائق */}
          {onSprint3Min && (
            <section className="carte border-forest/30 bg-sage-soft/35" aria-label="سبرينت 3 دقائق">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-forest/25 bg-paper text-forest"
                    aria-hidden="true"
                  >
                    <span className="block h-5 w-5">
                      <IcoChrono />
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="oeil">سبرينت ٣ دقائق · 6 أسئلة</p>
                    <p className="carte__titre mt-0.5">تركيز سريع وتنشيط الذاكرة</p>
                    <p className="petit doux mt-1">
                      تذكّر + فخاخ التصحيح + منهجية — بمؤقّت خفيف أو بوضع «بلا ضغط».
                    </p>
                    {(etat.sprints3Min?.length ?? 0) > 0 && (
                      <p className="mt-1 text-[11px] font-bold text-forest tnum">
                        أنجزت {nb(etat.sprints3Min!.length)} جولة سبرينت حتى الآن
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSprint3Min}
                  className="btn btn-primary min-h-[44px] shrink-0 whitespace-nowrap px-4 text-xs"
                >
                  ابدأ السبرينت
                </button>
              </div>
            </section>
          )}

          {/* تحدّي 60 ثانية + بنك التدريبات */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {onDefi60 && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
                <div className="min-w-0">
                  <p className="oeil">تحدّي 60 ثانية</p>
                  <p className="petit doux mt-0.5">دقيقة تنشيط من أسئلة وحدتك بلا خسارة.</p>
                </div>
                <button type="button" className="btn-mini min-h-[42px] shrink-0" onClick={onDefi60}>
                  العب
                </button>
              </div>
            )}
            {onAllerExercices && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
                <div className="min-w-0">
                  <p className="oeil">بنك التدريبات</p>
                  <p className="petit doux mt-0.5 tnum">
                    {nb(TOTAL_QCM + TOTAL_DEFS)} سؤالًا وتعريفًا مصنّفة حسب المحور.
                  </p>
                </div>
                <button type="button" className="btn-mini min-h-[42px] shrink-0" onClick={onAllerExercices}>
                  تصفّح
                </button>
              </div>
            )}
          </div>

          {/* تحدّي الأسبوع */}
          {onChoisirDefi && action.type !== 'rappel' && <CarteDefi etat={etat} onChoisir={onChoisirDefi} />}

          {/* المراجعة المتقاطعة الأسبوعية */}
          {onDemarrerRevueCroisee && croisee === 'prete' && action.type !== 'rappel' && (
            <section className="card border border-line p-5">
              <p className="eyebrow">مراجعة متقاطعة · مرّة في الأسبوع</p>
              <p className="font-naskh mt-1 text-lg font-bold leading-snug text-forest-deep">
                {nb(leconsCroisees.length)} دروس من مجالات مختلفة، في جلسة واحدة
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {leconsCroisees.map((id) => (
                  <li key={id} className="flex items-baseline justify-between gap-3">
                    <span className="font-bold">{titreLecon(id)}</span>
                    <span className="shrink-0 text-[11px] text-mute">{nomDomaine(id)}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onDemarrerRevueCroisee} className="btn btn-primary mt-4 min-h-[44px] w-full text-sm">
                ابدأ المراجعة المتقاطعة
              </button>
            </section>
          )}
          {croisee === 'faite' && (
            <p className="text-center text-[11px] text-mute">
              المراجعة المتقاطعة لهذا الأسبوع أُنجزت — تعود الأحد القادم.
            </p>
          )}

          {/* بطاقة كفاءة منهجية */}
          {competence && onResultatKafaa && (
            <section className="card border-2 border-sage bg-sage-soft/40 p-5">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sage bg-paper text-forest"
                  aria-hidden="true"
                >
                  <span className="block h-5 w-5">
                    <IcoCible />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">بطاقة كفاءة · مراجعة منهجية</p>
                  <p className="font-naskh mt-1 text-base font-bold leading-snug text-forest-deep">
                    «{competence.carte.verbe}» — {competence.carte.exercice}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-mute">
                    فخّ يجب تجنّبه: {competence.carte.erreur}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onResultatKafaa(competence.key, 5, competence.carte, true)}
                  className="btn btn-primary min-h-[44px] text-xs"
                >
                  أتقنتها — أراجعها لاحقًا
                </button>
                <button
                  type="button"
                  onClick={() => onResultatKafaa(competence.key, 3, competence.carte, true)}
                  className="btn btn-ghost min-h-[44px] text-xs"
                >
                  كافحت قليلًا — غدًا
                </button>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ── القسم 2: التمارين القصوى ومختبر الفضول والمنهجية ── */}
      {voirUltimes && (
        <section aria-label="التمارين القصوى والمنهجية" className="mb-6 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-naskh text-lg font-extrabold text-ink">التمارين القصوى والمنهجية</h2>
            <span className="tnum text-xs font-bold text-mute">
              {nb(ultimesFaits)} / {nb(EXERCICES_ULTIMES.length)} تمارين قصوى مُنجزة
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <LigneAction
              accent
              titre="التمارين القصوى · مستوى قوّي بالوثائق"
              meta={`${nb(EXERCICES_ULTIMES.length)} تمارين أصلية`}
              sous="تمارين تجريبية أصلية بوثائق ومنحنيات مرسومة (SVG): تحليل، استدلال علمي، وتركيب نموذجي كامل."
              action="ابدأ التحدّي"
              onClick={onOuvrirUltimes}
            />
            <LigneAction
              titre="مختبر الفضول والمنهجية"
              sous="جرّب، بدّل الشروط، لاحظ التغيّر في التسجيلات، ثمّ تدرّب على ورشات المنهجية."
              action="افتح المختبر"
              onClick={onOuvrirMethodo}
            />
            <LigneAction
              titre="صيّاد الفخاخ"
              meta={etat.fakh && Object.keys(etat.fakh).length > 0 ? `${nb(Object.keys(etat.fakh).length)} مصيدة` : undefined}
              sous="جملة واحدة في كلّ مرّة: فخّ ولا صحيح؟ لتفادي خسارة النقاط السهلة."
              action="اصطد"
              onClick={onOuvrirFakh}
            />
            <LigneAction
              titre="الرسوم والمخطّطات"
              sous="ستّة رسوم للتسمية — الرسم الوظيفي الواضح يثبّت الفهم بسرعة."
              action="تدرّب"
              onClick={onOuvrirSchemas}
            />
          </div>

          {/* دليل المنهجية السريع — مطوي افتراضيًّا لتقليل التمرير ويُفتح بنقرة */}
          <details className="carte group p-4">
            <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-2 text-sm font-extrabold text-ink">
              <span>دليل سريع: كيفاش تخدم موضوع · الأفعال اللي تتكرّر</span>
              <span className="block h-4 w-4 shrink-0 text-mute transition-transform group-open:rotate-180" aria-hidden="true">
                <IcoChevron />
              </span>
            </summary>

            <div className="mt-3 grid gap-4 border-t border-line pt-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="carte__titre">كيفاش تخدم موضوع</h3>
                  <span className="text-xs font-bold text-mute">3 خطوات</span>
                </div>
                <ol className="flex flex-col gap-1.5">
                  {ETAPES_METHODE.map((e, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-soft text-[11px] font-extrabold text-forest"
                        aria-hidden="true"
                      >
                        {nb(i + 1)}
                      </span>
                      <span className="petit">{e}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-line pt-3 sm:border-t-0 sm:border-s sm:ps-4 sm:pt-0">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="carte__titre">الأفعال اللي تتكرّر</h3>
                  <span className="text-xs font-bold text-mute">في التمارين التجريبية</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {VERBES_CLES.map((v) => (
                    <li key={v.verbe} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-bold text-ink">{v.verbe}</span>
                      <span className="petit doux">{v.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </section>
      )}

      <p className="petit doux mt-5 text-center">
        بوصلة العلوم · نسخة {VERSION_APP} — لا علامة مقلقة، ولا وقت يحجب عنك التعلّم.
      </p>
    </div>
  );
}
