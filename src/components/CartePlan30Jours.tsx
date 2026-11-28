// خطة المراجعة لـ 30 يومًا في علوم الطبيعة والحياة — تُحمَّل تلقائيًّا في «الرئيسية».
// مبنية بالكامل على بيانات التلميذ (الدروس الهشّة، الاسترجاع المستحق، الامتحانات، التموضع، ثقل الوحدات).

import { useMemo, useState } from 'react';
import type { Etat } from '../types';
import { formatCourteAr, nb } from '../utils/dates';
import { genererPlan30JoursScience, type JourPlanScience } from '../utils/plan30Jours';
import { IcoBoussole, IcoChrono, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  onBasculerJourFait: (cle: string) => void;
  onOuvrirLecon?: (lessonId: string) => void;
  onDemarrerRevision?: (lessonIds: string[]) => void;
  onOuvrirExamen?: () => void;
  onOuvrirFakh?: () => void;
}

const LIBELLE_ACTION: Record<JourPlanScience['actionType'], string> = {
  revision: 'راجع الآن',
  lecon: 'افتح الدرس',
  fakh: 'افتح صيّاد الفخاخ',
  examen: 'افتح التمارين القصوى',
  repos_leger: 'جولة خفيفة',
};

const LIBELLE_TYPE: Record<JourPlanScience['actionType'], string> = {
  revision: 'تثبيت واسترجاع',
  lecon: 'مراجعة درس',
  fakh: 'فخاخ ومنهجية',
  examen: 'التمارين القصوى',
  repos_leger: 'تنفّس وتثبيت',
};

export default function CartePlan30Jours({
  etat,
  onBasculerJourFait,
  onOuvrirLecon,
  onDemarrerRevision,
  onOuvrirExamen,
  onOuvrirFakh,
}: Props) {
  const [deplie, setDeplie] = useState(false);
  const [semaineActive, setSemaineActive] = useState(0);

  const plan = useMemo(() => genererPlan30JoursScience(etat), [etat]);
  const planFait = etat.plan30Jours?.fait ?? [];
  const aujourdhui = plan.aujourdhui;
  const aujFait = planFait.includes(aujourdhui.cle);
  const totalFaits = plan.jours.filter((j) => planFait.includes(j.cle)).length;
  const pct = Math.round((totalFaits / 30) * 100);

  const semaines = useMemo(
    () => [
      { id: 0, label: 'الأسبوع 1', jours: plan.jours.slice(0, 7) },
      { id: 1, label: 'الأسبوع 2', jours: plan.jours.slice(7, 14) },
      { id: 2, label: 'الأسبوع 3', jours: plan.jours.slice(14, 21) },
      { id: 3, label: 'الأسبوع 4', jours: plan.jours.slice(21, 30) },
    ],
    [plan.jours],
  );

  function lancerAction(jour: JourPlanScience): void {
    if (jour.actionType === 'revision' && jour.lessonId && onDemarrerRevision) {
      onDemarrerRevision([jour.lessonId]);
      return;
    }
    if ((jour.actionType === 'lecon' || jour.actionType === 'revision') && jour.lessonId && onOuvrirLecon) {
      onOuvrirLecon(jour.lessonId);
      return;
    }
    if (jour.actionType === 'examen' && onOuvrirExamen) {
      onOuvrirExamen();
      return;
    }
    if ((jour.actionType === 'fakh' || jour.actionType === 'repos_leger') && onOuvrirFakh) {
      onOuvrirFakh();
    }
  }

  return (
    <section
      className="card p-5"
      aria-label="خطة مراجعة العلوم لـ 30 يومًا"
      data-testid="carte-plan-30j"
    >
      {/* ترويسة الخطة + تقدّم الأيام */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-forest">
            <span className="block h-4 w-4 shrink-0" aria-hidden="true">
              <IcoBoussole />
            </span>
            <span>خطتك الذكية لـ 30 يومًا في العلوم</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-mute">
            {plan.resumeDonnees.sourcePrincipale}
          </p>
        </div>

        <div className="text-end shrink-0">
          <p className="tnum text-sm font-black text-forest-deep">
            {nb(totalFaits)} / {nb(30)} يومًا
          </p>
          <p className="tnum text-[11px] text-mute">
            إيقاع {nb(plan.resumeDonnees.minutesParJour)} د / اليوم
          </p>
        </div>
      </div>

      {/* شريط تقدّم نظيف للـ 30 يومًا */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line/70" aria-hidden="true">
        <div
          className="h-full rounded-full bg-forest transition-all duration-300"
          style={{ width: `${Math.max(3, pct)}%` }}
        />
      </div>

      {/* برنامج اليوم — يظهر تلقائيًّا في الرئيسية بفصل خطّي نظيف بلا بطاقة مزدوجة */}
      <div
        className={`mt-4 border-t border-line pt-4 ${
          aujFait ? 'opacity-90' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mute">
          <div className="flex flex-wrap items-center gap-1.5 font-bold text-ink-soft">
            <span className="font-extrabold text-forest">برنامج اليوم</span>
            <span aria-hidden="true">·</span>
            <span>{aujourdhui.jourSemaineAr}</span>
            <span aria-hidden="true">·</span>
            <span className="tnum">{formatCourteAr(aujourdhui.dateIso)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-ink-soft">
            <span className="block h-3.5 w-3.5 text-forest" aria-hidden="true">
              <IcoChrono />
            </span>
            <span className="tnum">{nb(aujourdhui.minutes)} دقيقة</span>
            <span aria-hidden="true">·</span>
            <span>{LIBELLE_TYPE[aujourdhui.actionType]}</span>
          </div>
        </div>

        <div className="mt-2">
          {aujourdhui.uniteTitre && (
            <p className="text-xs font-bold text-forest">
              الوحدة: {aujourdhui.uniteTitre}
            </p>
          )}
          <h3 className="font-naskh mt-0.5 text-lg font-extrabold leading-snug text-ink">
            {aujourdhui.titre}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {aujourdhui.raisonDonnees}
          </p>
        </div>

        {/* خطوات تنفيذ ملموسة اليوم */}
        <ol className="mt-3 space-y-1.5 border-t border-line/60 pt-3">
          {aujourdhui.etapes.map((etape, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
              <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-soft text-[11px] font-extrabold text-forest">
                {nb(idx + 1)}
              </span>
              <span>{etape}</span>
            </li>
          ))}
        </ol>

        {/* أزرار اليوم — لا تبدأ بـ «ابدأ» للحفاظ على وحدة الزر الرئيسي في البطاقة العليا */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => lancerAction(aujourdhui)}
            className="btn btn-primary min-h-[44px] flex-1 whitespace-nowrap text-xs"
          >
            {LIBELLE_ACTION[aujourdhui.actionType]}
          </button>
          <button
            type="button"
            onClick={() => onBasculerJourFait(aujourdhui.cle)}
            aria-pressed={aujFait}
            className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-extrabold whitespace-nowrap transition-colors ${
              aujFait
                ? 'border-forest bg-forest text-paper'
                : 'border-line bg-paper text-ink-soft hover:border-forest hover:text-forest'
            }`}
          >
            <span className="block h-4 w-4" aria-hidden="true">
              <IcoVerifie />
            </span>
            <span>{aujFait ? 'أُنجز اليوم' : 'حدّد كمُنجز'}</span>
          </button>
        </div>
      </div>

      {/* زر فتح/إغلاق جدول الـ 30 يومًا بالكامل */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
        <p className="text-[11px] text-mute">
          الأولويات الحالية: {plan.resumeDonnees.unitesPrioritaires.join(' · ')}
        </p>
        <button
          type="button"
          onClick={() => setDeplie((v) => !v)}
          aria-expanded={deplie}
          className="min-h-[40px] rounded-xl px-2.5 text-xs font-extrabold text-forest transition-colors hover:bg-sage-soft/70"
        >
          {deplie ? 'إخفاء جدول 30 يومًا ▲' : 'عرض جدول الـ 30 يومًا كاملًا ▼'}
        </button>
      </div>

      {deplie && (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          {/* تبويبات الأسابيع الأربعة */}
          <div
            className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-bg p-1"
            role="tablist"
            aria-label="أسابيع خطة 30 يومًا"
          >
            {semaines.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={semaineActive === s.id}
                onClick={() => setSemaineActive(s.id)}
                className={`min-h-[40px] rounded-lg px-2 text-xs font-extrabold whitespace-nowrap transition-colors ${
                  semaineActive === s.id
                    ? 'bg-forest text-paper'
                    : 'text-ink-soft hover:text-forest'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <ul className="space-y-2">
            {semaines[semaineActive]?.jours.map((jour) => {
              const coche = planFait.includes(jour.cle);
              return (
                <li
                  key={jour.cle}
                  className={`flex items-start gap-2.5 rounded-2xl border p-3 transition-colors ${
                    coche
                      ? 'border-forest/35 bg-sage-soft/45'
                      : jour.estAujourdhui
                        ? 'border-forest/50 bg-cream'
                        : jour.estWeekend
                          ? 'border-gold-soft bg-gold-soft/20'
                          : 'border-line bg-paper'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onBasculerJourFait(jour.cle)}
                    aria-pressed={coche}
                    aria-label={`تحديد اليوم ${jour.index} كمُنجز`}
                    className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${
                      coche
                        ? 'border-forest bg-forest text-paper'
                        : 'border-line bg-bg text-ink-soft hover:border-forest'
                    }`}
                  >
                    {coche ? (
                      <span className="block h-4 w-4">
                        <IcoVerifie />
                      </span>
                    ) : (
                      <span className="tnum text-xs font-extrabold">{nb(jour.index)}</span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-bold text-mute">
                      <span className={jour.estAujourdhui ? 'text-forest font-extrabold' : ''}>
                        {jour.estAujourdhui ? 'اليوم' : jour.jourSemaineAr}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tnum">{formatCourteAr(jour.dateIso)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tnum">{nb(jour.minutes)} د</span>
                      <span aria-hidden="true">·</span>
                      <span>{LIBELLE_TYPE[jour.actionType]}</span>
                    </div>
                    <p
                      className={`mt-0.5 text-sm font-extrabold leading-snug ${
                        coche ? 'text-forest-deep line-through opacity-75' : 'text-ink'
                      }`}
                    >
                      {jour.titre}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-mute">
                      {jour.raisonDonnees}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => lancerAction(jour)}
                    className="btn-mini min-h-[40px] shrink-0 self-center whitespace-nowrap"
                  >
                    {LIBELLE_ACTION[jour.actionType]}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
