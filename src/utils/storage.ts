// التخزين المحلي — كل شيء في المتصفح (offline-first، لا خادم)
// المفتاح: murajih_svt_v1 (تبقى عليه التقدّم القديم)

import { etatVierge, progressionVierge, type Etat, type ProgressionLecon } from '../types';
import { viderStats } from './stats';

const CLE = 'murajih_svt_v1';

export function chargerEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return etatVierge();
    return etatDepuisBrut(JSON.parse(brut) as Partial<Etat>);
  } catch {
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

// P-1.4 (D4) : l'échec d'écriture n'est plus avalé en silence. Les écouteurs
// enregistrés ici sont prévenus — l'app affiche un bandeau qui propose l'export.
type EcouteurEchec = () => void;
const ecouteursEchec: EcouteurEchec[] = [];

/** Écoute les échecs d'écriture localStorage (mode privé, quota plein…).
 *  Retourne une fonction de désinscription. */
export function surEchecSauvegarde(ecouteur: EcouteurEchec): () => void {
  ecouteursEchec.push(ecouteur);
  return () => {
    const i = ecouteursEchec.indexOf(ecouteur);
    if (i >= 0) ecouteursEchec.splice(i, 1);
  };
}

// ───────────── Sauvegarde complète exportée/importée (P-1.1, D1) ─────────────

/** Paquet d'export complet : enveloppe {application, version, exporteLe, etat}.
 *  Aucun secret réutilisable dans le fichier : le hachage de motDePasse est vidé
 *  (jeton conservé — exigé par la policy Supabase). Un fichier volé ne permet pas
 *  de retrouver le mot de passe, et l'import ne restaure jamais un hachage. */
export function paquetExportComplet(etat: Etat): {
  application: string;
  version: number;
  exporteLe: string;
  etat: Etat;
} {
  const sansSecret: Etat = etat.compte ? { ...etat, compte: { ...etat.compte, motDePasse: '' } } : etat;
  return {
    application: 'بوصلة العلوم · نسخة احتياطية',
    version: 2,
    exporteLe: new Date().toISOString(),
    etat: sansSecret,
  };
}

/** Import d'une sauvegarde : accepte l'export enveloppé {application, …, etat}
 *  (format actuel) ET le format plat historique (progression à la racine).
 *  Retourne null si ni l'un ni l'autre. Les secrets d'un fichier importé ne sont
 *  jamais restaurés : le hachage de motDePasse est vidé (voir Inscription pour
 *  la re-tétée à la reconnexion). */
export function etatDepuisFichier(brut: unknown): Etat | null {
  const enveloppe = brut as { etat?: Partial<Etat>; version?: number } | null;
  const source =
    enveloppe && typeof enveloppe === 'object' && enveloppe.etat
      ? enveloppe.etat
      : (brut as Partial<Etat> | null);
  if (!source || typeof source !== 'object' || !source.progression) return null;
  const copie = { ...source };
  if (copie.compte) copie.compte = { ...copie.compte, motDePasse: '' };
  return etatDepuisBrut(copie);
}

export function sauvegarderEtat(etat: Etat): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // وضع التصفّح الخاص أو امتلاء التخزين — لا نتجاهل بعد الآن: نُنبّه الواجهة
    // (l'état en mémoire n'est pas perdu ; la prochaine sauvegarde réessaie).
    for (const ecouteur of ecouteursEchec) ecouteur();
  }
}

export function progressionDe(etat: Etat, lessonId: string): ProgressionLecon {
  return etat.progression[lessonId] ?? progressionVierge();
}

export function viderStockage(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    // تجاهل
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
