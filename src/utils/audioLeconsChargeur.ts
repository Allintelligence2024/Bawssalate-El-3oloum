// المرحلة 3 / الطيّار — محمّل كسول ومخبّأ لسجلّ الملخّصات الصوتية للدروس (`src/data/audioLecons.ts`).
//
// يبقي السجلّ خارج الكوكية (`coquille ≤ 2.25 Mio`) ويدمجه في حزمة `contenu` فقط.

import type { PisteAudioLecon } from '../data/audioLecons';

type ModuleAudioLecons = { AUDIO_LECONS: PisteAudioLecon[] };
type ImporteurAudioLecons = () => Promise<ModuleAudioLecons>;

const importeurParDefaut: ImporteurAudioLecons = () => import('../data/audioLecons');

let importeurActif: ImporteurAudioLecons = importeurParDefaut;
let cache: PisteAudioLecon[] | null = null;
let enCours: Promise<PisteAudioLecon[]> | null = null;

export function lireAudioLeconsCache(): PisteAudioLecon[] | null {
  return cache;
}

export function chargerAudioLecons(): Promise<PisteAudioLecon[]> {
  if (cache) return Promise.resolve(cache);
  if (enCours) return enCours;
  enCours = importeurActif()
    .then((mod) => {
      cache = mod.AUDIO_LECONS;
      return cache;
    })
    .finally(() => {
      enCours = null;
    });
  return enCours;
}

/** تسخين صامت لسجلّ الملخّصات الصوتية دون حجب العرض أو رفع استثناء. */
export function prechaufferAudioLecons(): void {
  if (cache || enCours) return;
  void chargerAudioLecons().catch(() => {
    /* دون اتصال: لا خطأ في وحدة التحكّم */
  });
}

/** للاختبارات الوحدوية فقط: إعادة تهيئة المخبأ وحقن مستورد تجريبي عند الحاجة. */
export function reinitialiserChargeurAudioLeconsPourTests(
  importeur?: ImporteurAudioLecons,
): void {
  cache = null;
  enCours = null;
  importeurActif = importeur ?? importeurParDefaut;
}
