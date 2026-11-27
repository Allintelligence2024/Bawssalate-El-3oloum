// كويست — la porte des quiz et des défis (maquette : « main » ≠ « quiz »).
//
// L'écran principal vit sur الرئيسية ; ici : le quiz du jour (3 min), le défi de
// 60 secondes, les تدريبات (620 items), le défi de la semaine, la revue croisée
// et la brique de compétence. Aucun emoji : icônes SVG du dépôt uniquement.
import { competenceDue, prochaineAction } from '../utils/moteur';
import { nb } from '../utils/dates';
import { titreLecon } from '../data/programme';
import { etapesKouest, etapesReussies, leconDeLaQuete } from '../utils/kouest';
import { composerRevueCroisee, disponibiliteCroisee, nomDomaine } from '../utils/revueCroisee';
import CarteDefi from './CarteDefi';
import MascotteKunz from './MascotteKunz';
import { IcoTamrin } from './Icones';
import type { TypeDefi } from '../utils/defis';
import type { Etat } from '../types';
import type { ItemChemin } from '../data/programme';
import type { Qualite } from '../utils/srs';

interface Props {
  etat: Etat;
  onOuvrirItem?: (item: ItemChemin) => void;
  onDemarrerRevision?: (lessonIds: string[]) => void;
  onVoirUnite?: (uniteId: string) => void;
  onResultatKafaa?: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue?: boolean
  ) => void;
  onOuvrirMethodologie?: () => void;
  onOuvrirExamenBlanc?: () => void;
  /** المراجعة المتقاطعة الأسبوعية (P2.4) */
  onDemarrerRevueCroisee?: () => void;
  /** تحدّي الأسبوع (P3.2) */
  onChoisirDefi?: (type: TypeDefi) => void;
  /** كويست اليوم : la porte d'entrée (3 min) avant la séance complète. */
  onDemarrerKouest?: (lessonId: string) => void;
  /** « تحدّي 60 ثانية » (v0.11) — format court, optionnel. */
  onDefi60?: () => void;
  /** Phase 2 « Guide-First » : formats courts ouverts depuis le guide de الرئيسية. */
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  nomSujet?: string;
  /** Invitation à créer un compte (facultative). */
  onCreerCompte?: () => void;
  onMasquerInvitation?: () => void;
  /** تدريبات سريعة : sous-écran avec barre de retour vers cette porte. */
  onOuvrirExercices?: () => void;
}

export default function Aujourdhui({
  etat,
  onResultatKafaa,
  onOuvrirMethodologie,
  onDemarrerRevueCroisee,
  onChoisirDefi,
  onDemarrerKouest,
  onDefi60,
  onOuvrirExercices,
}: Props) {
  const action = prochaineAction(etat);
  const competence = onResultatKafaa ? competenceDue(etat) : null;
  const croisee = disponibiliteCroisee(etat);
  const leconsCroisees =
    croisee === 'prete'
      ? etat.revueCroisee && !etat.revueCroisee.faiteLe && etat.revueCroisee.lessonIds.length >= 2
        ? etat.revueCroisee.lessonIds
        : composerRevueCroisee(etat)
      : [];
  // كويست اليوم : la leçon que le moteur propose, et où en est la quête.
  const leconQuete = onDemarrerKouest ? leconDeLaQuete(etat) : null;
  const etapesQuete = leconQuete ? etapesKouest(leconQuete) : [];
  const faitesQuete = leconQuete ? etapesReussies(etat, leconQuete) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      {/* ترحيب كويست — la porte des quiz : pas de promesse, juste des portes ouvertes */}
      <header className="mb-4">
        <p className="eyebrow">بوّابة التمارين والاختبارات</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">كويست</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          أسئلة قصيرة من ذاكرتك، وتمارين مصنّفة حسب المحور. لا وقت محسوب، ولا خسارة في الميزان.
        </p>
      </header>

      <div className="mb-4">
        <MascotteKunz compact humeur="reflexion" message="ما هو الفعل؟ أين الدليل؟ قبل كل إجابة، اسأل السؤالين." />
      </div>

      {/* كويست اليوم — entrée principale de cette porte : un quiz de 3 min. */}
      {leconQuete && onDemarrerKouest && (
        <section className="carte mb-4">
          <div className="rangee rangee--entre mb-1">
            <span className="oeil">كويست اليوم · 3 دقائق</span>
            <span className="mention mention--or tnum">
              {nb(faitesQuete)} من {nb(etapesQuete.length)}
            </span>
          </div>
          <p className="carte__titre mt-1">{titreLecon(leconQuete)}</p>
          <p className="petit doux mt-1">
            {nb(etapesQuete.length)} أسئلة اختيار من ذاكرتك — بلا كتابة وبلا وقت. بعدها تختار:
            تكمّل الجلسة الكاملة ولا تكفي بهذا.
          </p>
          <button
            type="button"
            className="btn btn--secondaire mt-3 w-full"
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

      {/* تدريبات سريعة (maquette : chips) — 620 عناصر، 49 محورًا */}
      {onOuvrirExercices && (
        <section className="carte mb-4">
          <div className="rangee rangee--entre">
            <div className="min-w-0">
              <p className="oeil">تدريبات سريعة</p>
              <p className="petit doux mt-0.5">500 سؤال + 120 تعريفًا · 49 محورًا — تدرّب على ما تختار.</p>
            </div>
            <button type="button" className="btn-mini shrink-0" onClick={onOuvrirExercices}>
              <span className="block h-4 w-4" aria-hidden>
                <IcoTamrin />
              </span>
              افتح التدريبات
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['الوراثة', 'المناعة', 'العصبي', 'الغدّي'].map((axe) => (
              <button
                key={axe}
                type="button"
                className="btn-mini"
                onClick={onOuvrirExercices}
                aria-label={`تدريبات محور ${axe}`}
              >
                {axe}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* تحدّي 60 ثانية (v0.11) — ضدّ الملل، بلا رهان وبلا حساب */}
      {onDefi60 && (
        <section className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
          <div className="min-w-0">
            <p className="oeil">تحدّي 60 ثانية</p>
            <p className="petit doux mt-0.5">دقيقة واحدة من أسئلة وحدتك — للتنشيط فقط، بلا خسارة.</p>
          </div>
          <button type="button" className="btn-mini shrink-0" onClick={onDefi60}>
            العب
          </button>
        </section>
      )}

      {/* تحدّي الأسبوع (P3.2) — يظهر بعد المهمّة الواحدة، ولا يُطلب حين يكون استرجاع مستحقًّا */}
      {onChoisirDefi && action.type !== 'rappel' && <CarteDefi etat={etat} onChoisir={onChoisirDefi} />}

      {/* المراجعة المتقاطعة الأسبوعية (P2.4) — درس مُنهى من كلّ مجال، مرّة في الأسبوع؛ لا تظهر قبل مجالين */}
      {onDemarrerRevueCroisee && croisee === 'prete' && action.type !== 'rappel' && (
        <section className="card mt-5 border border-line p-5">
          <p className="eyebrow">مراجعة متقاطعة · مرّة في الأسبوع</p>
          <p className="font-naskh mt-1 text-lg font-bold leading-snug text-forest-deep">
            {nb(leconsCroisees.length)} دروس من مجالات مختلفة، في جلسة واحدة
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mute">
            الاسترجاع اليومي يأخذ كلّ درس حين يحين موعده؛ هذه تخلط المجالات عمدًا — الخلط هو ما يكشف ما ظننته ثابتًا.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {leconsCroisees.map((id) => (
              <li key={id} className="flex items-baseline justify-between gap-3">
                <span className="font-bold">{titreLecon(id)}</span>
                <span className="shrink-0 text-[11px] text-mute">{nomDomaine(id)}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onDemarrerRevueCroisee} className="btn btn-primary mt-4 w-full text-sm">
            ابدأ المراجعة المتقاطعة
          </button>
        </section>
      )}
      {croisee === 'faite' && (
        <p className="mt-4 text-center text-[11px] text-mute">المراجعة المتقاطعة لهذا الأسبوع أُنجزت — تعود الأحد القادم.</p>
      )}

      {/* بطاقة كفاءة — مراجعة منهجية قصيرة (audit) : 1 à 2 fois par semaine */}
      {competence && onResultatKafaa && (
        <section className="card mt-5 border-2 border-sage bg-sage-soft/40 p-5">
          <div className="flex items-center gap-3">
            <img
              src="/mascotte.webp"
              alt=""
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">بطاقة كفاءة · مراجعة منهجية</p>
              <p className="font-naskh mt-1 text-lg font-bold leading-snug text-forest-deep">
                «{competence.carte.verbe}» — {competence.carte.exercice}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mute">
                فخّ يجب تجنّبه: {competence.carte.erreur}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onResultatKafaa(competence.key, 5, competence.carte, true)}
              className="btn btn-primary"
            >
              أتقنتها — أراجعها لاحقًا
            </button>
            <button
              onClick={() => onResultatKafaa(competence.key, 3, competence.carte, true)}
              className="btn btn-ghost"
            >
              كافحت قليلًا — أراجعها غدًا
            </button>
          </div>
          {onOuvrirMethodologie && (
            <button
              onClick={onOuvrirMethodologie}
              className="mt-2 w-full text-center text-xs font-black text-forest"
            >
              أفتح البوصلة لأتدرّب على قراءة الدليل ←
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-mute">
            دقيقتان، لا أكثر. الاسترجاع القصير يثبّت الإجراء في الذاكرة — بلا نسبة مئوية وبلا عدوّ.
          </p>
        </section>
      )}
    </div>
  );
}
