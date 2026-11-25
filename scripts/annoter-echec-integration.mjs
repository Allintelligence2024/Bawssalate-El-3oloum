// Recopie les lignes utiles d'un échec d'intégration navigateur dans une annotation de check.
// Pourquoi : le log de job GitHub exige une authentification, alors que les annotations sont
// lisibles par l'API et par l'onglet « Checks » — c'est le seul endroit où l'erreur Playwright
// (locator, timeout, assertion) reste consultable sans se connecter.
//
// Usage (CI, après l'étape « Tester l'intégration sur le build local ») :
//   node scripts/annoter-echec-integration.mjs
// Ne fait jamais échouer le job : diagnostic, pas vérification.
import { readFileSync } from 'node:fs';

const SOURCES = ['/tmp/boussole-integration.log', '/tmp/boussole-preview.log'];

function lire() {
  for (const chemin of SOURCES) {
    try {
      const texte = readFileSync(chemin, 'utf8');
      if (texte.trim()) return texte;
    } catch {
      /* fichier absent : on essaie le suivant */
    }
  }
  return '';
}

/** Les messages d'erreur de Playwright et de node:assert, sans les dumps de texte de page. */
function lignesUtiles(texte) {
  const motif = /waiting for|locator|Error|Timeout|timed out|assert|expected|actual|\.cjs:\d+|not ok/i;
  const gardees = texte
    .split(/\r?\n/)
    .filter((l) => motif.test(l) && l.length < 400)
    .slice(-40);
  if (gardees.length) return gardees.join('\n');
  return texte.trim().split(/\r?\n/).slice(-20).join('\n');
}

/** GitHub exige ces échappements pour une annotation multi-lignes. */
function echapper(texte) {
  return texte.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

const texte = lire();
if (!texte) {
  console.log('::error title=Intégration navigateur::Aucune sortie capturée (ni test, ni serveur).');
  process.exit(0);
}
const resume = lignesUtiles(texte).slice(-3500);
console.log(`::error title=Intégration navigateur::${echapper(resume)}`);
