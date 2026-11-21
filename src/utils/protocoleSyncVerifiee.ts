import type { SupabaseClient } from '@supabase/supabase-js';

export type EtatAutorisation = { generation: number; autorise: boolean };
export type ResumePilote = { minutes_totales: number; lecons_terminees?: number; revisions?: number };
export type ResultatMutation = 'confirme' | 'refuse' | 'indetermine';

function generationValide(g: unknown): g is number {
  return typeof g === 'number' && Number.isSafeInteger(g) && g >= 0;
}

/** Aucune reprise automatique : le demandeur conserve la génération d'origine en cas de doute. */
export function protocoleSyncVerifiee(client: Pick<SupabaseClient, 'rpc'>) {
  async function appel(nom: string, args?: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await client.rpc(nom, args).abortSignal(AbortSignal.timeout(12_000));
    if (error) throw error;
    return data;
  }
  async function mutation(nom: string, generation: number, contenu?: ResumePilote): Promise<ResultatMutation> {
    if (!generationValide(generation)) return 'refuse';
    try {
      const reponse = await appel(nom, { attendue: generation, ...(contenu === undefined ? {} : { contenu }) });
      return reponse === true ? 'confirme' : reponse === false ? 'refuse' : 'indetermine';
    } catch { return 'indetermine'; }
  }
  return {
    async etat(): Promise<EtatAutorisation | null> {
      try {
        const lignes = await appel('kunz_sync_etat');
        if (!Array.isArray(lignes) || lignes.length !== 1) return null;
        const ligne = lignes[0];
        return ligne && generationValide(ligne.generation) && typeof ligne.autorise === 'boolean'
          ? { generation: ligne.generation, autorise: ligne.autorise } : null;
      } catch { return null; }
    },
    async consentir(generation: number): Promise<{ resultat: ResultatMutation; generation?: number }> {
      if (!generationValide(generation)) return { resultat: 'refuse' };
      try {
        const suivante = await appel('kunz_sync_consentir', { attendue: generation });
        if (suivante === null) return { resultat: 'refuse' };
        return generationValide(suivante) && suivante === generation + 1
          ? { resultat: 'confirme', generation: suivante } : { resultat: 'indetermine' };
      } catch { return { resultat: 'indetermine' }; }
    },
    ecrire: (generation: number, contenu: ResumePilote) => mutation('kunz_sync_ecrire', generation, contenu),
    effacer: (generation: number) => mutation('kunz_sync_effacer', generation),
  };
}
