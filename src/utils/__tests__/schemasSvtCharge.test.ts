// Le registre des schémas est chargé une seule fois par session : la promesse est
// mémorisée par module, et oubliée seulement en cas d'échec (pour permettre un nouvel
// essai au retour du réseau). Ce test verrouille ce contrat, qui évite le « flash »
// vide à chaque ouverture de leçon.

import { describe, expect, it, beforeEach } from 'vitest';
import { chargerSchemasSvt, oublierSchemasSvt } from '../schemasSvtCharge';

beforeEach(() => {
  oublierSchemasSvt();
});

describe('chargerSchemasSvt', () => {
  it('renvoie la même promesse pour deux appels successifs', () => {
    const premier = chargerSchemasSvt();
    const second = chargerSchemasSvt();
    expect(premier).toBe(second);
  });

  it('résout le registre complet des schémas', async () => {
    const liste = await chargerSchemasSvt();
    expect(liste.length).toBeGreaterThan(0);
    expect(liste.every((i) => typeof i.lessonId === 'string')).toBe(true);
  });

  it('oublie la promesse quand on la réinitialise', () => {
    const premier = chargerSchemasSvt();
    oublierSchemasSvt();
    const second = chargerSchemasSvt();
    expect(premier).not.toBe(second);
  });
});
