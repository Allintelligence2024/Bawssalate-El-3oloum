// الرئيسية — la porte principale, portée 1:1 de la maquette (écran 01).
//
// Même design, même style, même structure : rangée d'accueil, héros « مهمّة اليوم »
// (dégradé vert, halo feuille, mascotte, CTA or), carte du guide, « إيقاع الأسبوع »
// en perles, quick-row, carte « تدريبات سريعة » avec chips. Le quiz et les défis
// vivent sur leur porte séparée (كويست) — jamais mélangés ici.
//
// Une seule action principale : le CTA « ابدأ » du héros.
import { useState } from 'react';

import {
  prochaineAction,
  positionClasse,
  revisionsDues,
  rythmeSemaine,
  itemsFaits,
  planIntensif,
  quotaDe,
} from '../utils/moteur';
import { libelleMission, missionDuJour, sousTitreMission } from '../utils/planDuJour';
import { CHEMIN, UNITE_PAR_ID, type ItemChemin } from '../data/programme';
import { aujourdhui, nb, nbMin, formatJourAr, salue } from '../utils/dates';
import GuideAccueil, { type Energie } from './GuideAccueil';
import { IcoBoussole, IcoFlamme } from './Icones';
import type { Etat } from '../types';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
  /** الامتحان التجريبي depuis le plan intensif (carte conditionnelle, en bas). */
  onOuvrirExamenBlanc?: () => void;
  /** Formats courts proposés par le guide selon l'énergie. */
  onDefi60?: () => void;
  onFakh?: () => void;
  onBriques?: () => void;
  onSujetGuide?: () => void;
  nomSujet?: string;
  /** « تدريبات سريعة » : sous-écran (chips de la carte), retour vers الرئيسية. */
  onAllerExercices?: () => void;
  /** Invitation à créer un compte, après la première micro-victoire (jamais bloquante). */
  onCreerCompte?: () => void;
  onMasquerInvitation?: () => void;
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
  const revues = revisionsDues(etat);

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
        onVoirUnite('u1');
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
    <div className="ecran-maquette mx-auto max-w-3xl px-4 pb-28 pt-8">
      {/* rangée d'accueil — maquette : salutation, date, pilule d'éligibilité */}
      <div className="greet-row mb-4">
        <div>
          <h1>
            {salue()}، {etat.nom}
          </h1>
          <div className="date">
            {formatJourAr(aujourdhui())} · اليوم {nb(Math.min(faits + 1, CHEMIN.length))} في المسار
          </div>
        </div>
        <div className="streak">
          <span className="ico" aria-hidden>
            <IcoFlamme />
          </span>
          {nb(rythme.jours)} أيام
        </div>
      </div>

      {/* héros « مهمّة اليوم » — maquette : halo feuille, mascotte, CTA or */}
      <section className="hero-quest" aria-label="مهمّة اليوم">
        <div className="leaf-glow" aria-hidden="true" />
        <img className="mascot" src="/mascotte.webp" alt="" aria-hidden="true" />
        <div className="kicker">
          <span className="ico" aria-hidden>
            <IcoBoussole />
          </span>
          المرشد يفتح الحصة
        </div>
        <h2>مهمّة اليوم</h2>
        <p className="mission">
          {planMission.mission.titre}
          <br />
          في النهاية تعرف: {planMission.mission.savoirFaire}
        </p>
        <button type="button" className="btn-hero" onClick={lancerMission}>
          {libelleMission(planMission.mission)}
        </button>
        <p className="foot-note">لا مستعجل… خطوة واحدة تكفي</p>
        {reposChoisi ? (
          <p role="status" className="hero-statut">
            سجّلنا راحتك — المهمّة تبقى هنا غدًا، بلا حساب.
          </p>
        ) : (
          <button type="button" className="btn-hero-mini" onClick={() => setReposChoisi(true)}>
            يكفي اليوم
          </button>
        )}
      </section>

      {/* sous-titre de mission (rassurant, jamais une dette) */}
      <p className="mt-2 text-center text-[11px] text-mute">{sousTitreMission(planMission)}</p>

      {/* المرشد — le guide demande l'énergie, puis met en scène l'action du moteur */}
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

      {/* إيقاع الأسبوع — maquette : perles des jours, pas de chaîne à casser */}
      <section className="card rhythm mt-5">
        <div className="head-row">
          <h3>إيقاع الأسبوع</h3>
          <span className="pill pill-leaf">
            {nb(rythme.jours)} / {nb(rythme.cible)} أيام
          </span>
        </div>
        <div className="week-dots" dir="rtl">
          {rythme.sept.map((j) => {
            const idx = jourDe(j.iso);
            return (
              <div
                key={j.iso}
                className={`day ${j.actif ? 'done' : ''} ${j.aujourdhui ? 'today' : ''}`}
                title={formatJourAr(j.iso)}
              >
                <div className="bead">{j.actif ? '✓' : INITIALES_JOUR[idx]}</div>
                {JOURS_AR[idx]}
              </div>
            );
          })}
        </div>
        <p className="note">
          الهدف {nb(rythme.cible)} أيام من {nb(7)} — لا أكثر. الراحة جزء من الخطة، لا كسر فيها شيء.
        </p>
      </section>

      {/* quick-row — maquette : deux mini-cartes */}
      <div className="quick-row mt-5">
        <div className="card">
          <div className="num">{nb(revues.length)}</div>
          <div className="lbl">مراجعات اليوم · بطاقات</div>
        </div>
        <div className="card">
          <div className="num">
            {position.uniteId ? `${nb(UNITE_PAR_ID[position.uniteId].numero)} / ${nb(11)}` : '—'}
          </div>
          <div className="lbl">موقعك في القسم</div>
        </div>
      </div>

      {/* تدريبات سريعة — maquette : chips (sous-écran, retour vers الرئيسية) */}
      {onAllerExercices && (
        <section className="card drills mt-5">
          <div className="head-row">
            <div>
              <h3>تدريبات سريعة</h3>
              <div className="sub">500 سؤال + 120 تعريفًا · 49 محورًا</div>
            </div>
            <span className="pill pill-honey">+ XP</span>
          </div>
          <div className="chips-row">
            <button type="button" className="chip leaf" onClick={onAllerExercices}>
              الوراثة
            </button>
            <button type="button" className="chip" onClick={onAllerExercices}>
              المناعة
            </button>
            <button type="button" className="chip" onClick={onAllerExercices}>
              العصبي
            </button>
            <button type="button" className="chip" onClick={onAllerExercices}>
              الغدّي
            </button>
          </div>
        </section>
      )}

      {/* المراجعة المكثّفة (P2.3) — carte conditionnelle, rarement visible */}
      {plan && (
        <section className="mt-5 rounded-3xl border border-gold-soft bg-gold-soft/40 p-5">
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
    </div>
  );
}
