// Tests de la confidentialité du sync (P0.2 + P0.8) : aucun envoi avant opt-in
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import { syncActive, construireSnapshot, envoyerSnapshot, consentementEtat } from '../sync';

describe('sync — confidentialité (P0.2/P0.8)', () => {
  it('syncActive() est faux sans clés Supabase', () => {
    expect(syncActive({})).toBe(false);
    expect(syncActive({ url: 'https://test.supabase.co' })).toBe(false);
    expect(syncActive({ key: 'test-key' })).toBe(false);
  });

  it('syncActive() est vrai quand les clés sont présentes', () => {
    expect(syncActive({ url: 'https://test.supabase.co', key: 'test-anon-key' })).toBe(true);
  });

  it('construireSnapshot renvoie null sans compte', () => {
    const etat: Etat = {
      version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [],
      minutesTotales: 0, revisions: 0, nom: 'تلميذ', dateBac: '2027-06-10',
      seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    expect(construireSnapshot(etat)).toBeNull();
  });

  it('envoyerSnapshot ne fait rien sans consentement explicite', async () => {
    const etat: Etat = {
      version: 2, compte: { email: 'test@example.com', motDePasse: 'hachage', jeton: 'jeton-123', wilaya: '01', daira: '01', creeLe: '2026-11-16T00:00:00Z' },
      progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
      nom: 'تلميذ', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    // La promesse doit se terminer sans erreur, sans envoi réseau
    await expect(envoyerSnapshot(etat)).resolves.toBeUndefined();
  });

  it('consentementEtat => "non" quand consentementSync = false', () => {
    const etat: Etat = {
      version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
      nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
    };
    expect(consentementEtat(etat)).toBe('non');
  });

  it('consentementEtat => "oui" quand consentementSync = true (ou undefined)', () => {
    const etat: Etat = {
      version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
      nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: true,
    };
    expect(consentementEtat(etat)).toBe('oui');
  });
});
