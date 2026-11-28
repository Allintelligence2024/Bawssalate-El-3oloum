// « اختر حالتك اليوم » — شريط سريع وهادئ يكيّف حصّة اليوم مع طاقة التلميذ
// دون تكرار بطاقة المرشد الموجودة في البطل أعلاه.
//   عيان      → 60 ثانية / سبرينت خفيف / يوم راحة محمي
//   لاباس     → مهمّة اليوم
//   في الفورمة → موضوع كامل أو البوصلة 1-2-3

import type { ReactElement } from 'react';
import { nb } from '../utils/dates';
import type { TypeMission } from '../utils/planDuJour';
import { IcoBouclier, IcoCible, IcoEclair, IcoLune, IcoSoleil } from './Icones';

export type Energie = 'fatigue' | 'moyen' | 'forme';

interface Props {
  mission: { titre: string; minutes: number; type: TypeMission };
  /** Revues restées en liste après le plafond (jamais présentées comme une dette). */
  reportees: number;
  energie: Energie | null;
  onEnergie: (e: Energie) => void;
  /** L'action principale de la mission (même fonction que le bouton de mission). */
  onMission: () => void;
  onDefi60?: () => void;
  onSprint3Min?: () => void;
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  onUltimes?: () => void;
  /** درع الراحة الأسبوعي: يوم راحة واحد يحفظ السلسلة بلا تأنيب. */
  bouclierReposDispo?: boolean;
  jourReposActif?: boolean;
  onActiverJourRepos?: () => void;
  /** Invitation douce à créer un compte, après la première micro-victoire. */
  invitation?: { creer: () => void; plusTard: () => void };
  nomSujet?: string;
}

const CHOIX: {
  id: Energie;
  libelle: string;
  precision: string;
  Icone: (props: { className?: string }) => ReactElement;
}[] = [
  { id: 'fatigue', libelle: 'عيان', precision: 'دقيقة وحدة تكفي', Icone: IcoLune },
  { id: 'moyen', libelle: 'لاباس', precision: 'مهمّة اليوم', Icone: IcoSoleil },
  { id: 'forme', libelle: 'في الفورمة', precision: 'نتمرّن أكثر', Icone: IcoEclair },
];

export default function GuideAccueil({
  mission,
  reportees,
  energie,
  onEnergie,
  onMission,
  onDefi60,
  onSprint3Min,
  onFakh,
  onBriques,
  onSujetGuide,
  onUltimes,
  bouclierReposDispo = false,
  jourReposActif = false,
  onActiverJourRepos,
  invitation,
  nomSujet,
}: Props) {
  return (
    <section className="carte p-3.5" aria-label="اختر حالتك اليوم">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold text-ink">اختر حالتك اليوم</p>
        {energie && (
          <span className="text-[11px] font-bold text-forest">
            {energie === 'fatigue'
              ? 'وضع خفيف بلا ضغط'
              : energie === 'moyen'
                ? 'إيقاع متوازن'
                : 'تحدّي المستوى العالي'}
          </span>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2" role="group" aria-label="كيف حالك اليوم">
        {CHOIX.map(({ id, libelle, precision, Icone }) => {
          const actif = energie === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={actif}
              onClick={() => onEnergie(id)}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-2.5 py-2 text-start transition ${
                actif
                  ? 'border-forest bg-sage-soft text-forest-deep'
                  : 'border-line bg-bg/60 text-ink hover:border-forest/50'
              }`}
            >
              <span className="block h-5 w-5 shrink-0 text-forest" aria-hidden>
                <Icone />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-extrabold">{libelle}</span>
                <span className="block truncate text-[10px] text-mute">{precision}</span>
              </span>
            </button>
          );
        })}
      </div>

      {energie === 'fatigue' && (onSprint3Min || onFakh || onDefi60 || onActiverJourRepos) && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="petit doux">خفّف على روحك اليوم — بلا كتابة وبلا ضغط:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {onSprint3Min && (
              <button
                type="button"
                className="btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold"
                onClick={onSprint3Min}
              >
                سبرينت ٣ دقائق · بلا ضغط
              </button>
            )}
            {onFakh && (
              <button
                type="button"
                className={
                  onSprint3Min
                    ? 'btn-mini min-h-[44px] flex-1'
                    : 'btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold'
                }
                onClick={onFakh}
              >
                صيّاد الفخاخ · دقيقتين
              </button>
            )}
            {onDefi60 && (
              <button type="button" className="btn-mini min-h-[44px]" onClick={onDefi60}>
                تحدّي 60 ثانية
              </button>
            )}
          </div>
          {onActiverJourRepos && (
            <div className="mt-2.5 border-t border-line/70 pt-2.5">
              {jourReposActif ? (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-forest/30 bg-sage-soft/60 px-3 py-2 text-xs font-bold text-forest-deep"
                >
                  <span className="block h-4 w-4 shrink-0 text-forest" aria-hidden="true">
                    <IcoBouclier />
                  </span>
                  <span>يوم راحة محمي مفعّل لليوم — سلسلتك محفوظة، ارتاح بلا تأنيب.</span>
                </p>
              ) : bouclierReposDispo ? (
                <button
                  type="button"
                  onClick={onActiverJourRepos}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-forest/40 bg-paper px-3 py-2 text-xs font-extrabold text-forest-deep transition hover:bg-sage-soft/60"
                >
                  <span className="block h-4 w-4 shrink-0 text-forest" aria-hidden="true">
                    <IcoBouclier />
                  </span>
                  <span>فعّل يوم راحة محمي (يحفظ السلسلة · مرّة في الأسبوع)</span>
                </button>
              ) : (
                <p className="text-[11px] leading-relaxed text-mute">
                  استعملت درع الراحة لهذا الأسبوع — يتجدّد تلقائيًا يوم الأحد القادم.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {energie === 'moyen' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-mute">مهمّة اليوم · {nb(mission.minutes)} دقائق</p>
            <p className="text-sm font-bold text-ink">{mission.titre}</p>
          </div>
          <button
            type="button"
            className="btn--primaire min-h-[44px] shrink-0 px-4 text-xs font-extrabold"
            onClick={onMission}
          >
            نبدأ من هنا ←
          </button>
        </div>
      )}

      {energie === 'forme' && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="petit doux">نبني جوابًا علميًا قويًا بالوثائق، ونشوف وين ينقصنا بالضبط:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {onUltimes && (
              <button
                type="button"
                className="btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold"
                onClick={onUltimes}
              >
                التمارين القصوى · بالوثائق
              </button>
            )}
            {!onUltimes && onSujetGuide && (
              <button
                type="button"
                className="btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold"
                onClick={onSujetGuide}
              >
                موضوع كامل · خطوة بخطوة
                {nomSujet && <span className="ms-1 text-[11px] font-normal opacity-80">({nomSujet})</span>}
              </button>
            )}
            {onBriques && (
              <button
                type="button"
                className={
                  onUltimes || onSujetGuide
                    ? 'btn-mini min-h-[44px]'
                    : 'btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold'
                }
                onClick={onBriques}
              >
                البوصلة 1-2-3
              </button>
            )}
          </div>
        </div>
      )}

      {reportees > 0 && (
        <p className="mt-2.5 flex items-start gap-2 border-t border-line/70 pt-2.5 text-xs font-bold leading-relaxed text-forest-deep">
          <span className="mt-0.5 block h-3.5 w-3.5 shrink-0 text-forest" aria-hidden>
            <IcoCible />
          </span>
          بقيت {nb(Math.min(reportees, 5))} مراجعة في القائمة — تنتظر دورها، بلا عجلة وبلا دين.
        </p>
      )}

      {invitation && (
        <div className="mt-3 border-t border-gold-soft pt-3">
          <p className="text-sm font-bold text-forest-deep">أوّل انتصار — نحفظوه؟</p>
          <p className="petit doux mt-1">
            تقدّمك محفوظ على هذا الهاتف. حساب مجّاني يخلّيه يتبعك إذا بدّلت الجهاز — بلا إرسال
            لبريدك.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn--primaire min-h-[44px] flex-1 px-4 text-xs font-extrabold"
              onClick={invitation.creer}
            >
              أنشئ حسابي
            </button>
            <button type="button" className="btn-mini min-h-[44px]" onClick={invitation.plusTard}>
              نكمّل بلا حساب
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
