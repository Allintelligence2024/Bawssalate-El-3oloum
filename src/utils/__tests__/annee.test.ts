// Calendrier scolaire externalisé (P2.3 / reco audit n° 4) : plus de constante nationale dans le code métier
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CALENDRIERS, calendrierPour } from '../../config/annee';
import { debutAnnee, UNITES } from '../../data/programme';
import { etatVierge } from '../../types';

const racine = new URL('../..', import.meta.url).pathname;

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

describe('fenêtres des unités — cohérence avec le calendrier (bug « U8–U11 après le Bac »)', () => {
  // Le Bac 2027 tombe en semaine 39. Les fenêtres montaient jusqu'à la semaine 48, soit
  // le 9 août 2027 : `uniteDeLaClasse()` annonçait donc « la classe est en U11 » deux mois
  // après l'examen, et l'écran اليوم comparait l'élève à un programme déjà terminé.
  const calendrier = CALENDRIERS[0];
  const semaineDuBac = (() => {
    const d = new Date(calendrier.debut + 'T00:00:00Z');
    const b = new Date(calendrier.bac + 'T00:00:00Z');
    return Math.floor((b.getTime() - d.getTime()) / (7 * 86400000)) + 1;
  })();

  it('aucune unité n’est programmée après la semaine du Bac', () => {
    expect(semaineDuBac).toBe(39);
    for (const u of UNITES) {
      expect(u.fenetre.fin, `${u.id} finit après le Bac`).toBeLessThan(semaineDuBac);
      expect(u.fenetre.debut).toBeLessThanOrEqual(u.fenetre.fin);
    }
  });

  it('les fenêtres se suivent dans l’ordre du programme (pas de trou, pas de retour)', () => {
    for (let i = 1; i < UNITES.length; i++) {
      expect(UNITES[i].fenetre.debut, `${UNITES[i].id} commence avant ${UNITES[i - 1].id}`).toBeGreaterThanOrEqual(
        UNITES[i - 1].fenetre.debut,
      );
      expect(UNITES[i].fenetre.fin).toBeGreaterThanOrEqual(UNITES[i - 1].fenetre.fin);
    }
    // Pas de trou : chaque unité commence au plus tard la semaine qui suit la fin de la précédente.
    for (let i = 1; i < UNITES.length; i++) {
      expect(UNITES[i].fenetre.debut).toBeLessThanOrEqual(UNITES[i - 1].fenetre.fin + 1);
    }
  });

  it('tout le programme tient avant la révision générale de fin mai', () => {
    // 36 semaines de cours visées ; la dernière unité doit être bouclée avant juin.
    expect(UNITES[UNITES.length - 1].fenetre.fin).toBeLessThanOrEqual(38);
  });
});

describe('poidsBac — dérivé du corpus réel, pas d’un jugement à la main', () => {
  // Constat : la géologie pesait 4 (u9, u11) alors que u2 pesait 3, et le mode intensif
  // (bridge.planDeJour trie par poidsBac) poussait donc la tectonique AVANT la structure
  // des protéines. On vérifie ici l'ordre réel du corpus : 90 blocs d'exercices, points
  // pondérés par le nombre d'unités de chaque exercice.
  const corpus = () =>
    ['sujetsOfficiels.ts', 'sujets/s2013_2016.ts', 'sujets/s2017_2022.ts', 'sujets/s2024_2026.ts', 'sujetsCorriges.ts', 'enquetesBac.ts']
      .map((f) => readFileSync(`${racine}data/${f}`, 'utf8'))
      .join('\n');

  function pointsParUnite(): Record<string, number> {
    const pts: Record<string, number> = {};
    for (const m of corpus().matchAll(/bareme: ([\d.]+), unites: \[([^\]]*)\]/g)) {
      const bareme = Number(m[1]);
      const unites = m[2].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
      for (const u of unites) pts[u] = (pts[u] ?? 0) + bareme / unites.length;
    }
    return pts;
  }

  it('chaque unité porte un poids 1..5', () => {
    for (const u of UNITES) {
      expect(u.poidsBac, u.id).toBeGreaterThanOrEqual(1);
      expect(u.poidsBac, u.id).toBeLessThanOrEqual(5);
    }
  });

  it('les unités les plus lourdes au Bac pèsent plus que la géologie', () => {
    const p = (id: string) => UNITES.find((u) => u.id === id)!.poidsBac;
    for (const forte of ['u1', 'u3', 'u4', 'u5']) {
      expect(p(forte), `${forte} doit dépasser u9`).toBeGreaterThan(p('u9'));
      expect(p(forte), `${forte} doit dépasser u11`).toBeGreaterThan(p('u11'));
    }
    expect(p('u2')).toBeGreaterThan(p('u9'));
    expect(p('u2')).toBeGreaterThan(p('u11'));
  });

  it('le classement des poids suit le classement des points du corpus', () => {
    const pts = pointsParUnite();
    const p = (id: string) => UNITES.find((u) => u.id === id)!.poidsBac;
    // Les quatre plus gros contributeurs du corpus (u4, u5, u1, u6) sont aussi les plus lourds.
    const gros = Object.entries(pts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([u]) => u);
    for (const u of gros) expect(p(u), `${u} est un gros contributeur du corpus`).toBeGreaterThanOrEqual(4);
    // La géologie reste au plancher : elle ne dépasse jamais une unité du domaine 1 ou 2.
    for (const geo of ['u9', 'u10', 'u11']) expect(p(geo), geo).toBeLessThanOrEqual(2);
  });
});
