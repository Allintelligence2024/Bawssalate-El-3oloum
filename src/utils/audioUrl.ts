// المرحلة 3 — حلّ روابط ملفّات «صوت المُرشد» والملخّصات الصوتية للدروس (Cloudflare R2، بلا MP3 في Git).
//
// المبدأ مطابق لـ `src/utils/illustrations.ts`:
//  - الملفّات الصوتية لا تدخل مستودع Git ولا حزمة البدء أبدًا.
//  - دون ضبط رابط البثّ السحابي (`VITE_AUDIO_BASE_URL` / `VITE_AUDIO_LECONS_BASE_URL`)،
//    تعود الدالّة بـ `null` فلا يُرسل أيّ طلب 404.

const NOM_AUDIO = /^[a-z0-9._-]+\.(mp3|opus|ogg|m4a)$/;

export const MESSAGE_AUDIO_HORS_LIGNE =
  'تعذّر تحميل الصوت دون اتصال — يمكنك قراءة النصّ الكامل للمُرشد في الأسفل.';

export const MESSAGE_AUDIO_R2_EN_ATTENTE =
  'البثّ الصوتي جاهز للنشر السحابي — النصّ الكامل للمُرشد متاح للقراءة الآن دون اتصال.';

export const MESSAGE_AUDIO_RESUME_HORS_LIGNE =
  'يتطلّب اتصالًا للاستماع أوّل مرّة';

/**
 * رابط كبسولة صوتية للمُرشد (Cloudflare R2 عبر `VITE_AUDIO_BASE_URL`)، أو `null` إذا لم يُضبط بعد.
 */
export function urlAudioMourchid(fichier: string, baseOverride?: string): string | null {
  if (!NOM_AUDIO.test(fichier)) {
    throw new Error(`Nom de fichier audio invalide (attendu : <nom>.mp3|.opus|.ogg|.m4a) : ${fichier}`);
  }
  const brut = (baseOverride !== undefined ? baseOverride : import.meta.env.VITE_AUDIO_BASE_URL)?.trim();
  if (!brut) return null;
  const base = brut.endsWith('/') ? brut : `${brut}/`;
  return `${base}${fichier}`;
}

/**
 * رابط ملخّص صوتي لدرس محدّد (Cloudflare R2 عبر `VITE_AUDIO_LECONS_BASE_URL`)، أو `null` إذا لم يُضبط بعد.
 */
export function urlAudioLecon(fichier: string, baseOverride?: string): string | null {
  if (!NOM_AUDIO.test(fichier)) {
    throw new Error(`Nom de fichier audio de leçon invalide : ${fichier}`);
  }
  const brut = (
    baseOverride !== undefined ? baseOverride : import.meta.env.VITE_AUDIO_LECONS_BASE_URL
  )?.trim();
  if (!brut) return null;
  const base = brut.endsWith('/') ? brut : `${brut}/`;
  return `${base}${fichier}`;
}

/** صيغة مدّة صوتية مقروءة (مثال: 54 ← «0:54»، 88 ← «1:28»). */
export function formatDureeAudio(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes < 0) return '0:00';
  const total = Math.floor(secondes);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
