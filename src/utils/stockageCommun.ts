// Après un import avec statistiques, une seule écriture publie les deux données.
export const CLE_ETAT = 'murajih_svt_v1';
export const CLE_STATS_HISTORIQUE = 'kunz_stats_v1';
export const CHAMP_STATS = '__statsRestaureesV1';

export function lireEtatBrut(): Record<string, unknown> | null {
  const brut = localStorage.getItem(CLE_ETAT);
  return brut === null ? null : JSON.parse(brut);
}

export function lireStatsBrutes(): unknown {
  let etat: Record<string, unknown> | null;
  try { etat = lireEtatBrut(); } catch (e) {
    // Un ancien état JSON illisible ne rend pas les anciennes stats illisibles.
    if (!(e instanceof SyntaxError)) throw e;
    etat = null;
  }
  if (etat && Object.hasOwn(etat, CHAMP_STATS)) return etat[CHAMP_STATS];
  return JSON.parse(localStorage.getItem(CLE_STATS_HISTORIQUE) ?? 'null');
}

export function ecrireStatsBrutes(stats: unknown): void {
  let etat: Record<string, unknown> | null;
  try { etat = lireEtatBrut(); } catch (e) {
    if (!(e instanceof SyntaxError)) throw e;
    etat = null;
  }
  if (etat && Object.hasOwn(etat, CHAMP_STATS)) {
    localStorage.setItem(CLE_ETAT, JSON.stringify({ ...etat, [CHAMP_STATS]: stats }));
  } else {
    localStorage.setItem(CLE_STATS_HISTORIQUE, JSON.stringify(stats));
  }
}
