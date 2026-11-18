// التذكير اليومي المحلّي (P2.4) — اختياري (opt-in)، تذكير واحد في اليوم كحدّ أقصى، في الساعة التي يختارها التلميذ.
//
// المبادئ:
//  - لا شيء يُجدول قبل أن يفعّله التلميذ بنفسه، ويطفئه بلمسة واحدة.
//  - النصّ ثابت ومحايد: لا علامة، لا «تأخّرت»، لا محتوى درس، لا ذنب. (`TEXTES_RAPPEL`)
//  - محلّي بالكامل (Capacitor Local Notifications): لا خادم، لا رمز دفع، لا إرسال بيانات.
//  - منبّه غير دقيق (inexact): كافٍ لتذكير يومي ولا يحتاج إذن SCHEDULE_EXACT_ALARM.
//  - على المتصفح لا جدولة ممكنة والتطبيق مغلق: نقول ذلك صراحة بدل الادّعاء.
//
// المنطق الصافي (الساعة، النصّ، القرار) هنا قابل للاختبار بلا جهاز؛ الإضافة الأصلية تُحمَّل عند الطلب فقط.

import type { Etat } from '../types';

export const ID_RAPPEL = 1;
export const HEURE_PAR_DEFAUT = '19:30';

/** نصوص تُختار بالتناوب حسب يوم السنة — كلّها بلا أرقام ولا تقييم. */
export const TEXTES_RAPPEL: ReadonlyArray<{ titre: string; corps: string }> = [
  { titre: 'بوصلة العلوم', corps: 'مهمّة اليوم جاهزة. خطوة واحدة تكفي.' },
  { titre: 'بوصلة العلوم', corps: 'دقائق قليلة اليوم خير من ساعة في ماي.' },
  { titre: 'بوصلة العلوم', corps: 'طريقك ينتظر خطوتك التالية — حين تكون مستعدًّا.' },
  { titre: 'بوصلة العلوم', corps: 'استرجاع قصير اليوم يثبّت ما تعلّمته أمس.' },
];

export interface ReglageRappel {
  actif: boolean;
  /** HH:MM بتوقيت الجهاز */
  heure: string;
}

export function reglageRappel(etat: Etat): ReglageRappel {
  return { actif: etat.rappel?.actif ?? false, heure: etat.rappel?.heure ?? HEURE_PAR_DEFAUT };
}

/** يفكّك «HH:MM» بأمان؛ يعيد null إن كان الشكل غير صالح. */
export function decomposerHeure(heure: string): { hour: number; minute: number } | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(heure.trim());
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

export function texteRappel(date = new Date()): { titre: string; corps: string } {
  const debut = Date.UTC(date.getFullYear(), 0, 1);
  const jour = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - debut) / 86_400_000);
  return TEXTES_RAPPEL[jour % TEXTES_RAPPEL.length];
}

/** الموعد القادم للتذكير انطلاقًا من «الآن» — اليوم إن لم تمرّ الساعة بعد، وإلا غدًا. */
export function prochainRappel(heure: string, maintenant = new Date()): Date | null {
  const h = decomposerHeure(heure);
  if (!h) return null;
  const d = new Date(maintenant);
  d.setHours(h.hour, h.minute, 0, 0);
  if (d.getTime() <= maintenant.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

// ───────────── المحوّل الأصلي (Capacitor) ─────────────

export type EtatPermission = 'granted' | 'denied' | 'prompt' | 'indisponible';

/** واجهة ضيّقة حول الإضافة — تُستبدل في الاختبارات. */
export interface AdaptateurRappels {
  disponible(): boolean;
  permission(): Promise<EtatPermission>;
  demanderPermission(): Promise<EtatPermission>;
  programmer(heure: { hour: number; minute: number }, texte: { titre: string; corps: string }): Promise<void>;
  annuler(): Promise<void>;
}

async function adaptateurCapacitor(): Promise<AdaptateurRappels> {
  const { Capacitor } = await import('@capacitor/core');
  const natif = Capacitor.isNativePlatform();
  if (!natif) {
    return {
      disponible: () => false,
      permission: async () => 'indisponible',
      demanderPermission: async () => 'indisponible',
      programmer: async () => undefined,
      annuler: async () => undefined,
    };
  }
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const vers = (s: string): EtatPermission => (s === 'granted' || s === 'denied' ? s : 'prompt');
  return {
    disponible: () => true,
    permission: async () => vers((await LocalNotifications.checkPermissions()).display),
    demanderPermission: async () => vers((await LocalNotifications.requestPermissions()).display),
    programmer: async (heure, texte) => {
      await LocalNotifications.cancel({ notifications: [{ id: ID_RAPPEL }] });
      await LocalNotifications.schedule({
        notifications: [
          {
            id: ID_RAPPEL,
            title: texte.titre,
            body: texte.corps,
            // تكرار يومي في الساعة المختارة — منبّه غير دقيق، يكفي لتذكير، ولا يحتاج إذنًا إضافيًّا
            schedule: { on: { hour: heure.hour, minute: heure.minute }, allowWhileIdle: false },
          },
        ],
      });
    },
    annuler: async () => {
      await LocalNotifications.cancel({ notifications: [{ id: ID_RAPPEL }] });
    },
  };
}
let adaptateur: Promise<AdaptateurRappels> | null = null;
export function obtenirAdaptateur(): Promise<AdaptateurRappels> {
  adaptateur ??= adaptateurCapacitor();
  return adaptateur;
}
/** للاختبارات فقط. */
export function _injecterAdaptateur(a: AdaptateurRappels | null): void {
  adaptateur = a ? Promise.resolve(a) : null;
}

export type ResultatActivation =
  | { ok: true }
  | { ok: false; raison: 'heure_invalide' | 'permission_refusee' | 'indisponible' };

/** تفعيل: إذن → جدولة. لا يُجدول شيء إن رُفض الإذن أو كانت المنصّة متصفحًا. */
export async function activerRappel(heure: string, adapt?: AdaptateurRappels): Promise<ResultatActivation> {
  const h = decomposerHeure(heure);
  if (!h) return { ok: false, raison: 'heure_invalide' };
  const a = adapt ?? (await obtenirAdaptateur());
  if (!a.disponible()) return { ok: false, raison: 'indisponible' };
  let perm = await a.permission();
  if (perm === 'prompt') perm = await a.demanderPermission();
  if (perm !== 'granted') return { ok: false, raison: 'permission_refusee' };
  await a.programmer(h, texteRappel());
  return { ok: true };
}

export async function desactiverRappel(adapt?: AdaptateurRappels): Promise<void> {
  const a = adapt ?? (await obtenirAdaptateur());
  if (!a.disponible()) return;
  await a.annuler();
}

/** عند فتح التطبيق: إن كان التذكير مفعّلًا، نعيد الجدولة بهدوء (النصّ يتبدّل، والإلغاء بعد إعادة التثبيت يُصلَح). */
export async function synchroniserRappel(etat: Etat, adapt?: AdaptateurRappels): Promise<void> {
  const r = reglageRappel(etat);
  const a = adapt ?? (await obtenirAdaptateur());
  if (!a.disponible()) return;
  if (!r.actif) return;
  if ((await a.permission()) !== 'granted') return;
  const h = decomposerHeure(r.heure);
  if (h) await a.programmer(h, texteRappel());
}
