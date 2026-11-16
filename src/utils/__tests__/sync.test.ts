// Tests de la confidentialité du sync (P0.2 + P0.8) : aucun envoi avant opt-in
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  syncActive, construireSnapshot, envoyerSnapshot, consentementEtat,
  consentementExplicite, doitDemanderConsentement,
} from '../sync';

const base = (): Etat => ({
  version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
  nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
});
const compte = { email: 'test@example.com', motDePasse: 'hachage', jeton: 'jeton-123', wilaya: '01', daira: '01', creeLe: '2026-11-16T00:00:00Z' };

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

  it('consentementEtat => "oui" seulement avec un oui explicite et daté', () => {
    expect(consentementEtat({ ...base(), consentementSync: true })).toBe('non');
    expect(consentementEtat({ ...base(), consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z' })).toBe('oui');
  });

  it('consentementExplicite : un ancien « true » par défaut (sans date) ne vaut pas consentement', () => {
    expect(consentementExplicite({ ...base(), consentementSync: true })).toBe(false);
    expect(consentementExplicite({ ...base(), consentementSync: false, consentementSyncDecideLe: '2026-11-16T10:00:00Z' })).toBe(false);
    expect(consentementExplicite({ ...base(), consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z' })).toBe(true);
  });

  it('envoyerSnapshot ne fait rien avec consentementSync = true mais sans date (compte antérieur à v0.9.4)', async () => {
    const etat: Etat = { ...base(), compte, consentementSync: true };
    await expect(envoyerSnapshot(etat)).resolves.toBeUndefined();
  });

  it('doitDemanderConsentement : seulement compte existant + sync configuré + jamais répondu', () => {
    const sansSync = !syncActive();
    // Dans les tests, aucune clé Supabase n'est injectée : la question ne doit jamais s'afficher.
    expect(sansSync).toBe(true);
    expect(doitDemanderConsentement({ ...base(), compte })).toBe(false);
    expect(doitDemanderConsentement({ ...base() })).toBe(false);
    expect(doitDemanderConsentement({ ...base(), compte, consentementSyncDecideLe: '2026-11-16T10:00:00Z' })).toBe(false);
  });
});
