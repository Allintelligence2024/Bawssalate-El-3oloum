// نموذج البيانات العام — معماريّة OPUS 5.5 MAX مُطبّقة
// الحالة كلها في المتصفح (localStorage). لا خادم.

import { calendrierPour } from './config/annee';

function aujourdhuiIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type StatutLecon = 'vierge' | 'en_cours' | 'terminee';

export interface Domaine {
  id: string;
  titre: string;
  accent: string; // 'forest' | 'gold' | 'clay'
  unites: string[];
}

export interface Fenetre {
  debut: number; // أسبوع في السنة الدراسية (1 = منتصف سبتمبر)
  fin: number;
}

export interface Unite {
  id: string; // 'u1' ... 'u11'
  domaineId: string;
  numero: number;
  titre: string;
  competence: string;
  page: number;
  lessonIds: string[];
  prerequis?: string[];
  // ── إضافات معماريّة OPUS ──
  questionAr: string; // سؤال الوحدة (يُجاب عنه في الجسر)
  fenetre: Fenetre; // التدرّج السنوي الرسمي
  fenetreAr: string; // نص نافذة الوحدة
  poidsBac: number; // 1..5 — ثقل الوحدة في البكالوريا
  piegesAr: string[]; // فخّان رسميان للوحدة
}

// تقدّم تلميذ في درس واحد + معاملات التكرار المتباعد SM-2
export interface ProgressionLecon {
  statut: StatutLecon;
  phases: number[]; // المراحل المُنجزة (1..6)
  minutes: number;
  derniereSession?: string;
  repetitions: number;
  intervalle: number;
  facilite: number;
  prochaineRevision?: string;
  lue?: boolean;
  fragile?: boolean; // دعم/خطأ مرّتين → مراجعة غدًا
  reponses?: Record<number, string>; // إجابات التلميذ المكتوبة (إعادة القراءة)
  diagnostic?: string; // تشخيص الثغرة في المرحلة 6
  note?: number; // آخر تقييم ذاتي 0..10
  /** المراجعة المكثّفة (P2.3): نجاحات متتالية؛ عند 2 يخرج الدرس من قائمة الاسترجاع حتى الامتحان */
  reussitesIntensif?: number;
  /** خرج من الاسترجاع المكثّف بعد نجاحين (تاريخ ISO) */
  acquisIntensifLe?: string;
}

export interface BilanExamen {
  date: string; // ISO complet
  secondes: number;
  chrono: boolean;
  qcm: number; // عدد أسئلة الجزء الأول
  directs: number; // المُجابة من أول محاولة
  erreursEnquete: number; // أخطاء الجزء الثاني (استغلال الوثائق)
  unitesFaibles: number[]; // أرقام الوحدات التي وقع فيها خطأ في الجزء الأول
}

// بطاقة كفاءة المنهجية — مراجعة قصيرة programmée par la même SM-2 des leçons.
// Clé dans etat.kafaa : `methodo{index}` (index du تمرين في exercicesUnite1).
export interface CarteKafaa {
  verbe: string; // الإجراء (فكّك، استنتج، استخرج…)
  exercice: string; // عنوان التمرين
  erreur: string; // الفخّ (خطأ شائع) — à réécarter à chaque revue
  repetitions: number;
  intervalle: number;
  facilite: number;
  prochaineRevision?: string;
  fragile?: boolean;
}

// مربّط الوحدة (جسر) — كتابة تركيبية من الذاكرة
export interface JalonUnite {
  fait: boolean;
  synthese?: string;
  ts?: string;
}

export type KindNote = 'note' | 'question';

export interface NoteCarnet {
  id: string;
  kind: KindNote;
  texte: string;
  lessonId?: string;
  uniteId?: string;
  ts: string; // ISO
}

// خطأ ذرّي في تمرين منهجية — يُسجَّل آليًا لحظة وقوعه ثم يُصدَّر (v0.8 « carnet des failles »).
// Il complète la boucle mémoire kafaa par une trace consultable : « j'ai choisi X, pourquoi c'est
// fautif » — sans jamais y inscrire la bonne réponse (anti-stress : pas de révélation hors exercice).
export interface FauteCarnet {
  id: string;
  ts: string; // ISO
  contexte: string; // « تشخيص » « استقصاء · وثيقتان · مرحلة 3 » « محرّر · بطاقات » …
  enonce: string; // السؤال أو الموضع المطلوب
  donne: string; // جواب التلميذ الخاطئ (اختياره)
  diagnostic: string; // التشخيص المصنّف الذي عُرض لحظة الخطأ
}

// حساب التلميذ — يُحفظ في المتصفح فقط (لا خادم، لا تتبّع).
// motDePasse = SHA-256 مع بادئة ثابتة «kunz::» (وقد يكون تنسيقًا قديمًا قبل الدخول).
// الحساب لا يشفّر بيانات المتصفّح ولا يمثّل تحققًا من ملكية البريد.
// jeton = عشوائي، يُولَّد عند الإنشاء، يُرسَل في رأس «x-kunz-jeton» ليصرّح policy
// UPDATE في Supabase بتعديل سطر التلميذ فقط (انظر supabase/schema.sql).
export interface Compte {
  email: string;
  motDePasse: string;
  jeton?: string;
  wilaya: string; // رمز الولاية '01' .. '58'
  daira: string;
  creeLe: string; // ISO
}

export interface Etat {
  version: number;
  compte?: Compte;
  progression: Record<string, ProgressionLecon>;
  jalons: Record<string, JalonUnite>;
  notes: NoteCarnet[];
  carnet?: FauteCarnet[]; // سجلّ الأخطاء الذرّية (v0.8) — exportable
  journal: string[]; // أيام النشاط (ISO) — لإيقاع 5/7
  minutesTotales: number;
  revisions: number;
  nom: string;
  dateBac?: string; // ISO
  seancesJour?: string; // تاريخ آخر حصّة جديدة
  seancesComptees: number; // عدد الحصص الجديدة في seancesJour
  bonusJour?: string; // تاريخ استعمال الحصّة الإضافية
  drills?: Record<string, true>; // عناصر التدريبات المُجاب عنها correctly (المعرّف → true)
  ateliers?: Record<string, { fait: boolean; ts: string }>;
  kafaa?: Record<string, CarteKafaa>; // بطاقات كفاءة المنهجية (مفتاح: methodo{index})
  kafaaHebdo?: { debut: string; n: number }; // مراجعات الكفاءة هذا الأسبوع (الأحد → samedi): ≤ 2
  revueCroisee?: { semaine: string; lessonIds: string[]; faiteLe?: string }; // المراجعة المتقاطعة الأسبوعية (P2.4) — درس/مجال، مرّة في الأسبوع
  defi?: { semaine: string; type: 'drills' | 'croisee' | 'examen'; choisiLe: string; baseDrills: number }; // تحدّي الأسبوع المختار (P3.2)
  defisAccomplis?: string[]; // أسابيع التحدّيات المُنجزة (ISO بداية الأسبوع) — للشارة فقط
  consentementSync?: boolean; // موافقة التلميذ على إرسال ملخّص تقدّمه للمطوّر (انظر utils/sync.ts)
  /** تاريخ اختيار التلميذ الصريح (نعم أو لا) على شاشة الموافقة. غيابه = لم يُسأل بعد
   *  (تثبيت قديم كان فيه الإرسال مفعّلًا افتراضيًّا) → لا إرسال حتى يجيب (P0.2/P0.8). */
  consentementSyncDecideLe?: string;
  /** هدف العلامة (P2.2): 10+ / 14+ / 18+ — يضبط الحصّة اليومية المقترحة وسقف مراجعات الكفاءة. غيابه = 14. */
  objectif?: Objectif;
  /** المراجعة المكثّفة (P2.3): 'auto' (تلقائيًّا عند ≤ 60 يومًا من البكالوريا) · 'on' · 'off'. غيابه = auto. */
  modeIntensif?: 'auto' | 'on' | 'off';
  /** حجم الخط (P3.3): s / m / l. غيابه = m. */
  tailleTexte?: TailleTexte;
  /** اختبار التموضع (P2.1): النتيجة لكل وحدة. لا يفتح الطريق ولا يُقارن. */
  diagnostic?: { date: string; parUnite: Record<string, { justes: number; total: number }> };
  /** تاريخ آخر عرض/قرار لاختبار التموضع (قبول أو «لاحقًا») — يُعرض مرّة واحدة تلقائيًّا. */
  diagnosticDecideLe?: string;
  /** المفضّلة (P3.3): معرّفات الدروس المحفوظة — تُعاد مراجعتها في SessionRevision. */
  favoris?: string[];
  /** الامتحانات التجريبية المُنهاة (تواريخ ISO) — لمتابعة «موضوع واحد في الأسبوع» (P2.3). */
  examensBlancs?: string[];
  /** سجلّ الامتحانات التجريبية (P1.4): تاريخ، مدّة، مع/بدون مؤقّت، أسئلة الجزء الأول المُجابة مباشرة، الوحدات التي تعثّر فيها */
  examens?: BilanExamen[];
  /** التذكير اليومي المحلّي (P2.4): اختياري، مرّة في اليوم، الساعة بتوقيت الجهاز. غيابه = معطّل. */
  rappel?: { actif: boolean; heure: string };
  /** البطاقات (flashcards): صندوق لايتنر لكل بطاقة — مستقلّة عن SM-2 الدروس. */
  flashcards?: Record<string, { boite: 1 | 2 | 3; prochaine: string; vues: number }>;
  schemas?: Record<string, true>; // مخطّطات التسمية المُنهاة (P1.6)
}

export type Objectif = 10 | 14 | 18;
export type TailleTexte = 's' | 'm' | 'l';

export function progressionVierge(): ProgressionLecon {
  return {
    statut: 'vierge',
    phases: [],
    minutes: 0,
    repetitions: 0,
    intervalle: 0,
    facilite: 2.5,
  };
}

export function etatVierge(): Etat {
  return {
    version: 2,
    progression: {},
    jalons: {},
    notes: [],
    carnet: [],
    journal: [],
    minutesTotales: 0,
    revisions: 0,
    nom: 'تلميذ',
    dateBac: calendrierPour(aujourdhuiIso()).bac,
    seancesComptees: 0,
    ateliers: {},
    consentementSync: false, // par défaut: pas d'envoi tant que l'élève n'a pas explicitement dit oui (P0.2/P0.8)
  };
}
