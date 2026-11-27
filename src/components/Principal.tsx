// الرئيسية — la porte principale de l'application (maquette « écran 01 »).
//
// C'est l'écran « main » : le bandeau d'accueil (المرشد يفتح الحصة), la mission du
// jour en un geste, le plan intensif, le rythme de la semaine, les statistiques
// du مُرشد et les liens rapides. Le quiz et les défis vivent sur leur propre porte
// (كويست) ; ici, une seule action principale.
import { useState } from 'react';

import { prochaineAction, positionClasse, rythmeSemaine, itemsFaits, planIntensif, quotaDe } from '../utils/moteur';
import { libelleMission, missionDuJour, sousTitreMission, type TypeMission } from '../utils/planDuJour';
import { CHEMIN, UNITE_PAR_ID, type ItemChemin } from '../data/programme';
import { aujourdhui, nb, nbMin, formatJourAr, salue } from '../utils/dates';
import { messageAccueil } from '../utils/diagnostic';
import GuideAccueil, { type Energie } from './GuideAccueil';
import CarteStats from './CarteStats';
import { IcoCible, IcoDiplome, IcoFlamme, IcoTamrin } from './Icones';
import type { Etat } from '../types';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
  /** الامتحان التجريبي depuis le plan intensif. */
  onOuvrirExamenBlanc?: () => void;
  /** Formats courts proposés par le guide selon l'énergie. */
  onDefi60?: () => void;
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  nomSujet?: string;
  /** Liens rapides vers les autres portes. */
  onAllerExercices?: () => void;
  onAllerKouest?: () => void;
  onAllerBac?: () => void;
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

export default function Principal({
  etat,
  onOuvrirItem,
  onDemarrerRevision,
  onVoirUnite,
  onOuvrirExamenBlanc,
  onDefi60,
  onFakh,
  onBriques,
  onSujetGuide,
  nomSujet,
  onAllerExercices,
  onAllerKouest,
  onAllerBac,
  onCreerCompte,
  onMasquerInvitation,
}: Props) {
  const action = prochaineAction(etat);
  // Humeur déclarée par l'élève : elle ne s'écrit pas dans l'état, elle ne dure pas.
  const [energie, setEnergie] = useState<Energie | null>(null);
  const [reposChoisi, setReposChoisi] = useState(false);
  const planMission = missionDuJour(etat);
  const croiseePlan = planIntensif(etat);
  const quota = quotaDe(etat);
  const rythme = rythmeSemaine(etat);
  const position = positionClasse(etat);
  const faits = itemsFaits(etat);
  const plan = croiseePlan;

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
        if (onAllerBac) onAllerBac();
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
      {/* bandeau d'accueil — maquette « écran 01 » : halo feuille, miel, une seule promesse */}
      <header className="hero-principal">
        <div className="lueur-feuille" aria-hidden="true" />
        <div className="rangee rangee--entre">
          <p className="eyebrow">{formatJourAr(aujourdhui())}</p>
          <span className="pilule-sequence">
            <span className="block h-3.5 w-3.5" aria-hidden>
              <IcoFlamme />
            </span>
            إيقاعك {nb(rythme.jours)} من {nb(rythme.cible)}
          </span>
        </div>
        <h1 className="font-naskh hero-titre">
          {salue()}، {etat.nom}
        </h1>
        <p className="hero-sous">
          {faits === 0
            ? 'كل شيء يبدأ بخطوة واحدة. مهمّة اليوم وحدها تكفي.'
            : `أنجزت ${nbMin(faits)} من ${nbMin(CHEMIN.length)} بنية في طريقك. مهمّة واحدة في كل مرة.`}
        </p>
        {faits < 3 && messageAccueil(etat) && <p className="hero-note">{messageAccueil(etat)}</p>}
      </header>

      {/* المرشد يفتح الحصة — le guide demande l'énergie, puis met en scène l'action
          que le moteur a déjà choisie. Une seule carte, trois boutons. */}
      <div className="mt-4">
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
      </div>

      {/* المهمّة الواحدة — 3 إلى 5 دقائق، بلا جدار وبلا طابور */}
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

      {/* Liens rapides (maquette : chips « تدريبات سريعة ») — jamais des « ابدأ » */}
      {(onAllerKouest || onAllerExercices || onAllerBac) && (
        <nav className="liens-rapides mb-4" aria-label="وصول سريع">
          {onAllerKouest && (
            <button type="button" className="lien-rapide" onClick={onAllerKouest}>
              <span className="picto" aria-hidden>
                <IcoCible />
              </span>
              كويست
            </button>
          )}
          {onAllerExercices && (
            <button type="button" className="lien-rapide" onClick={onAllerExercices}>
              <span className="picto" aria-hidden>
                <IcoTamrin />
              </span>
              تدريبات سريعة
            </button>
          )}
          {onAllerBac && (
            <button type="button" className="lien-rapide" onClick={onAllerBac}>
              <span className="picto" aria-hidden>
                <IcoDiplome />
              </span>
              الباك
            </button>
          )}
        </nav>
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
                  } ${j.aujourdhui ? 'ring-2 ring-leaf ring-offset-1 ring-offset-paper' : ''}`}
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
