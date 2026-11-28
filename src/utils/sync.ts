// المزامنة الاختيارية — تُرسل ملخّص تقدّم التلميذ إلى قاعدة بيانات المطوّر (Supabase)
// فقط عند موافقته الصريحة. لا كلمات مرور، لا ملاحظات شخصية، لا حظر عند انقطاع الشبكة:
// التطبيق يعمل offline دائمًا، والمزامنة مجرّد إضافة صامتة في الخلفية.

import type { Etat } from '../types';
import { normaliserEmail } from './compte';
import { xpDe, niveauDe } from './xp';
import { statsActuelles } from './stats';

export const VERSION_APP = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.9.3';

/** Plafond aligné sur la policy RLS Supabase (256 Kio). */
export const TAILLE_MAX_CHARGE_UTILE = 262_144;
export const DELAI_DEBOUNCE_SYNC_MS = 6_000;
export const DELAI_MAX_ATTENTE_SYNC_MS = 30_000;

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
    email: normaliserEmail(etat.compte.email),
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

/** Délai maximal d'un envoi. Au-delà, on rend la main à l'élève : mieux vaut un état
 *  « erreur » affiché honnêtement qu'une application qui semble figée dans un couloir. */
export const DELAI_ENVOI_MS = 8_000;

function erreurDelai(): Error {
  const e = new Error('Délai de synchronisation dépassé');
  e.name = 'TimeoutError';
  return e;
}

/** Signal d'annulation à délai fixe avec repli AbortController pour les anciens Safari/WebView. */
export function signalDelai(ms: number = DELAI_ENVOI_MS): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controle = new AbortController();
  const minuterie = setTimeout(() => {
    controle.abort(erreurDelai());
  }, ms);
  // Permet à Node de ne pas rester bloqué sur un timer orphelin en test.
  if (typeof (minuterie as unknown as { unref?: () => void }).unref === 'function') {
    (minuterie as unknown as { unref: () => void }).unref();
  }
  return controle.signal;
}

/** Borne n'importe quelle promesse asynchrone (dont l'import dynamique du SDK) par un délai strict. */
export function avecDelai<T>(promesse: Promise<T>, ms: number = DELAI_ENVOI_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const minuterie = setTimeout(() => reject(erreurDelai()), ms);
    promesse.then(
      (valeur) => { clearTimeout(minuterie); resolve(valeur); },
      (err) => { clearTimeout(minuterie); reject(err); },
    );
  });
}

/** Calcule le délai effectif avant envoi sans famine : debounce court + plafond d'attente maximal. */
export function delaiAvantEnvoi(
  debutAttenteMs: number | null,
  maintenantMs: number,
  debounceMs: number = DELAI_DEBOUNCE_SYNC_MS,
  plafondMs: number = DELAI_MAX_ATTENTE_SYNC_MS,
): number {
  if (debutAttenteMs === null) return debounceMs;
  const ecoule = Math.max(0, maintenantMs - debutAttenteMs);
  const restant = Math.max(0, plafondMs - ecoule);
  return Math.min(debounceMs, restant);
}

let client: import('@supabase/supabase-js').SupabaseClient | null = null;
let jetonClient = '';
let enCours: Promise<void> | null = null;
/** Dernier état local pas encore remis au serveur. Un seul slot : on veut le PLUS RÉCENT,
 *  pas une file de tous les états intermédiaires (le serveur ne garde que l'écrasement final). */
let enAttente: Snapshot | null = null;
const comptesSuspendus = new Set<string>();
const suppressionsEnCours = new Set<string>();
export const CLE_SYNC_GENERATIONS = 'kunz_sync_generations_v1';
const generationsConnues = new Map<string, number>();

function lireGenerationsStockees(): Record<string, number> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const brut = localStorage.getItem(CLE_SYNC_GENERATIONS);
    if (!brut) return {};
    const obj = JSON.parse(brut) as unknown;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const resultat: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isSafeInteger(v) && v >= 1) {
        resultat[k] = v;
      }
    }
    return resultat;
  } catch {
    return {};
  }
}

function ecrireGenerationStockee(cle: string, generation: number | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const courant = lireGenerationsStockees();
    if (generation === null) {
      delete courant[cle];
    } else {
      courant[cle] = generation;
    }
    if (Object.keys(courant).length === 0) {
      localStorage.removeItem(CLE_SYNC_GENERATIONS);
    } else {
      localStorage.setItem(CLE_SYNC_GENERATIONS, JSON.stringify(courant));
    }
  } catch {
    // Stockage privé/indisponible : la Map mémoire reste fonctionnelle.
  }
}

export function generationConnue(email?: string): number {
  if (!email) return 1;
  const cle = normaliserEmail(email);
  const enMemoire = generationsConnues.get(cle);
  if (enMemoire !== undefined) return enMemoire;
  const stockees = lireGenerationsStockees();
  const stockee = stockees[cle];
  if (stockee !== undefined) {
    generationsConnues.set(cle, stockee);
    return stockee;
  }
  return 1;
}

export function definirGenerationConnue(email: string, generation: number): void {
  if (Number.isSafeInteger(generation) && generation >= 1) {
    const cle = normaliserEmail(email);
    generationsConnues.set(cle, generation);
    ecrireGenerationStockee(cle, generation);
  }
}

/** Vide le cache mémoire des générations (utile après effacement local ou en test). */
export function reinitialiserGenerationsMemoire(): void {
  generationsConnues.clear();
}

/** Les anciens jetons déterministes, triviaux (hex répété) ou issus du repli faible ne sont pas sûrs. */
export function jetonUtilisable(jeton?: string): boolean {
  return Boolean(
    jeton &&
    !/^([0-9a-f])\1{31,}$/i.test(jeton) &&
    !jeton.startsWith('j-'),
  );
}

/** Arrête les nouveaux envois dans cet onglet ; les requêtes déjà parties peuvent continuer. */
export function suspendreSync(email?: string): void {
  if (!email) return;
  const cle = normaliserEmail(email);
  comptesSuspendus.add(cle);
  if (enAttente?.email === cle) enAttente = null;
}

/** Un nouveau consentement explicite est nécessaire pour reprendre. */
export function reprendreSync(email?: string): void {
  if (!email) return;
  const cle = normaliserEmail(email);
  if (suppressionsEnCours.has(cle)) return;
  comptesSuspendus.delete(cle);
  dernierEnvoye = '';
  erreursEnvoi.delete(cle);
  publierEtatEnvoi(cle, 'en_attente');
}

let dernierEnvoye = '';
export type EtatEnvoi = 'en_attente' | 'envoi' | 'confirme' | 'erreur' | 'hors_ligne';
export type CauseErreurEnvoi =
  | 'aucune'
  | 'autorisation'
  | 'conflit_generation'
  | 'charge_trop_lourde'
  | 'limite_debit'
  | 'delai'
  | 'reseau'
  | 'serveur';

/** Compteur local (aucun envoi) des envois interrompus par le délai de 8 s. */
let derniersDelaisDepasses = 0;
export function delaisDepasses(): number {
  return derniersDelaisDepasses;
}

const etatsEnvoi = new Map<string, EtatEnvoi>();
const erreursEnvoi = new Map<string, CauseErreurEnvoi>();
const observateursEnvoi = new Set<() => void>();

export function etatEnvoi(email?: string): EtatEnvoi {
  return (email && etatsEnvoi.get(normaliserEmail(email))) || 'en_attente';
}

export function derniereErreurEnvoi(email?: string): CauseErreurEnvoi {
  return (email && erreursEnvoi.get(normaliserEmail(email))) || 'aucune';
}

export function abonnerEtatEnvoi(fn: () => void): () => void {
  observateursEnvoi.add(fn);
  return () => { observateursEnvoi.delete(fn); };
}

function publierEtatEnvoi(email: string, etat: EtatEnvoi, cause: CauseErreurEnvoi = 'aucune'): void {
  const cle = normaliserEmail(email);
  if (comptesSuspendus.has(cle)) return;
  etatsEnvoi.set(cle, etat);
  if (etat === 'erreur') erreursEnvoi.set(cle, cause);
  else if (etat === 'confirme') erreursEnvoi.set(cle, 'aucune');
  for (const fn of observateursEnvoi) fn();
}

export function classerErreurEnvoi(err: unknown): CauseErreurEnvoi {
  if (!err) return 'reseau';
  if (err instanceof Error && err.name === 'TimeoutError') return 'delai';
  const obj = err as { status?: number; code?: string; message?: string };
  const status = typeof obj.status === 'number' ? obj.status : undefined;
  const code = typeof obj.code === 'string' ? obj.code : '';
  const msg = typeof obj.message === 'string' ? obj.message.toLowerCase() : '';
  if (code === '40001' || status === 409 || msg.includes('génération') || msg.includes('generation')) {
    return 'conflit_generation';
  }
  if (status === 401 || status === 403 || code === '42501') return 'autorisation';
  if (status === 413 || msg.includes('262144') || msg.includes('payload too large')) return 'charge_trop_lourde';
  if (status === 429) return 'limite_debit';
  if (status !== undefined && status >= 500) return 'serveur';
  return 'reseau';
}

async function clientSupabase(jeton: string) {
  if (!syncActive()) return null;
  // Le jeton est passé en en-tête : il est exigé par la policy UPDATE (RLS).
  // Le client est recréé si le compte (donc le jeton) a changé dans l'onglet.
  const { url, key } = getSupabaseConfig();
  if (!client || jetonClient !== jeton) {
    const { createClient } = await avecDelai(import('@supabase/supabase-js'), DELAI_ENVOI_MS);
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
  if (!etat.compte) return;
  const email = normaliserEmail(etat.compte.email);
  if (!jetonUtilisable(etat.compte.jeton) || comptesSuspendus.has(email) || !consentementExplicite(etat)) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) { publierEtatEnvoi(email, 'hors_ligne'); return; }
  const snap = construireSnapshot(etat);
  if (!snap) return;
  // Coalescence (BUG-003) : si un envoi est en cours, on mémorise le dernier état produit.
  // Il sera envoyé dès la fin du précédent — jamais abandonné, même si l'écran a changé dix fois.
  if (enCours) { enAttente = snap; return; }
  await envoyerResume(snap);
}

async function lireGenerationServeur(
  sb: import('@supabase/supabase-js').SupabaseClient,
  email: string,
): Promise<number | null> {
  try {
    const table = sb.from('eleves') as unknown as {
      select?: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle?: () => Promise<{ data?: { generation?: unknown } | null; error?: unknown }>;
        };
      };
    };
    if (typeof table.select !== 'function') return null;
    const req = table.select('generation').eq('email', email);
    if (typeof req.maybeSingle !== 'function') return null;
    const { data, error } = await avecDelai(req.maybeSingle(), DELAI_ENVOI_MS);
    if (error || !data) return null;
    const gen = data.generation;
    return typeof gen === 'number' && Number.isSafeInteger(gen) && gen >= 1 ? gen : null;
  } catch {
    return null;
  }
}

async function envoyerResume(snap: Snapshot, tentativesConflit = 0): Promise<void> {
  const { maj: _maj, jeton: _jeton, ...chargeUtile } = snap;
  const json = JSON.stringify([snap.jeton, chargeUtile]);
  if (json === dernierEnvoye) { publierEtatEnvoi(snap.email, 'confirme'); return; }
  const generationAttendue = generationConnue(snap.email);
  const chargeComplete = { ...chargeUtile, maj: snap.maj, temoin_generation: generationAttendue };
  if (new TextEncoder().encode(JSON.stringify(chargeComplete)).byteLength > TAILLE_MAX_CHARGE_UTILE) {
    publierEtatEnvoi(snap.email, 'erreur', 'charge_trop_lourde');
    return;
  }
  let nouvelleGenerationReprise: number | null = null;
  const travail = Promise.resolve().then(async () => {
    try {
      const sb = await clientSupabase(snap.jeton);
      if (!sb || comptesSuspendus.has(snap.email)) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) { publierEtatEnvoi(snap.email, 'hors_ligne'); return; }
      publierEtatEnvoi(snap.email, 'envoi');
      // Timeout borné (BUG-007) : `abortSignal` annule la requête réseau, pas seulement l'attente.
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
          charge_utile: chargeComplete,
        },
        { onConflict: 'email' },
      ).abortSignal(signalDelai());
      if (!error) {
        dernierEnvoye = json;
        definirGenerationConnue(snap.email, generationAttendue + 1);
        publierEtatEnvoi(snap.email, 'confirme');
      } else {
        const cause = classerErreurEnvoi(error);
        if (cause === 'conflit_generation' && tentativesConflit < 1 && !comptesSuspendus.has(snap.email)) {
          const genServeur = await lireGenerationServeur(sb, snap.email);
          if (genServeur !== null && genServeur !== generationAttendue) {
            definirGenerationConnue(snap.email, genServeur);
            nouvelleGenerationReprise = genServeur;
            return;
          }
        }
        publierEtatEnvoi(snap.email, 'erreur', cause);
      }
    } catch (e) {
      const cause = classerErreurEnvoi(e);
      if (cause === 'delai') derniersDelaisDepasses++;
      publierEtatEnvoi(snap.email, 'erreur', cause);
    }
  });
  enCours = travail;
  try {
    await travail;
  } finally {
    // La file est vidée quoi qu'il arrive : succès, erreur, timeout, exception. Un état
    // produit pendant l'envoi ne doit jamais disparaître parce que l'envoi a échoué.
    if (enCours === travail) {
      enCours = null;
      if (nouvelleGenerationReprise !== null && !comptesSuspendus.has(snap.email)) {
        const aRejouer = enAttente ?? snap;
        enAttente = null;
        await envoyerResume(aRejouer, tentativesConflit + 1);
        return;
      }
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
  const email = etat.compte?.email ? normaliserEmail(etat.compte.email) : undefined;
  suspendreSync(email);
  if (!syncActive()) return 'sync_inactive';
  if (!email || !etat.compte?.jeton) return 'pas_de_compte';
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'hors_ligne';
  if (suppressionsEnCours.has(email)) return 'erreur';
  suppressionsEnCours.add(email);
  try {
    if (enCours) await enCours;
    const sb = await clientSupabase(etat.compte.jeton);
    if (!sb) return 'sync_inactive';
    const requeteSuppression = sb.from('eleves').delete().eq('email', email).select('email') as unknown as
      Promise<{ data: unknown[] | null; error: unknown }> & {
        abortSignal?: (signal: AbortSignal) => Promise<{ data: unknown[] | null; error: unknown }>;
      };
    const promesseSuppression = typeof requeteSuppression.abortSignal === 'function'
      ? requeteSuppression.abortSignal(signalDelai())
      : requeteSuppression;
    const { data, error } = await avecDelai(promesseSuppression, DELAI_ENVOI_MS);
    if (error) {
      return 'erreur';
    }
    if (!data || data.length !== 1) return 'indetermine'; // RLS ou ligne absente : impossible de distinguer
    dernierEnvoye = ''; // إن أعاد التلميذ الموافقة لاحقًا يُرسَل من جديد
    generationsConnues.delete(email);
    ecrireGenerationStockee(email, null);
    return 'supprime';
  } catch {
    return 'erreur';
  } finally {
    suppressionsEnCours.delete(email);
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
