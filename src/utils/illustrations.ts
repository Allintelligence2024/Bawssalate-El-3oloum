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

export type NoeudLegende =
  | { type: 'texte'; texte: string }
  | { type: 'br' }
  | { type: 'span' | 'strong' | 'em'; enfants: NoeudLegende[] };

/**
 * URL d'une illustration. `fichier` est un simple nom `.webp` ou `.svg`, jamais un chemin.
 *
 * - Sans variable d'environnement : `${BASE_URL}lecons/img/<fichier>` (Vite gère le
 *   sous-chemin de déploiement via `BASE_URL`).
 * - Avec `VITE_ILLUSTRATIONS_BASE_URL` : base R2 strictement `https:` + `<fichier>`.
 */
export function urlIllustration(fichier: string): string {
  if (!NOM_FICHIER.test(fichier)) {
    throw new Error(`Nom d'illustration invalide (attendu : <nom>.webp ou <nom>.svg) : ${fichier}`);
  }
  const local = (import.meta.env.BASE_URL ?? '/').endsWith('/')
    ? (import.meta.env.BASE_URL ?? '/')
    : `${import.meta.env.BASE_URL ?? '/'}/`;
  const distant = import.meta.env.VITE_ILLUSTRATIONS_BASE_URL?.trim();
  if (distant) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(distant);
    } catch {
      // Valeur non-URL (ex. jeton/placeholder injecté par l'environnement) : repli sûr vers les actifs locaux.
      return `${local}lecons/img/${fichier}`;
    }
    if (parsed.protocol !== 'https:') {
      throw new Error('VITE_ILLUSTRATIONS_BASE_URL doit utiliser le protocole https:');
    }
    const base = distant.endsWith('/') ? distant : `${distant}/`;
    return `${base}${fichier}`;
  }
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

/**
 * Analyse une légende en arbre de nœuds sûr pour un rendu React déclaratif (sans injection HTML brute).
 * Toute balise non autorisée (script, img, svg, etc.) est ignorée et tous les attributs sont écartés.
 */
export function analyserLegendeAr(html: string | undefined): NoeudLegende[] {
  if (!html) return [];
  const racine: NoeudLegende[] = [];
  const pile: { balise: 'span' | 'strong' | 'em'; enfants: NoeudLegende[] }[] = [];
  const courant = () => (pile.length > 0 ? pile[pile.length - 1].enfants : racine);

  const regex = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
  let dernierIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > dernierIndex) {
      courant().push({ type: 'texte', texte: html.slice(dernierIndex, match.index) });
    }
    dernierIndex = regex.lastIndex;
    const estFermeture = match[1] === '/';
    const balise = match[2].toLowerCase();

    if (!BALISES_LEGENDE.has(balise)) continue;
    if (balise === 'br') {
      if (!estFermeture) courant().push({ type: 'br' });
      continue;
    }
    const baliseConteneur = balise as 'span' | 'strong' | 'em';
    if (!estFermeture) {
      const noeud = { type: baliseConteneur, enfants: [] as NoeudLegende[] };
      courant().push(noeud);
      pile.push({ balise: baliseConteneur, enfants: noeud.enfants });
    } else {
      for (let i = pile.length - 1; i >= 0; i--) {
        if (pile[i].balise === baliseConteneur) {
          pile.splice(i);
          break;
        }
      }
    }
  }

  if (dernierIndex < html.length) {
    courant().push({ type: 'texte', texte: html.slice(dernierIndex) });
  }
  return racine;
}
