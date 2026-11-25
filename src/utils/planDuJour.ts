// Plan du jour — la mission unique, en 3 à 5 minutes.
//
// Ce module **câble** ce qui existait déjà sans être appelé :
//   · `planDeJour` (utils/bridge.ts) et son plafond `PLAFOND_DETTE = 5` ;
//   · `competencesTriees` / `niveauConfiance` pour la compétence la plus fragile ;
//   · `prochaineAction` (utils/moteur.ts), qui reste la source de vérité du « quoi faire ».
//
// Il n'invente aucune règle pédagogique : il ordonne, plafonne et nomme. Aucune note, aucun
// pourcentage, aucune comparaison entre élèves n'est produite ici.

import { PLAFOND_DETTE, planDeJour, type PlanDeJour } from './bridge';
import { profilCompetences } from './profil';
import {
  prochaineAction,
  revisionsDues,
  type ActionJour,
} from './moteur';
import { prochainNoeud, type NoeudMicro } from './microNoeuds';
import { prioriteLecon } from '../data/priorites';
import { titreLecon, uniteDeItem, type ItemChemin } from '../data/programme';
import { nb } from './dates';
import type { Etat } from '../types';

export type TypeMission = 'noeud' | 'jalon' | 'revision' | 'entrainement_sujet' | 'repos' | 'fini';

export interface Mission {
  type: TypeMission;
  /** Durée annoncée — toujours dans [3, 5] sauf repos (2) et fin de parcours (2). */
  minutes: number;
  /** Titre = l'action elle-même, pas la matière. */
  titre: string;
  /** « في النهاية تعرف: … » — une phrase, jamais un programme. */
  savoirFaire: string;
  /** Une ligne de justification, sans comparaison ni reproche. */
  pourquoi: string;
  /** Clé stable (idempotence d'affichage, analytique locale). */
  cle: string;
  lessonId?: string;
  /** Révisions retenues par le plafond (mission `revision`). */
  lessonIds?: string[];
  /** Nœud précis quand la mission porte sur une leçon. */
  noeud?: NoeudMicro;
}

export interface PlanDuJour {
  mission: Mission;
  /** Révisions laissées en file par le plafond (affichées sobrement, jamais reprochées). */
  reportees: number;
  /** Détail du moteur de plan (compétences, recommandations) — utile aux tests et à أنا. */
  plan: PlanDeJour;
}

/** Minutes annoncées par type de mission : plafond dur de 5 minutes. */
export const MINUTES_MISSION = {
  noeud: 4,
  jalon: 5,
  revision: 4,
  entrainement_sujet: 5,
  repos: 2,
  fini: 2,
} as const;

/** La borne est un invariant produit, pas une convention : cf. les tests. */
export const MINUTES_MAX_MISSION = 5;
export const MINUTES_MIN_MISSION = 3;

/**
 * Révisions dues, triées pour le Bac puis par échéance, **plafonnées à 5**.
 * Le surplus reste en file : il n'est ni supprimé ni reproché.
 */
export function revisionsDuesPlafonnees(
  etat: Etat,
  plafond: number = PLAFOND_DETTE,
): { retenues: string[]; reportees: number; toutes: string[] } {
  const toutes = revisionsDues(etat).sort((a, b) => {
    const p = prioriteLecon(a) - prioriteLecon(b);
    if (p !== 0) return p;
    const da = etat.progression[a]?.prochaineRevision ?? '';
    const db = etat.progression[b]?.prochaineRevision ?? '';
    return da.localeCompare(db);
  });
  const retenues = toutes.slice(0, Math.max(0, plafond));
  return { retenues, reportees: Math.max(0, toutes.length - retenues.length), toutes };
}

function missionDepuisAction(etat: Etat, action: ActionJour): Mission {
  if (action.type === 'reprise' || action.type === 'nouvelle') {
    const item: ItemChemin = action.item;
    if (item.type === 'jalon') {
      const unite = uniteDeItem(item);
      return {
        type: 'jalon',
        minutes: MINUTES_MISSION.jalon,
        titre: `جسر الوحدة ${unite ? unite.numero : ''}: ${unite ? unite.titre : ''}`,
        savoirFaire: 'تلخّص الوحدة من ذاكرتك في جملة واحدة، بلا نظر إلى الدرس.',
        pourquoi: 'الجسر يثبّت الوحدة قبل الانتقال — دونه يُبنى الجديد على رمل.',
        cle: `jalon:${item.uniteId}`,
      };
    }
    const lessonId = item.id;
    const noeud = prochainNoeud(lessonId, etat.progression[lessonId]);
    if (!noeud) {
      // Toutes les phases sont faites mais la leçon n'est pas encore clôturée : on propose la fiche.
      return {
        type: 'noeud',
        minutes: 3,
        titre: `بطاقة الدرس: ${titreLecon(lessonId)}`,
        savoirFaire: 'تراجع بطاقتك في ثلاث جمل قبل أن تنتقل.',
        pourquoi: 'المراجعة القصيرة بعد العمل هي ما يثبّت.',
        cle: `fiche:${lessonId}`,
        lessonId,
      };
    }
    return {
      type: 'noeud',
      minutes: noeud.minutes,
      titre: `${noeud.titre} · ${titreLecon(lessonId)}`,
      savoirFaire: noeud.savoirFaire,
      pourquoi:
        action.type === 'reprise'
          ? 'توقّفت هنا — نكمل من نفس المكان بلا إعادة.'
          : 'الخطوة التالية في طريقك، لا أكثر.',
      cle: noeud.id,
      lessonId,
      noeud,
    };
  }

  if (action.type === 'rappel') {
    const { retenues, reportees, toutes } = revisionsDuesPlafonnees(etat);
    const ids = retenues.length ? retenues : action.lessonIds;
    const titre =
      ids.length === 1 ? `راجع: ${titreLecon(ids[0])}` : `راجع ${ids.length} دروس مستحقّة اليوم`;
    return {
      type: 'revision',
      minutes: MINUTES_MISSION.revision,
      titre,
      savoirFaire: 'تسترجع الفكرة الأساسية لكل درس قبل أن تُفتح أي حصّة جديدة.',
      pourquoi:
        reportees > 0
          ? `الاسترجاع قبل الجديد — ${reportees} مراجعة بقيت في القائمة، بلا عجلة.`
          : 'الاسترجاع قبل الجديد — هذه هي القاعدة الأولى للطريقة.',
      cle: `revision:${(toutes.length ? toutes : action.lessonIds).join(',')}`,
      lessonIds: ids,
    };
  }

  if (action.type === 'fini') {
    // Tout le chemin est fait : on propose la compétence la plus fragile (entraînement court).
    const plan = planDeJour({
      unitesAbordees: Object.keys(etat.progression),
      revisionsDues: [],
      niveaux: profilCompetences(etat.maitriseSujets ?? {}),
    });
    const cible = plan.actions.find((a) => a.type === 'entrainement_sujet');
    return {
      type: cible ? 'entrainement_sujet' : 'fini',
      minutes: cible ? MINUTES_MISSION.entrainement_sujet : MINUTES_MISSION.fini,
      titre: cible ? 'تدريب قصير على أضعف كفاءة' : 'أنهيت كل البرنامج',
      savoirFaire: cible
        ? 'تتدرّب على الكفاءة التي تُكلّفك أكثر نقطة في الموضوع.'
        : 'تعيد على ما أتقنته، بلا جديد.',
      pourquoi: cible?.pourquoi ?? 'الطريق كامل — الباقي استرجاع ومواضيع.',
      cle: cible ? `competence:${cible.competence ?? ''}` : 'fini',
    };
  }

  // repos
  const prochain = action.prochaineItem;
  if (action.bonusDispo && prochain && prochain.type === 'lecon') {
    const noeud = prochainNoeud(prochain.id, etat.progression[prochain.id]);
    if (noeud) {
      return {
        type: 'noeud',
        minutes: noeud.minutes,
        titre: `${noeud.titre} · ${titreLecon(prochain.id)}`,
        savoirFaire: noeud.savoirFaire,
        pourquoi: 'حصّة إضافية واحدة متاحة — اختيارية، ولا تُحسب من حصص الغد.',
        cle: noeud.id,
        lessonId: prochain.id,
        noeud,
      };
    }
  }
  return {
    type: 'repos',
    minutes: MINUTES_MISSION.repos,
    titre: 'راحة مشروعة',
    savoirFaire: 'تترك التثبيت يحدث — النوم جزء من الحفظ.',
    pourquoi: 'أنجزت حصّة اليوم. الراحة ليست تراجعًا.',
    cle: 'repos',
  };
}

/**
 * La mission du jour : une seule, entre 3 et 5 minutes, avec ce que l'élève saura faire.
 * Ordre : reprise → révisions plafonnées à 5 → nœud du chemin → repos/compétence faible.
 */
export function missionDuJour(etat: Etat): PlanDuJour {
  const action = prochaineAction(etat);
  const mission = missionDepuisAction(etat, action);
  const { reportees, toutes } = revisionsDuesPlafonnees(etat);
  const plan = planDeJour({
    unitesAbordees: Object.keys(etat.progression),
    revisionsDues: toutes,
    niveaux: profilCompetences(etat.maitriseSujets ?? {}),
  });
  // Invariant : on n'affiche jamais une mission plus longue que la promesse faite à l'élève.
  const bornée: Mission = { ...mission, minutes: Math.min(mission.minutes, MINUTES_MAX_MISSION) };
  return { mission: bornée, reportees, plan };
}

/** Libellé du bouton principal — un seul, toujours le même verbe d'action. */
export function libelleMission(m: Mission): string {
  switch (m.type) {
    case 'noeud':
      return m.titre.startsWith('بطاقة') ? 'افتح البطاقة' : `ابدأ ${nb(m.minutes)} دقائق`;
    case 'jalon':
      return 'افتح الجسر';
    case 'revision':
      return 'ابدأ الاسترجاع';
    case 'entrainement_sujet':
      return 'ابدأ التدريب';
    case 'repos':
      return 'حسنًا — راحة';
    case 'fini':
      return 'مراجعة ما أُنجز';
  }
}

/** Sous-titre sobre : ce qui reste en file, jamais ce qui « manque ». */
export function sousTitreMission(p: PlanDuJour): string {
  if (p.mission.type === 'revision' && p.reportees > 0) {
    return `+ ${p.reportees} مراجعة في القائمة — تنتظر دورها، بلا عجلة.`;
  }
  if (p.mission.type === 'repos') return 'مهمّة واحدة في اليوم تكفي.';
  if (p.mission.type === 'fini') return 'كل الطريق أُنجز.';
  return 'مهمّة واحدة. لا أكثر اليوم.';
}
