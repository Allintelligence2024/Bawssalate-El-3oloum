import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { verifierInventaire } from './verifier-inventaire-boussole.mjs';

const hash = (texte) => createHash('sha256').update(texte).digest('hex');
const ligne = (nom, texte) => `| \`${nom}\` | \`${hash(texte)}\` | TEST |`;
const a = 'modules/boussole/assets/figure.png';
const b = 'public/boussole/index.html';
async function preparer(t) {
  const racine = await mkdtemp(path.join(os.tmpdir(), 'inventaire-boussole-'));
  t.after(() => rm(racine, { recursive: true, force: true }));
  for (const dossier of ['modules/boussole/assets', 'public/boussole', 'plans/sources']) {
    await mkdir(path.join(racine, dossier), { recursive: true });
  }
  await writeFile(path.join(racine, a), 'figure');
  await writeFile(path.join(racine, b), 'html');
  const registre = path.join(racine, 'plans/sources/INVENTAIRE-BOUSSOLE-2026-11-21.md');
  await writeFile(registre, `<!-- BOUSSOLE-INVENTAIRE-DEBUT -->\n${ligne(a, 'figure')}\n${ligne(b, 'html')}\n<!-- BOUSSOLE-INVENTAIRE-FIN -->\n`);
  return { racine, registre };
}

test('le registre réel couvre les octets du laboratoire', async () => {
  const { erreurs, nombre } = await verifierInventaire();
  assert.deepEqual(erreurs, []);
  assert(nombre > 0);
});
test('des fixtures concordantes passent le contrôle de cohérence', async (t) => {
  const { racine } = await preparer(t);
  assert.deepEqual((await verifierInventaire(racine)).erreurs, []);
});
test('une ressource modifiée, même sans changement de nom, est signalée', async (t) => {
  const { racine } = await preparer(t);
  await writeFile(path.join(racine, a), 'figure changée');
  assert((await verifierInventaire(racine)).erreurs.some(e => e.includes(`Empreinte modifiée : ${a}`)));
});
test('un fichier nouveau ou manquant est signalé', async (t) => {
  const { racine } = await preparer(t);
  await writeFile(path.join(racine, 'public/boussole/nouveau.pdf'), 'PDF');
  await unlink(path.join(racine, a));
  const erreurs = (await verifierInventaire(racine)).erreurs;
  assert(erreurs.some(e => e.includes('Fichier absent de l’inventaire : public/boussole/nouveau.pdf')));
  assert(erreurs.some(e => e.includes(`Fichier inventorié absent : ${a}`)));
});
test('un registre vide ou ambigu est refusé', async (t) => {
  const { racine, registre } = await preparer(t);
  await writeFile(registre, `<!-- BOUSSOLE-INVENTAIRE-DEBUT -->\n${ligne(a, 'figure')}\n${ligne(a, 'figure')}\n<!-- BOUSSOLE-INVENTAIRE-FIN -->`);
  assert((await verifierInventaire(racine)).erreurs.some(e => e.includes('Entrée dupliquée')));
  await writeFile(registre, '<!-- BOUSSOLE-INVENTAIRE-DEBUT --><!-- BOUSSOLE-INVENTAIRE-FIN -->');
  assert((await verifierInventaire(racine)).erreurs.some(e => e.includes('Inventaire vide')));
});
