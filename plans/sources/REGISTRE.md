# Registre des sujets de Bac — P0.1 (état réel, 16/11/2026)

> **Statut global : AUCUN de ces fichiers n'est publiable dans l'app.** Source non officielle (sites de
> partage dzexams.com / ency-education.com, d'après les métadonnées PDF), **droits de reproduction non
> clarifiés**, et pour 15 fichiers sur 32 il s'agit d'épreuves de la **série Mathématiques** (programme SVT
> différent, durée ≈ 2 h), hors périmètre d'une app Sciences Expérimentales.
>
> Les originaux sont archivés ici (`plans/sources/sujets/{SE,M}/`) à titre de **matériau de travail** pour
> P1.1 (transcription structurée + corrigé-barème signé) et P1.7 (fréquences). Ils ne sont **plus** copiés
> dans `public/` (−81 Mo dans `dist/` et dans l'APK) et aucun écran élève ne les référence.
>
> **Méthode :** année, session et série sont **lues dans le texte du PDF** (`pypdf`, 3 premières pages),
> jamais déduites du nom de fichier — les nombres des noms `dzexams-…-NNNNNNN.pdf` sont des **tailles en
> octets**, pas des identifiants. « scan » = aucune couche texte exploitable (image seule) : année et série
> **non vérifiées**, à lire à l'œil avant tout usage. Les chiffres de l'année sont parfois inversés par
> l'extraction (« 7102 » = 2017) ; la durée est donnée **brute** (ordre des chiffres non fiable) — la durée
> officielle de l'épreuve reste à confirmer sur une source ONEC (probablement 4 h 30 en SE, 2 h en M).
>
> **Ce qui manque pour passer la porte P0.1 :** (1) source officielle ou autorisation écrite ;
> (2) lecture à l'œil des 13 scans ; (3) décision d'écarter la série M ou de l'étiqueter comme telle.

## A. Dossier `SE/` (série supposée Sciences Expérimentales — 17 fichiers)

| Fichier | Taille | Pages | SHA-256 (16) | Couche texte | Année lue | Session | Série lue | Durée (brute) | Source (métadonnées) | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| `BAC2025_SVT_Sujet1.pdf` | 1.0 Mo | 11 | `2f81965e9afd2ea1` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `BAC2025_SVT_Sujet2.pdf` | 1.1 Mo | 11 | `8f771a08b57f33e5` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-2116452.pdf` | 2.2 Mo | 18 | `57420110d44bf62c` | oui | 2017 (chiffres inversés dans le PDF) | استثنائية | علوم تجريبية | 10 ساو01 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-2311208.pdf` | 2.7 Mo | 20 | `2f83ecf8bbc1a57d` | oui | 2022 | عادية | علوم تجريبية (lu manuellement : formes de présentation) | — | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-2356016.pdf` | 2.8 Mo | 19 | `9be1e50bf1d55d51` | oui | 2020 | عادية | علوم تجريبية | 40 سا04 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-2581269.pdf` | 2.8 Mo | 16 | `ac02599bef250dac` | oui | 2017 (chiffres inversés dans le PDF) | عادية | علوم تجريبية | 10 ساو01 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-2586794.pdf` | 3.0 Mo | 21 | `a5db9d3a69b9e32f` | oui | — | — | علوم تجريبية | — | ency-education.com | 🟡 texte lisible, année absente |
| `dzexams-bac-sciences-2728849.pdf` | 3.2 Mo | 21 | `4086ce3ea7e00a8c` | oui | 2021 | عادية | علوم تجريبية | 40 سا و04 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-3051478.pdf` | 3.3 Mo | 19 | `65066e97dffe405f` | oui | 2019 | عادية | علوم تجريبية | — | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-3509975.pdf` | 3.6 Mo | 19 | `86f447567cb68404` | oui | 2018 | عادية | علوم تجريبية | 40 سا و04 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-3814840.pdf` | 3.8 Mo | 23 | `bd0819c2f54c0c6f` | non (scan) | — | — | — | — | ency-education.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-4380238.pdf` | 4.2 Mo | 22 | `693cd1b6d48691b0` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-4463279.pdf` | 4.4 Mo | 17 | `0ee9df94b5714f08` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-5906014.pdf` | 5.6 Mo | 20 | `cccdd811c6f9d807` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-naturelles-1751784.pdf` | 1.7 Mo | 20 | `2d49307170947a69` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-naturelles-1780707.pdf` | 2.1 Mo | 20 | `f7a1b27bd69def03` | oui | 2023 | عادية | علوم تجريبية | 40 سا و04 د | ency-education.com | 🟡 vérifié texte — droits non clarifiés |
| `dzexams-bac-sciences-naturelles-2667863.pdf` | 2.5 Mo | 23 | `fa7cb5ab28a397cb` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |

## B. Dossier `M/` (série Mathématiques — 15 fichiers)

| Fichier | Taille | Pages | SHA-256 (16) | Couche texte | Année lue | Session | Série lue | Durée (brute) | Source (métadonnées) | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| `dzexams-bac-sciences-1413929.pdf` | 1.7 Mo | 11 | `482060bc44ac597b` | oui | — | — | رياضيات | 16 سا و01 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1777391.pdf` | 2.0 Mo | 13 | `4467bc9c48de18d6` | oui | 2022 (lecture incertaine) | عادية | رياضيات | 22 سا و02 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1803994.pdf` | 1.9 Mo | 11 | `dea4d174b9814720` | oui | 2017 (chiffres inversés dans le PDF) | استثنائية | رياضيات | — | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-1967487.pdf` | 2.1 Mo | 12 | `0a4ae96d9deb4489` | oui | 2018 | عادية | رياضيات | 02 سا و00 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2068087.pdf` | 2.3 Mo | 12 | `ac438bdd5561bc29` | oui | 2021 | عادية | رياضيات | 20 سا و02 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2273619.pdf` | 2.0 Mo | 10 | `70140246c910b3e9` | oui | 2020 | عادية | رياضيات | 20 سا و02 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2275712.pdf` | 2.3 Mo | 9 | `2824068daa4b5dc5` | oui | — | — | رياضيات | — | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2280992.pdf` | 2.5 Mo | 10 | `e9237e1a81f7d2cd` | oui | 2019 | عادية | رياضيات | 20 سا و02 د | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-2369148.pdf` | 2.4 Mo | 11 | `d82273f23d19f4f1` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-2723927.pdf` | 2.6 Mo | 10 | `d1883559c0acc950` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-2770867.pdf` | 2.8 Mo | 11 | `7162e3e4d2aa02c8` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-naturelles-1077342.pdf` | 1.3 Mo | 13 | `da6ccaf666fb790a` | oui | 2023 | عادية | رياضيات (lu manuellement : formes de présentation) | — | ency-education.com | ❌ hors périmètre (série M) |
| `dzexams-bac-sciences-naturelles-1343688.pdf` | 1.3 Mo | 14 | `73df96aee09e82e6` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-naturelles-1482576.pdf` | 1.4 Mo | 13 | `8ccb6407c4714d46` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |
| `dzexams-bac-sciences-naturelles-1554243.pdf` | 1.5 Mo | 13 | `ed091e9e98f90d32` | non (scan) | — | — | — | — | dzexams.com | ⚠️ scan — non vérifié |

## C. Synthèse

- 32 fichiers, 80 Mo. Couche texte exploitable : 18/32 ; scans : 14/32.
- Sujets SE avec année **et** série vérifiées dans le texte : **8** (2017 ×2 dont 1 session exceptionnelle, 2018, 2019, 2020, 2021, 2022, 2023). Aucun 2024, aucun 2025 vérifiable (les deux `BAC2025_*` sont des scans sans texte).
- Sessions : aucune session « septembre » n'existe dans les fichiers lisibles ; la seule session non ordinaire est **الدورة الاستثنائية 2017**.
- Doublons potentiels (même année/série) à comparer à l'œil : 2017 SE (`2116452` exceptionnelle / `2581269` ordinaire).
- Historique : le PR #1 déclarait pour ces fichiers des années 2019–2025, des sessions « septembre » et une série « Sciences Naturelles » — toutes contredites par le contenu (voir `plans/preuves/ANALYSE-PR1.md` §2 R3).

## D. Prochaines actions (chemin critique du plan)

1. Demander à l'ONEC / au ministère la liste officielle des sujets SE 2018–2025 et les conditions de reproduction ; à défaut, repli P1.1 : sujets blancs rédigés par le correcteur, **étiquetés « sujet blanc »**.
2. Lire à l'œil les 13 scans et compléter ce registre (année, série, session) — ou les écarter.
3. Ne réintroduire un écran « sujets » dans l'app qu'avec des sujets **structurés** (QCM / enquête / synthèse) et un corrigé-barème signé, jamais un lien vers un PDF.
