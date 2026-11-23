// Extraire les textes et nœuds cliquables d'un dump uiautomator XML.
import { readFileSync } from 'node:fs';
const src = process.argv[2];
const s = readFileSync(src, 'utf8');
const re = /<node[^>]*>/g;
let m;
const out = [];
while ((m = re.exec(s))) {
  const a = m[0];
  const pick = (k) => (a.match(new RegExp(k + '="([^"]*)"')) || [])[1] || '';
  const text = pick('text');
  const desc = pick('content-desc');
  const clickable = a.includes('clickable="true"');
  const cls = pick('class');
  const bounds = pick('bounds');
  if (text || desc) out.push(`${clickable ? '[CLICK] ' : ''}${text || desc}  <${cls}> ${bounds}`);
}
console.log(out.join('\n') || '(aucun texte)');
console.log('TOTAL nœuds:', (s.match(/<node/g) || []).length);
