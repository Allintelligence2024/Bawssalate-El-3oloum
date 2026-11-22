// §10.3 — le travail de l'entraîneur survit à une sauvegarde / restauration.
//
// Défaut trouvé en revue : `etatSchema` est un `z.object` zod, qui SUPPRIME les clés
// inconnues. `maitriseSujets` et `brouillonsSujets` n'y figuraient pas, donc importer une
// sauvegarde « complète » rendait l'élève devant un entraîneur vide — silencieusement, alors
// que le README promet une sauvegarde complète. Ces tests figent la correction.
import { describe, it, expect } from 'vitest';
import { lireSauvegarde } from '../backup';

// `progression` et `jalons` sont exigés par le schéma : on part d'un état minimal valide
// et on ajoute le champ testé, pour ne pas confondre « fichier incomplet » et « champ perdu ».
const base = {
  version: 3, progression: {}, jalons: {}, notes: [], carnet: [], journal: [],
  kafaa: {}, drills: {}, ateliers: {}, minutesTotales: 0,
};
const paquet = (etat: Record<string, unknown>) => ({ application: 'x', version: 3, etat: { ...base, ...etat } });

describe('sauvegarde — travail de l’entraîneur', () => {
  it('conserve les auto-évaluations 0/1/2', () => {
    const lu = lireSauvegarde(paquet({ maitriseSujets: { '2023-1': { e1p0c0: 2, e1p0c1: 0 } } }));
    expect(lu?.etat.maitriseSujets).toEqual({ '2023-1': { e1p0c0: 2, e1p0c1: 0 } });
  });

  it('conserve les brouillons rédigés', () => {
    const lu = lireSauvegarde(paquet({ brouillonsSujets: { '2023-1': { e1p0c0: 'إجابة التلميذ' } } }));
    expect(lu?.etat.brouillonsSujets).toEqual({ '2023-1': { e1p0c0: 'إجابة التلميذ' } });
  });

  it('refuse un niveau hors {0,1,2} au lieu de le ramener à 0', () => {
    // Une note /20 glissée dans le champ de maîtrise doit faire échouer l'import :
    // l'accepter reviendrait à réintroduire une notation chiffrée.
    expect(lireSauvegarde(paquet({ maitriseSujets: { '2023-1': { e1p0c0: 17 } } }))).toBeNull();
  });

  it('refuse une chaîne là où un niveau est attendu', () => {
    expect(lireSauvegarde(paquet({ maitriseSujets: { '2023-1': { e1p0c0: '2' } } }))).toBeNull();
  });

  it('accepte l’absence de ces champs (anciennes sauvegardes)', () => {
    const lu = lireSauvegarde(paquet({ journal: [] }));
    expect(lu).not.toBeNull();
    expect(lu?.etat.maitriseSujets).toBeUndefined();
  });

  it('borne la taille des brouillons comme le reste du texte libre', () => {
    const enorme = 'ا'.repeat(10001);
    expect(lireSauvegarde(paquet({ brouillonsSujets: { '2023-1': { e1p0c0: enorme } } }))).toBeNull();
  });
});
