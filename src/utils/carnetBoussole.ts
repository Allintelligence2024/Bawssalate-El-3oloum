// Contrat commun avec le laboratoire autonome. Le carnet est local à l'origine,
// pas à un compte ; la sauvegarde en conserve le texte sans le synchroniser.
import { ENTRY_KEY, RESTORE_KEY, restorationPending, parseBook, type EntryBook } from '../../modules/boussole/src/entry';

export const CLE_CARNET_BOUSSOLE = ENTRY_KEY;
export const CLE_RESTAURATION = RESTORE_KEY;
export { parseBook as validerCarnetBoussole, restorationPending as restaurationEnAttente };
export type CarnetBoussole = EntryBook;

/** Empêche de présenter une sauvegarde partielle comme une sauvegarde complète. */
export class CarnetBoussoleIllisible extends Error {}

export function lireCarnetBoussole(): CarnetBoussole | null {
  try {
    const brut = localStorage.getItem(CLE_CARNET_BOUSSOLE);
    if (brut === null) return null;
    const carnet = parseBook(JSON.parse(brut));
    if (!carnet) throw new Error('format de carnet inconnu');
    return carnet;
  } catch {
    throw new CarnetBoussoleIllisible('Le carnet du laboratoire ne peut pas être lu.');
  }
}
