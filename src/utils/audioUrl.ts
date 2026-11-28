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

export function normaliserBaseAudio(brut: string): string | null {
  const clean = brut.trim();
  if (!clean) return null;
  if (clean.startsWith('/') && !clean.startsWith('//')) {
    return clean.endsWith('/') ? clean : `${clean}/`;
  }
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== 'https:') return null;
    const href = parsed.toString();
    return href.endsWith('/') ? href : `${href}/`;
  } catch {
    return null;
  }
}

/**
 * رابط كبسولة صوتية للمُرشد: يستخدم `VITE_AUDIO_BASE_URL` إن ضُبط، وإلّا المسار المحلّي
 * `/audio/mourchid/<fichier>`. تمرير `baseOverride = ""` يُعطّل الصوت صراحة (للاختبارات).
 */
export function urlAudioMourchid(fichier: string, baseOverride?: string): string | null {
  if (!NOM_AUDIO.test(fichier)) {
    throw new Error(`Nom de fichier audio invalide (attendu : <nom>.mp3|.opus|.ogg|.m4a) : ${fichier}`);
  }
  if (baseOverride !== undefined) {
    const base = normaliserBaseAudio(baseOverride);
    return base ? `${base}${fichier}` : null;
  }
  const env = import.meta.env.VITE_AUDIO_BASE_URL?.trim();
  const base = env ? normaliserBaseAudio(env) : BASE_AUDIO_MOURCHID_LOCAL;
  return base ? `${base}${fichier}` : `${BASE_AUDIO_MOURCHID_LOCAL}${fichier}`;
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
    const base = normaliserBaseAudio(baseOverride);
    return base ? `${base}${fichier}` : null;
  }
  const env = import.meta.env.VITE_AUDIO_LECONS_BASE_URL?.trim();
  const base = env ? normaliserBaseAudio(env) : BASE_AUDIO_LECONS_LOCAL;
  return base ? `${base}${fichier}` : `${BASE_AUDIO_LECONS_LOCAL}${fichier}`;
}

/** صيغة مدّة صوتية مقروءة (مثال: 54 ← «0:54»، 88 ← «1:28»). */
export function formatDureeAudio(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes < 0) return '0:00';
  const total = Math.floor(secondes);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/** سرعات التشغيل الموحّدة بين ملخّصات الدروس وكبسولات «صوت المُرشد». */
export const VITESSES_AUDIO = [1, 1.25, 1.5] as const;

let arretAudioActif: (() => void) | null = null;

/** يضمن تشغيل مقطع صوتي واحد فقط في كلّ لحظة عبر جميع المشغّلات. */
export function activerLecteurAudio(arreter: () => void): void {
  if (arretAudioActif && arretAudioActif !== arreter) {
    arretAudioActif();
  }
  arretAudioActif = arreter;
}

/** يحرّر القفل الصوتي عند الإيقاف أو انتهاء التشغيل أو إزالة المكوّن. */
export function libererLecteurAudio(arreter: () => void): void {
  if (arretAudioActif === arreter) {
    arretAudioActif = null;
  }
}

