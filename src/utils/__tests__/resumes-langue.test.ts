// Les résumés dorés sont lus par l'élève : leurs champs arabes ne doivent contenir ni fuite
// de français, ni les coquilles scientifiques corrigées en relecture. Ce test empêche leur
// retour silencieux (une coquille arabe se relit mal en diff).
import { describe, it, expect } from 'vitest';
import { LESSON_GOLD_SUMMARIES } from '../../data/lessonGoldSummaries';

const CHAMPS_ARABES = ['missionAr', 'evidenceAr', 'commonErrorAr', 'recallQuestionAr'] as const;

/** Mots français courants (pas les abréviations scientifiques ATP, ADN, Vmax, pHi…). */
const MOTS_FRANCAIS = /\b(il|elle|les|des|est|sont|reste|seuls|sites|saturés|dans|pour|avec|que|qui|ne|pas)\b/;

/** Coquilles relevées en relecture : chacune a une forme correcte dans le dépôt. */
const COQUILLES = [
  'التمسية', // → التمسّخ (dénaturation)
  'المتتهج', // → المثار (chlorophylle excitée)
  'الارتصام', // → الارتصاص (agglutination)
  'فانعطمت', // forme fautive
  'أرجل كافية', // → القطعة Fc / أرجل كاذبة
  'المرصع', // → الراصّ (pression)
  'البذرة Granum', // → البذيرة (granum ≠ graine)
  'هرمون الأنترلوكين', // l'IL-2 est un messager chimique
  'الناقل T₆', // → المعقّد IV
  'منحنى التصلب الجاف', // → منحنى بداية الانصهار
];

describe('résumés dorés — langue et coquilles', () => {
  it('aucune fuite de français dans les champs arabes', () => {
    const fuites: string[] = [];
    for (const [id, r] of Object.entries(LESSON_GOLD_SUMMARIES)) {
      for (const champ of CHAMPS_ARABES) {
        const texte = (r as unknown as Record<string, string>)[champ] ?? '';
        if (MOTS_FRANCAIS.test(texte)) fuites.push(`${id}.${champ}: ${texte.slice(0, 80)}`);
      }
    }
    expect(fuites).toEqual([]);
  });

  it('les coquilles corrigées ne reviennent pas', () => {
    const toutesLesChaines = Object.entries(LESSON_GOLD_SUMMARIES).flatMap(([id, r]) =>
      [
        ...CHAMPS_ARABES.map((c) => [id, (r as unknown as Record<string, string>)[c] ?? ''] as const),
        ...((r.mechanismAr ?? []).map((t) => [id, t] as const)),
        ...((r.vocabulary ?? []).map((t) => [id, t] as const)),
        ...((r.bacSentenceFrameAr ? [[id, r.bacSentenceFrameAr] as const] : [])),
      ],
    );
    const trouvees: string[] = [];
    for (const [id, texte] of toutesLesChaines) {
      for (const c of COQUILLES) if (texte.includes(c)) trouvees.push(`${id}: « ${c} »`);
    }
    expect(trouvees).toEqual([]);
  });

  it('chaque résumé garde 4 à 8 étapes causales et un vocabulaire non vide', () => {
    for (const [id, r] of Object.entries(LESSON_GOLD_SUMMARIES)) {
      expect(r.mechanismAr.length, id).toBeGreaterThanOrEqual(4);
      expect(r.mechanismAr.length, id).toBeLessThanOrEqual(8);
      expect(r.vocabulary.length, id).toBeGreaterThanOrEqual(4);
    }
  });
});
