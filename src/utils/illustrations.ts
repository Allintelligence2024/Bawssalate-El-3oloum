// Phase 2 — résolution centralisée des illustrations de leçons.
//
// Les visuels (WebP annotés et SVG vectoriels) vivent localement dans `public/lecons/img/`.
// Le jour où ils sont servis depuis Cloudflare R2, il suffit de renseigner
// `VITE_ILLUSTRATIONS_BASE_URL` : aucun composant ne connaît alors le chemin physique
// des fichiers.

// Deux formats seulement, jamais de chemin : les WebP muets du manuel et les SVG
// vectoriels exacts (courbes, graphiques, schémas géométriques). Aucun JPEG/PNG brut.
const NOM_FICHIER = /^[a-zA-Z0-9._-]+\.(webp|svg)$/;
const BALISES_LEGENDE = new Set(['span', 'strong', 'em', 'br']);

/**
 * URL d'une illustration. `fichier` est un simple nom `.webp` ou `.svg`, jamais un chemin.
 *
 * - Sans variable d'environnement : `${BASE_URL}lecons/img/<fichier>` (Vite gère le
 *   sous-chemin de déploiement via `BASE_URL`).
 * - Avec `VITE_ILLUSTRATIONS_BASE_URL` : base R2 (avec ou sans `/` final) + `<fichier>`.
 *   L'origine externe n'est pas interceptée par le Service Worker : le cache HTTP du
 *   navigateur prend le relais, ce qui est le comportement attendu pour un CDN.
 */
export function urlIllustration(fichier: string): string {
  if (!NOM_FICHIER.test(fichier)) {
    throw new Error(`Nom d'illustration invalide (attendu : <nom>.webp ou <nom>.svg) : ${fichier}`);
  }
  const distant = import.meta.env.VITE_ILLUSTRATIONS_BASE_URL?.trim();
  if (distant) {
    const base = distant.endsWith('/') ? distant : `${distant}/`;
    return `${base}${fichier}`;
  }
  const local = (import.meta.env.BASE_URL ?? '/').endsWith('/')
    ? (import.meta.env.BASE_URL ?? '/')
    : `${import.meta.env.BASE_URL ?? '/'}/`;
  return `${local}lecons/img/${fichier}`;
}

/**
 * `legendeAr` est du HTML éditorial généré par `scripts/importer-images-lecons.mjs`.
 * On ne garde qu'une poignée de balises de mise en forme, sans aucun attribut :
 * jamais de `onclick`, de `src`, de `style` ni de balise exécutable.
 */
export function legendeArSecurisee(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (_tout, fermeture: string, nom: string) => {
    const balise = nom.toLowerCase();
    if (!BALISES_LEGENDE.has(balise)) return '';
    return `<${fermeture}${balise}>`;
  });
}
