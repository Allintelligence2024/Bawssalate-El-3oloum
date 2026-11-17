# Registre des sujets de Bac — P0.1 (état réel, 16/11/2026, 2e lecture)

> **Statut global : AUCUN de ces fichiers n'est publiable dans l'app.** Source non officielle (sites de
> partage dzexams.com / ency-education.com d'après les métadonnées PDF — ce sont des copies d'épreuves ONEC,
> mais obtenues sans autorisation), **droits de reproduction non clarifiés**, et 15 fichiers sur 32 sont des
> épreuves de la **série Mathématiques** (programme SVT différent, durée 2 h 30), hors périmètre d'une app
> Sciences Expérimentales.
>
> Les originaux sont archivés ici (`plans/sources/sujets/{SE,M}/`) comme **matériau de travail** pour P1.1
> (transcription structurée + corrigé-barème signé) et P1.7 (fréquences). Ils ne sont **plus** copiés dans
> `public/` (−81 Mo dans `dist/` et l'APK) et aucun écran élève ne les référence.
>
> **Méthode (deux passes) :** (1) `pypdf` sur les 3 premières pages pour les 19 fichiers à couche texte ;
> (2) **lecture à l'œil** de l'en-tête de la page 1 (rendu `pymupdf` 100 dpi) pour les 13 scans et pour les
> 5 fichiers texte dont l'extraction était ambiguë. Année, session, série et durée sont donc toutes **lues sur
> l'épreuve**, jamais déduites du nom de fichier (les nombres des noms `dzexams-…-NNNNNNN.pdf` sont des tailles
> en octets). Colonne « Vérif. » : `texte`, `œil`, ou `texte + œil`.
>
> **Durée officielle (lue sur 18 en-têtes, constante 2013→2026) : 4 h 30 en Sciences Expérimentales,
> 2 h 30 en Mathématiques.** Le « 3 h 30 » du plan GLM est donc faux ; le chrono de l'examen blanc (P1.1/P1.2)
> peut être calibré sur 4 h 30 pour un sujet complet.
>
> **Ce qui manque pour passer la porte P0.1 :** (1) source officielle ou autorisation écrite de reproduction ;
> (2) comparaison des doublons 2016 SE ; (3) décision formelle d'écarter la série M.


## A. Dossier `SE/` — 17 fichiers

| Fichier | Taille | Pages | SHA-256 (16) | Vérif. | Année | Session | Série | Durée | Source (métadonnées) | Note | Statut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dzexams-bac-sciences-4463279.pdf` | 4.4 Mo | 17 | `0ee9df94b5714f08` | œil | 2013 | جوان | علوم تجريبية | 04 سا و30 د | dzexams.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-4380238.pdf` | 4.2 Mo | 22 | `693cd1b6d48691b0` | œil | 2014 | جوان | علوم تجريبية | 04 سا و30 د | dzexams.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-5906014.pdf` | 5.6 Mo | 20 | `cccdd811c6f9d807` | œil | 2015 | جوان | علوم تجريبية | 04 سا و30 د | dzexams.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2586794.pdf` | 3.0 Mo | 21 | `a5db9d3a69b9e32f` | texte + œil | 2016 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com | texte lisible mais année absente de l'extraction ; lue à l'œil | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-3814840.pdf` | 3.8 Mo | 23 | `bd0819c2f54c0c6f` | œil | 2016 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com | doublon probable de 2586794 (même année, à comparer) | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2116452.pdf` | 2.2 Mo | 18 | `57420110d44bf62c` | texte | 2017 | استثنائية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2581269.pdf` | 2.8 Mo | 16 | `ac02599bef250dac` | texte | 2017 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-3509975.pdf` | 3.6 Mo | 19 | `86f447567cb68404` | texte | 2018 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-3051478.pdf` | 3.3 Mo | 19 | `65066e97dffe405f` | texte | 2019 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2356016.pdf` | 2.8 Mo | 19 | `9be1e50bf1d55d51` | texte | 2020 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2728849.pdf` | 3.2 Mo | 21 | `4086ce3ea7e00a8c` | texte | 2021 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-2311208.pdf` | 2.7 Mo | 20 | `2f83ecf8bbc1a57d` | texte | 2022 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-naturelles-1780707.pdf` | 2.1 Mo | 20 | `f7a1b27bd69def03` | texte | 2023 | عادية | علوم تجريبية | 04 سا و30 د | ency-education.com |  | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-naturelles-1751784.pdf` | 1.7 Mo | 20 | `2d49307170947a69` | œil | 2024 | عادية | علوم تجريبية | 04 سا و30 د | dzexams.com | code BAC2024/SSA24/CH03R05 | 🟡 identifié — droits non clarifiés |
| `BAC2025_SVT_Sujet1.pdf` | 1.0 Mo | 11 | `2f81965e9afd2ea1` | œil | 2025 | عادية | علوم تجريبية | 04 سا و30 د | dzexams.com | sujet 1 (pages 1–5) ; code BAC2025/SJ25/#CH02R03# | 🟡 identifié — droits non clarifiés |
| `BAC2025_SVT_Sujet2.pdf` | 1.1 Mo | 11 | `8f771a08b57f33e5` | œil | 2025 | عادية | علوم تجريبية | 04 سا و30 د | dzexams.com | « الموضوع الثاني » seul (pages 6–10) de la même épreuve | 🟡 identifié — droits non clarifiés |
| `dzexams-bac-sciences-naturelles-2667863.pdf` | 2.5 Mo | 23 | `fa7cb5ab28a397cb` | œil | 2026 | عادية | علوم تجريبية | 04 سا و30 د | dzexams.com | « الدورة: 2026 » — session de juin 2026 | 🟡 identifié — droits non clarifiés |

## B. Dossier `M/` — 15 fichiers

| Fichier | Taille | Pages | SHA-256 (16) | Vérif. | Année | Session | Série | Durée | Source (métadonnées) | Note | Statut |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dzexams-bac-sciences-2770867.pdf` | 2.8 Mo | 11 | `7162e3e4d2aa02c8` | œil | 2013 | جوان | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2369148.pdf` | 2.4 Mo | 11 | `d82273f23d19f4f1` | œil | 2014 | جوان | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2723927.pdf` | 2.6 Mo | 10 | `d1883559c0acc950` | œil | 2015 | جوان | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1413929.pdf` | 1.7 Mo | 11 | `482060bc44ac597b` | texte + œil | 2016 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1803994.pdf` | 1.9 Mo | 11 | `dea4d174b9814720` | texte | 2017 | استثنائية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2275712.pdf` | 2.3 Mo | 9 | `2824068daa4b5dc5` | texte + œil | 2017 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1967487.pdf` | 2.1 Mo | 12 | `0a4ae96d9deb4489` | texte | 2018 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2280992.pdf` | 2.5 Mo | 10 | `e9237e1a81f7d2cd` | texte | 2019 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2273619.pdf` | 2.0 Mo | 10 | `70140246c910b3e9` | texte | 2020 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2068087.pdf` | 2.3 Mo | 12 | `ac438bdd5561bc29` | texte | 2021 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1777391.pdf` | 2.0 Mo | 13 | `4467bc9c48de18d6` | texte + œil | 2022 | عادية | رياضيات | 02 سا و30 د | ency-education.com | corrige la lecture « 2222 » de l'extraction | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-naturelles-1077342.pdf` | 1.3 Mo | 13 | `da6ccaf666fb790a` | texte | 2023 | عادية | رياضيات | 02 سا و30 د | ency-education.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-naturelles-1482576.pdf` | 1.4 Mo | 13 | `8ccb6407c4714d46` | œil | 2024 | عادية | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-naturelles-1554243.pdf` | 1.5 Mo | 13 | `ed091e9e98f90d32` | œil | 2025 | عادية | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-naturelles-1343688.pdf` | 1.3 Mo | 14 | `73df96aee09e82e6` | œil | 2026 | عادية | رياضيات | 02 سا و30 د | dzexams.com |  | ❌ hors périmètre (série M) |

## C. Synthèse

- 32 fichiers, 80 Mo. Tous identifiés (année + série + durée) après la 2e lecture.
- **Sciences Expérimentales : 17 fichiers**, années 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 — soit **14 années distinctes** (3 doublons : 2016 ×2, 2017 ordinaire + exceptionnelle, 2025 sujet 1 + sujet 2 d'une même épreuve).
- **Mathématiques : 15 fichiers**, années 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 — hors périmètre, conservés uniquement comme référence.
- Sessions : « جوان » (2013–2015) ou « دورة NNNN » (ordinaire) ; une seule session non ordinaire : **الدورة الاستثنائية 2017** (SE et M). Aucune session « septembre ».
- Historique : le PR #1 déclarait des années 2019–2025, des sessions « septembre » et une série « Sciences Naturelles » — contredites par le contenu (voir `plans/preuves/ANALYSE-PR1.md` §2 R3).

## D. Prochaines actions (chemin critique du plan)

1. **Droits** : demander à l'ONEC la liste officielle des sujets SE 2013–2026 et les conditions de reproduction ; à défaut, repli P1.1 bis : sujets blancs rédigés par le correcteur, **étiquetés « sujet blanc »**, calibrés sur 4 h 30.
2. **P1.1** : transcrire en priorité les 6 sujets SE les plus récents (2020 → 2026) en exercices structurés (QCM / enquête / synthèse) avec corrigé-barème signé — jamais un lien vers le PDF.
3. **P1.7** : l'analyse de fréquence peut démarrer sur les 14 années SE (2013–2026) sans attendre les droits, puisqu'elle ne reproduit pas les épreuves.

*16/11 — P1.1 phase « structure » : 2020, 2021, 2023 SE structurés dans `src/data/sujetsOfficiels.ts` (consignes + barème + unités, sans documents ni corrigé). Les fichiers SE à couche texte incluent la **correction officielle ONEC** après le sujet (ex. 2023 : pages 11–20) — matériau pour la phase 2 une fois les droits clarifiés. 2022 : couche texte illisible (glyphes privés), à traiter par rendu image ; 2024–2026 : scans.*
