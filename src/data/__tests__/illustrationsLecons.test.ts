// Garde-fous du registre des illustrations (Phase 3) et des schémas créés (Lots 1 à 4).
//
// On ne vérifie pas seulement les objets TypeScript : on regarde le disque (les fichiers
// existent-ils, sont-ils seuls dans le dossier, respectent-ils le plafond ?) et le programme
// officiel (chaque `lessonId` est-il une vraie leçon, dans la bonne unité ?).
// `reviewed` reste la porte éditoriale : aucun test n'autorise `true`.
//
// Depuis le Lot 1, deux familles cohabitent :
//  - 21 WebP `webp_legacy` du manuel (u6, u7, u8, u9, u11) — jamais modifiées ;
//  - 40 schémas créés (u1 → u11) — 35 SVG écrits à la main, 5 WebP muettes annotées.

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  ILLUSTRATIONS_LECONS,
  illustrationsParLecon,
  illustrationsParUnite,
  typeVisuelDe,
} from '../illustrationsLecons';
import { SCHEMAS_SVT } from '../schemasSvt';
import { TOUTES_LECONS, uniteDeLecon } from '../programme';

const racine = new URL('../../..', import.meta.url).pathname;
const dossierImages = join(racine, 'public/lecons/img');
const PLAFOND_OCTETS = 150 * 1024;
const REPARTITION_LEGACY: Record<string, number> = { u6: 9, u7: 2, u8: 2, u9: 4, u11: 4 };
const REPARTITION_SCHEMAS: Record<string, number> = { u1: 5, u2: 5, u3: 6, u4: 6, u5: 4, u6: 2, u7: 3, u8: 1, u9: 3, u10: 3, u11: 2 };

describe('registre des 21 illustrations du manuel (u6, u7, u8, u9, u11)', () => {
  const legacy = ILLUSTRATIONS_LECONS.filter((i) => typeVisuelDe(i) === 'webp_legacy');

  it('contient exactement 21 entrées réparties 9 / 2 / 2 / 4 / 4', () => {
    expect(legacy).toHaveLength(21);
    const parUnite: Record<string, number> = {};
    for (const i of legacy) {
      expect(Object.keys(REPARTITION_LEGACY)).toContain(i.uniteId);
      parUnite[i.uniteId] = (parUnite[i.uniteId] ?? 0) + 1;
    }
    expect(parUnite).toEqual(REPARTITION_LEGACY);
    for (const uniteId of Object.keys(REPARTITION_LEGACY)) {
      const duManuel = illustrationsParUnite(uniteId).filter((i) => typeVisuelDe(i) === 'webp_legacy');
      expect(duManuel).toHaveLength(REPARTITION_LEGACY[uniteId]);
    }
    // 13 leçons distinctes portent ces 21 documents.
    expect(new Set(legacy.map((i) => i.lessonId)).size).toBe(13);
  });
});

describe('schémas créés — règle « zéro texte IA » (Lots 1 à 4)', () => {
  it('couvre u1 → u11 avec 40 schémas sur les leçons officielles', () => {
    expect(SCHEMAS_SVT).toHaveLength(40);
    const parUnite: Record<string, number> = {};
    for (const i of SCHEMAS_SVT) {
      expect(Object.keys(REPARTITION_SCHEMAS)).toContain(i.uniteId);
      parUnite[i.uniteId] = (parUnite[i.uniteId] ?? 0) + 1;
    }
    expect(parUnite).toEqual(REPARTITION_SCHEMAS);
    // 35 schémas vectoriels écrits à la main + 5 WebP muettes annotées.
    expect(SCHEMAS_SVT.filter((i) => typeVisuelDe(i) === 'svg_vectoriel')).toHaveLength(35);
    expect(SCHEMAS_SVT.filter((i) => typeVisuelDe(i) === 'webp_annote')).toHaveLength(5);

    // Les schémas se répartissent sur 39 leçons : `phase3_chapitres_5_6` en porte deux
    // (Anfinsen + drépanocytose), conformément au plafond de 2 schémas par leçon.
    const lecons = SCHEMAS_SVT.map((i) => i.lessonId);
    expect(new Set(lecons).size).toBe(39);
    const parLecon = new Map<string, number>();
    for (const l of lecons) parLecon.set(l, (parLecon.get(l) ?? 0) + 1);
    expect(Math.max(...parLecon.values())).toBeLessThanOrEqual(2);
    // Aucun schéma pour les deux leçons d'enrichissement hors périmètre.
    expect(lecons).not.toContain('phase22_chapitres_43_44');
    expect(lecons).not.toContain('phase22_chapitres_43_44_2');
  });

  it('type visuel cohérent avec l’extension et le mode d’annotation', () => {
    for (const i of SCHEMAS_SVT) {
      const type = typeVisuelDe(i);
      expect(['svg_vectoriel', 'webp_annote']).toContain(type);
      expect(i.fichier.endsWith(type === 'svg_vectoriel' ? '.svg' : '.webp'), i.fichier).toBe(true);
      // Les deux familles portent des pastilles : le visuel lui-même est muet.
      expect(i.annotations && i.annotations.length, i.id).toBeGreaterThanOrEqual(4);
      expect(i.legendeAr && i.legendeAr.length).toBeGreaterThan(0);
    }
  });

  it('pastilles numérotées 1..n, dans l’image, avec libellé arabe et détail ≤ 90 caractères', () => {
    for (const i of SCHEMAS_SVT) {
      const nums = (i.annotations ?? []).map((a) => a.num);
      expect(nums, i.id).toEqual(nums.map((_, k) => k + 1));
      for (const a of i.annotations ?? []) {
        // Bornes du prompt : une pastille collée au bord est illisible sur mobile.
        expect(a.x, `${i.id} #${a.num}`).toBeGreaterThanOrEqual(5);
        expect(a.x, `${i.id} #${a.num}`).toBeLessThanOrEqual(95);
        expect(a.y, `${i.id} #${a.num}`).toBeGreaterThanOrEqual(5);
        expect(a.y, `${i.id} #${a.num}`).toBeLessThanOrEqual(95);
        expect(a.labelAr.trim().length, `${i.id} #${a.num}`).toBeGreaterThan(0);
        if (a.detailAr !== undefined) {
          expect(a.detailAr.trim().length, `${i.id} #${a.num} : ${a.detailAr}`).toBeLessThanOrEqual(90);
        }
        // Le libellé est arabe : au moins un caractère de la plage arabe.
        expect(/[\u0600-\u06FF]/.test(a.labelAr), `${i.id} #${a.num}`).toBe(true);
      }
    }
  });

  it('les SVG sont vectoriels, autonomes et sans texte arabe incrusté', () => {
    for (const i of SCHEMAS_SVT.filter((s) => typeVisuelDe(s) === 'svg_vectoriel')) {
      const source = readFileSync(join(dossierImages, i.fichier), 'utf8');
      expect(source.startsWith('<svg'), i.fichier).toBe(true);
      expect(source).not.toContain('base64');
      expect(source).not.toMatch(/<image[\s>]/);
      // Aucun texte arabe dans les pixels : les libellés arabes viennent de l'application.
      expect(/[\u0600-\u06FF]/.test(source), i.fichier).toBe(false);
    }
  });

  it('les WebP annotées sont muettes côté fichier (pas de bitmap dans les SVG, tailles bornées)', () => {
    for (const i of SCHEMAS_SVT.filter((s) => typeVisuelDe(s) === 'webp_annote')) {
      const chemin = join(dossierImages, i.fichier);
      expect(existsSync(chemin), i.fichier).toBe(true);
      expect(statSync(chemin).size, i.fichier).toBeLessThanOrEqual(PLAFOND_OCTETS);
      expect(i.largeur).toBeLessThanOrEqual(1200);
      expect(i.hauteur).toBeLessThanOrEqual(1200);
    }
  });
});

describe('registre complet — disque et programme', () => {
  it('rattache chaque lessonId à une leçon existante de programme.ts', () => {
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(TOUTES_LECONS, `lessonId absent du programme : ${i.lessonId}`).toContain(i.lessonId);
      expect(uniteDeLecon(i.lessonId)?.id, `unité incohérente pour ${i.lessonId}`).toBe(i.uniteId);
    }
    // 21 documents du manuel (13 leçons) + 40 schémas (39 leçons) = 52 leçons illustrées.
    expect(new Set(ILLUSTRATIONS_LECONS.map((i) => i.lessonId)).size).toBe(52);
  });

  it('ne référence que des fichiers réellement présents sur disque, ≤ 150 Ko', () => {
    const fichiers = new Set<string>();
    const ids = new Set<string>();
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(i.fichier).toMatch(/^[a-zA-Z0-9._-]+\.(webp|svg)$/);
      expect(fichiers.has(i.fichier), `fichier dupliqué : ${i.fichier}`).toBe(false);
      expect(ids.has(i.id), `id dupliqué : ${i.id}`).toBe(false);
      fichiers.add(i.fichier);
      ids.add(i.id);

      const chemin = join(dossierImages, i.fichier);
      expect(existsSync(chemin), `fichier absent du disque : ${i.fichier}`).toBe(true);
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
    expect(surDisque, 'aucun JPEG/PNG brut ni fichier étranger dans public/lecons/img/').toHaveLength(61);
    expect(surDisque.every((f) => f.endsWith('.webp') || f.endsWith('.svg'))).toBe(true);
    expect(surDisque).toEqual([...fichiers].sort());
  });

  it('garde 0 reviewed: true et 61 statuts a_valider_enseignant', () => {
    expect(ILLUSTRATIONS_LECONS).toHaveLength(61);
    expect(ILLUSTRATIONS_LECONS.filter((i) => i.reviewed === true)).toHaveLength(0);
    expect(ILLUSTRATIONS_LECONS.every((i) => i.reviewed === false)).toBe(true);
    expect(ILLUSTRATIONS_LECONS.every((i) => i.statut === 'a_valider_enseignant')).toBe(true);
    // Garde-fou sur les sources : une validation non signée ne doit pas passer.
    for (const fichier of ['src/data/illustrationsLecons.ts', 'src/data/schemasSvt.ts']) {
      const source = readFileSync(join(racine, fichier), 'utf8');
      expect(source, fichier).not.toContain('reviewed: true');
      expect(source, fichier).not.toContain("statut: 'actif'");
    }
  });

  it('expose des helpers cohérents par leçon et par unité', () => {
    const lecon = 'phase10_chapitres_19_20_2';
    const parLecon = illustrationsParLecon(lecon);
    expect(parLecon.length).toBeGreaterThan(0);
    expect(parLecon.every((i) => i.lessonId === lecon)).toBe(true);
    expect(illustrationsParLecon('lecon-inexistante')).toEqual([]);
    expect(illustrationsParUnite('u12')).toEqual([]);
    // u6, u7 et u8 portent à la fois des WebP du manuel et des schémas créés : on déduplique.
    const unites = new Set([...Object.keys(REPARTITION_LEGACY), ...Object.keys(REPARTITION_SCHEMAS)]);
    const somme = [...unites].reduce((s, u) => s + illustrationsParUnite(u).length, 0);
    expect(somme).toBe(ILLUSTRATIONS_LECONS.length);
  });
});
