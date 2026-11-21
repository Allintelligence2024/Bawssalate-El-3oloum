// Tests de la confidentialité du sync (P0.2 + P0.8) : aucun envoi avant opt-in
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Etat } from '../../types';
import {
  syncActive, construireSnapshot, envoyerSnapshot, consentementEtat,
  consentementExplicite, doitDemanderConsentement, DONNEES_ENVOYEES, supprimerSnapshotServeur, reprendreSync, jetonUtilisable,
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

  it('supprimerSnapshotServeur : sans configuration → « sync_inactive » ; aucun appel réseau, aucune exception', async () => {
    // Dans l'environnement de test, aucune clé Supabase n'est injectée : la suppression doit répondre
    // explicitement (pas de promesse silencieuse) et sans toucher au réseau.
    await expect(supprimerSnapshotServeur({ ...base(), compte })).resolves.toBe('sync_inactive');
    await expect(supprimerSnapshotServeur(base())).resolves.toBe('sync_inactive');
  });
});

// ───────────── Preuve réseau du consentement (P-1.6 — D7) ─────────────
// Client Supabase simulé : la garantie « 0 requête sans consentement explicite »
// est prouvée en comptant les appels, pas seulement en lisant le code.

const sbMocks = vi.hoisted(() => ({
  upsert: vi.fn(async (payload: Record<string, unknown>, options?: Record<string, unknown>) => ({ error: null })),
  createClient: vi.fn(),
  select: vi.fn(async () => ({ data: [{ email: 'test@example.com' }], error: null })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: sbMocks.createClient,
}));

describe('sync — preuve réseau (P-1.6 : client simulé, appel par appel)', () => {
  const etatAvec = (maj: Partial<Etat>): Etat => ({ ...base(), ...maj });

  beforeEach(() => {
    // horloge figée : sinon le champ « maj » (ISO à chaque appel) rend chaque
    // JSON différent et la déduplication dernierEnvoye ne peut jamais s'appliquer
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T10:00:00Z'));
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    // l'environnement de test déclare navigator.onLine = false → sinon aucun envoi ne part
    vi.stubGlobal('navigator', { onLine: true });
    reprendreSync(compte.email);
    sbMocks.select.mockReset();
    sbMocks.select.mockResolvedValue({ data: [{ email: compte.email }], error: null });
    sbMocks.upsert.mockReset();
    sbMocks.upsert.mockResolvedValue({ error: null });
    sbMocks.createClient.mockClear();
    sbMocks.createClient.mockImplementation(() => ({
      from: () => ({
        upsert: sbMocks.upsert,
        delete: () => ({ eq: () => ({ select: sbMocks.select }) }),
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('(a) consentementSync: false → 0 requête réseau', async () => {
    await envoyerSnapshot(etatAvec({ compte, consentementSync: false, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 1 }));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('(b) consentementSync: undefined (ancien état migré) → 0 requête', async () => {
    await envoyerSnapshot(etatAvec({ compte, minutesTotales: 2 }));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('(c) true sans consentementSyncDecideLe (installation v0.9.3) → 0 requête', async () => {
    await envoyerSnapshot(etatAvec({ compte, consentementSync: true, minutesTotales: 3 }));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('(d) true + date → exactement 1 upsert avec x-kunz-jeton, jamais le mot de passe', async () => {
    const etat = etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 4 });
    await envoyerSnapshot(etat);
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    const [payload, options] = sbMocks.upsert.mock.calls[0];
    expect(payload.email).toBe('test@example.com');
    expect(payload.jeton).toBe('jeton-123');
    expect((options as any).onConflict).toBe('email');
    expect(JSON.stringify(payload)).not.toContain('motDePasse');
    expect(JSON.stringify(payload)).not.toContain('hachage');
    // Le client est créé une seule fois, avec les clés d'environnement et l'en-tête policy
    expect(sbMocks.createClient).toHaveBeenCalledTimes(1);
    const [url, , optionsClient] = sbMocks.createClient.mock.calls[0];
    expect(url).toContain('test.supabase.co');
    expect((optionsClient as any).global.headers['x-kunz-jeton']).toBe('jeton-123');
  });

  it('(e) état identique ré-envoyé → 0 nouvelle requête ; état modifié → exactement 1 nouvelle', async () => {
    const etat = etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 5 });
    await envoyerSnapshot(etat);
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    await envoyerSnapshot(etat); // rien n'a changé
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    await envoyerSnapshot({ ...etat, minutesTotales: 6 }); // progression a bougé
    expect(sbMocks.upsert).toHaveBeenCalledTimes(2);
  });

  it('(f) révocation (true → false) → plus aucun envoi ensuite', async () => {
    const etat = etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 7 });
    await envoyerSnapshot(etat);
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    await envoyerSnapshot({ ...etat, consentementSync: false, minutesTotales: 8 });
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1); // 0 requête de plus
  });

  it('(g) supprimerSnapshotServeur avec compte + jeton → DELETE « supprime »', async () => {
    await expect(supprimerSnapshotServeur(etatAvec({ compte }))).resolves.toBe('supprime');
    // Après suppression, seul un nouveau consentement permet l'envoi.
    await envoyerSnapshot(etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 9 }));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
    reprendreSync(compte.email);
    await envoyerSnapshot(etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: 9 }));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
  });
  it('zéro ligne est indéterminé, et une erreur ne confirme jamais la suppression', async () => {
    sbMocks.select.mockResolvedValueOnce({ data: [], error: null });
    await expect(supprimerSnapshotServeur(etatAvec({ compte }))).resolves.toBe('indetermine');
    sbMocks.select.mockRejectedValueOnce(new Error('réseau'));
    await expect(supprimerSnapshotServeur(etatAvec({ compte }))).resolves.toBe('erreur');
    await envoyerSnapshot(etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: 'date', minutesTotales: 100 }));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('attend un envoi déjà parti et bloque tout nouvel envoi avant DELETE', async () => {
    let terminer!: (result: { error: null }) => void;
    let demarre!: () => void;
    const parti = new Promise<void>(resolve => { demarre = resolve; });
    sbMocks.upsert.mockImplementationOnce(() => { demarre(); return new Promise(resolve => { terminer = resolve; }); });
    const etat = etatAvec({ compte, consentementSync: true, consentementSyncDecideLe: 'date', minutesTotales: 101 });
    const envoi = envoyerSnapshot(etat);
    await parti;
    const suppression = supprimerSnapshotServeur(etat);
    await envoyerSnapshot({ ...etat, minutesTotales: 102 });
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    expect(sbMocks.select).not.toHaveBeenCalled();
    terminer({ error: null });
    await envoi;
    await expect(suppression).resolves.toBe('supprime');
    expect(sbMocks.select).toHaveBeenCalledTimes(1);
    await envoyerSnapshot({ ...etat, minutesTotales: 103 });
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
  });

  it('aucun envoi avec un jeton faible, nul ou absent', async () => {
    for (const jeton of [undefined, '00000000000000000000000000000000', 'j-ancien-aleatoire']) {
      expect(jetonUtilisable(jeton)).toBe(false);
      await envoyerSnapshot(etatAvec({ compte: { ...compte, jeton }, consentementSync: true, consentementSyncDecideLe: 'date' }));
    }
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('construireSnapshot n’inclut jamais aucun texte libre (notes, carnet, mot de passe) et aligne VERSION_APP', () => {
    const snap = construireSnapshot({
      ...base(),
      compte,
      notes: [{ id: 'n1', uniteId: 'u1', lessonId: 'l1', texte: 'SECRET_NOTE_ELEVE', kind: 'note', ts: '2026-11-21' }],
      carnet: [{ id: 'c1', ts: '2026-11-21', contexte: 'u1', enonce: 'Q', donne: 'SECRET_BROUILLON_LIBRE', diagnostic: 'D' }],
      consentementSync: true,
      consentementSyncDecideLe: '2026-11-21T00:00:00Z',
    });
    expect(snap).not.toBeNull();
    const serialise = JSON.stringify(snap);
    expect(serialise).not.toContain('SECRET_NOTE_ELEVE');
    expect(serialise).not.toContain('SECRET_BROUILLON_LIBRE');
    expect(serialise).not.toContain('hachage');
    expect(snap!.notes_nombre).toBe(1);
    expect(snap!.app_version).toBe('0.9.3');
  });

});
