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

export function sauvegarderEtat(etat: Etat): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // وضع التصفّح الخاص أو امتلاء التخزين — تجاهل
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
