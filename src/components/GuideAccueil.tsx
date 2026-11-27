// « المرشد يفتح الحصة » — la carte d'accueil du guide, en tête de الرئيسية.
//
// Elle ne décide rien : la mission vient de `missionDuJour()` (moteur unique). Le guide
// demande seulement **comment l'élève se sent**, puis met en scène l'action que le moteur a
// déjà choisie — ou, s'il est à plat, un format de 60 secondes qui ne coûte rien.
//
//   عيان      (à plat)      → 60 s : « صيّاد الفخاخ » ou « تحدّي 60 ثانية »
//   لاباس     (ça va)       → la mission du jour, telle quelle
//   في الفورمة (en forme)   → البوصلة 1-2-3 (briques) ou un sujet guidé
//
// Toutes les icônes sont des SVG du dépôt : aucun emoji, aucune note, aucun chrono.

import type { ReactElement } from 'react';
import { nb } from '../utils/dates';
import type { TypeMission } from '../utils/planDuJour';
import MascotteKunz from './MascotteKunz';
import { IcoCible, IcoEclair, IcoLune, IcoSoleil } from './Icones';

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
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  /** Invitation douce à créer un compte, après la première micro-victoire. */
  invitation?: { creer: () => void; plusTard: () => void };
  nomSujet?: string;
}

const CHOIX: { id: Energie; libelle: string; precision: string; Icone: (props: { className?: string }) => ReactElement }[] = [
  { id: 'fatigue', libelle: 'عيان', precision: 'دقيقة وحدة تكفي', Icone: IcoLune },
  { id: 'moyen', libelle: 'لاباس', precision: 'مهمّة اليوم', Icone: IcoSoleil },
  { id: 'forme', libelle: 'في الفورمة', precision: 'نتمرّن أكثر', Icone: IcoEclair },
];

const MESSAGE: Record<Energie | 'defaut', string> = {
  defaut: 'كيف حالك اليوم؟ اختار حالتك، ونفتحولك حاجة على قياسك — بلا ما تلتزم بشيء.',
  fatigue: 'عيان؟ مليح. دقيقة وحدة برك، وبعدها تروح ترتاح بلا حسّ بالذنب.',
  moyen: 'لاباس؟ يكفي. مهمّة وحدة صغيرة، وهي اللي تخدمك في البكالوريا.',
  forme: 'في الفورمة؟ نستغلوها. نبنو جوابًا كاملًا بالبنى، خطوة بخطوة.',
};

export default function GuideAccueil({
  mission,
  reportees,
  energie,
  onEnergie,
  onMission,
  onDefi60,
  onFakh,
  onBriques,
  onSujetGuide,
  invitation,
  nomSujet,
}: Props) {
  const message = MESSAGE[energie ?? 'defaut'];
  return (
    <section className="carte mb-4" aria-label="المرشد يفتح الحصة">
      <p className="oeil mb-2">المرشد يفتح الحصة</p>
      {/* Le portrait vit dans le bandeau de مهمّة اليوم juste au-dessus : un seul
          visuel du guide par écran. */}
      <MascotteKunz message={message} humeur="accueil" compact sansPortrait />

      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="كيف حالك اليوم">
        {CHOIX.map(({ id, libelle, precision, Icone }) => {
          const actif = energie === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={actif}
              onClick={() => onEnergie(id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 transition ${
                actif
                  ? 'border-forest bg-sage-soft text-forest-deep'
                  : 'border-line bg-paper text-ink hover:border-sage'
              }`}
            >
              <span className="block h-6 w-6" aria-hidden>
                <Icone />
              </span>
              <span className="text-sm font-extrabold">{libelle}</span>
              <span className="text-[10px] leading-tight text-mute">{precision}</span>
            </button>
          );
        })}
      </div>

      {energie === 'fatigue' && (onFakh || onDefi60) && (
        <div className="mt-3 rounded-2xl border border-line bg-bg p-3">
          <p className="petit doux">حاجة قصيرة، بلا كتابة وبلا وقت:</p>
          <div className="mt-2 flex flex-col gap-2">
            {onFakh && (
              <button type="button" className="btn--primaire w-full" onClick={onFakh}>
                صيّاد الفخاخ · دقيقتين
              </button>
            )}
            {onDefi60 && (
              <button type="button" className="btn-mini w-full" onClick={onDefi60}>
                تحدّي 60 ثانية
              </button>
            )}
          </div>
        </div>
      )}

      {energie === 'moyen' && (
        <div className="mt-3 rounded-2xl border border-line bg-bg p-3">
          <p className="petit doux">مهمّة اليوم · {nb(mission.minutes)} دقائق</p>
          <p className="mt-1 text-sm font-bold text-ink">{mission.titre}</p>
          <button type="button" className="btn--primaire mt-2 w-full" onClick={onMission}>
            نبدأ من هنا ←
          </button>
        </div>
      )}

      {energie === 'forme' && (
        <div className="mt-3 rounded-2xl border border-line bg-bg p-3">
          <p className="petit doux">نبني جوابًا كاملًا، ونشوف وين ينقصنا بالضبط:</p>
          <div className="mt-2 flex flex-col gap-2">
            {onSujetGuide && (
              <button type="button" className="btn--primaire w-full" onClick={onSujetGuide}>
                موضوع كامل · خطوة بخطوة
                {nomSujet && <span className="ms-1 text-[11px] font-normal opacity-80">({nomSujet})</span>}
              </button>
            )}
            {onBriques && (
              <button type="button" className={onSujetGuide ? 'btn-mini w-full' : 'btn--primaire w-full'} onClick={onBriques}>
                البوصلة 1-2-3 · نركّب الجواب
              </button>
            )}
          </div>
        </div>
      )}

      {reportees > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-sage-soft/60 px-3 py-2 text-xs font-bold leading-relaxed text-forest-deep">
          <span className="block h-3.5 w-3.5 shrink-0" aria-hidden>
            <IcoCible />
          </span>
          بقيت {nb(Math.min(reportees, 5))} مراجعة في القائمة — تنتظر دورها، بلا عجلة وبلا دين.
        </p>
      )}

      {invitation && (
        <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-3">
          <p className="text-sm font-bold text-forest-deep">أوّل انتصار — نحفظوه؟</p>
          <p className="petit doux mt-1">
            تقدّمك محفوظ على هذا الهاتف. حساب مجّاني يخلّيه يتبعك إذا بدّلت الجهاز — بلا إرسال
            لبريدك.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <button type="button" className="btn--primaire w-full" onClick={invitation.creer}>
              أنشئ حسابي
            </button>
            <button type="button" className="btn-mini w-full" onClick={invitation.plusTard}>
              نكمّل بلا حساب
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
