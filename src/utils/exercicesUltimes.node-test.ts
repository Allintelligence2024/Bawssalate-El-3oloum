import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EXERCICES_ULTIMES } from '../data/exercicesUltimes';

const MOTS_INTERDITS = /باك|بكالوريا|\bbac\b|امتحان/i;

test('EXERCICES_ULTIMES contient 6 exercices originaux complets avec 2 documents SVG et 3 étapes chacun', () => {
  assert.equal(EXERCICES_ULTIMES.length, 6);
  const ids = new Set<string>();
  const docIds = new Set<string>();

  for (const exo of EXERCICES_ULTIMES) {
    assert.ok(exo.id && !ids.has(exo.id), `id dupliqué: ${exo.id}`);
    ids.add(exo.id);
    assert.equal(exo.documents.length, 2, `2 documents requis pour ${exo.id}`);
    assert.equal(exo.etapes.length, 3, `3 étapes requises pour ${exo.id}`);
    assert.ok(exo.modeleComplet.length >= 3, `modèle complet requis pour ${exo.id}`);
    assert.ok(exo.regleOr.trim().length > 15, `règle d'or requise pour ${exo.id}`);

    for (const d of exo.documents) {
      assert.ok(!docIds.has(d.id), `document SVG dupliqué: ${d.id}`);
      docIds.add(d.id);
    }

    for (const e of exo.etapes) {
      assert.equal(e.options.length, 3);
      assert.ok(e.bonne >= 0 && e.bonne <= 2);
      assert.ok(e.explication.trim().length > 15);
    }
  }
  assert.equal(docIds.size, 12);
});

test('aucune mention interdite (باك / بكالوريا / BAC / امتحان) dans les التمارين القصوى', () => {
  const fichiers = [
    'src/data/exercicesUltimes.ts',
    'src/components/SchemasUltimesSvg.tsx',
    'src/components/ExercicesUltimes.tsx',
  ];
  for (const chemin of fichiers) {
    const contenu = fs.readFileSync(chemin, 'utf8');
    const match = contenu.match(MOTS_INTERDITS);
    assert.equal(
      match,
      null,
      `Mot interdit "${match?.[0]}" trouvé dans ${chemin}`,
    );
  }
});
