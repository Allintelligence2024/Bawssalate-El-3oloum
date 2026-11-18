// Signal commun aux différents magasins locaux : l'échec n'est jamais silencieux.
const ecouteurs = new Set<() => void>();
let echecNonSignale = false;

export function signalerEchecStockage(): void {
  echecNonSignale = true;
  for (const ecouteur of ecouteurs) ecouteur();
}

export function surEchecSauvegarde(ecouteur: () => void): () => void {
  ecouteurs.add(ecouteur);
  if (echecNonSignale) ecouteur();
  return () => { ecouteurs.delete(ecouteur); };
}

export function effacerAlerteStockage(): void { echecNonSignale = false; }
