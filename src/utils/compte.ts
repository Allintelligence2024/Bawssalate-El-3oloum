// الحساب المحلي — بريد إلكتروني وكلمة مرور وولاية ودائرة، داخل المتصفح فقط.
// لا خادم، لا إرسال، لا تتبّع: كل شيء في localStorage تحت مفتاح التطبيق نفسه.

import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

const CLE_SESSION = 'kunz_session_v1';

export const MIN_MDP = 6;
const PBKDF2_PREFIXE = 'pbkdf2';
const PBKDF2_ITERATIONS = 60_000;
const PBKDF2_OCTETS_CLE = 32;

export function courrielValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

function versHex(octets: Uint8Array): string {
  return [...octets].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function depuisHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function egalTempsConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function genererSel(texte: string): Uint8Array {
  try {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint8Array(16));
    }
  } catch {
    /* Repli sans CSPRNG dans un environnement de test isolé */
  }
  // Repli déterministe minimal uniquement si WebCrypto/CSPRNG est totalement absent.
  return sha256(new TextEncoder().encode(`kunz-sel::${texte}`)).slice(0, 16);
}

async function deriverPbkdf2(texte: string, sel: Uint8Array, iterations: number): Promise<string> {
  const octets = new TextEncoder().encode(`kunz::${texte}`);
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle && typeof subtle.importKey === 'function' && typeof subtle.deriveBits === 'function') {
      const cle = await subtle.importKey('raw', octets, 'PBKDF2', false, ['deriveBits']);
      const bits = await subtle.deriveBits(
        { name: 'PBKDF2', salt: sel as BufferSource, iterations, hash: 'SHA-256' },
        cle,
        PBKDF2_OCTETS_CLE * 8,
      );
      return versHex(new Uint8Array(bits));
    }
  } catch {
    /* Repli @noble/hashes compatible lorsque WebCrypto manque ou échoue. */
  }
  return versHex(pbkdf2(sha256, octets, sel, { c: iterations, dkLen: PBKDF2_OCTETS_CLE }));
}

async function sha256Historique(texte: string): Promise<string> {
  const octets = new TextEncoder().encode(`kunz::${texte}`);
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const resultat = await subtle.digest('SHA-256', octets);
      return versHex(new Uint8Array(resultat));
    }
  } catch {
    /* Repli SHA-256 compatible lorsque WebCrypto manque ou échoue. */
  }
  return versHex(sha256(octets));
}

/** Dérivation salée PBKDF2-SHA256 (compatible avec ou sans WebCrypto).
 *  Note de transparence : le compte local ne chiffre pas les données du navigateur. */
export async function hacher(texte: string): Promise<string> {
  const sel = genererSel(texte);
  const cle = await deriverPbkdf2(texte, sel, PBKDF2_ITERATIONS);
  return `${PBKDF2_PREFIXE}$${PBKDF2_ITERATIONS}$${versHex(sel)}$${cle}`;
}

/** Indique si un hachage stocké utilise un format historique à migrer après vérification. */
export function doitMigrerHachage(hash?: string): boolean {
  if (!hash) return false;
  return !hash.startsWith(`${PBKDF2_PREFIXE}$`);
}

/** Uniquement pour authentifier les comptes créés par l'ancien repli non-SHA avant migration. */
function ancienHachage(s: string): string {
  let a = 0x811c9dc5;
  let b = 0x1b873593;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x85ebca6b) >>> 0;
    b = ((b << 13) | (b >>> 19)) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

export async function verifierMdp(motDePasse: string, hashAttendu: string): Promise<boolean> {
  if (typeof hashAttendu !== 'string') return false;
  // Format courant : pbkdf2$<iterations>$<selHex32>$<cleHex64>
  if (hashAttendu.startsWith(`${PBKDF2_PREFIXE}$`)) {
    const parties = hashAttendu.split('$');
    if (parties.length !== 4) return false;
    const iterations = Number(parties[1]);
    if (!Number.isSafeInteger(iterations) || iterations < 10_000 || iterations > 1_000_000) return false;
    if (!/^[0-9a-f]{32}$/.test(parties[2]) || !/^[0-9a-f]{64}$/.test(parties[3])) return false;
    const sel = depuisHex(parties[2]);
    if (!sel) return false;
    const derivee = await deriverPbkdf2(motDePasse, sel, iterations);
    return egalTempsConstant(derivee, parties[3]);
  }
  // Rétrocompatibilité stricte des comptes existants (migrés vers PBKDF2 à la connexion).
  if (/^[0-9a-f]{16}$/.test(hashAttendu)) return egalTempsConstant(ancienHachage(`kunz::${motDePasse}`), hashAttendu);
  if (/^[0-9a-f]{64}$/.test(hashAttendu)) return egalTempsConstant(await sha256Historique(motDePasse), hashAttendu);
  return false;
}

/** Jeton d'écriture aléatoire — stocké dans le compte, envoyé en en-tête `x-kunz-jeton`.
 *  La policy UPDATE de Supabase l'exige : seul le client qui le connaît peut modifier
 *  la ligne de l'élève. */
export function nouveauJeton(): string | undefined {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (!globalThis.crypto?.getRandomValues) return undefined;
    const octets = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return versHex(octets);
  } catch {
    return undefined; // pas d'aléa fiable : le compte reste local, sans synchronisation
  }
}

/** فتح جلسة بعد نجاح الدخول (تبقى مفتوحة ما دام التبويب مفتوحًا). */
export function ouvrirSession(email: string): void {
  try {
    sessionStorage.setItem(CLE_SESSION, normaliserEmail(email));
  } catch {
    /* تجاهل */
  }
}

export function sessionOuverte(email?: string): boolean {
  if (!email) return false;
  try {
    const courant = sessionStorage.getItem(CLE_SESSION);
    return courant === email || courant === normaliserEmail(email);
  } catch {
    return false;
  }
}

export function fermerSession(): void {
  try {
    sessionStorage.removeItem(CLE_SESSION);
  } catch {
    /* تجاهل */
  }
}

/** رسائل الخطأ بلطف — لا عصبية، لا رفض حاد. */
export function messageCompte(
  champ: 'email' | 'mdp' | 'mdp2' | 'wilaya' | 'daira',
  details?: { mdp?: boolean }
): string {
  switch (champ) {
    case 'email':
      return 'اكتب بريدًا إلكترونيًا صحيحًا، مثل: eleve@gmail.com';
    case 'mdp':
      return details?.mdp
        ? 'كلمة المرور خاطئة — أعِد المحاولة.'
        : 'كلمة المرور لا تقلّ عن 6 أحرف.';
    case 'mdp2':
      return 'كلمتا المرور غير متطابقتين.';
    case 'wilaya':
      return 'اختر ولايتك من القائمة.';
    case 'daira':
      return 'اختر دائرتك من القائمة.';
  }
}
