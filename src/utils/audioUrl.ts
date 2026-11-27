// حلّ روابط ملفّات «صوت المُرشد» والملخّصات الصوتية للدروس.
//
// المبدأ المطابق لـ `src/utils/illustrations.ts`:
//  - الملفّات الصوتية (65 MP3 في `public/audio/{lecons,mourchid}/`) تُخدَّم مباشرة عند الطلب
//    (`<audio preload="none">`) ولا تدخل حزمة البدء (`coquille`) ولا `contenu` أبدًا، ويحفظها
//    عامل الخدمة بعد أوّل استماع للعمل دون اتصال.
//  - يمكن اختياريًا توجيه البثّ إلى CDN خارجي (Cloudflare R2) عبر `VITE_AUDIO_BASE_URL`
//    و`VITE_AUDIO_LECONS_BASE_URL`.

const NOM_AUDIO = /^[a-z0-9._-]+\.(mp3|opus|ogg|m4a)$/;

export const BASE_AUDIO_MOURCHID_LOCAL = '/audio/mourchid/';
export const BASE_AUDIO_LECONS_LOCAL = '/audio/lecons/';

export const MESSAGE_AUDIO_HORS_LIGNE =
  'تعذّر تحميل الصوت دون اتصال — يمكنك قراءة النصّ الكامل للمُرشد في الأسفل.';

export const MESSAGE_AUDIO_R2_EN_ATTENTE =
  'البثّ الصوتي غير مفعّل حاليًا — النصّ الكامل للمُرشد متاح للقراءة الآن دون اتصال.';

export const MESSAGE_AUDIO_RESUME_HORS_LIGNE =
  'يتطلّب اتصالًا للاستماع أوّل مرّة';

/**
 * رابط كبسولة صوتية للمُرشد: يستخدم `VITE_AUDIO_BASE_URL` إن ضُبط، وإلّا المسار المحلّي
 * `/audio/mourchid/<fichier>`. تمرير `baseOverride = ""` يُعطّل الصوت صراحة (للاختبارات).
 */
export function urlAudioMourchid(fichier: string, baseOverride?: string): string | null {
  if (!NOM_AUDIO.test(fichier)) {
    throw new Error(`Nom de fichier audio invalide (attendu : <nom>.mp3|.opus|.ogg|.m4a) : ${fichier}`);
  }
  if (baseOverride !== undefined) {
    const brut = baseOverride.trim();
    if (!brut) return null;
    const base = brut.endsWith('/') ? brut : `${brut}/`;
    return `${base}${fichier}`;
  }
  const env = import.meta.env.VITE_AUDIO_BASE_URL?.trim();
  const base = env ? (env.endsWith('/') ? env : `${env}/`) : BASE_AUDIO_MOURCHID_LOCAL;
  return `${base}${fichier}`;
}

/**
 * رابط ملخّص صوتي لدرس محدّد: يستخدم `VITE_AUDIO_LECONS_BASE_URL` إن ضُبط، وإلّا المسار
 * المحلّي `/audio/lecons/<fichier>`. تمرير `baseOverride = ""` يُعطّل الصوت صراحة.
 */
export function urlAudioLecon(fichier: string, baseOverride?: string): string | null {
  if (!NOM_AUDIO.test(fichier)) {
    throw new Error(`Nom de fichier audio de leçon invalide : ${fichier}`);
  }
  if (baseOverride !== undefined) {
    const brut = baseOverride.trim();
    if (!brut) return null;
    const base = brut.endsWith('/') ? brut : `${brut}/`;
    return `${base}${fichier}`;
  }
  const env = import.meta.env.VITE_AUDIO_LECONS_BASE_URL?.trim();
  const base = env ? (env.endsWith('/') ? env : `${env}/`) : BASE_AUDIO_LECONS_LOCAL;
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
