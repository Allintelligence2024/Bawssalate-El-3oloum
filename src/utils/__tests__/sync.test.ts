// Tests de la confidentialité du sync (P0.2 + P0.8) : aucun envoi avant opt-in
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  syncActive, construireSnapshot, envoyerSnapshot, consentementEtat,
  consentementExplicite, doitDemanderConsentement, DONNEES_ENVOYEES,
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

  it('inventaire P0.8 : chaque champ réellement envoyé est couvert par la liste affichée à l\'élève', () => {
    const snap = construireSnapshot({ ...base(), compte, nom: 'تلميذ' });
    expect(snap).not.toBeNull();
    // Champs du snapshot → rubrique de DONNEES_ENVOYEES qui les décrit. Ajouter un champ ici ET dans la liste.
    const couverture: Record<string, string> = {
      email: 'بريدك الإلكتروني', jeton: 'رمز كتابة خاص بحسابك',
      wilaya: 'اسمك المعروض والولاية والدائرة', daira: 'اسمك المعروض والولاية والدائرة', nom: 'اسمك المعروض والولاية والدائرة',
      cree_le: 'اسمك المعروض والولاية والدائرة', date_bac: 'تاريخ البكالوريا الذي اخترته',
      xp: 'نقاط الخبرة والمستوى وإصدار التطبيق', niveau: 'نقاط الخبرة والمستوى وإصدار التطبيق',
      app_version: 'نقاط الخبرة والمستوى وإصدار التطبيق', maj: 'نقاط الخبرة والمستوى وإصدار التطبيق',
      lecons_terminees: 'معرّفات الدروس والجسور والورشات', lecons_en_cours: 'معرّفات الدروس والجسور والورشات',
      lecons_fragiles: 'معرّفات الدروس والجسور والورشات', jalons_faits: 'معرّفات الدروس والجسور والورشات',
      ateliers_faits: 'معرّفات الدروس والجسور والورشات',
      drills_faits: 'أرقام تقدّمك', minutes_totales: 'أرقام تقدّمك', revisions: 'أرقام تقدّمك',
      seances_comptees: 'أرقام تقدّمك', jours_activite: 'أرقام تقدّمك', reponses_justes: 'أرقام تقدّمك',
      reponses_fausses: 'أرقام تقدّمك', notes_nombre: 'أرقام تقدّمك',
    };
    const libelles = new Set(DONNEES_ENVOYEES.map((d) => d.libelle));
    for (const champ of Object.keys(snap!)) {
      expect(couverture[champ], `champ non documenté : ${champ}`).toBeDefined();
      expect(libelles.has(couverture[champ]), `rubrique absente : ${couverture[champ]}`).toBe(true);
    }
    // Et rien de sensible : jamais de mot de passe ni de texte de note
    expect(Object.keys(snap!)).not.toContain('motDePasse');
    expect(JSON.stringify(snap)).not.toContain('hachage');
  });
});
