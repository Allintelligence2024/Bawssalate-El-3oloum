import { describe, expect, it } from 'vitest';
import {
  BOUCLIERS_MAX,
  PLAFOND_EVENEMENTS,
  SEUIL_BOUCLIER,
  boucliers,
  cleEvenement,
  consignerTrophee,
  dejaVu,
  marquerVu,
  tentative,
} from '../evenements';
import {
  cleTentative,
  enregistrerTentative,
  libelleManquant,
  ongletConseille,
  progres,
  progresDuJeu,
} from '../amelioration';
import { evaluerAssemblage } from '../briques';
import { JEUX_UNITE1 } from '../../data/briques/u1';
import { etatVierge, type Etat } from '../../types';

const LE = '2026-11-21T09:00:00.000Z';
const e2 = JEUX_UNITE1.find((j) => j.id === 'jb:u1:e2')!;

function idsDes(jeu: typeof e2, roles: string[]): string[] {
  return roles.map((r) => jeu.briques.find((b) => b.role === r)!.id);
}

const COMPLET = idsDes(e2, ['observation', 'comparaison', 'interpretation', 'conclusion']);
const PARTIEL = idsDes(e2, ['observation']);

describe('contrat d’événement learning.attempt.completed', () => {
  const params = {
    attemptId: 'a1',
    origine: 'briques' as const,
    mode: 'briques' as const,
    exerciceId: 'jb:u1:e2',
    uniteId: 'u1',
    verbe: 'قارن',
    titre: 'قارن بين مكان الاستنساخ ومكان الترجمة',
    reussi: true,
    criteres: ['observation', 'comparaison'] as ('observation' | 'comparaison')[],
    timestamp: LE,
  };

  it('porte le type, une version de schéma et la source', () => {
    const t = tentative({ ...params, criteres: [...params.criteres] });
    expect(t.type).toBe('learning.attempt.completed');
    expect(t.schemaVersion).toBe(1);
    expect(t.source).toBe('briques');
    expect(t.timestamp).toBe(LE);
  });

  it('n’écrit jamais le statut d’une leçon, ses phases ni ses jalons', () => {
    const t = tentative({ ...params, criteres: [...params.criteres] }) as unknown as Record<string, unknown>;
    expect(t).not.toHaveProperty('statut');
    expect(t).not.toHaveProperty('phases');
    expect(t).not.toHaveProperty('jalons');
    expect(t).not.toHaveProperty('progression');
  });

  it('tronque les champs libres (titre 160, erreurTag 300)', () => {
    const t = tentative({ ...params, titre: 'x'.repeat(400), erreurTag: 'y'.repeat(900) });
    expect(t.titre.length).toBe(160);
    expect(t.erreurTag?.length).toBe(300);
  });

  it('omet les champs optionnels quand ils sont absents', () => {
    const t = tentative({ ...params, criteres: undefined, erreurTag: undefined });
    expect(t).not.toHaveProperty('criteres');
    expect(t).not.toHaveProperty('erreurTag');
  });

  it('l’origine boussole prend la source boussole', () => {
    expect(tentative({ ...params, origine: 'boussole' }).source).toBe('boussole');
  });
});

describe('idempotence des événements', () => {
  it('la clé est (origine, attemptId)', () => {
    expect(cleEvenement({ origine: 'briques', attemptId: 'a1' })).toBe('briques:a1');
    expect(cleEvenement({ attemptId: 'a1' })).toBe('boussole:a1');
  });

  it('un rejeu est reconnu, et marquerVu ne duplique pas', () => {
    let etat: Etat = etatVierge();
    const cle = 'briques:a1';
    expect(dejaVu(etat, cle)).toBe(false);
    etat = { ...etat, boussoleEventsSeen: marquerVu(etat, cle) };
    expect(dejaVu(etat, cle)).toBe(true);
    const uneFois = etat.boussoleEventsSeen!;
    etat = { ...etat, boussoleEventsSeen: marquerVu(etat, cle) };
    expect(etat.boussoleEventsSeen).toEqual(uneFois);
  });

  it('la liste des clés vues est plafonnée à 500', () => {
    let vus: string[] = [];
    for (let i = 0; i < PLAFOND_EVENEMENTS + 50; i++) {
      vus = marquerVu({ ...etatVierge(), boussoleEventsSeen: vus }, `briques:${i}`);
    }
    expect(vus).toHaveLength(PLAFOND_EVENEMENTS);
    expect(vus[vus.length - 1]).toBe(`briques:${PLAFOND_EVENEMENTS + 49}`);
  });
});

describe('trophées tactiques', () => {
  it('comptent les passages par verbe, sans série à ne pas casser', () => {
    let trophees = consignerTrophee(etatVierge(), 'قارن', LE) ?? {};
    trophees = consignerTrophee({ ...etatVierge(), trophees }, 'قارن', LE) ?? {};
    expect(trophees['قارن']).toEqual({ le: LE, n: 2 });
    expect(JSON.stringify(trophees)).not.toMatch(/streak|série|record/i);
  });
});

describe('boucliers — un acquis, jamais une série qui casse', () => {
  function etatAvecJours(jours: string[]): Etat {
    return { ...etatVierge(), journal: jours };
  }
  const AUJ = '2026-11-21';

  it('les bornes produit : seuil 4/7, maximum 3', () => {
    expect(SEUIL_BOUCLIER).toBe(4);
    expect(BOUCLIERS_MAX).toBe(3);
  });

  it('3 jours sur 7 → aucun bouclier', () => {
    expect(boucliers(etatAvecJours(['2026-11-21', '2026-11-20', '2026-11-19']), AUJ).acquis).toBe(0);
  });

  it('4 jours → 1, 6 jours → 2, 7 jours → 3', () => {
    const jours = ['2026-11-21', '2026-11-20', '2026-11-19', '2026-11-18', '2026-11-17', '2026-11-16', '2026-11-15'];
    expect(boucliers(etatAvecJours(jours.slice(0, 4)), AUJ).acquis).toBe(1);
    expect(boucliers(etatAvecJours(jours.slice(0, 6)), AUJ).acquis).toBe(2);
    expect(boucliers(etatAvecJours(jours), AUJ).acquis).toBe(3);
  });

  it('les jours hors fenêtre de 7 ne comptent pas', () => {
    const anciens = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'];
    expect(boucliers(etatAvecJours(anciens), AUJ).acquis).toBe(0);
  });
});

describe('Avant / Après sur les tentatives de briques', () => {
  it('la première tentative n’affiche pas de progrès (on ne compare pas au vide)', () => {
    const ev = evaluerAssemblage(e2, PARTIEL);
    const etat = enregistrerTentative(etatVierge(), e2.id, ev, LE);
    expect(etat.briques?.[cleTentative(e2.id)]?.avant).toBeUndefined();
    expect(progresDuJeu(etat, e2.id, ev.total)).toBeNull();
  });

  it('la deuxième tente garde l’Avant et gagne en critères', () => {
    const premier = enregistrerTentative(etatVierge(), e2.id, evaluerAssemblage(e2, PARTIEL), LE);
    const second = enregistrerTentative(premier, e2.id, evaluerAssemblage(e2, COMPLET), LE);
    const p = progresDuJeu(second, e2.id, 4);
    expect(p).not.toBeNull();
    expect(p!.avant).toBe(1);
    expect(p!.apres).toBe(4);
    expect(p!.gain).toBe(3);
  });

  it('la dernière tentative est la seule conservée (une entrée par jeu)', () => {
    const premier = enregistrerTentative(etatVierge(), e2.id, evaluerAssemblage(e2, PARTIEL), LE);
    const second = enregistrerTentative(premier, e2.id, evaluerAssemblage(e2, COMPLET), LE);
    expect(Object.keys(second.briques ?? {})).toHaveLength(1);
  });

  it('un progrès ne s’exprime jamais en points ni en pourcentage', () => {
    const p = progres(1, 4, 4);
    expect(p).toMatchObject({ avant: 1, apres: 4, gain: 3 });
    expect(p.phrase).toContain('4');
    expect(JSON.stringify(p)).not.toMatch(/%|\/20/);
    // Un gain nul ne culpabilise pas : il propose un autre élément.
    expect(progres(4, 4, 4).phrase).toMatch(/جرّب/);
  });
});

describe('vers où envoyer l’élève quand un critère manque', () => {
  it('un manque d’observation ou de comparaison → onglet vérificateur (le contrôle des trois preuves)', () => {
    const ev = evaluerAssemblage(e2, PARTIEL);
    expect(ev.manquants).toContain('comparaison');
    expect(ongletConseille(ev)).toBe('verificateur');
    expect(libelleManquant(ev)).toBe('المقارنة بالشاهد');
  });

  it('un manque d’interprétation → onglet du verbe (ce que le correcteur attend)', () => {
    const ids = idsDes(e2, ['observation', 'comparaison', 'conclusion']);
    const ev = evaluerAssemblage(e2, ids);
    expect(ev.manquants).toEqual(['interpretation']);
    expect(ongletConseille(ev)).toBe('verbe');
    expect(libelleManquant(ev)).toBe('التفسير العلمي');
  });

  it('un piège retenu → onglet des pièges', () => {
    const piege = e2.briques.find((b) => b.role === 'piege')!.id;
    expect(ongletConseille(evaluerAssemblage(e2, [...COMPLET, piege]))).toBe('pieges');
  });

  it('ordre inversé → vérificateur, avec le critère « الترتيب »', () => {
    const ev = evaluerAssemblage(e2, [...COMPLET].reverse());
    expect(ongletConseille(ev)).toBe('verificateur');
    expect(libelleManquant(ev)).toBe('الترتيب');
  });

  it('assemblage complet → aucune indication (rien à corriger)', () => {
    const ev = evaluerAssemblage(e2, COMPLET);
    expect(libelleManquant(ev)).toBeNull();
    expect(ongletConseille(ev)).toBe('verificateur');
    expect(ongletConseille(null)).toBe('verificateur');
  });
});
