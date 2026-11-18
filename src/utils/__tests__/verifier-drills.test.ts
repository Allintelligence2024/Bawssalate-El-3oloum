import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts/verifier-drills.mjs');
function verifier(lignes: string) {
  const dossier = mkdtempSync(join(tmpdir(), 'bousala-drills-'));
  try {
    mkdirSync(join(dossier, 'src/data/drills'), { recursive: true });
    for (const f of ['domaine1', 'domaine2', 'domaine3', 'niveau3'])
      writeFileSync(join(dossier, 'src/data/drills', f + '.ts'), f === 'domaine1' ? lignes : '');
    return spawnSync(process.execPath, [script], { cwd: dossier, encoding: 'utf8' });
  } finally { rmSync(dossier, { recursive: true, force: true }); }
}
const bon = `  { id: 'q1', u: 1, a: 1, n: 1, q: "سؤال", o: ["واحد", "اثنان", "ثلاثة", "أربعة"], e: "تفسير" },`;
describe('vérificateur des drills en CI', () => {
  it('accepte une banque valide', () => { expect(verifier(bon).status).toBe(0); });
  it('échoue si une ligne est non analysée, si un id est dupliqué ou si la banque est vide', () => {
    for (const input of ["{ id: non-parse }", `${bon}\n${bon}`, '']) expect(verifier(input).status).toBe(1);
  });
});
