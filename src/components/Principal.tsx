// الرئيسية — port 1:1 de l'écran 01 de la maquette.
//
// Rôle : accueillir l'élève sur UNE mission du jour (héros vert + CTA or),
// puis le guide (« اختر حالتك اليوم »), le rythme 5/7, deux indicateurs sobres
// et les accès rapides aux تدريبات.
// Jamais de contenu de quiz (« كويست اليوم ») ici — كويست vit sur son propre onglet.

import { useState } from 'react';
import { CHEMIN, type ItemChemin } from '../data/programme';
import { TOTAL_DEFS, TOTAL_QCM } from '../data/drills/axes';
import type { Etat } from '../types';
import { aujourdhui, formatJourAr, joursNb, nb, salue } from '../utils/dates';
import {
  itemsFaits,
  planIntensif,
  positionClasse,
  prochaineAction,
  rythmeSemaine,
} from '../utils/moteur';
import { libelleMission, missionDuJour, sousTitreMission } from '../utils/planDuJour';
import {
  VALEURS,
  bouclierReposDisponibleSemaine,
  jourReposActifAujourdhui,
  joursConsecutifsAvecBouclier,
  xpDe,
  xpTexte,
} from '../utils/xp';
import GuideAccueil, { type Energie } from './GuideAccueil';
import CartePlan30Jours from './CartePlan30Jours';
import { IcoBoussole, IcoFlamme, IcoVerifie } from './Icones';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
  onOuvrirLecon?: (lessonId: string) => void;
  onBasculerJourPlan30?: (cle: string) => void;
  onOuvrirUltimes?: () => void;
  onDefi60?: () => void;
  onSprint3Min?: (zen?: boolean) => void;
  onActiverJourRepos?: () => void;
  onFakh?: () => void;
  onBriques?: () => void;
  onCreerCompte?: () => void;
  onMasquerInvitation?: () => void;
  onAllerExercices?: () => void;
}

const JOURS_COURTS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function jourCourtSemaine(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return JOURS_COURTS_AR[d.getDay()] ?? '';
}

function aUneMicroVictoire(etat: Etat): boolean {
  if (Object.values(etat.progression).some((p) => p.statut === 'terminee')) return true;
  if (Object.keys(etat.drills ?? {}).length > 0) return true;
  if (Object.values(etat.jalons ?? {}).some((j) => j.fait)) return true;
  if (Object.keys(etat.fakh ?? {}).length > 0) return true;
  if (Object.keys(etat.bacExercices ?? {}).length > 0) return true;
  if (Object.values(etat.ateliers ?? {}).some((a) => a.fait)) return true;
  return false;
}

export default function Principal({
  etat,
  onOuvrirItem,
  onDemarrerRevision,
  onVoirUnite,
  onOuvrirLecon,
  onBasculerJourPlan30,
  onOuvrirUltimes,
  onDefi60,
  onSprint3Min,
  onActiverJourRepos,
  onFakh,
  onBriques,
  onCreerCompte,
  onMasquerInvitation,
  onAllerExercices,
}: Props) {
  const [energie, setEnergie] = useState<Energie | null>(null);
  const [reposConfirme, setReposConfirme] = useState(false);

  const action = prochaineAction(etat);
  const planMission = missionDuJour(etat);
  const rythme = rythmeSemaine(etat);
  const position = positionClasse(etat);
  const intensif = planIntensif(etat);
  const auj = aujourdhui();
  const joursRepos = etat.rythmeBienveillant?.joursRepos ?? [];
  const jours = joursConsecutifsAvecBouclier(etat.journal, joursRepos, auj);
  const bouclierReposDispo = bouclierReposDisponibleSemaine(joursRepos, auj);
  const jourReposActif = jourReposActifAujourdhui(joursRepos, auj);

  function lancerMission(): void {
    if (action.type === 'reprise' || action.type === 'nouvelle') {
      onOuvrirItem(action.item);
      return;
    }
    if (action.type === 'rappel') {
      const ids = planMission.mission.lessonIds?.length ? planMission.mission.lessonIds : action.lessonIds;
      onDemarrerRevision(ids);
      return;
    }
    if (action.type === 'repos') {
      if (action.bonusDispo && action.prochaineItem) {
        onOuvrirItem(action.prochaineItem);
      } else {
        setReposConfirme(true);
      }
      return;
    }
    if (action.type === 'fini') {
      if (planMission.mission.type === 'entrainement_sujet' && onAllerExercices) {
        onAllerExercices();
      } else if (onOuvrirUltimes) {
        onOuvrirUltimes();
      } else if (position.uniteId) {
        onVoirUnite(position.uniteId);
      } else {
        setReposConfirme(true);
      }
    }
  }

  const invitation =
    aUneMicroVictoire(etat) &&
    !etat.compte &&
    !etat.invitationCompteVue &&
    onCreerCompte &&
    onMasquerInvitation
      ? { creer: onCreerCompte, plusTard: onMasquerInvitation }
      : undefined;

  const aDesDrills = Boolean(
    onAllerExercices || onDefi60 || onFakh || onBriques || onOuvrirUltimes,
  );

  return (
    <div className="ecran-maquette mx-auto max-w-3xl space-y-3.5 px-4 pb-28 pt-5 lg:pb-12">
      {/* الترحيب وسلسلة الأيام */}
      <div className="greet-row">
        <div>
          <h1>{etat.nom && etat.nom !== 'تلميذ' ? `${salue()}، ${etat.nom}` : salue()}</h1>
          <p className="date">{formatJourAr(auj)}</p>
        </div>
        <span className="streak">
          <span className="ico" aria-hidden="true">
            <IcoFlamme />
          </span>
          <span className="tnum">{joursNb(jours)}</span>
        </span>
      </div>

      {/* 1. بطاقة البطل — مهمّة اليوم (هوية دولينغو + زر واحد واضح) */}
      <section className="hero-quest" aria-label="مهمّة اليوم">
        <div className="leaf-glow" aria-hidden="true" />
        <img
          className="mascot"
          src="/mascotte.webp"
          alt="مستكشف بوصلة العلوم"
          width={128}
          height={164}
        />
        <p className="kicker">
          <span className="ico" aria-hidden="true">
            <IcoBoussole />
          </span>
          المرشد يفتح الحصة
        </p>
        <h2>مهمّة اليوم</h2>
        <p className="mission">
          {planMission.mission.titre} — {planMission.mission.savoirFaire}
        </p>
        <button type="button" className="btn-hero" onClick={lancerMission}>
          {libelleMission(planMission.mission)}
        </button>
        {action.type !== 'repos' && !reposConfirme && (
          <button
            type="button"
            className="btn-hero-mini"
            onClick={() => setReposConfirme(true)}
          >
            يكفي اليوم
          </button>
        )}
        {reposConfirme && (
          <p className="hero-statut">
            يكفي اليوم — خذ استراحة، فالتثبيت يحدث أثناء الراحة.
          </p>
        )}
        <p className="foot-note">{sousTitreMission(planMission)}</p>
      </section>

      {/* شريط الحالة السريع — سطر واحد مدمج بلا تكرار */}
      <GuideAccueil
        mission={planMission.mission}
        reportees={planMission.reportees}
        energie={energie}
        onEnergie={setEnergie}
        onMission={lancerMission}
        onDefi60={onDefi60}
        onSprint3Min={onSprint3Min ? () => onSprint3Min(true) : undefined}
        onFakh={onFakh}
        onBriques={onBriques}
        onUltimes={onOuvrirUltimes}
        bouclierReposDispo={bouclierReposDispo}
        jourReposActif={jourReposActif}
        onActiverJourRepos={onActiverJourRepos}
        invitation={invitation}
      />

      {/* 2. خطة المراجعة الذكية لـ 30 يومًا في العلوم — تُحمَّل تلقائيًّا حسب بيانات التلميذ */}
      <CartePlan30Jours
        etat={etat}
        onBasculerJourFait={(cle) => onBasculerJourPlan30?.(cle)}
        onOuvrirLecon={onOuvrirLecon}
        onDemarrerRevision={onDemarrerRevision}
        onOuvrirExamen={onOuvrirUltimes}
        onOuvrirFakh={onFakh}
      />

      {/* 3. إيقاع الأسبوع 5/7 + التقدّم في المسار (بطاقة واحدة متكاملة بلا تكرار XP) */}
      <section className="card rhythm" aria-label="إيقاع الأسبوع">
        <div className="head-row">
          <div>
            <h3>إيقاع الأسبوع وتقدّمك</h3>
            <p className="mt-0.5 text-[11px] font-bold text-mute tnum">
              المسار: {nb(itemsFaits(etat))} من {nb(CHEMIN.length)} بنية · {xpTexte(xpDe(etat))}
            </p>
          </div>
          <span className="pill pill-leaf tnum">
            {nb(rythme.jours)} من {nb(rythme.cible)} أيام
          </span>
        </div>
        <div className="week-dots">
          {rythme.sept.map((j) => (
            <div
              key={j.iso}
              className={`day ${j.actif ? 'done' : ''} ${j.aujourdhui ? 'today' : ''}`.trim()}
            >
              <span className="bead" aria-hidden="true">
                {j.actif ? (
                  <span className="block h-3 w-3">
                    <IcoVerifie />
                  </span>
                ) : null}
              </span>
              <span>{j.aujourdhui ? 'اليوم' : jourCourtSemaine(j.iso)}</span>
            </div>
          ))}
        </div>
        <p className="note">{position.texteAr}</p>
      </section>

      {/* اختصارات سريعة — 3 مداخل مركّزة بدل التشتيت */}
      {aDesDrills && (
        <section className="card drills" aria-label="تدريبات سريعة">
          <div className="head-row">
            <h3>تدريبات سريعة</h3>
            <span className="pill pill-honey tnum">+ {nb(VALEURS.drill)} XP</span>
          </div>
          <nav className="chips-row" aria-label="تدريبات سريعة">
            {onAllerExercices && (
              <button type="button" className="chip leaf" onClick={onAllerExercices}>
                بنك التدريبات ({nb(TOTAL_QCM + TOTAL_DEFS)})
              </button>
            )}
            {onDefi60 && (
              <button type="button" className="chip" onClick={onDefi60}>
                تحدّي 60 ثانية
              </button>
            )}
            {onOuvrirUltimes && (
              <button type="button" className="chip" onClick={onOuvrirUltimes}>
                التمارين القصوى
              </button>
            )}
          </nav>
        </section>
      )}

      {/* المراجعة المكثّفة عند ≤ 60 يومًا أو تفعيلها يدويًّا */}
      {intensif && (
        <section className="card p-4" aria-label="المراجعة المكثّفة">
          <div className="head-row">
            <h3>المراجعة المكثّفة · {intensif.phase}</h3>
            <span className="pill pill-honey tnum">{nb(intensif.restants)} بنود متبقّية</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            {intensif.joursRestants !== null
              ? `بقي ${nb(intensif.joursRestants)} يومًا — الإيقاع المقترح: ${nb(intensif.parSemaine)} في الأسبوع.`
              : `الإيقاع المقترح في الوضع المكثّف: ${nb(intensif.parSemaine)} في الأسبوع.`}
          </p>
          {onOuvrirUltimes && !intensif.sujetFait && (
            <button
              type="button"
              className="btn btn--secondaire mt-3 w-full text-xs"
              onClick={onOuvrirUltimes}
            >
              افتح التمارين القصوى لهذا الأسبوع
            </button>
          )}
        </section>
      )}
    </div>
  );
}
