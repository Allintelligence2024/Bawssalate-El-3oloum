// P2.4 — rappel quotidien local : opt-in, 1/jour, texte neutre, rien sans permission, rien sur le web
import { describe, it, expect } from 'vitest';
import type { Etat } from '../../types';
import {
  activerRappel,
  desactiverRappel,
  synchroniserRappel,
  decomposerHeure,
  prochainRappel,
  texteRappel,
  reglageRappel,
  TEXTES_RAPPEL,
  ID_RAPPEL,
  type AdaptateurRappels,
  type EtatPermission,
} from '../rappels';

function vierge(extra: Partial<Etat> = {}): Etat {
  return {
    version: 2, progression: {}, jalons: {}, notes: [], carnet: [], journal: [], minutesTotales: 0, revisions: 0,
    nom: 'x', dateBac: '2027-06-10', seancesComptees: 0, ateliers: {}, consentementSync: false, ...extra,
  };
}

function faux(opts: { dispo?: boolean; perm?: EtatPermission; apresDemande?: EtatPermission } = {}) {
  const journal: string[] = [];
  let perm: EtatPermission = opts.perm ?? 'prompt';
  const a: AdaptateurRappels = {
    disponible: () => opts.dispo ?? true,
    permission: async () => perm,
    demanderPermission: async () => {
      journal.push('demande');
      perm = opts.apresDemande ?? 'granted';
      return perm;
    },
    programmer: async (h, t) => {
      journal.push(`programme ${h.hour}:${h.minute} «${t.corps}»`);
    },
    annuler: async () => {
      journal.push('annule');
    },
  };
  return { a, journal };
}

describe('rappels (P2.4)', () => {
  it('désactivé par défaut, heure par défaut 19:30 ; parsing strict de HH:MM', () => {
    expect(reglageRappel(vierge())).toEqual({ actif: false, heure: '19:30' });
    expect(decomposerHeure('07:05')).toEqual({ hour: 7, minute: 5 });
    expect(decomposerHeure('23:59')).toEqual({ hour: 23, minute: 59 });
    expect(decomposerHeure('24:00')).toBeNull();
    expect(decomposerHeure('19h30')).toBeNull();
  });

  it('prochain rappel : aujourd\'hui si l\'heure n\'est pas passée, sinon demain', () => {
    const now = new Date('2026-11-16T10:00:00');
    expect(prochainRappel('19:30', now)!.toISOString()).toBe(new Date('2026-11-16T19:30:00').toISOString());
    expect(prochainRappel('09:00', now)!.toISOString()).toBe(new Date('2026-11-17T09:00:00').toISOString());
    expect(prochainRappel('zz', now)).toBeNull();
  });

  it('textes : aucun chiffre, aucun mot culpabilisant, rotation déterministe', () => {
    for (const t of TEXTES_RAPPEL) {
      expect(t.corps).not.toMatch(/\d|%/);
      expect(t.corps).not.toMatch(/تأخّرت|تأخرت|فشل|ضعيف/);
    }
    expect(texteRappel(new Date(2026, 0, 1))).toEqual(TEXTES_RAPPEL[0]);
    expect(texteRappel(new Date(2026, 0, 2))).toEqual(TEXTES_RAPPEL[1]);
  });

  it('activer : demande la permission puis programme UNE notification à l\'heure choisie', async () => {
    const { a, journal } = faux();
    const res = await activerRappel('19:30', a);
    expect(res).toEqual({ ok: true });
    expect(journal[0]).toBe('demande');
    expect(journal.filter((l) => l.startsWith('programme')).length).toBe(1);
    expect(journal[1]).toMatch(/^programme 19:30 «/);
    expect(ID_RAPPEL).toBe(1);
  });

  it('refus de permission → rien n\'est programmé ; web → indisponible ; heure invalide → erreur sans appel', async () => {
    const refus = faux({ apresDemande: 'denied' });
    expect(await activerRappel('19:30', refus.a)).toEqual({ ok: false, raison: 'permission_refusee' });
    expect(refus.journal.some((l) => l.startsWith('programme'))).toBe(false);

    const web = faux({ dispo: false });
    expect(await activerRappel('19:30', web.a)).toEqual({ ok: false, raison: 'indisponible' });
    expect(web.journal).toEqual([]);

    const mauvaise = faux();
    expect(await activerRappel('19h', mauvaise.a)).toEqual({ ok: false, raison: 'heure_invalide' });
    expect(mauvaise.journal).toEqual([]);
  });

  it('désactiver annule ; synchroniser ne reprogramme que si actif ET permission accordée', async () => {
    const d = faux();
    await desactiverRappel(d.a);
    expect(d.journal).toEqual(['annule']);

    const off = faux({ perm: 'granted' });
    await synchroniserRappel(vierge(), off.a);
    expect(off.journal).toEqual([]);

    const sansPerm = faux({ perm: 'denied' });
    await synchroniserRappel(vierge({ rappel: { actif: true, heure: '20:00' } }), sansPerm.a);
    expect(sansPerm.journal).toEqual([]); // jamais de re-demande silencieuse au lancement

    const on = faux({ perm: 'granted' });
    await synchroniserRappel(vierge({ rappel: { actif: true, heure: '20:00' } }), on.a);
    expect(on.journal).toEqual([expect.stringMatching(/^programme 20:0 «/)]);
  });
});
