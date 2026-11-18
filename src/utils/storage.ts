// التخزين المحلي — كل شيء في المتصفح (offline-first، لا خادم)
// المفتاح: murajih_svt_v1 (تبقى عليه التقدّم القديم)

import { etatVierge, progressionVierge, type Etat, type ProgressionLecon } from '../types';
import { viderStats, statsActuelles, type StatsReponses } from './stats';
import { signalerEchecStockage } from './echecsStockage';
export { surEchecSauvegarde } from './echecsStockage';

const CLE = 'murajih_svt_v1';
// Ne pas écraser des données existantes si leur lecture a échoué.
let lectureEnEchec = false;

/** Un remplacement explicite par une sauvegarde validée lève la protection. */
export function autoriserRemplacementEtat(): void { lectureEnEchec = false; }

export function chargerEtat(): Etat {
  try {
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
    if (progression && Object.values(progression).some(p => !p || typeof p !== 'object' || Array.isArray(p))) throw new Error('leçon invalide');
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
    return analyse.progression?.[lessonId]?.minutes ?? 0;
  } catch {
    return 0;
  }
}
