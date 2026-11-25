// Résumé d'une hiérarchie UI capturée par uiautomator dump (fichiers ui-*.xml).
// Affiche uniquement les nœuds ayant du texte ou cliquables.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const xml = readFileSync(file, 'utf8');
console.log(`=== ${file} (${xml.length} bytes) ===`);
let n = 0;
for (const m of xml.matchAll(/<node[^>]*>/g)) {
  const tag = m[0];
  const text = (tag.match(/\btext="([^"]*)"/) || [])[1];
  const bounds = (tag.match(/\bbounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) || []).slice(1, 5);
  const pkg = (tag.match(/\bpackage="([^"]*)"/) || [])[1];
  const clickable = tag.includes('clickable="true"');
  if (!text && !clickable) continue;
  console.log(`pkg=${pkg} text=${JSON.stringify(text)} bounds=[${bounds.join(',')}] clickable=${clickable}`);
  n++;
  if (n > 200) { console.log('... (tronqué)'); break; }
}
console.log(`total: ${n} nœuds intéressants`);
