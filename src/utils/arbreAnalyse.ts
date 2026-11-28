// محرّك «شجرة تحليل أدائك» لشاشة «أنا» — يجمع نتائج الدروس، التدريبات، الكفاءات الثماني،
// الامتحانات التجريبية، دروع الانتظام، وسجلّ الأخطاء في بنية شجرية واضحة وسهلة الفهم.

import { CHEMIN, DOMAINES, UNITES } from '../data/programme';
import type { Etat } from '../types';
import { niveauConfiance } from './bridge';
import { COMPETENCES } from './bridgeAdapter';
import { aujourdhui, differenceJours } from './dates';
import { itemsFaits } from './moteur';
import {
  LIBELLE_COMPETENCE,
  faiblessesMesurees,
  nombreEvaluations,
  profilCompetences,
  type EvaluationsParSujet,
} from './profil';
import { totalReponses, type StatsReponses } from './stats';
import { conseilPourFaible, forcesFaiblesses, statsParUnite, type StatUnite } from './statsUnite';
import { joursConsecutifsAvecBouclier, niveauDe, xpDe } from './xp';

export type StatutNoeud = 'solide' | 'en_cours' | 'fragile' | 'vierge';

export interface NoeudUniteArbre {
  uniteId: string;
  numero: number;
  titre: string;
  poidsBac: number;
  terminees: number;
  lecons: number;
  fragiles: string[];
  drillsFaits: number;
  drillsTotal: number;
  pourcentage: number; // داخلي لشريط التقدّم البصري
  statut: StatutNoeud;
  libelleStatut: string;
}

export interface NoeudDomaineArbre {
  domaineId: string;
  titreCourt: string;
  titre: string;
  accent: string;
  terminees: number;
  lecons: number;
  fragilesCount: number;
  pourcentage: number;
  statut: StatutNoeud;
  libelleStatut: string;
  unites: NoeudUniteArbre[];
}

export interface NoeudCompetenceArbre {
  code: string;
  libelle: string;
  preuves: number;
  statut: 'fragile' | 'en_cours' | 'solide';
  libelleStatut: string;
}

export interface ArbreAnalyseEleve {
  racine: {
    nom: string;
    niveauNom: string;
    xp: number;
    joursSuite: number;
    joursAvantBac: number | null;
    itemsFaits: number;
    itemsTotal: number;
    progressionPct: number;
    minutesTotales: number;
    etatGlobal: StatutNoeud;
    resumeGlobal: string;
  };
  domaines: NoeudDomaineArbre[];
  competences: {
    totalEvaluees: number;
    mesurees: NoeudCompetenceArbre[];
    prioriteUn: { libelle: string; raisons: string[] } | null;
    reponsesJustes: number;
    reponsesFausses: number;
    reponsesTotal: number;
    examensCount: number;
    fakhCount: number;
    tropheesCount: number;
    sprintsCount: number;
  };
  priorites: {
    plusForte: StatUnite | null;
    plusFaible: StatUnite | null;
    conseilFaible: string | null;
    fautesCount: number;
    notesCount: number;
    fragilesIds: string[];
    actionRecommandee: {
      titre: string;
      detail: string;
      type: 'revision' | 'exercices' | 'diagnostic';
      lessonIds?: string[];
    };
  };
}

const LIBELLES_STATUT: Record<StatutNoeud, string> = {
  solide: 'متين',
  en_cours: 'في الطريق',
  fragile: 'يحتاج تثبيتًا',
  vierge: 'لم يبدأ',
};

function titreCourtDomaine(titre: string): string {
  const idx = titre.indexOf(':');
  return idx >= 0 ? titre.slice(idx + 1).trim() : titre;
}

function statutDeUnite(s: StatUnite): StatutNoeud {
  if (!s.commencee) return 'vierge';
  if (s.fragiles.length > 0 || s.diagnostic === 'fragile') return 'fragile';
  if (s.lecons > 0 && s.terminees >= s.lecons) return 'solide';
  return 'en_cours';
}

function statutDeDomaine(unites: NoeudUniteArbre[]): StatutNoeud {
  if (unites.every((u) => u.statut === 'vierge')) return 'vierge';
  if (unites.some((u) => u.statut === 'fragile')) return 'fragile';
  if (unites.every((u) => u.statut === 'solide')) return 'solide';
  return 'en_cours';
}

export function construireArbreAnalyse(
  etat: Etat,
  stats: StatsReponses,
  evaluationsEntraineur?: EvaluationsParSujet,
  auj: string = aujourdhui(),
): ArbreAnalyseEleve {
  const statsU = statsParUnite(etat);
  const statParId = new Map(statsU.map((s) => [s.uniteId, s]));
  const unitesParId = new Map(UNITES.map((u) => [u.id, u]));

  const domaines: NoeudDomaineArbre[] = DOMAINES.map((d) => {
    const unites: NoeudUniteArbre[] = d.unites.map((uid) => {
      const s = statParId.get(uid);
      const u = unitesParId.get(uid);
      const lecons = s?.lecons ?? u?.lessonIds.length ?? 0;
      const terminees = s?.terminees ?? 0;
      const statut = s ? statutDeUnite(s) : 'vierge';
      return {
        uniteId: uid,
        numero: u?.numero ?? s?.numero ?? 0,
        titre: u?.titre ?? s?.titre ?? uid,
        poidsBac: u?.poidsBac ?? 2,
        terminees,
        lecons,
        fragiles: s?.fragiles ?? [],
        drillsFaits: s?.drillsFaits ?? 0,
        drillsTotal: s?.drillsTotal ?? 0,
        pourcentage: lecons > 0 ? Math.round((terminees / lecons) * 100) : 0,
        statut,
        libelleStatut: LIBELLES_STATUT[statut],
      };
    });

    const lecons = unites.reduce((acc, u) => acc + u.lecons, 0);
    const terminees = unites.reduce((acc, u) => acc + u.terminees, 0);
    const fragilesCount = unites.reduce((acc, u) => acc + u.fragiles.length, 0);
    const statut = statutDeDomaine(unites);

    return {
      domaineId: d.id,
      titreCourt: titreCourtDomaine(d.titre),
      titre: d.titre,
      accent: d.accent,
      terminees,
      lecons,
      fragilesCount,
      pourcentage: lecons > 0 ? Math.round((terminees / lecons) * 100) : 0,
      statut,
      libelleStatut: LIBELLES_STATUT[statut],
      unites,
    };
  });

  // فرع الكفاءات والنتائج
  const evals = evaluationsEntraineur ?? {};
  const totalEvaluees = nombreEvaluations(evals);
  const profil = totalEvaluees > 0 ? profilCompetences(evals) : null;
  const faiblessesComp = totalEvaluees > 0 ? faiblessesMesurees(evals, 1) : [];
  const mesurees: NoeudCompetenceArbre[] = profil
    ? COMPETENCES.filter((c) => profil[c].preuves > 0).map((c) => {
        const n = profil[c];
        const conf = niveauConfiance(n);
        const statut = conf < 40 ? 'fragile' : conf < 75 ? 'en_cours' : 'solide';
        return {
          code: c,
          libelle: LIBELLE_COMPETENCE[c],
          preuves: n.preuves,
          statut,
          libelleStatut: LIBELLES_STATUT[statut],
        };
      })
    : [];

  // فرع الأولويات (الأقوى والأضعف والأخطاء)
  const { plusForte, plusFaible } = forcesFaiblesses(etat);
  const fragilesIds = statsU.flatMap((s) => s.fragiles);
  const actionRecommandee: ArbreAnalyseEleve['priorites']['actionRecommandee'] =
    fragilesIds.length > 0
      ? {
          titre: `ثبّت ${fragilesIds.length === 1 ? 'الدرس الهشّ' : `${fragilesIds.length} دروس هشّة`}`,
          detail: 'جلسة استرجاع سريعة تحوّل النقاط الهشّة إلى معرفة ثابتة.',
          type: 'revision',
          lessonIds: fragilesIds.slice(0, 3),
        }
      : plusFaible
        ? {
            titre: `ركّز على وحدة «${plusFaible.titre}»`,
            detail: conseilPourFaible(plusFaible),
            type: 'exercices',
          }
        : {
            titre: 'حدّد مستواك باختبار التموضع',
            detail: 'اختبار قصير يكشف لك أيّ الوحدات تبدأ بها أولًا دون أي تقييم مقلق.',
            type: 'diagnostic',
          };

  // الجذر
  const faits = itemsFaits(etat);
  const totalItems = CHEMIN.length;
  const progressionPct = totalItems > 0 ? Math.round((faits / totalItems) * 100) : 0;
  const xp = xpDe(etat);
  const niveau = niveauDe(xp);
  const joursSuite = joursConsecutifsAvecBouclier(
    etat.journal,
    etat.rythmeBienveillant?.joursRepos,
    auj,
  );
  const joursAvantBac = etat.dateBac ? Math.max(0, differenceJours(auj, etat.dateBac)) : null;

  const etatGlobal: StatutNoeud =
    faits === 0 && totalReponses(stats) === 0
      ? 'vierge'
      : fragilesIds.length > 0
        ? 'fragile'
        : progressionPct >= 75
          ? 'solide'
          : 'en_cours';

  const resumeGlobal =
    etatGlobal === 'vierge'
      ? 'بداية نظيفة — كل درس أو تمرين تنجزه سيضيء فرعًا جديدًا في شجرتك.'
      : etatGlobal === 'fragile'
        ? `تقدّمك يسير جيدًا، مع ${fragilesIds.length === 1 ? 'نقطة واحدة تحتاج تثبيتًا' : `${fragilesIds.length} نقاط تحتاج تثبيتًا`}.`
        : etatGlobal === 'solide'
          ? 'مسارك متين ومنظّم — حافظ على المراجعة المتباعدة والامتحانات التجريبية.'
          : 'أنت في الطريق الصحيح — واصل خطوة بخطوة في الوحدات الأثقل.';

  return {
    racine: {
      nom: etat.nom && etat.nom !== 'تلميذ' ? etat.nom : 'طالب البكالوريا',
      niveauNom: niveau.nom,
      xp,
      joursSuite,
      joursAvantBac,
      itemsFaits: faits,
      itemsTotal: totalItems,
      progressionPct,
      minutesTotales: etat.minutesTotales,
      etatGlobal,
      resumeGlobal,
    },
    domaines,
    competences: {
      totalEvaluees,
      mesurees,
      prioriteUn: faiblessesComp[0]
        ? {
            libelle: LIBELLE_COMPETENCE[faiblessesComp[0].competence],
            raisons: faiblessesComp[0].raisons,
          }
        : null,
      reponsesJustes: stats.justes,
      reponsesFausses: stats.fausses,
      reponsesTotal: totalReponses(stats),
      examensCount: (etat.examens?.length ?? 0),
      fakhCount: Object.keys(etat.fakh ?? {}).length,
      tropheesCount: Object.keys(etat.trophees ?? {}).length,
      sprintsCount: (etat.sprints3Min?.length ?? 0),
    },
    priorites: {
      plusForte,
      plusFaible,
      conseilFaible: plusFaible ? conseilPourFaible(plusFaible) : null,
      fautesCount: (etat.carnet?.length ?? 0),
      notesCount: etat.notes.length,
      fragilesIds,
      actionRecommandee,
    },
  };
}
