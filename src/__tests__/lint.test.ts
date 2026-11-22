// Contrôle de la configuration ESLint (J3).
//
// La configuration ne traite QUE JavaScript. Ce fichier vérifie que c'est vrai et que
// la raison est toujours valable : si `typescript-eslint` finit par supporter TypeScript 7,
// ce test le dit et invite à étendre la configuration. Sinon, la configuration reste honnête
// au lieu de prétendre lint-er des fichiers qu'elle ignore.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const racine = new URL('../..', import.meta.url).pathname;

describe('configuration ESLint', () => {
  it('ignore explicitement les fichiers TypeScript', () => {
    const config = readFileSync(`${racine}eslint.config.mjs`, 'utf8');
    expect(config).toContain("'**/*.ts'");
    expect(config).toContain("'**/*.tsx'");
  });

  it('documente l’incompatibilité TypeScript 7 / typescript-eslint', () => {
    const config = readFileSync(`${racine}eslint.config.mjs`, 'utf8');
    // La raison est écrite dans la config, pas seulement dans un historique Git.
    expect(config).toMatch(/TypeScript 7/);
    expect(config).toMatch(/typescript-eslint/);
  });

  it('typescript-eslint plante encore avec TypeScript 7 — sinon, étendre ESLint', () => {
    let versionTypescript = '';
    try {
      versionTypescript = JSON.parse(
        readFileSync(`${racine}node_modules/typescript/package.json`, 'utf8'),
      ).version as string;
    } catch {
      expect.fail('typescript introuvable : lancer npm ci');
    }
    const majeur = Number(versionTypescript.split('.')[0]);
    if (majeur >= 7) {
      // On vérifie l'échec réel, pas la documentation : si un jour ça passe,
      // l'assertion tombe et on sait qu'il faut étendre la configuration aux .ts.
      let message = '';
      try {
        execFileSync(process.execPath, ['-e', "require('typescript-eslint')"], {
          cwd: racine,
          stdio: 'pipe',
        });
      } catch (e) {
        message = String((e as { stderr?: Buffer }).stderr ?? '');
      }
      expect(message, 'typescript-eslint fonctionne désormais : étendre eslint.config.mjs aux .ts').toMatch(
        /does not support TS 7|Cannot find module/,
      );
    }
  });

  it('le lint des fichiers JavaScript passe', () => {
    // Exécuté ici pour que la CI échoue même si le job lint était retiré du workflow.
    const sortie = execFileSync('npx', ['eslint', '.'], { cwd: racine, encoding: 'utf8' });
    expect(sortie.trim()).toBe('');
  }, 60_000);
});
