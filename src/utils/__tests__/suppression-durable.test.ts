// P0.2 — suppression durable : deux onglets, réseau coupé, réponse perdue, jeton refusé,
// réactivation. « Onglet B » = instance fraîche du module (vi.resetModules) partageant le
// même serveur simulé : la course inter-onglets est DÉMONTRÉE par un test, pas affirmée.
// Les résultats réels RLS (bon/mal/aucun jeton) viennent de la matrice P0.1 exécutée sur
// le projet connecté avec des données fictives — cf. plans/AUDIT-RLS-P0.1-2026-11-18.md.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Etat } from '../../types';
import { envoyerSnapshot, supprimerSnapshotServeur, reprendreSync, suspendreSync, etatEnvoi } from '../sync';

const sbMocks = vi.hoisted(() => ({
  /** Payloads successifs (le client réel les reçoit avant `.abortSignal()`). */
  payloads: [] as unknown[],
  upsert: vi.fn(async (_signal?: AbortSignal): Promise<{ error: null | { message: string } }> => ({ error: null })),
  createClient: vi.fn(),
  select: vi.fn(async (): Promise<{ data: unknown[]; error: null }> => ({ data: [{ email: 'test@example.com' }], error: null })),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: sbMocks.createClient }));

const base = (): Etat => ({
  version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
  nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false,
});
const compte = { email: 'test@example.com', motDePasse: 'hachage', jeton: 'jeton-123', wilaya: '01', daira: '01', creeLe: '2026-11-16T00:00:00Z' };
/** État avec consentement daté ; `minutes` unique par envoi (horloge figée → dédup `dernierEnvoye`). */
const etatSync = (minutes: number): Etat => ({
  ...base(), compte, consentementSync: true, consentementSyncDecideLe: '2026-11-16T10:00:00Z', minutesTotales: minutes,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-16T10:00:00Z'));
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  vi.stubGlobal('navigator', { onLine: true });
  reprendreSync(compte.email);
  sbMocks.select.mockReset();
  sbMocks.select.mockResolvedValue({ data: [{ email: compte.email }], error: null });
  sbMocks.upsert.mockReset();
  sbMocks.upsert.mockResolvedValue({ error: null });
  sbMocks.createClient.mockClear();
  sbMocks.createClient.mockImplementation(() => ({
    from: () => ({
      // `.abortSignal()` fait partie du client PostgREST réel (timeout borné, BUG-007).
      upsert: (payload: unknown) => {
        sbMocks.payloads.push(payload);
        return { abortSignal: (signal: AbortSignal) => sbMocks.upsert(signal) };
      },
      delete: () => ({ eq: () => ({ select: sbMocks.select }) }),
    }),
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('état visible de synchronisation', () => {
  it('ne confirme qu’un envoi accepté et permet un nouvel essai identique après un refus', async () => {
    sbMocks.upsert.mockResolvedValueOnce({ error: { message: 'refus fictif' } });
    expect(etatEnvoi(compte.email)).toBe('en_attente');
    await envoyerSnapshot(etatSync(20));
    expect(etatEnvoi(compte.email)).toBe('erreur');
    await envoyerSnapshot(etatSync(20));
    expect(etatEnvoi(compte.email)).toBe('confirme');
    vi.setSystemTime(new Date('2026-11-16T10:12:00Z'));
    await envoyerSnapshot(etatSync(20));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(2);
    expect(sbMocks.payloads.at(-1)).toMatchObject({ jeton: compte.jeton });
    expect(sbMocks.payloads.at(-1)).not.toHaveProperty('charge_utile.jeton');
  });

  it('coalesce les mises à jour pendant un envoi et abandonne celles suspendues', async () => {
    for (const suspendre of [false, true]) {
      reprendreSync(compte.email);
      sbMocks.upsert.mockClear();
      sbMocks.payloads.length = 0;
      let terminer!: (r: { error: null }) => void;
      sbMocks.upsert.mockImplementationOnce(() => new Promise(r => { terminer = r; }));
      const premier = envoyerSnapshot(etatSync(10));
      await vi.advanceTimersByTimeAsync(0);
      await envoyerSnapshot(etatSync(20));
      await envoyerSnapshot(etatSync(30));
      if (suspendre) suspendreSync(compte.email);
      terminer({ error: null });
      await premier;
      expect(sbMocks.payloads.map((p) => (p as { minutes_totales: number }).minutes_totales))
        .toEqual(suspendre ? [10] : [10, 30]);
    }
  });

  it('signale le mode hors ligne et ne part pas si la suspension précède la requête', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    await envoyerSnapshot(etatSync(20));
    expect(etatEnvoi(compte.email)).toBe('hors_ligne');
    vi.stubGlobal('navigator', { onLine: true });
    const attente = envoyerSnapshot(etatSync(20));
    suspendreSync(compte.email);
    await attente;
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });
});

describe('P0.2 — suppression durable (onglets, réseau, réactivation)', () => {
  it('deux onglets : le DELETE de l\'onglet A n\'arrête pas l\'onglet B qui réécrit la ligne', async () => {
    // Onglet A : envoi puis suppression confirmée (1 ligne).
    await envoyerSnapshot(etatSync(200));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    await expect(supprimerSnapshotServeur(etatSync(200))).resolves.toBe('supprime');
    expect(sbMocks.select).toHaveBeenCalledTimes(1);
    // Même onglet : suspendu après la demande → plus aucun envoi, même avec consentement.
    await envoyerSnapshot(etatSync(201));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    // Onglet B : module frais (aucune suspension), même serveur simulé → la ligne réapparaît.
    vi.resetModules();
    const ongletB = await import('../sync');
    await ongletB.envoyerSnapshot(etatSync(201));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(2); // réécriture inter-onglets DÉMONTRÉE
  });

  it('réseau coupé pendant la suppression → « hors_ligne », zéro requête, aucune fausse confirmation', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    await expect(supprimerSnapshotServeur(etatSync(202))).resolves.toBe('hors_ligne');
    expect(sbMocks.select).not.toHaveBeenCalled();
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('réponse perdue sur le DELETE → « erreur » (jamais « supprime »), envois bloqués, puis nouvelle tentative', async () => {
    await envoyerSnapshot(etatSync(203));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    sbMocks.select.mockRejectedValueOnce(new Error('réseau'));
    await expect(supprimerSnapshotServeur(etatSync(203))).resolves.toBe('erreur');
    // L'UI affiche « تعذّر تأكيد الحذف… أعد المحاولة » et la sync est suspendue dans ce onglet.
    await envoyerSnapshot(etatSync(204));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
    // Bouton « إعادة المحاولة » du même écran.
    await expect(supprimerSnapshotServeur(etatSync(204))).resolves.toBe('supprime');
  });

  it('ligne absente ou jeton refusé par la RLS → « indetermine » (0 ligne), envois bloqués ensuite', async () => {
    // Matrice P0.1 S8 : DELETE avec mauvais jeton → 0 ligne côté serveur (USING non satisfait).
    sbMocks.select.mockResolvedValueOnce({ data: [], error: null });
    await expect(supprimerSnapshotServeur(etatSync(205))).resolves.toBe('indetermine');
    await envoyerSnapshot(etatSync(206));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
  });

  it('après suppression réussie, seul un ré-engagement explicite (reprendreSync, comme au consentement) relance l\'envoi', async () => {
    await expect(supprimerSnapshotServeur(etatSync(207))).resolves.toBe('supprime');
    await envoyerSnapshot(etatSync(208));
    expect(sbMocks.upsert).not.toHaveBeenCalled();
    reprendreSync(compte.email); // App.tsx:501 — appelé uniquement sur ré-engagement explicite
    await envoyerSnapshot(etatSync(208));
    expect(sbMocks.upsert).toHaveBeenCalledTimes(1);
  });

  it('textes UI conformes à la garantie réellement obtenue (Confidentialite.tsx)', () => {
    const src = readFileSync('src/components/Confidentialite.tsx', 'utf8');
    expect(src).toContain('الأجهزة أو التبويبات الأخرى'); // les autres onglets/appareils peuvent réécrire
    expect(src).toContain('رمز الحساب غير صالح'); // 0 ligne = jeton invalide possible (indéterminé)
    expect(src).toContain('غير مؤكّدين'); // durée de conservation non confirmée, dite telle quelle
    expect(src).toContain('بيانات هاتفك لم تُمسّ'); // la suppression serveur ne touche pas le local
    expect(src).toContain('إعادة المحاولة'); // reprise après erreur/indéterminé
    expect(src).toContain('قد تكتمل الطلبات التي بدأت'); // retrait : les envois déjà partis peuvent finir
  });
});
