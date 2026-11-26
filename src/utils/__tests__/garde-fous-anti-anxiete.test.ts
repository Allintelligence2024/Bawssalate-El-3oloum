// Garde-fous « anti-anxiété » (plan directeur §6) — vérifiés par grep sur les fichiers v0.11.
//
// Trois promesses sont testables mécaniquement :
//   1. aucune note /20, aucun pourcentage présenté comme une note ;
//   2. aucun « Game Over », aucune sanction, aucun échec définitif ;
//   3. aucun emoji récent (l'appareil cible affiche des tofu).
//
// Les commentaires sont retirés avant contrôle : ils ont le droit de *nommer* ce que le produit
// refuse (« aucun Game Over »), c'est même ainsi que la règle se transmet.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FICHIERS = [
  'src/utils/briques.ts',
  'src/utils/amelioration.ts',
  'src/utils/microNoeuds.ts',
  'src/utils/planDuJour.ts',
  'src/utils/evenements.ts',
  'src/utils/accesSujets.ts',
  'src/data/briques/types.ts',
  'src/data/briques/u1.ts',
  'src/data/briques/sujet-2025-1.ts',
  'src/components/ConstructeurReponse.tsx',
  'src/components/Ecran123.tsx',
  'src/components/EcranBriques.tsx',
  'src/components/Defi60.tsx',
  'src/components/MicroNoeuds.tsx',
  'src/components/JourneeReparation.tsx',
  'src/components/TiroirBoussole.tsx',
  'src/components/CarteBoucliersSM2.tsx',
  'src/components/CarteTropheesTactiques.tsx',
  'src/components/SujetGuide.tsx',
  'src/utils/parcoursSujet.ts',
  'src/data/audioMourchid.ts',
  'src/utils/audioMourchid.ts',
  'src/components/LecteurAudioMourchid.tsx',
  'src/components/AudioMourchidBloc.tsx',
];

/** Code seul : commentaires de ligne et blocs retirés (grossier, suffisant pour un grep-guard). */
export function sansCommentaires(texte: string): string {
  const sansBlocs = texte.replace(/\/\*[\s\S]*?\*\//g, '');
  return sansBlocs
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('//') && !l.trimStart().startsWith('*'))
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');
}

const code = (chemin: string) =>
  sansCommentaires(readFileSync(new URL(`../../../${chemin}`, import.meta.url), 'utf8'));

/** Emoji / pictogrammes récents. Les signes typographiques du dépôt (✓ → ⚠) restent permis. */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{FE0F}]/u;

describe('garde-fous anti-anxiété sur les fichiers v0.11', () => {
  it.each(FICHIERS)('%s : aucune note /20 dans le code', (fichier) => {
    const texte = code(fichier);
    expect(texte).not.toMatch(/\/\s*20\b/);
    expect(texte).not.toMatch(/sur\s*20\b/);
  });

  it.each(FICHIERS)('%s : aucun Game Over ni échec définitif', (fichier) => {
    const texte = code(fichier).toLowerCase();
    expect(texte).not.toContain('game over');
    expect(texte).not.toContain('gameover');
    expect(texte).not.toMatch(/نقاط\s+ضائعة|لقد\s+خسرت/);
  });

  it.each(FICHIERS)('%s : aucun emoji', (fichier) => {
    expect(code(fichier)).not.toMatch(EMOJI);
  });
});

describe('pas de texte latin dans les copies arabes', () => {
  /** Une chaîne arabe ne doit pas contenir de mot latin collé (cf. « ما ربحتwall »). */
  const LATIN_DANS_ARABE = /[\u0600-\u06FF][a-zA-Z]{2,}|[a-zA-Z]{2,}[\u0600-\u06FF]/;

  it.each([
    'src/components/TiroirBoussole.tsx',
    'src/components/Ecran123.tsx',
    'src/components/ConstructeurReponse.tsx',
    'src/components/Defi60.tsx',
    'src/components/CarteBoucliersSM2.tsx',
    'src/data/audioMourchid.ts',
    'src/components/LecteurAudioMourchid.tsx',
  ])('%s', (fichier) => {
    const fautives = code(fichier)
      .split('\n')
      .filter((l) => LATIN_DANS_ARABE.test(l));
    expect(fautives).toEqual([]);
  });
});

describe('l’atelier 1-2-3 ne verrouille rien', () => {
  it.each([
    'src/components/EcranBriques.tsx',
    'src/components/Ecran123.tsx',
    'src/components/Defi60.tsx',
    'src/components/SujetGuide.tsx',
  ])(
    '%s : aucun état « verrouillé » ni « bloqué »',
    (fichier) => {
      expect(code(fichier)).not.toMatch(/verrouill|bloqué|محظور|مقفل/);
    },
  );

  it('Defi60 n’affiche aucun échec et reste quittable à tout moment', () => {
    const texte = code('src/components/Defi60.tsx');
    expect(texte).not.toMatch(/خسرت|فشلت/);
    expect(texte).toMatch(/onFermer/);
  });
});
