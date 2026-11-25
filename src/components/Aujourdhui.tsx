// اليوم — مهمّة واحدة فقط. أولوية: استئناف → استرجاع مستحق → حصّة جديدة → راحة.
//
// v0.11 : la carte d'entrée ne promet plus « 46 minutes » mais une mission de 3 à 5 minutes,
// avec ce que l'élève saura faire à la fin. La séance complète reste accessible depuis le
// parcours de la leçon, jamais imposée ici.
import { useState } from 'react';

import { competenceDue, prochaineAction, positionClasse, rythmeSemaine, itemsFaits, planIntensif, quotaDe } from '../utils/moteur';
import { libelleMission, missionDuJour, sousTitreMission, type TypeMission } from '../utils/planDuJour';
import { CHEMIN, UNITE_PAR_ID, titreItem, titreLecon, uniteDeItem } from '../data/programme';
import { aujourdhui, compteLeconsAdj, nb, nbMin, formatJourAr, salue } from '../utils/dates';
import { messageAccueil } from '../utils/diagnostic';
import { etapesKouest, etapesReussies, leconDeLaQuete } from '../utils/kouest';
import { composerRevueCroisee, disponibiliteCroisee, nomDomaine } from '../utils/revueCroisee';
import CarteStats from './CarteStats';
import GuideAccueil, { type Energie } from './GuideAccueil';
import CarteDefi from './CarteDefi';
import type { TypeDefi } from '../utils/defis';
import type { Etat } from '../types';
import type { ItemChemin } from '../data/programme';
import type { Qualite } from '../utils/srs';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
  onResultatKafaa: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue?: boolean
  ) => void;
  onOuvrirMethodologie: () => void;
  onOuvrirExamenBlanc?: () => void;
  /** المراجعة المتقاطعة الأسبوعية (P2.4) */
  onDemarrerRevueCroisee?: () => void;
  /** تحدّي الأسبوع (P3.2) */
  onChoisirDefi?: (type: TypeDefi) => void;
  /** كويست اليوم : la porte d'entrée (3 min) avant la séance complète. */
  onDemarrerKouest?: (lessonId: string) => void;
  /** « تحدّي 60 ثانية » (v0.11) — format court, optionnel. */
  onDefi60?: () => void;
  /** Phase 2 « Guide-First » : le guide ouvre la séance et propose un format selon l'énergie. */
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  nomSujet?: string;
  /** Invitation à créer un compte, après la première micro-victoire (jamais bloquante). */
  onCreerCompte?: () => void;
  onMasquerInvitation?: () => void;
}

const ETIQUETTES_MISSION: Record<TypeMission, string> = {
  noeud: 'خطوة واحدة',
  jalon: 'جسر الوحدة',
  revision: 'استرجاع',
  entrainement_sujet: 'تدريب قصير',
  repos: 'راحة',
  fini: 'مراجعة',
};

function etiquetteMission(type: TypeMission): string {
  return ETIQUETTES_MISSION[type];
}

export default function Aujourdhui({
  etat,
  onOuvrirItem,
  onDemarrerRevision,
  onVoirUnite,
  onResultatKafaa,
  onOuvrirMethodologie,
  onOuvrirExamenBlanc,
  onDemarrerRevueCroisee,
  onChoisirDefi,
  onDemarrerKouest,
  onDefi60,
  onFakh,
  onBriques,
  onSujetGuide,
  nomSujet,
  onCreerCompte,
  onMasquerInvitation,
}: Props) {
  const action = prochaineAction(etat);
  // Humeur déclarée par l'élève : elle ne s'écrit pas dans l'état, elle ne dure pas.
  const [energie, setEnergie] = useState<Energie | null>(null);
  const [reposChoisi, setReposChoisi] = useState(false);
  const planMission = missionDuJour(etat);
  const competence = competenceDue(etat);
  const croisee = disponibiliteCroisee(etat);
  const leconsCroisees =
    croisee === 'prete'
      ? etat.revueCroisee && !etat.revueCroisee.faiteLe && etat.revueCroisee.lessonIds.length >= 2
        ? etat.revueCroisee.lessonIds
        : composerRevueCroisee(etat)
      : [];
  const rythme = rythmeSemaine(etat);
  const position = positionClasse(etat);
  const faits = itemsFaits(etat);
  const plan = planIntensif(etat);
  const quota = quotaDe(etat);
  // كويست اليوم : la leçon que le moteur propose, et où en est la quête.
  const leconQuete = onDemarrerKouest ? leconDeLaQuete(etat) : null;
  const etapesQuete = leconQuete ? etapesKouest(leconQuete) : [];
  const faitesQuete = leconQuete ? etapesReussies(etat, leconQuete) : 0;

  // compte le nombre de leçons échouées (statut = vierge ou en_cours sans revision)
  const leconsEchouees = Object.values(etat.progression).filter(
    (p) => p.statut !== 'terminee' && !p.lue
  ).length;

  /** Un seul geste : la mission du jour. Aucun écran intermédiaire, aucun choix à faire. */
  function lancerMission(): void {
    const m = planMission.mission;
    switch (m.type) {
      case 'noeud':
        if (m.lessonId) onOuvrirItem({ type: 'lecon', id: m.lessonId });
        break;
      case 'jalon':
        onVoirUnite(etat.progression ? m.cle.replace('jalon:', '') : 'u1');
        break;
      case 'revision':
        if (m.lessonIds?.length) onDemarrerRevision(m.lessonIds);
        break;
      case 'entrainement_sujet':
        onOuvrirMethodologie();
        break;
      case 'repos':
        if (action.type === 'repos' && action.bonusDispo && action.prochaineItem) {
          onOuvrirItem(action.prochaineItem);
        } else {
          setReposChoisi(true);
        }
        break;
      case 'fini':
        onVoirUnite('u1');
        break;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      {/* ترحيب */}
      {/* Un seul visuel de guide par écran : il est dans la carte d'accueil, juste en dessous. */}
      <header className="mb-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{formatJourAr(aujourdhui())}</p>
          <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
            {salue()}، {etat.nom}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {faits === 0
              ? 'كل شيء يبدأ بخطوة واحدة. مهمّة اليوم وحدها تكفي.'
              : `أنجزت ${nbMin(faits)} من ${nbMin(CHEMIN.length)} بنية في طريقك. مهمّة واحدة في كل مرة.`}
          </p>
          {faits < 3 && messageAccueil(etat) && (
            <p className="mt-1.5 text-xs leading-relaxed text-forest-deep">{messageAccueil(etat)}</p>
          )}
        </div>
      </header>

      {/* Phase 2 · المرشد يفتح الحصة — le guide demande l'énergie, puis met en scène
          l'action que le moteur a déjà choisie. Une seule carte, trois boutons. */}
      <GuideAccueil
        mission={{
          titre: planMission.mission.titre,
          minutes: planMission.mission.minutes,
          type: planMission.mission.type,
        }}
        reportees={planMission.reportees}
        energie={energie}
        onEnergie={setEnergie}
        onMission={lancerMission}
        onDefi60={onDefi60}
        onFakh={onFakh}
        onBriques={onBriques}
        onSujetGuide={onSujetGuide}
        nomSujet={nomSujet}
        invitation={
          onCreerCompte && !etat.compte && faits >= 1 && !etat.invitationCompteVue
            ? { creer: onCreerCompte, plusTard: onMasquerInvitation ?? (() => {}) }
            : undefined
        }
      />

      {/* v0.13 · B2 du rapport d'utilisabilité : UNE action principale, en premier.
          La mission du jour passe avant le quiz et le défi : c'est elle qui sert au bac. */}
      {/* المهمّة الواحدة · v0.11 — 3 إلى 5 دقائق، بلا جدار وبلا طابور */}
      <section className="carte mb-4" aria-label="مهمّة اليوم">
        <div className="rangee rangee--entre">
          <p className="oeil">مهمّة اليوم · {nb(planMission.mission.minutes)} دقائق</p>
          <span
            className={`mention ${
              planMission.mission.type === 'repos' || planMission.mission.type === 'fini'
                ? 'mention--vert'
                : 'mention--or'
            }`}
          >
            {etiquetteMission(planMission.mission.type)}
          </span>
        </div>
        <p className="carte__titre mt-1">{planMission.mission.titre}</p>
        <p className="petit mt-1">في النهاية تعرف: {planMission.mission.savoirFaire}</p>
        <p className="petit doux mt-1">{planMission.mission.pourquoi}</p>

        <button type="button" className="btn--primaire mt-3 w-full" onClick={lancerMission}>
          {libelleMission(planMission.mission)}
        </button>

        <p className="petit doux mt-2 text-center">{sousTitreMission(planMission)}</p>

        {reposChoisi ? (
          <p role="status" className="mt-2 rounded-xl border border-line bg-bg px-3 py-2 text-center text-xs font-bold text-ink-soft">
            سجّلنا راحتك — المهمّة تبقى هنا غدًا، بلا حساب.
          </p>
        ) : (
          <button
            type="button"
            className="btn-mini mt-2 w-full"
            onClick={() => setReposChoisi(true)}
          >
            يكفي اليوم
          </button>
        )}
      </section>

      {/* كويست اليوم — entrée secondaire : un quiz de 3 min, après la mission. */}
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

      {/* المراجعة المكثّفة (P2.3): خطة الأسبوع — تظهر فقط عند تفعيلها */}
      {plan && (
        <section className="mb-4 rounded-3xl border border-gold-soft bg-gold-soft/40 p-5">
          <p className="eyebrow">المراجعة المكثّفة</p>
          <h2 className="font-naskh mt-1 text-xl font-bold leading-snug">
            {plan.phase === 'J7'
              ? 'الأسبوع الأخير: استرجاع ومواضيع'
              : plan.phase === 'J30'
                ? 'المرحلة الثانية: الدروس المتكرّرة والمنتظمة في البكالوريا'
                : 'المرحلة الأولى: الدروس التي تتكرّر في البكالوريا'}
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {plan.joursRestants !== null && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="tnum">{nb(plan.joursRestants)}</span> يومًا على امتحانك
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {plan.restants === 0
                ? 'أنهيت كل بنود الأولوية — الآن استرجاع ومواضيع فقط.'
                : `${nb(plan.restants)} بندًا ذا أولوية متبقّيًا · نحو ${nb(plan.parSemaine)} في الأسبوع`}
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${plan.sujetFait ? 'bg-forest' : 'bg-gold'}`} />
              {plan.sujetFait ? 'موضوع هذا الأسبوع: أُنجز ✓' : 'موضوع واحد في الأسبوع في شروط الامتحان — لم يُنجز بعد'}
            </li>
            {plan.acquises > 0 && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                {nb(plan.acquises)} درسًا ثبت بعد نجاحين — خرج من الاسترجاع حتى الامتحان
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-mute">
            وحدات الأولوية مفتوحة في «مساري» دون انتظار ما قبلها. الحصّة اليوم: حتى {nb(quota.seances)} حصص —
            سقف، لا واجب.
          </p>
          {onOuvrirExamenBlanc && (
            <button type="button" onClick={onOuvrirExamenBlanc} className="btn btn-ghost mt-3 w-full text-sm">
              افتح الامتحان التجريبي
            </button>
          )}
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
      {competence && (
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
          <button
            onClick={onOuvrirMethodologie}
            className="mt-2 w-full text-center text-xs font-black text-forest"
          >
            أفتح البوصلة لأتدرّب على قراءة الدليل ←
          </button>
          <p className="mt-2 text-center text-[11px] text-mute">
            دقيقتان، لا أكثر. الاسترجاع القصير يثبّت الإجراء في الذاكرة — بلا نسبة مئوية وبلا عدوّ.
          </p>
        </section>
      )}

      {/* إيقاع الأسبوع — لا سلسلة قابلة للكسر */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">إيقاع الأسبوع</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {rythme.jours >= rythme.cible
                ? `${nb(rythme.cible)} من ${nb(rythme.cible)} أيام ✓`
                : `${nb(rythme.jours)} من ${nb(rythme.cible)} أيام`}
            </p>
          </div>
          <div className="flex items-start gap-1.5" dir="rtl">
            {rythme.sept.map((j) => (
              <div
                key={j.iso}
                className="flex w-7 flex-col items-center gap-1"
                title={formatJourAr(j.iso)}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-black ${
                    j.actif ? 'bg-forest text-paper' : 'border border-line bg-paper text-mute'
                  } ${j.aujourdhui ? 'ring-2 ring-gold ring-offset-1 ring-offset-paper' : ''}`}
                >
                  {j.actif ? '✓' : ''}
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    j.aujourdhui ? 'font-black text-forest-deep' : 'text-mute'
                  }`}
                >
                  {new Date(j.iso + 'T12:00:00').getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          الهدف {nb(rythme.cible)} أيام من {nb(7)} — لا أكثر. الراحة جزء من الخطة، لا كسر فيها شيء.
        </p>
      </section>

      {/* إحصاء المُرشد — كم صحيحة وكم ليست صحيحة */}
      <div className="mt-5">
        <CarteStats />
      </div>

      {/* موضع القسم */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">التدرّج السنوي</p>
        {position.uniteId ? (
          <>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {position.statut === 'retard'
                ? 'متأخّر قليلًا'
                : position.statut === 'avance'
                  ? 'متقدّم'
                  : 'محاذٍ لقسمك'}
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-sage"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(8, (UNITE_PAR_ID[position.uniteId].numero / 11) * 100)
                  )}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-mute">
              وحدتك الحالية: {UNITE_PAR_ID[position.uniteId].titre} · نافذتها{' '}
              {UNITE_PAR_ID[position.uniteId].fenetreAr}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm font-bold text-ink-soft">انتهى التدرّج السنوي</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-mute">{position.texteAr}</p>
      </section>
    </div>
  );
}
