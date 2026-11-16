// Subjects Bac SVT réels — fichiers PDF depuis dossiers M/ et SE/
// Phase 1.1 : structuration des sujets d'examen pour navigation et affichage

export interface SujetExamen {
  id: string;
  annee: number;
  session: 'juin' | 'septembre' | 'rattrapage';
  serie: 'SVT' | 'Sciences Naturelles';
  titre: string;
  fichier: string; // chemin relatif depuis public/
  taille: number;
  source: 'M' | 'SE';
}

export const SUJETS_EXAMEN: SujetExamen[] = [
  // Dossier SE - Subjects 2025 officiels
  {
    id: 'bac2025_svt_1',
    annee: 2025,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac 2025 SVT — Sujet 1',
    fichier: 'examens/BAC2025_SVT_Sujet1.pdf',
    taille: 1099674,
    source: 'SE',
  },
  {
    id: 'bac2025_svt_2',
    annee: 2025,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac 2025 SVT — Sujet 2',
    fichier: 'examens/BAC2025_SVT_Sujet2.pdf',
    taille: 1158907,
    source: 'SE',
  },
  // Dossier SE - autres sujets
  {
    id: 'bac_svt_2116452',
    annee: 2024,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2024 — Sujet complet (2116452)',
    fichier: 'examens/dzexams-bac-sciences-2116452.pdf',
    taille: 2351655,
    source: 'SE',
  },
  {
    id: 'bac_svt_2311208',
    annee: 2024,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2024 — Sujet complet (2311208)',
    fichier: 'examens/dzexams-bac-sciences-2311208.pdf',
    taille: 2820909,
    source: 'SE',
  },
  {
    id: 'bac_svt_2356016',
    annee: 2023,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2023 — Sujet complet (2356016)',
    fichier: 'examens/dzexams-bac-sciences-2356016.pdf',
    taille: 2891811,
    source: 'SE',
  },
  {
    id: 'bac_svt_2581269',
    annee: 2023,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2023 — Sujet complet (2581269)',
    fichier: 'examens/dzexams-bac-sciences-2581269.pdf',
    taille: 2987862,
    source: 'SE',
  },
  {
    id: 'bac_svt_2586794',
    annee: 2022,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2022 — Sujet complet (2586794)',
    fichier: 'examens/dzexams-bac-sciences-2586794.pdf',
    taille: 3108059,
    source: 'SE',
  },
  {
    id: 'bac_svt_2728849',
    annee: 2022,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2022 — Sujet complet (2728849)',
    fichier: 'examens/dzexams-bac-sciences-2728849.pdf',
    taille: 3350043,
    source: 'SE',
  },
  {
    id: 'bac_svt_3051478',
    annee: 2021,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2021 — Sujet complet (3051478)',
    fichier: 'examens/dzexams-bac-sciences-3051478.pdf',
    taille: 3501775,
    source: 'SE',
  },
  {
    id: 'bac_svt_3509975',
    annee: 2021,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2021 — Sujet complet (3509975)',
    fichier: 'examens/dzexams-bac-sciences-3509975.pdf',
    taille: 3785824,
    source: 'SE',
  },
  {
    id: 'bac_svt_3814840',
    annee: 2020,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2020 — Sujet complet (3814840)',
    fichier: 'examens/dzexams-bac-sciences-3814840.pdf',
    taille: 3941128,
    source: 'SE',
  },
  {
    id: 'bac_svt_4380238',
    annee: 2020,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2020 — Sujet complet (4380238)',
    fichier: 'examens/dzexams-bac-sciences-4380238.pdf',
    taille: 4391442,
    source: 'SE',
  },
  {
    id: 'bac_svt_4463279',
    annee: 2019,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2019 — Sujet complet (4463279)',
    fichier: 'examens/dzexams-bac-sciences-4463279.pdf',
    taille: 4583055,
    source: 'SE',
  },
  {
    id: 'bac_svt_5906014',
    annee: 2019,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2019 — Sujet complet (5906014)',
    fichier: 'examens/dzexams-bac-sciences-5906014.pdf',
    taille: 5915393,
    source: 'SE',
  },
  // Sciences Naturelles - SE
  {
    id: 'bac_sn_1751784',
    annee: 2024,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2024 — Sujet (1751784)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1751784.pdf',
    taille: 1750903,
    source: 'SE',
  },
  {
    id: 'bac_sn_1780707',
    annee: 2023,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2023 — Sujet (1780707)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1780707.pdf',
    taille: 2203695,
    source: 'SE',
  },
  {
    id: 'bac_sn_2667863',
    annee: 2022,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2022 — Sujet (2667863)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-2667863.pdf',
    taille: 2667863,
    source: 'SE',
  },
  // Dossier M - Subjects
  {
    id: 'bac_svt_1413929',
    annee: 2024,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2024 — Sujet (1413929)',
    fichier: 'examens/dzexams-bac-sciences-1413929.pdf',
    taille: 1751241,
    source: 'M',
  },
  {
    id: 'bac_svt_1777391',
    annee: 2024,
    session: 'septembre',
    serie: 'SVT',
    titre: 'Bac SVT 2024 Septembre — Sujet (1777391)',
    fichier: 'examens/dzexams-bac-sciences-1777391.pdf',
    taille: 2103532,
    source: 'M',
  },
  {
    id: 'bac_svt_1803994',
    annee: 2023,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2023 — Sujet (1803994)',
    fichier: 'examens/dzexams-bac-sciences-1803994.pdf',
    taille: 1988523,
    source: 'M',
  },
  {
    id: 'bac_svt_1967487',
    annee: 2023,
    session: 'septembre',
    serie: 'SVT',
    titre: 'Bac SVT 2023 Septembre — Sujet (1967487)',
    fichier: 'examens/dzexams-bac-sciences-1967487.pdf',
    taille: 2177191,
    source: 'M',
  },
  {
    id: 'bac_svt_2068087',
    annee: 2022,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2022 — Sujet (2068087)',
    fichier: 'examens/dzexams-bac-sciences-2068087.pdf',
    taille: 2403488,
    source: 'M',
  },
  {
    id: 'bac_svt_2273619',
    annee: 2022,
    session: 'septembre',
    serie: 'SVT',
    titre: 'Bac SVT 2022 Septembre — Sujet (2273619)',
    fichier: 'examens/dzexams-bac-sciences-2273619.pdf',
    taille: 2060203,
    source: 'M',
  },
  {
    id: 'bac_svt_2275712',
    annee: 2021,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2021 — Sujet (2275712)',
    fichier: 'examens/dzexams-bac-sciences-2275712.pdf',
    taille: 2441144,
    source: 'M',
  },
  {
    id: 'bac_svt_2280992',
    annee: 2021,
    session: 'septembre',
    serie: 'SVT',
    titre: 'Bac SVT 2021 Septembre — Sujet (2280992)',
    fichier: 'examens/dzexams-bac-sciences-2280992.pdf',
    taille: 2641720,
    source: 'M',
  },
  {
    id: 'bac_svt_2369148',
    annee: 2020,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2020 — Sujet (2369148)',
    fichier: 'examens/dzexams-bac-sciences-2369148.pdf',
    taille: 2483008,
    source: 'M',
  },
  {
    id: 'bac_svt_2723927',
    annee: 2020,
    session: 'septembre',
    serie: 'SVT',
    titre: 'Bac SVT 2020 Septembre — Sujet (2723927)',
    fichier: 'examens/dzexams-bac-sciences-2723927.pdf',
    taille: 2724300,
    source: 'M',
  },
  {
    id: 'bac_svt_2770867',
    annee: 2019,
    session: 'juin',
    serie: 'SVT',
    titre: 'Bac SVT 2019 — Sujet (2770867)',
    fichier: 'examens/dzexams-bac-sciences-2770867.pdf',
    taille: 2884740,
    source: 'M',
  },
  // Sciences Naturelles - M
  {
    id: 'bac_sn_1077342',
    annee: 2024,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2024 — Sujet (1077342)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1077342.pdf',
    taille: 1330097,
    source: 'M',
  },
  {
    id: 'bac_sn_1343688',
    annee: 2023,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2023 — Sujet (1343688)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1343688.pdf',
    taille: 1343688,
    source: 'M',
  },
  {
    id: 'bac_sn_1482576',
    annee: 2022,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2022 — Sujet (1482576)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1482576.pdf',
    taille: 1481788,
    source: 'M',
  },
  {
    id: 'bac_sn_1554243',
    annee: 2021,
    session: 'juin',
    serie: 'Sciences Naturelles',
    titre: 'Bac Sciences Naturelles 2021 — Sujet (1554243)',
    fichier: 'examens/dzexams-bac-sciences-naturelles-1554243.pdf',
    taille: 1554243,
    source: 'M',
  },
];

export function getSujetsParAnnee(): Map<number, SujetExamen[]> {
  const map = new Map<number, SujetExamen[]>();
  for (const s of SUJETS_EXAMEN) {
    const arr = map.get(s.annee) ?? [];
    arr.push(s);
    map.set(s.annee, arr);
  }
  // Trier par session (juin avant septembre)
  for (const [, arr] of map) {
    arr.sort((a, b) => {
      const order = { juin: 0, septembre: 1, rattrapage: 2 };
      return order[a.session] - order[b.session];
    });
  }
  return map;
}

export function getSujetsParSerie(serie: 'SVT' | 'Sciences Naturelles'): SujetExamen[] {
  return SUJETS_EXAMEN.filter(s => s.serie === serie).sort((a, b) => b.annee - a.annee);
}

export function getSujetById(id: string): SujetExamen | undefined {
  return SUJETS_EXAMEN.find(s => s.id === id);
}