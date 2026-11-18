// GÉNÉRÉ par scripts/frequence-bac.py — ne pas éditer à la main (voir plans/analyse-frequence-bac.md).
// Corpus : 9 épreuves Bac SE à couche texte (2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023).
// 1 = cœur du Bac (unité ≥ 2/3 des épreuves et leçon citée ≥ 2 fois) · 2 = régulier · 3 = enrichissement / prérequis / absent.

export type Priorite = 1 | 2 | 3;

export const PRIORITE_LECON: Record<string, Priorite> = {
  // u1 · تركيب البروتين — 7/9 épreuves
  'd1-u1-l1-expression-genique': 1,
  'phase1_chapitres_1_2': 1,
  'lecon_transcription': 1,
  'phase1_chapitres_1_2_2': 1,
  'phase2_chapitres_3_4': 2,
  // u2 · البنية والوظيفة — 4/9 épreuves
  'lecon_representation': 2,
  'phase2_chapitres_3_4_2': 2,
  'phase3_chapitres_5_6': 2,
  // u3 · النشاط الإنزيمي — 8/9 épreuves
  'phase3_chapitres_5_6_2': 1,
  'lecon_activite_structure': 1,
  'phase4_chapitres_7_8': 1,
  'phase4_chapitres_7_8_2': 2,
  'd1-u3-l1-enzyme': 1,
  // u4 · الدفاع عن الذات — 7/9 épreuves
  'phase5_chapitres_9_10': 1,
  'phase5_chapitres_9_10_2': 1,
  'phase6_chapitres_11_12': 1,
  'phase6_chapitres_11_12_2': 2,
  'phase7_chapitres_13_14': 1,
  'phase7_chapitres_13_14_2': 1,
  'immunity_memory_response': 1,
  'immunity_hiv_aids': 2,
  'prerequis2AS_genetique': 3,
  // u5 · الاتصال العصبي — 7/9 épreuves
  'phase8_chapitres_15_16': 1,
  'phase8_chapitres_15_16_2': 2,
  'phase9_chapitres_17_18': 1,
  'phase9_chapitres_17_18_2': 2,
  'phase10_chapitres_19_20': 2,
  // u6 · التركيب الضوئي — 3/9 épreuves
  'phase10_chapitres_19_20_2': 2,
  'phase11_chapitres_21_22_2': 2,
  'phase12_chapitres_23_24': 2,
  'phase12_chapitres_23_24_2': 2,
  'd2-u6-l1-hill-ruben': 2,
  'd2-u6-l2-jagendorf': 2,
  'd2-u6-l3-calvin': 2,
  // u7 · التنفّس الخلوي وإنتاج ATP — 5/9 épreuves
  'phase13_chapitres_25_26': 2,
  'phase13_chapitres_25_26_2': 2,
  'phase14_chapitres_27_28': 2,
  'phase14_chapitres_27_28_2': 2,
  'd2-u7-l1-mitchell-racker': 2,
  // u8 · وحدة إثرائية (طاقة) — 0/9 épreuves
  'phase15_chapitres_29_30': 3,
  'phase15_chapitres_29_30_2': 3,
  // u9 · النشاط التكتوني للصفائح — 0/9 épreuves
  'phase16_chapitres_31_32': 3,
  'phase16_chapitres_31_32_2': 2,
  'phase17_chapitres_33_34': 3,
  'phase18_chapitres_35_36': 3,
  'phase18_chapitres_35_36_2': 3,
  // u10 · بنية الكرة الأرضية — 1/9 épreuves
  'phase19_chapitres_37_38': 3,
  'phase19_chapitres_37_38_2': 3,
  'phase20_chapitres_39_40': 3,
  // u11 · البنيات الجيولوجية — 5/9 épreuves
  'phase17_chapitres_33_34_2': 2,
  'phase20_chapitres_39_40_2': 2,
  'phase21_chapitres_41_42': 2,
  'phase21_chapitres_41_42_2': 2,
  'phase22_chapitres_43_44': 2,
  'phase22_chapitres_43_44_2': 2,
  'd3-u11-l1-migmatite': 2,
  // prérequis hors unités
  'enzyme_inhibitors': 3,
  'amino_acid_behavior': 3,
};

/** Priorité d'une leçon ; 2 (régulier) si la leçon est inconnue du corpus. */
export function prioriteLecon(lessonId: string): Priorite {
  return PRIORITE_LECON[lessonId] ?? 2;
}
