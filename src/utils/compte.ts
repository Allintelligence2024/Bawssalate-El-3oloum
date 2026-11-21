// الحساب المحلي — بريد إلكتروني وكلمة مرور وولاية ودائرة، داخل المتصفح فقط.
// لا خادم، لا إرسال، لا تتبّع: كل شيء في localStorage تحت مفتاح التطبيق نفسه.

import { sha256 } from '@noble/hashes/sha256';

const CLE_SESSION = 'kunz_session_v1';

export const MIN_MDP = 6;

export function courrielValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** SHA-256 reste identique avec ou sans WebCrypto. Le préfixe historique est
 *  fixe : ce compte local ne chiffre pas les données et n'est pas une protection
 *  contre une personne ayant accès au stockage du navigateur. */
export async function hacher(texte: string): Promise<string> {
  const octets = new TextEncoder().encode(`kunz::${texte}`);
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const resultat = await subtle.digest('SHA-256', octets);
      return [...new Uint8Array(resultat)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    /* Repli SHA-256 compatible lorsque WebCrypto manque ou échoue. */
  }
  return [...sha256(octets)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Uniquement pour authentifier les comptes créés par l'ancien repli non-SHA. */
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
  // Les anciens repli et SHA-256 n'ont pas la même longueur. Ne jamais accepter
  // arbitrairement un format inconnu et ne plus créer de nouveaux comptes faibles.
  if (/^[0-9a-f]{16}$/.test(hashAttendu)) return ancienHachage(`kunz::${motDePasse}`) === hashAttendu;
  if (/^[0-9a-f]{64}$/.test(hashAttendu)) return (await hacher(motDePasse)) === hashAttendu;
  return false;
}

/** Jeton d'écriture aléatoire — stores in the compte, sent as `x-kunz-jeton` header.
 *  La policy UPDATE de Supabase l'exige : seul le client qui le connaît peut modifier
 *  la ligne de l'élève (n'importe qui d'autre avec l'URL publique ne peut qu'insérer). */
export function nouveauJeton(): string | undefined {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (!globalThis.crypto?.getRandomValues) return undefined;
    const octets = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return [...octets].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return undefined; // pas d'aléa fiable : le compte reste local, sans synchronisation
  }
}

/** فتح جلسة بعد نجاح الدخول (تبقى مفتوحة ما دام التبويب مفتوحًا). */
export function ouvrirSession(email: string): void {
  try {
    sessionStorage.setItem(CLE_SESSION, email);
  } catch {
    /* تجاهل */
  }
}

export function sessionOuverte(email?: string): boolean {
  if (!email) return false;
  try {
    return sessionStorage.getItem(CLE_SESSION) === email;
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
