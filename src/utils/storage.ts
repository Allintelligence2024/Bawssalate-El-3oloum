// التخزين المحلي — كل شيء في المتصفح (offline-first، لا خادم)
// المفتاح: murajih_svt_v1 (تبقى عليه التقدّم القديم)

import { etatVierge, progressionVierge, type Etat, type ProgressionLecon } from '../types';
import { viderStats, statsActuelles, appliquerStats, CLE_STATS, type StatsReponses } from './stats';
import { signalerEchecStockage } from './echecsStockage';
export { surEchecSauvegarde } from './echecsStockage';

const CLE = 'murajih_svt_v1';
// Journal d'engagement de la restauration atomique (état + statistiques en une seule écriture).
const CLE_RESTAURATION = 'murajih_restauration_v1';
// Ne pas écraser des données existantes si leur lecture a échoué.
let lectureEnEchec = false;

/** Un remplacement explicite par une sauvegarde validée lève la protection. */
export function autoriserRemplacementEtat(): void { lectureEnEchec = false; }

function minutesValides(valeur: unknown): valeur is number {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= 0 && valeur <= 1_000_000_000;
}

export function chargerEtat(): Etat {
  // Une restauration engagée mais interrompue (rechargement au milieu de l'opération)
  // est rejouée avant toute lecture : l'import est complet ou absent, jamais à moitié.
  try {
    rejouerJournalRestauration();
    const brut = localStorage.getItem(CLE);
    if (!brut) { lectureEnEchec = false; return etatVierge(); }
    const analyse: unknown = JSON.parse(brut);
    if (!analyse || typeof analyse !== 'object' || Array.isArray(analyse)) throw new Error('état invalide');
    const progression = (analyse as Record<string, unknown>).progression;
    if (progression !== undefined && (!progression || typeof progression !== 'object' || Array.isArray(progression))) throw new Error('progression invalide');
    const champs = analyse as Record<string, unknown>;
    for (const champ of ['notes', 'carnet', 'journal']) {
      if (champs[champ] !== undefined && !Array.isArray(champs[champ])) throw new Error(`${champ} invalide`);
    }
    for (const champ of ['jalons', 'kafaa', 'drills', 'ateliers']) {
      const valeur = champs[champ];
      if (valeur !== undefined && (!valeur || typeof valeur !== 'object' || Array.isArray(valeur))) throw new Error(`${champ} invalide`);
    }
    if (champs.minutesTotales !== undefined && !minutesValides(champs.minutesTotales)) throw new Error('total invalide');
    if (progression && Object.values(progression).some(p => {
      if (!p || typeof p !== 'object' || Array.isArray(p)) return true;
      const { minutes } = p as Record<string, unknown>;
      return minutes !== undefined && !minutesValides(minutes);
    })) throw new Error('leçon invalide');
    const etat = etatDepuisBrut(analyse as Partial<Etat>);
    lectureEnEchec = false;
    return etat;
  } catch {
    lectureEnEchec = true;
    signalerEchecStockage();
    return etatVierge();
  }
}

/** Normalise un état brut (localStorage ou fichier importé) : comble les champs
 *  manquants avec les valeurs vierges — la même voie pour le chargement et l'import. */
export function etatDepuisBrut(analyse: Partial<Etat>): Etat {
  return {
    ...etatVierge(),
    ...analyse,
    progression: { ...analyse.progression },
    jalons: { ...analyse.jalons },
    notes: analyse.notes ?? [],
    carnet: analyse.carnet ?? [],
    journal: analyse.journal ?? [],
    kafaa: analyse.kafaa ?? {},
    drills: analyse.drills ?? {},
    ateliers: analyse.ateliers ?? {},
  };
}

// Les sauvegardes ne contiennent ni compte, ni jeton, ni consentement.
// Elles restent personnelles : progression et notes sont en clair.
export function paquetExportComplet(etat: Etat): {
  application: string; version: number; exporteLe: string;
  etat: Partial<Etat>; stats: StatsReponses;
} {
  const { compte: _compte, consentementSync: _consentement,
    consentementSyncDecideLe: _dateConsentement, ...progression } = etat;
  return {
    application: 'بوصلة العلوم · نسخة احتياطية', version: 3,
    exporteLe: new Date().toISOString(), etat: progression, stats: statsActuelles(),
  };
}

/** L'import de progression ne change jamais l'identité ni le consentement locaux. */
export function fusionnerProgressionImportee(courant: Etat, importe: Etat): Etat {
  return { ...importe, compte: courant.compte,
    consentementSync: courant.consentementSync, consentementSyncDecideLe: courant.consentementSyncDecideLe };
}

interface JournalRestauration { etat?: unknown; stats?: unknown }

/** Achève une restauration engagée mais inachevée, avant toute lecture de l'état. */
function rejouerJournalRestauration(): void {
  let brut: string | null = null;
  try { brut = localStorage.getItem(CLE_RESTAURATION); } catch { return; }
  if (!brut) return;
  let journal: JournalRestauration;
  try {
    journal = JSON.parse(brut) as JournalRestauration;
  } catch {
    // Journal illisible : abandonné, l'état sur le disque reste la source.
    try { localStorage.removeItem(CLE_RESTAURATION); } catch { /* rien */ }
    return;
  }
  const etatValide = !!journal && typeof journal === 'object' && !!journal.etat &&
    typeof journal.etat === 'object' && !Array.isArray(journal.etat);
  const statsValides = !!journal && (journal.stats === undefined || journal.stats === null ||
    (typeof journal.stats === 'object' && !Array.isArray(journal.stats)));
  if (!etatValide || !statsValides) {
    try { localStorage.removeItem(CLE_RESTAURATION); } catch { /* rien */ }
    return;
  }
  try {
    // Phase d'application rejouée, dans le même ordre que l'opération initiale.
    localStorage.setItem(CLE, JSON.stringify(journal.etat));
    if (journal.stats) {
      localStorage.setItem(CLE_STATS, JSON.stringify(journal.stats));
      appliquerStats(journal.stats as StatsReponses);
    }
    localStorage.removeItem(CLE_RESTAURATION);
    lectureEnEchec = false;
  } catch {
    // Les clés peuvent déjà diverger. Le journal reste la source de reprise ;
    // chargerEtat bloque les sauvegardes automatiques et signale l'échec.
    throw new Error('reprise de restauration incomplète');
  }
}

/**
 * Restauration atomique d'un import complet : la progression ET les statistiques sont
 * engagées par une seule écriture (le journal d'engagement), puis appliquées sur les
 * deux clés canoniques.
 *
 * @returns true si tout est appliqué. false si le stockage a refusé (quota) : dans ce
 * cas les anciennes données sur le disque, la mémoire et l'état affiché restent
 * inchangés — seule une écriture du journal a eu lieu, aussitôt annulée.
 * Une sauvegarde ancienne sans statistiques (stats undefined) ne touche pas les
 * statistiques existantes.
 */
export function restaurerEtatEtStats(nouveau: Etat, stats?: StatsReponses): boolean {
  let ancienEtat: string | null = null;
  try {
    ancienEtat = localStorage.getItem(CLE);
    // Phase d'engagement : une seule écriture contient les deux valeurs.
    localStorage.setItem(CLE_RESTAURATION, JSON.stringify({ etat: nouveau, stats: stats ?? null }));
  } catch {
    signalerEchecStockage(); // aucune autre clé n'a été touchée
    return false;
  }
  try {
    // Phase d'application, clé 1 : l'état.
    localStorage.setItem(CLE, JSON.stringify(nouveau));
  } catch {
    // setItem est atomique par clé : l'ancien contenu est déjà intact.
    // Il suffit d'annuler l'engagement pour que rien n'ait changé.
    try { localStorage.removeItem(CLE_RESTAURATION); } catch { /* rien */ }
    signalerEchecStockage();
    return false; // mémoire jamais touchée : l'état affiché ne bouge pas
  }
  if (stats) {
    try {
      // Phase d'application, clé 2 : les statistiques.
      localStorage.setItem(CLE_STATS, JSON.stringify(stats));
    } catch {
      // L'état a été écrit : on remet l'ancien octet de l'état, puis on retire le
      // journal. Remettre l'ancien octet coûte exactement ce que le journal (qui a
      // réussi) vient d'ajouter : cette écriture ne peut pas échouer à son tour.
      let remis = false;
      try {
        if (ancienEtat === null) localStorage.removeItem(CLE);
        else localStorage.setItem(CLE, ancienEtat);
        remis = true;
      } catch { remis = false; }
      if (remis) { try { localStorage.removeItem(CLE_RESTAURATION); } catch { /* rien */ } }
      signalerEchecStockage();
      return false; // mémoire jamais touchée : l'état affiché ne bouge pas
    }
  }
  try { localStorage.removeItem(CLE_RESTAURATION); } catch { /* rien */ }
  lectureEnEchec = false; // remplacement validé par l'import
  if (stats) appliquerStats(stats); // sinon les statistiques existantes sont conservées
  return true;
}

export function sauvegarderEtat(etat: Etat): void {
  if (lectureEnEchec) { signalerEchecStockage(); return; }
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // وضع التصفّح الخاص أو امتلاء التخزين — لا نتجاهل بعد الآن: نُنبّه الواجهة
    // (l'état en mémoire n'est pas perdu ; la prochaine sauvegarde réessaie).
    signalerEchecStockage();
  }
}

export function progressionDe(etat: Etat, lessonId: string): ProgressionLecon {
  return etat.progression[lessonId] ?? progressionVierge();
}

export function viderStockage(): void {
  try {
    localStorage.removeItem(CLE);
    lectureEnEchec = false;
  } catch {
    lectureEnEchec = true;
    signalerEchecStockage();
  }
  // إحصاء المُرشد يُمسح مع كل شيء عند إعادة الضبط
  viderStats();
}

// الدقائق المسجّلة سابقًا للدرس (قراءة مباشرة من التخزين لتفادي تقادم حالة React)
export function minutesStockees(lessonId: string): number {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return 0;
    const analyse = JSON.parse(brut) as Partial<Etat>;
    const minutes = analyse.progression?.[lessonId]?.minutes;
    return minutesValides(minutes) ? minutes : 0;
  } catch {
    return 0;
  }
}
