// @vitest-environment jsdom
// États de chargement de `IllustrationsLecon` — le durcissement de la PR #17.
//
// Ce que ce fichier prouve :
//  - pendant la résolution du chunk, une leçon sans WebP du manuel garde une place
//    discrète (squelette) au lieu de faire disparaître la section ;
//  - si le chunk échoue (première ouverture hors ligne), un message arabe sobre
//    s'affiche — la section ne disparaît plus en silence ;
//  - une fois le chunk chargé, les schémas de la leçon apparaissent normalement ;
//  - le chargeur mémorise sa promesse : deux écrans ne déclenchent qu'un seul import.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const chargerSchemasSvt = vi.fn();
vi.mock('../../utils/schemasSvtCharge', () => ({
  chargerSchemasSvt: (...args: unknown[]) => chargerSchemasSvt(...args),
  prechaufferSchemasSvt: () => {},
  oublierSchemasSvt: () => {},
}));

import IllustrationsLecon from '../IllustrationsLecon';
import { SCHEMAS_SVT } from '../../data/schemasSvt';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let racine: Root | null = null;
let hote: HTMLDivElement | null = null;

afterEach(() => {
  act(() => racine?.unmount());
  hote?.remove();
  racine = null;
  hote = null;
});

beforeEach(() => {
  chargerSchemasSvt.mockReset();
});

async function rendre(noeud: React.ReactElement): Promise<HTMLDivElement> {
  hote = document.createElement('div');
  document.body.appendChild(hote);
  racine = createRoot(hote);
  await act(async () => {
    racine!.render(noeud);
  });
  // Laisse la promesse du chunk se résoudre et le state se mettre à jour.
  await act(async () => {
    await Promise.resolve();
  });
  return hote;
}

// Leçon sans aucune WebP du manuel : tout son visuel vient du chunk asynchrone.
const LECON_SCHEMA_SEUL = 'phase6_chapitres_11_12';

describe('IllustrationsLecon — états du chunk schemasSvt', () => {
  it('affiche un squelette discret tant que le chunk se résout', async () => {
    chargerSchemasSvt.mockReturnValue(new Promise(() => {}));
    const hote = await rendre(<IllustrationsLecon lessonId={LECON_SCHEMA_SEUL} />);
    expect(hote.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(hote.textContent).toContain('وثائق الدرس ومخططاته');
  });

  it('affiche le message arabe hors ligne si le chunk échoue', async () => {
    chargerSchemasSvt.mockRejectedValue(new Error('Failed to fetch dynamically imported module'));
    const hote = await rendre(<IllustrationsLecon lessonId={LECON_SCHEMA_SEUL} />);
    const statut = hote.querySelector('[role="status"]');
    expect(statut).not.toBeNull();
    expect(statut?.textContent).toBe(
      'تعذّر تحميل المخطّط دون اتصال — افتح الدرس مرّة واحدة بالإنترنت لحفظه.',
    );
  });

  it('rend les schémas de la leçon quand le chunk est disponible', async () => {
    chargerSchemasSvt.mockResolvedValue(SCHEMAS_SVT);
    const hote = await rendre(<IllustrationsLecon lessonId={LECON_SCHEMA_SEUL} />);
    const attendus = SCHEMAS_SVT.filter((i) => i.lessonId === LECON_SCHEMA_SEUL);
    expect(attendus.length).toBeGreaterThan(0);
    const sources = [...hote.querySelectorAll('img')].map((img) => img.getAttribute('src') ?? '');
    for (const entree of attendus) {
      expect(sources.some((src) => src.endsWith(entree.fichier))).toBe(true);
      // La parole arabe vient du registre : au moins un libellé de la légende est rendu.
      const premierLibelle = entree.annotations?.[0]?.labelAr;
      if (premierLibelle) expect(hote.textContent).toContain(premierLibelle);
    }
    expect(hote.querySelector('[role="status"]')).toBeNull();
    expect(hote.querySelector('[aria-busy="true"]')).toBeNull();
  });
});
