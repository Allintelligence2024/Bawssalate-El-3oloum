// @vitest-environment jsdom
// Tests du chargement à la demande, du cache module (préchauffage) et de la panne hors ligne
// du chunk `schemasSvt` dans `IllustrationsLecon`.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import IllustrationsLecon, { MESSAGE_HORS_LIGNE_SCHEMAS } from '../IllustrationsLecon';
import type { IllustrationLecon } from '../../data/illustrationsTypes';
import {
  lireSchemasSvtCache,
  prechaufferSchemasSvt,
  reinitialiserChargeurSchemasSvtPourTests,
} from '../../utils/schemasSvtChargeur';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const SCHEMA_EXEMPLE: IllustrationLecon = {
  id: 'schema-test-u1',
  lessonId: 'd1-u1-l1-expression-genique',
  uniteId: 'u1',
  typeVisuel: 'svg_vectoriel',
  fichier: 'u1-flux-information.svg',
  largeur: 1200,
  hauteur: 760,
  titreAr: 'مخطط تجريبي لتدفق المعلومة الوراثية',
  altAr: 'مخطط تجريبي للنواة والهيولى.',
  legendeAr: '<span><strong>المخطط</strong> — تجربة تحميل.</span>',
  annotations: [
    { num: 1, x: 20, y: 20, labelAr: 'النواة' },
    { num: 2, x: 50, y: 50, labelAr: 'الهيولى' },
    { num: 3, x: 70, y: 50, labelAr: 'الريبوزوم' },
    { num: 4, x: 80, y: 70, labelAr: 'البروتين' },
  ],
  statut: 'a_valider_enseignant',
  reviewed: false,
};

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

beforeEach(() => {
  reinitialiserChargeurSchemasSvtPourTests();
});

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
  reinitialiserChargeurSchemasSvtPourTests();
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => racine!.render(noeud));
  return hote;
}

describe('IllustrationsLecon — chargement, préchauffage et hors ligne du chunk schemasSvt', () => {
  it('affiche un état léger de chargement tant que la promesse n’est pas résolue, puis rend le schéma', async () => {
    let resoudre!: (v: { SCHEMAS_SVT: IllustrationLecon[] }) => void;
    const promesse = new Promise<{ SCHEMAS_SVT: IllustrationLecon[] }>((resolve) => {
      resoudre = resolve;
    });
    const importeur = vi.fn(() => promesse);
    reinitialiserChargeurSchemasSvtPourTests(importeur);

    const zone = await rendre(<IllustrationsLecon lessonId="d1-u1-l1-expression-genique" />);
    expect(zone.querySelector('section[aria-busy="true"]')).not.toBeNull();
    expect(zone.querySelector('[role="status"]')?.textContent).toContain('جارٍ تحميل');
    expect(zone.querySelector('img')).toBeNull();

    await act(async () => {
      resoudre({ SCHEMAS_SVT: [SCHEMA_EXEMPLE] });
      await promesse;
    });

    expect(zone.querySelector('section[aria-busy="true"]')).toBeNull();
    expect(zone.querySelector('img')?.getAttribute('src')).toContain('u1-flux-information.svg');
    expect(lireSchemasSvtCache()).toEqual([SCHEMA_EXEMPLE]);
    expect(importeur).toHaveBeenCalledTimes(1);
  });

  it('supprime tout clignotement null sur les leçons suivantes grâce au cache module et au préchauffage', async () => {
    const importeur = vi.fn(async () => ({ SCHEMAS_SVT: [SCHEMA_EXEMPLE] }));
    reinitialiserChargeurSchemasSvtPourTests(importeur);

    prechaufferSchemasSvt();
    await Promise.resolve();
    await Promise.resolve();
    expect(lireSchemasSvtCache()).toEqual([SCHEMA_EXEMPLE]);

    // Rendu synchrone sans aucun état de chargement ni nouvel import dynamique.
    const zone = await rendre(<IllustrationsLecon lessonId="d1-u1-l1-expression-genique" />);
    expect(zone.querySelector('section[aria-busy="true"]')).toBeNull();
    expect(zone.querySelector('img')?.getAttribute('src')).toContain('u1-flux-information.svg');
    expect(importeur).toHaveBeenCalledTimes(1);

    // Une leçon sans schéma ne rend rien une fois le registre en cache.
    act(() => racine?.unmount());
    hote?.remove();
    const vide = await rendre(<IllustrationsLecon lessonId="lecon-sans-visuel" />);
    expect(vide.innerHTML).toBe('');
  });

  it('affiche le message arabe sobre en cas d’échec réseau hors ligne, puis récupère au retour en ligne', async () => {
    const importeur = vi
      .fn<() => Promise<{ SCHEMAS_SVT: IllustrationLecon[] }>>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch dynamically imported module'))
      .mockResolvedValueOnce({ SCHEMAS_SVT: [SCHEMA_EXEMPLE] });
    reinitialiserChargeurSchemasSvtPourTests(importeur);

    const zone = await rendre(<IllustrationsLecon lessonId="d1-u1-l1-expression-genique" />);
    expect(zone.querySelector('[role="status"]')?.textContent).toBe(MESSAGE_HORS_LIGNE_SCHEMAS);
    expect(zone.textContent).toContain(
      'تعذّر تحميل المخطّط دون اتصال — افتح الدرس مرّة واحدة بالإنترنت لحفظه',
    );
    expect(lireSchemasSvtCache()).toBeNull();

    // Retour en ligne : un nouveau montage retente le chargement et réussit.
    act(() => racine?.unmount());
    hote?.remove();
    const reprise = await rendre(<IllustrationsLecon lessonId="d1-u1-l1-expression-genique" />);
    expect(reprise.querySelector('img')?.getAttribute('src')).toContain('u1-flux-information.svg');
    expect(importeur).toHaveBeenCalledTimes(2);
  });
});
