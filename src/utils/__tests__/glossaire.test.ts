// P2.5 — glossaire AR↔FR : couverture des vocabulaires, unicité, recherche bilingue
import { describe, it, expect } from 'vitest';
import { GLOSSAIRE, termeGlossaire, chercherGlossaire } from '../../data/glossaire';
import { LESSON_GOLD_SUMMARIES } from '../../data/lessonGoldSummaries';

describe('glossaire', () => {
  it('≥ 200 termes, entrées AR uniques, FR non vide', () => {
    expect(GLOSSAIRE.length).toBeGreaterThanOrEqual(200);
    expect(new Set(GLOSSAIRE.map((t) => t.ar)).size).toBe(GLOSSAIRE.length);
    for (const t of GLOSSAIRE) expect(t.fr.trim().length, t.ar).toBeGreaterThan(1);
  });

  it('couvre la grande majorité des mots-clés des fiches (hors symboles/valeurs)', () => {
    const symbole = /^[A-Za-z0-9⁺⁻₀-₉¹²³⁴⁵⁶⁷⁸⁹.,/−\-\s°%·]+$|mV|°C|¹⁸O|¹⁴CO|³H|²³|⁴⁰|Cl⁻|ADP|NAD|FADH|ATP$/;
    const mots = [...new Set(Object.values(LESSON_GOLD_SUMMARIES).flatMap((l) => l.vocabulary))];
    const conceptuels = mots.filter((m) => !symbole.test(m));
    const manquants = conceptuels.filter((m) => !termeGlossaire(m));
    // seuil : au plus 12 % des termes conceptuels sans entrée (listés pour le dépôt 2)
    expect(manquants.length, manquants.join(' | ')).toBeLessThanOrEqual(Math.ceil(conceptuels.length * 0.12));
  });

  it('distingue la glycosyltransférase du transporteur de glucose', () => {
    expect(termeGlossaire('إنزيم ناقل السكر')?.fr).toBe('glycosyltransférase');
    expect(termeGlossaire('ناقل الغلوكوز')?.fr).toBe('transporteur du glucose');
  });

  it('recherche bilingue : « كالفن » et « calvin » trouvent le cycle de Calvin ; alias et normalisation', () => {
    expect(chercherGlossaire('كالفن').some((t) => t.fr === 'cycle de Calvin')).toBe(true);
    expect(chercherGlossaire('calvin').some((t) => t.ar === 'حلقة كالفن')).toBe(true);
    expect(termeGlossaire('التشبّع')?.fr).toBe('saturation');
    expect(termeGlossaire('الموقع النشط')?.fr).toBe('site actif');
    expect(chercherGlossaire('x')).toEqual([]);
  });
});
