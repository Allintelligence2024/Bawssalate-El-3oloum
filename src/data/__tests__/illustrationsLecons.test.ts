// Phase 3 — garde-fous du registre des 21 illustrations `OK`.
//
// On ne vérifie pas seulement les objets TypeScript : on regarde le disque (les WebP
// existent-ils, sont-ils seuls dans le dossier, respectent-ils le plafond ?) et le
// programme officiel (chaque `lessonId` est-il une vraie leçon, dans la bonne unité ?).
// `reviewed` reste la porte éditoriale : aucun test n'autorise `true`.

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ILLUSTRATIONS_LECONS, illustrationsParLecon, illustrationsParUnite } from '../illustrationsLecons';
import { TOUTES_LECONS, uniteDeLecon } from '../programme';

const racine = new URL('../../..', import.meta.url).pathname;
const dossierImages = join(racine, 'public/lecons/img');
const PLAFOND_OCTETS = 150 * 1024;
const REPARTITION: Record<string, number> = { u6: 9, u7: 2, u8: 2, u9: 4, u11: 4 };

describe('registre des 21 illustrations OK (u6, u7, u8, u9, u11)', () => {
  it('contient exactement 21 entrées réparties 9 / 2 / 2 / 4 / 4', () => {
    expect(ILLUSTRATIONS_LECONS).toHaveLength(21);
    const parUnite: Record<string, number> = {};
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(Object.keys(REPARTITION)).toContain(i.uniteId);
      parUnite[i.uniteId] = (parUnite[i.uniteId] ?? 0) + 1;
    }
    expect(parUnite).toEqual(REPARTITION);
    for (const uniteId of Object.keys(REPARTITION)) {
      expect(illustrationsParUnite(uniteId)).toHaveLength(REPARTITION[uniteId]);
    }
  });

  it('rattache chaque lessonId à une leçon existante de programme.ts', () => {
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(TOUTES_LECONS, `lessonId absent du programme : ${i.lessonId}`).toContain(i.lessonId);
      expect(uniteDeLecon(i.lessonId)?.id, `unité incohérente pour ${i.lessonId}`).toBe(i.uniteId);
    }
    // 13 leçons distinctes portent ces 21 documents.
    expect(new Set(ILLUSTRATIONS_LECONS.map((i) => i.lessonId)).size).toBe(13);
  });

  it('ne référence que des WebP réellement présents sur disque, ≤ 150 Ko', () => {
    const fichiers = new Set<string>();
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(i.fichier).toMatch(/^[a-zA-Z0-9._-]+\.webp$/);
      expect(fichiers.has(i.fichier), `fichier dupliqué : ${i.fichier}`).toBe(false);
      fichiers.add(i.fichier);

      const chemin = join(dossierImages, i.fichier);
      expect(existsSync(chemin), `WebP absent du disque : ${i.fichier}`).toBe(true);
      const taille = statSync(chemin).size;
      expect(taille, `${i.fichier} pèse ${taille} octets > 150 Ko`).toBeLessThanOrEqual(PLAFOND_OCTETS);
      expect(i.largeur).toBeGreaterThan(0);
      expect(i.largeur).toBeLessThanOrEqual(1200);
      expect(i.hauteur).toBeGreaterThan(0);
      expect(i.hauteur).toBeLessThanOrEqual(1200);
      expect(i.altAr.length).toBeGreaterThan(0);
      expect(i.titreAr.length).toBeGreaterThan(0);
    }

    const surDisque = readdirSync(dossierImages).sort();
    expect(surDisque, 'aucun JPEG brut ni fichier étranger dans public/lecons/img/').toHaveLength(21);
    expect(surDisque.every((f) => f.endsWith('.webp'))).toBe(true);
    expect(surDisque).toEqual([...fichiers].sort());
  });

  it('garde 0 reviewed: true et 21 statuts a_valider_enseignant', () => {
    expect(ILLUSTRATIONS_LECONS.filter((i) => i.reviewed === true)).toHaveLength(0);
    expect(ILLUSTRATIONS_LECONS.every((i) => i.reviewed === false)).toBe(true);
    expect(ILLUSTRATIONS_LECONS.every((i) => i.statut === 'a_valider_enseignant')).toBe(true);
    // Garde-fou sur le fichier généré lui-même : une édition manuelle ne doit pas passer.
    const source = readFileSync(join(racine, 'src/data/illustrationsLecons.ts'), 'utf8');
    expect(source).not.toContain('reviewed: true');
    expect(source).not.toContain("statut: 'actif'");
  });

  it('expose des helpers cohérents par leçon et par unité', () => {
    const lecon = 'phase10_chapitres_19_20_2';
    const parLecon = illustrationsParLecon(lecon);
    expect(parLecon.length).toBeGreaterThan(0);
    expect(parLecon.every((i) => i.lessonId === lecon)).toBe(true);
    expect(illustrationsParLecon('lecon-inexistante')).toEqual([]);
    expect(illustrationsParUnite('u1')).toEqual([]);
    const somme = Object.keys(REPARTITION)
      .reduce((s, u) => s + illustrationsParUnite(u).length, 0);
    expect(somme).toBe(ILLUSTRATIONS_LECONS.length);
  });
});
