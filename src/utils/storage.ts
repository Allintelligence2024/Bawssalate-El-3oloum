// التخزين المحلي — كل شيء في المتصفح (offline-first، لا خادم)
// المفتاح: murajih_svt_v1 (تبقى عليه التقدّم القديم)

import { etatVierge, progressionVierge, type Etat, type ProgressionLecon } from '../types';
import { viderStats, statsPourExport, appliquerStats, suspendreEcritureStats, CLE_STATS, type StatsReponses } from './stats';
import { signalerEchecStockage } from './echecsStockage';
import { lireSauvegarde } from './backup';
import { etatDepuisBrut } from './etat';
import { memoriserValeur, marquerEtatPerime, reinitialiserEtatPerime, verifierCoherence } from './coherenceStockage';
import {
  CLE_CARNET_BOUSSOLE, CLE_RESTAURATION, lireCarnetBoussole,
  restaurationEnAttente, type CarnetBoussole,
} from './carnetBoussole';
export { surEchecSauvegarde } from './echecsStockage';
export { surEtatPerime } from './coherenceStockage';
export { etatDepuisBrut } from './etat';

export const CLE_ETAT = 'murajih_svt_v1';
const CLE = CLE_ETAT;
// Ne pas écraser des données existantes si leur lecture a échoué.
let lectureEnEchec = false;
let repriseBloqueeAuChargement = false;

/** Un remplacement explicite par une sauvegarde validée lève la protection. */
export function autoriserRemplacementEtat(): void { lectureEnEchec = false; }
export function restaurationBloqueeAuChargement(): boolean { return repriseBloqueeAuChargement; }

/** Geler cet onglet s'il a appris qu'un autre document restaure ou efface l'état. */
export function suspendreEcrituresLocalement(): void {
  lectureEnEchec = true;
  suspendreEcritureStats();
  marquerEtatPerime();
  signalerEchecStockage();
}

/** Après confirmation explicite : abandonner seulement le journal, jamais les autres clés. */
export function abandonnerJournalRestauration(): boolean {
  try {
    localStorage.removeItem(CLE_RESTAURATION);
    return localStorage.getItem(CLE_RESTAURATION) === null;
  } catch {
    signalerEchecStockage();
    return false;
  }
}

function minutesValides(valeur: unknown): valeur is number {
  return typeof valeur === 'number' && Number.isFinite(valeur) && valeur >= 0 && valeur <= 1_000_000_000;
}

export function chargerEtat(): Etat {
  // Une restauration interrompue est reprise avant la lecture de l'état ; si le
  // rejeu échoue, on bloque au lieu de présenter une copie partielle comme complète.
  // Les écritures sur plusieurs clés ne constituent pas une transaction inter-onglets.
  const reprise = rejouerJournalRestauration();
  if (reprise !== 'ok') {
    // Un journal connu bloque l'interface ; si tout le stockage est inaccessible,
    // on garde un mode temporaire utilisable, sans autoriser d'écritures.
    repriseBloqueeAuChargement = reprise === 'journal';
    lectureEnEchec = true;
    suspendreEcritureStats();
    return etatVierge();
  }
  repriseBloqueeAuChargement = false;
  try {
    const brut = localStorage.getItem(CLE);
    memoriserValeur(CLE, brut);
    if (brut === null) { reinitialiserEtatPerime(); lectureEnEchec = false; return etatVierge(); }
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
    reinitialiserEtatPerime();
    lectureEnEchec = false;
    return etat;
  } catch {
    lectureEnEchec = true;
    signalerEchecStockage();
    return etatVierge();
  }
}

// Les sauvegardes ne contiennent ni compte, ni jeton, ni consentement.
// Elles restent personnelles : progression et notes sont en clair.
export class RestaurationEnAttente extends Error {}
/** L'état vierge de secours ne représente pas les données devenues illisibles. */
export class EtatIllisible extends Error {}

/** La progression de secours ne doit pas non plus être envoyée comme une copie fiable. */
export function verifierLectureEtat(): void {
  if (lectureEnEchec) throw new EtatIllisible('La progression locale ne peut pas être lue.');
}

export function paquetExportComplet(etat: Etat): {
  application: string; version: number; exporteLe: string;
  etat: Partial<Etat>; stats: StatsReponses; carnetBoussole: CarnetBoussole | null;
} {
  // Un autre onglet a remplacé ou effacé les données : notre état React et nos
  // statistiques en mémoire ne forment plus une sauvegarde complète cohérente.
  try {
    if (!verifierCoherence()) throw new Error('copie périmée');
  } catch {
    throw new RestaurationEnAttente('La cohérence de cet onglet ne peut pas être vérifiée.');
  }
  const carnetBoussole = lireCarnetBoussole();
  // Un journal peut contenir une restauration partiellement appliquée : ne pas
  // assembler une copie qui mélangerait les anciennes et les nouvelles données.
  try {
    if (restaurationEnAttente()) throw new Error('journal présent');
  } catch {
    throw new RestaurationEnAttente('La restauration en cours ne peut pas être vérifiée.');
  }
  verifierLectureEtat();
  const { compte: _compte, consentementSync: _consentement,
    consentementSyncDecideLe: _dateConsentement, ...progression } = etat;
  return {
    application: 'بوصلة العلوم · نسخة احتياطية', version: 3,
    exporteLe: new Date().toISOString(), etat: progression, stats: statsPourExport(),
    // null distingue un carnet absent d'un ancien fichier sans ce champ.
    carnetBoussole,
  };
}

/** L'import de progression ne change jamais l'identité ni le consentement locaux. */
export function fusionnerProgressionImportee(courant: Etat, importe: Etat): Etat {
  return { ...importe, compte: courant.compte,
    consentementSync: courant.consentementSync, consentementSyncDecideLe: courant.consentementSyncDecideLe };
}

interface JournalRestauration { etat?: unknown; stats?: unknown; carnetBoussole?: unknown }
interface Modification { cle: string; valeur: string | null }

/** Le carnet vu à la confirmation doit encore être le même à l'action suivante. */
function carnetToujoursAttendu(reference: string | null | undefined): boolean {
  // undefined = référence omise, à distinguer de null = carnet effectivement absent.
  if (reference === undefined) return false;
  if (localStorage.getItem(CLE_CARNET_BOUSSOLE) === reference) return true;
  marquerEtatPerime();
  return false;
}

/** Un journal ancien sans carnet ne modifie pas le carnet local. */
function modificationsDuJournal(journal: JournalRestauration): Modification[] | null {
  if (!journal || typeof journal !== 'object' || Array.isArray(journal)) return null;
  // Ne pas effacer un futur journal qui contiendrait d'autres opérations.
  if (Object.keys(journal).some((cle) => !['etat', 'stats', 'carnetBoussole'].includes(cle))) return null;
  if (!journal.etat || typeof journal.etat !== 'object' || Array.isArray(journal.etat)) return null;
  const etat = journal.etat as Record<string, unknown>;
  // L'import ignore l'identité, mais un journal contient l'identité locale qui
  // sera réécrite telle quelle. Ne pas rejouer un compte ou consentement abîmé.
  if (etat.compte !== undefined) {
    if (!etat.compte || typeof etat.compte !== 'object' || Array.isArray(etat.compte)) return null;
    const compte = etat.compte as Record<string, unknown>;
    if (['email', 'wilaya', 'daira', 'creeLe'].some((cle) => typeof compte[cle] !== 'string')) return null;
    if (['motDePasse', 'jeton'].some((cle) => compte[cle] !== undefined && typeof compte[cle] !== 'string')) return null;
  }
  if (etat.consentementSync !== undefined && typeof etat.consentementSync !== 'boolean') return null;
  if (etat.consentementSyncDecideLe !== undefined && typeof etat.consentementSyncDecideLe !== 'string') return null;
  const presenceCarnet = Object.prototype.hasOwnProperty.call(journal, 'carnetBoussole');
  // Un journal illisible ou d'une version future ne doit jamais être appliqué ni
  // supprimé. Employer les mêmes bornes que pour un fichier importé.
  const lu = lireSauvegarde({
    version: 3,
    etat: journal.etat,
    ...(journal.stats != null ? { stats: journal.stats } : {}),
    ...(presenceCarnet ? { carnetBoussole: journal.carnetBoussole } : {}),
  });
  if (!lu || (presenceCarnet && lu.carnetBoussole === undefined)) return null;
  // L'état engagé comprend l'identité locale : la validation ci-dessus ne doit
  // pas la retirer, contrairement à la normalisation d'un fichier importé.
  const modifications: Modification[] = [{ cle: CLE, valeur: JSON.stringify(journal.etat) }];
  if (lu.stats) modifications.push({ cle: CLE_STATS, valeur: JSON.stringify(lu.stats) });
  if (presenceCarnet) {
    modifications.push({ cle: CLE_CARNET_BOUSSOLE, valeur: lu.carnetBoussole === null ? null : JSON.stringify(lu.carnetBoussole) });
  }
  return modifications;
}

function appliquerModification({ cle, valeur }: Modification): void {
  if (valeur === null) localStorage.removeItem(cle);
  else localStorage.setItem(cle, valeur);
}

/** Achève une restauration engagée mais inachevée, avant toute lecture de l'état. */
function rejouerJournalRestauration(): 'ok' | 'journal' | 'indisponible' {
  let brut: string | null;
  try { brut = localStorage.getItem(CLE_RESTAURATION); }
  catch { signalerEchecStockage(); return 'indisponible'; }
  if (brut === null) return 'ok';
  let journal: JournalRestauration | null = null;
  try { journal = JSON.parse(brut) as JournalRestauration; } catch { /* journal illisible */ }
  const modifications = journal && modificationsDuJournal(journal);
  if (!modifications) {
    // Ce journal peut contenir des données encore non appliquées ou appartenir à
    // une version plus récente. Le conserver plutôt que présenter un état partiel.
    signalerEchecStockage();
    return 'journal';
  }
  try {
    modifications.forEach(appliquerModification);
    localStorage.removeItem(CLE_RESTAURATION);
    // Après rejeu, les références suivies correspondent aux valeurs réellement écrites.
    modifications.filter(({ cle }) => cle === CLE || cle === CLE_STATS)
      .forEach(({ cle, valeur }) => memoriserValeur(cle, valeur));
    const stats = modifications.find(({ cle }) => cle === CLE_STATS)?.valeur;
    if (stats) appliquerStats(JSON.parse(stats) as StatsReponses);
    lectureEnEchec = false;
    return 'ok';
  } catch {
    // Le journal reste pour un nouvel essai. Ne pas lire un état partiellement appliqué.
    signalerEchecStockage();
    return 'journal';
  }
}

/**
 * Engage d'abord les champs présents dans un journal unique, puis les applique.
 * Si l'application échoue, restaure les anciennes valeurs quand le stockage le permet ;
 * sinon le journal subsiste pour être rejoué et l'erreur est signalée. Les champs
 * absents d'une ancienne sauvegarde ne modifient ni stats ni carnet existants.
 * Si le carnet est présent dans l'import (même null), sa valeur locale brute
 * doit être capturée avant confirmation ; une référence omise est refusée.
 */
export function restaurerEtatEtStats(
  nouveau: Etat,
  stats?: StatsReponses,
  carnetBoussole?: CarnetBoussole | null,
  carnetAvantConfirmation?: string | null,
): boolean {
  // Un onglet périmé ne peut pas engager une nouvelle opération avec son état
  // ancien, même si le journal de l'autre document a déjà disparu.
  // Ne pas rejouer ici : l'interface afficherait encore l'ancien état après le
  // rejeu. Une restauration inachevée doit être reprise au prochain chargement.
  try {
    if (!verifierCoherence()) { signalerEchecStockage(); return false; }
    if (carnetBoussole !== undefined && !carnetToujoursAttendu(carnetAvantConfirmation)) {
      signalerEchecStockage();
      return false;
    }
    if (restaurationEnAttente()) {
      lectureEnEchec = true;
      signalerEchecStockage();
      return false;
    }
  } catch {
    lectureEnEchec = true;
    signalerEchecStockage();
    return false;
  }
  const journal: JournalRestauration = {
    etat: nouveau,
    stats: stats ?? null,
    ...(carnetBoussole !== undefined ? { carnetBoussole } : {}),
  };
  const modifications = modificationsDuJournal(journal);
  if (!modifications) { signalerEchecStockage(); return false; }
  let anciennes: Modification[];
  try {
    anciennes = modifications.map(({ cle }) => ({ cle, valeur: localStorage.getItem(cle) }));
    localStorage.setItem(CLE_RESTAURATION, JSON.stringify(journal));
  } catch {
    signalerEchecStockage();
    return false;
  }
  let appliquees = 0;
  try {
    for (const modification of modifications) {
      appliquerModification(modification);
      appliquees++;
    }
    localStorage.removeItem(CLE_RESTAURATION);
  } catch {
    let retourComplet = true;
    for (let i = appliquees - 1; i >= 0; i--) {
      try { appliquerModification(anciennes[i]); } catch { retourComplet = false; }
    }
    if (retourComplet) {
      try { localStorage.removeItem(CLE_RESTAURATION); } catch { retourComplet = false; }
    }
    // Si le retour a échoué, le rejeu sera nécessaire : bloquer les écritures en attendant.
    if (!retourComplet) lectureEnEchec = true;
    signalerEchecStockage();
    return false;
  }
  modifications.filter(({ cle }) => cle === CLE || cle === CLE_STATS)
    .forEach(({ cle, valeur }) => memoriserValeur(cle, valeur));
  lectureEnEchec = false;
  if (stats) appliquerStats(stats);
  return true;
}

export function sauvegarderEtat(etat: Etat): void {
  if (lectureEnEchec) { signalerEchecStockage(); return; }
  try {
    // Un autre document peut avoir engagé une restauration depuis notre lecture.
    // Ne plus écrire un état potentiellement périmé, même si le journal disparaît.
    if (restaurationEnAttente()) {
      lectureEnEchec = true;
      signalerEchecStockage();
      return;
    }
    if (!verifierCoherence()) { signalerEchecStockage(); return; }
    const brut = JSON.stringify(etat);
    localStorage.setItem(CLE, brut);
    memoriserValeur(CLE, brut);
  } catch {
    // وضع التصفّح الخاص أو امتلاء التخزين — لا نتجاهل بعد الآن: نُنبّه الواجهة
    // (l'état en mémoire n'est pas perdu ; la prochaine sauvegarde réessaie).
    signalerEchecStockage();
  }
}

export function progressionDe(etat: Etat, lessonId: string): ProgressionLecon {
  return etat.progression[lessonId] ?? progressionVierge();
}

export function viderStockage(carnetAvantConfirmation: string | null): boolean {
  // Supprimer d'abord le journal : sinon il pourrait ressusciter les données effacées.
  try {
    if (!verifierCoherence()) { signalerEchecStockage(); return false; }
    if (!carnetToujoursAttendu(carnetAvantConfirmation)) { signalerEchecStockage(); return false; }
    localStorage.removeItem(CLE_RESTAURATION);
  } catch { signalerEchecStockage(); return false; }
  let supprime = true;
  for (const cle of [CLE_CARNET_BOUSSOLE, CLE]) {
    try {
      localStorage.removeItem(cle);
      if (cle === CLE) memoriserValeur(CLE, null);
    } catch { supprime = false; signalerEchecStockage(); }
  }
  const statsSupprimees = viderStats();
  // En cas d'échec partiel, empêcher l'état encore affiché d'écraser le disque.
  lectureEnEchec = !supprime || !statsSupprimees;
  return supprime && statsSupprimees;
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
