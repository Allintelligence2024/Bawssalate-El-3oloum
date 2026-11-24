// المزامنة الاختيارية — تُرسل ملخّص تقدّم التلميذ إلى قاعدة بيانات المطوّر (Supabase)
// فقط عند موافقته الصريحة. لا كلمات مرور، لا ملاحظات شخصية، لا حظر عند انقطاع الشبكة:
// التطبيق يعمل offline دائمًا، والمزامنة مجرّد إضافة صامتة في الخلفية.

import type { Etat } from '../types';
import { xpDe, niveauDe } from './xp';
import { statsActuelles } from './stats';

export const VERSION_APP = '0.10.4';

function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  };
}

// المزامنة مفعّلة فقط إذا وُضعت مفاتيح Supabase في .env — وإلّا تتحوّل تلقائيًا إلى لا شيء.
export function syncActive(config?: { url?: string; key?: string }): boolean {
  const { url, key } = config ?? getSupabaseConfig();
  return Boolean(url && key);
}

// ما يُرسَل: أرقام ومعرّفات الدروس/الجسور/التدريبات فقط. لا كلمات مرور ولا نصوص الملاحظات.
export interface Snapshot {
  email: string;
  jeton: string; // jeton d'écriture — exigé par la policy UPDATE côté base
  wilaya: string;
  daira: string;
  cree_le: string;
  nom: string;
  date_bac: string | null;
  xp: number;
  niveau: string;
  lecons_terminees: string[];
  lecons_en_cours: string[];
  lecons_fragiles: string[];
  jalons_faits: string[];
  ateliers_faits: string[];
  drills_faits: number;
  minutes_totales: number;
  revisions: number;
  seances_comptees: number;
  jours_activite: string[];
  reponses_justes: number;
  reponses_fausses: number;
  notes_nombre: number;
  app_version: string;
  maj: string;
}

/** قائمة ما يُرسَل فعلًا (P0.8) — تُعرض حرفيًّا في شاشة الموافقة وفي «أنا».
 *  يجب أن تبقى مطابقة لحقول Snapshot أعلاه: أي حقل جديد يُضاف هنا أيضًا. */
export const DONNEES_ENVOYEES: ReadonlyArray<{ libelle: string; detail: string }> = [
  { libelle: 'بريدك الإلكتروني', detail: 'معرّف حسابك (email)' },
  { libelle: 'اسمك المعروض والولاية والدائرة', detail: 'كما أدخلتها عند التسجيل' },
  { libelle: 'تاريخ البكالوريا الذي اخترته', detail: 'date_bac' },
  { libelle: 'معرّفات الدروس والجسور والورشات', detail: 'المنجزة، الجارية، الهشّة — أرقام ومعرّفات فقط' },
  { libelle: 'أرقام تقدّمك', detail: 'عدد التدريبات، الدقائق، المراجعات، الإجابات الصحيحة/الخاطئة، أيام النشاط، عدد الملاحظات' },
  { libelle: 'نقاط الخبرة والمستوى وإصدار التطبيق', detail: 'xp، niveau، app_version' },
  { libelle: 'رمز كتابة خاص بحسابك', detail: 'jeton — يسمح بتحديث سجلّك أنت فقط' },
];

/** ما لا يُرسَل أبدًا. */
export const DONNEES_JAMAIS_ENVOYEES: ReadonlyArray<string> = [
  'كلمة المرور (ولا حتى مشفّرة)',
  'نصوص ملاحظاتك وكرّاسة الأخطاء',
  'إجاباتك سؤالًا بسؤال',
  'نتيجة اختبار التموضع، مفضّلتك، بطاقاتك، إعداد التذكير، مراجعتك المتقاطعة، تحدّياتك وشاراتك، وتواريخ امتحاناتك التجريبية (تبقى على جهازك)',
];

export function construireSnapshot(etat: Etat): Snapshot | null {
  if (!etat.compte) return null;
  const stats = statsActuelles();
  const lecons = Object.entries(etat.progression);
  const xp = xpDe(etat);
  return {
    email: etat.compte.email,
    jeton: etat.compte.jeton ?? '',
    wilaya: etat.compte.wilaya,
    daira: etat.compte.daira,
    cree_le: etat.compte.creeLe,
    nom: etat.nom,
    date_bac: etat.dateBac ?? null,
    xp,
    niveau: niveauDe(xp).nom,
    lecons_terminees: lecons.filter(([, p]) => p.statut === 'terminee').map(([id]) => id),
    lecons_en_cours: lecons.filter(([, p]) => p.statut === 'en_cours').map(([id]) => id),
    lecons_fragiles: lecons.filter(([, p]) => p.fragile).map(([id]) => id),
    jalons_faits: Object.entries(etat.jalons).filter(([, j]) => j.fait).map(([id]) => id),
    ateliers_faits: Object.entries(etat.ateliers ?? {}).filter(([, a]) => a.fait).map(([id]) => id),
    drills_faits: Object.keys(etat.drills ?? {}).length,
    minutes_totales: etat.minutesTotales,
    revisions: etat.revisions,
    seances_comptees: etat.seancesComptees,
    jours_activite: [...new Set(etat.journal)].sort(),
    reponses_justes: stats.justes,
    reponses_fausses: stats.fausses,
    notes_nombre: etat.notes.length,
    app_version: VERSION_APP,
    maj: new Date().toISOString(),
  };
}

// ───────────── العميل (يُحمّل عند أول إرسال فقط — لا يثقل حزمة التطبيق الأساسية) ─────────────

let client: import('@supabase/supabase-js').SupabaseClient | null = null;
let jetonClient = '';
let enCours: Promise<void> | null = null;
let enAttente: Snapshot | null = null;
const comptesSuspendus = new Set<string>();
const suppressionsEnCours = new Set<string>();
/** Les anciens jetons déterministes ou issus du repli faible ne sont pas sûrs. */
export function jetonUtilisable(jeton?: string): boolean {
  return Boolean(jeton && !/^0{32}$/.test(jeton) && !jeton.startsWith('j-'));
}
/** Arrête les nouveaux envois dans cet onglet ; les requêtes déjà parties peuvent continuer. */
export function suspendreSync(email?: string): void {
  if (!email) return;
  comptesSuspendus.add(email);
  if (enAttente?.email === email) enAttente = null;
}
/** Un nouveau consentement explicite est nécessaire pour reprendre. */
export function reprendreSync(email?: string): void {
  if (!email || suppressionsEnCours.has(email)) return;
  comptesSuspendus.delete(email);
  dernierEnvoye = '';
  publierEtatEnvoi(email, 'en_attente');
}
let dernierEnvoye = '';
export type EtatEnvoi = 'en_attente' | 'envoi' | 'confirme' | 'erreur' | 'hors_ligne';
const etatsEnvoi = new Map<string, EtatEnvoi>();
const observateursEnvoi = new Set<() => void>();
export function etatEnvoi(email?: string): EtatEnvoi {
  return (email && etatsEnvoi.get(email)) || 'en_attente';
}
export function abonnerEtatEnvoi(fn: () => void): () => void {
  observateursEnvoi.add(fn);
  return () => { observateursEnvoi.delete(fn); };
}
function publierEtatEnvoi(email: string, etat: EtatEnvoi): void {
  if (comptesSuspendus.has(email)) return;
  etatsEnvoi.set(email, etat);
  for (const fn of observateursEnvoi) fn();
}

async function clientSupabase(jeton: string) {
  if (!syncActive()) return null;
  // Le jeton est passé en en-tête : il est exigé par la policy UPDATE (RLS).
  // Le client est recréé si le compte (donc le jeton) a changé dans l'onglet.
  const { url, key } = getSupabaseConfig();
  if (!client || jetonClient !== jeton) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(url as string, key as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-kunz-jeton': jeton } },
    });
    jetonClient = jeton;
  }
  return client;
}

// La progression locale ne dépend jamais du réseau.
export async function envoyerSnapshot(etat: Etat): Promise<void> {
  if (!syncActive()) return;
  if (!etat.compte || !jetonUtilisable(etat.compte.jeton) || comptesSuspendus.has(etat.compte.email) || !consentementExplicite(etat)) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) { publierEtatEnvoi(etat.compte.email, 'hors_ligne'); return; }
  const snap = construireSnapshot(etat);
  if (!snap) return;
  if (enCours) { enAttente = snap; return; }
  await envoyerResume(snap);
}

async function envoyerResume(snap: Snapshot): Promise<void> {
  const { maj: _maj, jeton: _jeton, ...chargeUtile } = snap;
  const json = JSON.stringify([snap.jeton, chargeUtile]);
  if (json === dernierEnvoye) { publierEtatEnvoi(snap.email, 'confirme'); return; }
  const travail = Promise.resolve().then(async () => {
  try {
    const sb = await clientSupabase(snap.jeton);
    if (!sb || comptesSuspendus.has(snap.email)) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) { publierEtatEnvoi(snap.email, 'hors_ligne'); return; }
    publierEtatEnvoi(snap.email, 'envoi');
    const { error } = await sb.from('eleves').upsert(
      {
        email: snap.email,
        jeton: snap.jeton,
        wilaya: snap.wilaya,
        daira: snap.daira,
        cree_le: snap.cree_le,
        nom: snap.nom,
        date_bac: snap.date_bac,
        xp: snap.xp,
        niveau: snap.niveau,
        lecons_terminees: snap.lecons_terminees.length,
        lecons_en_cours: snap.lecons_en_cours.length,
        lecons_fragiles: snap.lecons_fragiles.length,
        jalons_faits: snap.jalons_faits.length,
        ateliers_faits: snap.ateliers_faits.length,
        drills_faits: snap.drills_faits,
        minutes_totales: snap.minutes_totales,
        revisions: snap.revisions,
        seances_comptees: snap.seances_comptees,
        jours_activite: snap.jours_activite.length,
        reponses_justes: snap.reponses_justes,
        reponses_fausses: snap.reponses_fausses,
        notes_nombre: snap.notes_nombre,
        app_version: snap.app_version,
        maj: snap.maj,
        charge_utile: { ...chargeUtile, maj: snap.maj },
      },
      { onConflict: 'email' },
    );
    if (!error) {
      dernierEnvoye = json;
      publierEtatEnvoi(snap.email, 'confirme');
    } else publierEtatEnvoi(snap.email, 'erreur');
  } catch {
    publierEtatEnvoi(snap.email, 'erreur');
  }
  });
  enCours = travail;
  try { await travail; } finally {
    if (enCours === travail) {
      enCours = null;
      const suivant = enAttente;
      enAttente = null;
      if (suivant && !comptesSuspendus.has(suivant.email)) await envoyerResume(suivant);
    }
  }
}

/** حذف سجلّ التلميذ من الخادم (P0.8) — يتطلّب حسابًا وجيتونه (سياسة DELETE في supabase/schema.sql).
 *  النتيجة صريحة لأن الحذف ليس إرسالًا صامتًا: التلميذ يريد أن يعرف إن نجح. */
export type ResultatSuppression = 'supprime' | 'hors_ligne' | 'pas_de_compte' | 'sync_inactive' | 'indetermine' | 'erreur';

export async function supprimerSnapshotServeur(etat: Etat): Promise<ResultatSuppression> {
  suspendreSync(etat.compte?.email);
  if (!syncActive()) return 'sync_inactive';
  if (!etat.compte?.email || !etat.compte.jeton) return 'pas_de_compte';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'hors_ligne';
  if (suppressionsEnCours.has(etat.compte.email)) return 'erreur';
  suppressionsEnCours.add(etat.compte.email);
  try {
    if (enCours) await enCours;
    const sb = await clientSupabase(etat.compte.jeton);
    if (!sb) return 'sync_inactive';
    const { data, error } = await sb.from('eleves').delete().eq('email', etat.compte.email).select('email');
    if (error) {
      return 'erreur';
    }
    if (!data || data.length !== 1) return 'indetermine'; // RLS ou ligne absente : impossible de distinguer
    dernierEnvoye = ''; // إن أعاد التلميذ الموافقة لاحقًا يُرسَل من جديد
    return 'supprime';
  } catch {
    return 'erreur';
  } finally {
    suppressionsEnCours.delete(etat.compte.email);
  }
}

/** موافقة صريحة فقط: «نعم» مُسجَّل بتاريخ. التثبيتات القديمة (consentementSync: true بلا تاريخ
 *  لأن القيمة الافتراضية كانت true قبل v0.9.4) لا تُرسل شيئًا حتى يُجيب التلميذ على شاشة الموافقة. */
export function consentementExplicite(etat: Etat): boolean {
  return etat.consentementSync === true && Boolean(etat.consentementSyncDecideLe);
}

/** هل يجب عرض شاشة الموافقة؟ حساب موجود + مزامنة مهيّأة + لم يُجب بعد. */
export function doitDemanderConsentement(etat: Etat): boolean {
  return Boolean(etat.compte) && syncActive() && !etat.consentementSyncDecideLe;
}

// حالة المزامنة كما تُعرض في «أنا»: «نعم» فقط عند موافقة صريحة
export function consentementEtat(etat: Etat): 'oui' | 'non' {
  return consentementExplicite(etat) ? 'oui' : 'non';
}
