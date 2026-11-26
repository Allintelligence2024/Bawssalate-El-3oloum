// المرحلة 3 — محمّل كسول ومخبَّأ لسجلّ «صوت المُرشد» (`src/data/audioMourchid.ts`).
//
// يبقي السجلّ والنصوص العربية خارج حزمة البدء (coquille ≤ 2.25 Mio) مثل `schemasSvtChargeur.ts`.
// مرّة واحدة في الذاكرة بعد أوّل تحميل، مع توحيد الطلبات المتزامنة وإمكانية إعادة المحاولة.

import type { PisteAudioMourchid } from '../data/audioMourchid';

type ModuleAudioMourchid = { AUDIO_MOURCHID: PisteAudioMourchid[] };
type ImporteurAudioMourchid = () => Promise<ModuleAudioMourchid>;

const importeurParDefaut: ImporteurAudioMourchid = () => import('../data/audioMourchid');

let importeurActif: ImporteurAudioMourchid = importeurParDefaut;
let cache: PisteAudioMourchid[] | null = null;
let enCours: Promise<PisteAudioMourchid[]> | null = null;

export function lireAudioMourchidCache(): PisteAudioMourchid[] | null {
  return cache;
}

export function chargerAudioMourchid(): Promise<PisteAudioMourchid[]> {
  if (cache) return Promise.resolve(cache);
  if (enCours) return enCours;
  enCours = importeurActif()
    .then((mod) => {
      cache = mod.AUDIO_MOURCHID;
      return cache;
    })
    .finally(() => {
      enCours = null;
    });
  return enCours;
}

/** تسخين صامت لسجلّ المُرشد الصوتي دون حجب العرض أو إثارة خطأ غير معالَج. */
export function prechaufferAudioMourchid(): void {
  if (cache || enCours) return;
  void chargerAudioMourchid().catch(() => {
    /* الفشل دون اتصال يُعرض في المكوّن عند الحاجة */
  });
}

/** للاختبارات الوحدوية فقط: إعادة تهيئة المخبأ وحقن مستورد تجريبي عند الحاجة. */
export function reinitialiserChargeurAudioMourchidPourTests(
  importeur?: ImporteurAudioMourchid,
): void {
  cache = null;
  enCours = null;
  importeurActif = importeur ?? importeurParDefaut;
}
