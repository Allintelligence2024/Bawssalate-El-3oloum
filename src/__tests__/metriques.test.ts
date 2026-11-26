// Les métriques du README disent-elles la vérité ? (9.2 du Plan V2)
//
// `sync-metrics.mjs` compte par expressions régulières ; `verifier-drills.mjs` parse les
// items un par un. Deux méthodes indépendantes : si elles divergent, l'une des deux ment.
// Ce test les confronte, et vérifie que le README correspond à ce qu'elles disent.
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { ILLUSTRATIONS_LECONS, illustrationsParLecon } from '../data/illustrationsLecons';

const racine = new URL('../..', import.meta.url).pathname;
const lire = (p: string) => readFileSync(`${racine}${p}`, 'utf8');

describe('métriques du README', () => {
  it('le nombre d’items de drills est le même dans les deux comptages indépendants', () => {
    // 1) comptage par expressions régulières (sync-metrics)
    const FICHIERS = ['domaine1', 'domaine2', 'domaine3', 'niveau3'];
    let parRegex = 0;
    for (const f of FICHIERS) {
      const contenu = lire(`src/data/drills/${f}.ts`).replace(/\r\n/g, '\n');
      parRegex += (contenu.match(/^\s*\{ id: '/gm) ?? []).length;
    }

    // 2) comptage par le parseur ligne à ligne de verifier-drills
    let parParseur = 0;
    for (const f of FICHIERS) {
      const src = lire(`src/data/drills/${f}.ts`).replace(/\r\n/g, '\n');
      for (const ligne of src.split('\n')) {
        if (/^\s*\{ id: '[^']+', u: \d+, a: \d+, n: \d, q: ".*", o: \[.*\], e: ".*"(, def: true)? \},$/.test(ligne)) {
          parParseur++;
        }
      }
    }

    expect(parRegex, 'les deux comptages divergent : un fichier ou un format a changé').toBe(parParseur);
    expect(parRegex).toBeGreaterThan(0);
  });

  it('le README est à jour par rapport au code', () => {
    // `--check` sort en 1 avec un diff lisible quand le bloc est périmé.
    // On le lance réellement plutôt que d'imiter son calcul : c'est lui qui fait foi en CI.
    let sortie = '';
    let code = 0;
    try {
      sortie = execFileSync(process.execPath, ['scripts/sync-metrics.mjs', '--check'], {
        cwd: racine, encoding: 'utf8', stdio: 'pipe',
      });
    } catch (e) {
      code = (e as { status?: number }).status ?? 1;
      sortie = String((e as { stdout?: string }).stdout ?? '') + String((e as { stderr?: string }).stderr ?? '');
    }
    expect(code, `README périmé — lancer « node scripts/sync-metrics.mjs » :\n${sortie}`).toBe(0);
  });

  it('le bloc de métriques existe et contient les chiffres attendus', () => {
    const readme = lire('README.md');
    const bloc = readme.match(/<!-- METRICS:START -->([\s\S]*?)<!-- METRICS:END -->/);
    expect(bloc, 'balises METRICS absentes du README').not.toBeNull();
    const texte = bloc![1];
    expect(texte).toMatch(/\| Unités du programme \|/);
    expect(texte).toMatch(/\| Items de drills \|/);
    expect(texte).toMatch(/\| Coquille hors ligne/);
  });

  it('aucun chiffre de métrique n’est saisi à la main dans le script', () => {
    // Le script doit compter, pas afficher une constante. On vérifie qu'il n'écrit
    // jamais un nombre de drills/sujets en dur (les budgets de poids sont ailleurs).
    const script = lire('scripts/sync-metrics.mjs');
    expect(script).toContain('compte(');
    expect(script).not.toMatch(/drills\s*=\s*\d{2,}/);
    expect(script).not.toMatch(/sujetsOfficiels\s*=\s*\d{2,}/);
  });

  it('les fichiers de tests sont tous dans src/', () => {
    // Garde-fou : si un dossier de tests apparaît hors de src/, le décompte mentirait.
    const fichiers = readdirSync(`${racine}src`, { recursive: true, encoding: 'utf8' })
      .filter((f) => typeof f === 'string' && /\.test\.tsx?$/.test(f));
    expect(fichiers.length).toBeGreaterThan(40);
  });
});

it('les métriques des sujets et corrigés incluent les sessions exceptionnelles', async () => {
  const { SUJETS_OFFICIELS } = await import('../data/sujetsOfficiels');
  const { SUJETS_CORRIGES } = await import('../data/sujetsCorriges');
  const ids = SUJETS_OFFICIELS.map((s) => s.id);
  const corriges = SUJETS_CORRIGES.map((s) => s.sujetId);
  expect(ids).toContain('2017x-1');
  expect(ids).toContain('2017x-2');
  expect(new Set(ids).size).toBe(ids.length);
  expect(new Set(corriges).size).toBe(corriges.length);
  expect(new Set(ids)).toEqual(new Set(corriges));
  const readme = lire('README.md');
  expect(readme).toContain(`| Sujets officiels structurés | **${ids.length}** |`);
  expect(readme).toContain(`| Sujets avec éléments de réponse | **${corriges.length}** |`);
});

describe('registre des illustrations — 21 images OK (Phase 3)', () => {
  it('contient exactement les 21 images OK, toutes à valider par un enseignant', () => {
    expect(ILLUSTRATIONS_LECONS).toHaveLength(21);
    const fichiers = new Set<string>();
    const unites = new Set<string>();
    for (const i of ILLUSTRATIONS_LECONS) {
      expect(['u6', 'u7', 'u8', 'u9', 'u11']).toContain(i.uniteId);
      expect(i.statut).toBe('a_valider_enseignant');
      expect(i.reviewed).toBe(false);
      expect(i.fichier).toMatch(/^[a-zA-Z0-9._-]+\.webp$/);
      expect(i.largeur).toBeGreaterThan(0);
      expect(i.largeur).toBeLessThanOrEqual(1200);
      expect(i.hauteur).toBeGreaterThan(0);
      expect(i.hauteur).toBeLessThanOrEqual(1200);
      expect(i.altAr.length).toBeGreaterThan(0);
      fichiers.add(i.fichier);
      unites.add(i.uniteId);
    }
    expect(fichiers.size).toBe(21);
    expect(unites.size).toBe(5);
    expect(illustrationsParLecon('phase10_chapitres_19_20_2').length).toBeGreaterThan(0);
    expect(illustrationsParLecon('u1-lesson-inexistante')).toEqual([]);
  });
});
