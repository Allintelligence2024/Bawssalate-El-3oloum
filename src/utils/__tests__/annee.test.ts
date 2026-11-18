// Calendrier scolaire externalisé (P2.3 / reco audit n° 4) : plus de constante nationale dans le code métier
import { describe, it, expect } from 'vitest';
import { CALENDRIERS, calendrierPour } from '../../config/annee';
import { debutAnnee } from '../../data/programme';
import { etatVierge } from '../../types';

describe('config/annee — calendrier scolaire', () => {
  it('2026–2027 est confirmé : rentrée 2026-09-14, Bac 2027-06-10', () => {
    const c = calendrierPour('2026-11-16');
    expect(c).toEqual(CALENDRIERS[0]);
    expect(c.estime).toBe(false);
    expect(debutAnnee('2026-11-16')).toBe('2026-09-14');
  });

  it('reste sur 2026–2027 pendant la marge post-Bac (résultats, rattrapage)', () => {
    expect(calendrierPour('2027-07-01').libelle).toBe('2026–2027');
  });

  it('au-delà, dérive un calendrier estimé (2e lundi de septembre, 10 juin) et le marque estime', () => {
    const c = calendrierPour('2027-09-20');
    expect(c.estime).toBe(true);
    expect(c.debut).toBe('2027-09-13'); // 1er sept. 2027 = mercredi → 1er lundi = 6 → 2e lundi = 13
    expect(c.bac).toBe('2028-06-10');
    // janvier 2028 appartient encore à 2027–2028
    expect(calendrierPour('2028-01-15').bac).toBe('2028-06-10');
  });

  it("etatVierge() prend la date du Bac du calendrier courant, pas une constante", () => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(etatVierge().dateBac).toBe(calendrierPour(iso).bac);
  });
});
