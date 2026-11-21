// Détection optimiste : comparer les valeurs lues/écrites par cet onglet avant
// les opérations sensibles, sans attendre l'événement « storage » asynchrone.
// Ce n'est PAS un verrou ni une transaction : une autre écriture peut survenir
// entre getItem et setItem, ou une ancienne version peut ignorer ces contrôles.
const references = new Map<string, string | null>();
const ecouteurs = new Set<() => void>();
let perime = false;

export function memoriserValeur(cle: string, valeur: string | null): void {
  references.set(cle, valeur);
}

export function marquerEtatPerime(): void {
  if (perime) return;
  perime = true;
  for (const ecouteur of ecouteurs) ecouteur();
}

export function surEtatPerime(ecouteur: () => void): () => void {
  ecouteurs.add(ecouteur);
  if (perime) ecouteur();
  return () => { ecouteurs.delete(ecouteur); };
}

/** Réservé au chargement d'un état vérifié ou à une réinitialisation réussie. */
export function reinitialiserEtatPerime(): void { perime = false; }

/** Peut lever une erreur si le stockage ne peut être relu : l'appelant doit alors refuser l'opération. */
export function verifierCoherence(): boolean {
  if (perime) return false;
  for (const [cle, attendue] of references) {
    if (localStorage.getItem(cle) !== attendue) {
      marquerEtatPerime();
      return false;
    }
  }
  return true;
}
