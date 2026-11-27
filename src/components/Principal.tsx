// الرئيسية — la porte principale de l'application (maquette « écran 01 », version
// développée) : bandeau d'accueil, carte مهمّة اليوم façon maquette (halo feuille,
// mascotte, CTA or), le guide et son choix d'énergie, les liens rapides, le plan
// intensif, l'éligibilité de la semaine en perles, les mini-statistiques, les
// statistiques du مُرشد et la position par rapport à la classe.
//
// Une seule action principale par écran : le CTA « ابدأ » de la mission. Le quiz
// et les défis vivent sur leur propre porte (كويست).
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

const JOURS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const INITIALES_JOUR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

function jourDe(iso: string): number {
  return new Date(iso + 'T12:00:00').getDay();
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
  const plan = planIntensif(etat);
  const quota = quotaDe(etat);
  const rythme = rythmeSemaine(etat);
  const position = positionClasse(etat);
  const faits = itemsFaits(etat);

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
      {/* ترحيب — rangée d'accueil façon maquette : date, salutation, pilule d'éligibilité */}
      <header className="mb-4">
        <div className="rangee rangee--entre">
          <div className="min-w-0">
            <p className="eyebrow">{formatJourAr(aujourdhui())}</p>
            <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
              {salue()}، {etat.nom}
            </h1>
          </div>
          <span className="pill-rythme">
            <span className="block h-3.5 w-3.5" aria-hidden>
              <IcoFlamme />
            </span>
            إيقاعك {nb(rythme.jours)} من {nb(rythme.cible)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          {faits === 0
            ? 'كل شيء يبدأ بخطوة واحدة. مهمّة اليوم وحدها تكفي.'
            : `أنجزت ${nbMin(faits)} من ${nbMin(CHEMIN.length)} بنية في طريقك. مهمّة واحدة في كل مرة.`}
        </p>
        {faits < 3 && messageAccueil(etat) && (
          <p className="mt-1.5 text-xs leading-relaxed text-forest-deep">{messageAccueil(etat)}</p>
        )}
      </header>

      {/* مهمّة اليوم — le héros maquette : halo feuille, mascotte, un seul « ابدأ » */}
      <section className="hero-principal" aria-label="مهمّة اليوم">
        <div className="lueur-feuille" aria-hidden="true" />
        <img className="hero-mascotte" src="/mascotte.webp" alt="" aria-hidden="true" />
        <div className="hero-contenu">
          <div className="rangee rangee--entre">
            <p className="hero-etiquette">مهمّة اليوم · {nb(planMission.mission.minutes)} دقائق</p>
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
          <h2 className="hero-titre-mission">{planMission.mission.titre}</h2>
          <p className="hero-sous">في النهاية تعرف: {planMission.mission.savoirFaire}</p>
          <p className="hero-note">{planMission.mission.pourquoi}</p>

          <button type="button" className="btn-hero" onClick={lancerMission}>
            {libelleMission(planMission.mission)}
          </button>
          <p className="hero-note hero-centre">{sousTitreMission(planMission)}</p>

          {reposChoisi ? (
            <p role="status" className="hero-statut">
              سجّلنا راحتك — المهمّة تبقى هنا غدًا، بلا حساب.
            </p>
          ) : (
            <button type="button" className="btn-hero-mini" onClick={() => setReposChoisi(true)}>
              يكفي اليوم
            </button>
          )}
        </div>
      </section>

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

      {/* Liens rapides (maquette : chips « تدريبات سريعة ») — jamais des « ابدأ » */}
      {(onAllerKouest || onAllerExercices || onAllerBac) && (
        <nav className="liens-rapides mt-4" aria-label="وصول سريع">
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
        <section className="mb-4 mt-4 rounded-3xl border border-gold-soft bg-gold-soft/40 p-5">
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

      {/* إيقاع الأسبوع — perles des jours (maquette), لا سلسلة قابلة للكسر */}
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
          <div className="perles-jours" dir="rtl">
            {rythme.sept.map((j) => {
              const idx = jourDe(j.iso);
              return (
                <div key={j.iso} className="jour" title={formatJourAr(j.iso)}>
                  <span className={`jour-perle ${j.actif ? 'fait' : ''} ${j.aujourdhui ? 'aujourdhui' : ''}`}>
                    {j.actif ? '✓' : INITIALES_JOUR[idx]}
                  </span>
                  <span className={`jour-nom ${j.aujourdhui ? 'aujourdhui' : ''}`}>{JOURS_AR[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          الهدف {nb(rythme.cible)} أيام من {nb(7)} — لا أكثر. الراحة جزء من الخطة، لا كسر فيها شيء.
        </p>
      </section>

      {/* mini-statistiques (maquette : deux cartes courtes) */}
      <div className="mini-stats mt-5">
        <div className="card mini-stat">
          <div className="num">{nb(etat.revisions)}</div>
          <div className="lbl">مراجعة في رصيدك</div>
        </div>
        <div className="card mini-stat">
          <div className="num">{nb(etat.minutesTotales)}</div>
          <div className="lbl">دقيقة تدريب</div>
        </div>
      </div>

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
