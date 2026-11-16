# Registre des arbitrages éditoriaux — drills, exercices, résumés

> Toute modification d'un item de contenu (banque de drills, exercices `Methodologie.tsx` / `ExamBlanc.tsx`,
> résumés `lessonGoldSummaries.ts`) est tracée ici **avant** d'être considérée comme acquise.
> Colonne « Statut » : `correctif-dev` (défaut technique corrigé sans attendre) · `en attente enseignant` ·
> `arbitré` (nom + date du relecteur).

## ⚠️ Avertissement P1.4-bis — régénération des drills

`src/data/drills/domaine{1,2,3}.ts` sont **générés** par `scripts/importer-drills.mjs` depuis un fichier
Markdown dont le chemin par défaut est un chemin local Windows absent du dépôt
(`C:/Users/zakaria/Desktop/drills_svt_arabe_500_QCM_120_definitions_programme_joint.md`).
**Tant que cette source n'est pas versionnée dans le dépôt, les fichiers générés sont la source de vérité
et toute régénération est interdite** sans ré-application manuelle de chaque ligne de ce registre.

## Arbitrages

| # | Item | Fichier | Défaut constaté | Action | Statut | Date |
|---|---|---|---|---|---|---|
| A-001 | `d101` (U10, axe 42, définition « سطح غوتنبرغ ») | `src/data/drills/domaine3.ts:176` | Options `o[0]` (comptée juste) et `o[2]` **équivalentes** : « سطح فاصل عند 2900 كم بين البرنس واللب الخارجي » / « يفصل البرنس عن اللب الخارجي عند نحو 2900 كم ». Un élève choisissant `o[2]` était marqué faux pour une réponse correcte. Signalé par `scripts/verifier-drills.mjs` (« خيارات متقاربة »). | `o[2]` remplacée par un distracteur distinct et géologiquement faux pour Gutenberg : « يفصل القشرة عن البرنس على عمق 30 إلى 70 كم تحت القارات » (= définition du Moho, déjà utilisée comme bonne réponse dans `q416`). `o[0]`, `o[1]` (Lehmann ≈ 5 100 km) et `o[3]` inchangées. `verifier-drills.mjs` → **0 problème** après correction. | `correctif-dev` — **formulation finale à arbitrer par l'enseignant** (P0.5, exception prioritaire) | 2026-11-16 |
| A-002 | Hill — année | `src/data/lessonGoldSummaries.ts:38`, `src/components/ExamBlanc.tsx:45,68`, `src/data/programme.ts:343` | Le PR #1 a changé 1937→1939 dans `lessonGoldSummaries.ts` seul ; `programme.ts` dit 1937, `ExamBlanc.tsx` 1939 → trois fichiers, deux années. | **16/11 soir :** `lessonGoldSummaries.ts` **remis à 1937** (= baseline et `programme.ts`) pour ne pas publier une modification non arbitrée ; `ExamBlanc.tsx` reste à 1939 (valeur de la baseline, non touchée). L'année à retenir (expérience de Hill réalisée en 1937, article *Nature* 1937 / *Proc. R. Soc. B* 1939) doit être tranchée par le relecteur puis appliquée aux **3** fichiers en une fois. | `en attente enseignant` | 2026-11-16 |
| A-003 | ¹⁸O — enquête Ruben & Kamen | `src/components/ExamBlanc.tsx` (exercice 2, doc 2, options, indices, succès, conclusion) | Baseline : ¹⁸O décrit comme « radioactif » (faux : isotope **stable**). PR #1 : remplacement partiel → texte auto-contradictoire (« نظير استقرار » + « أكسجين مشع » dans la même phrase). | **Réécrit** en termes de traçage isotopique stable : H₂¹⁸O / C¹⁸O₂, oxygène « مُوسَّم » (marqué) détecté par spectrométrie de masse ; 0 occurrence de « مشع » dans le fichier (`grep -c "مشع" src/components/ExamBlanc.tsx` → 0). Les valeurs numériques du doc 2 sont des ordres de grandeur pédagogiques, pas les données brutes de 1941. | `correctif-dev` — **validation enseignant requise avant publication** (formulation arabe + valeurs du tableau) | 2026-11-16 |
| A-004 | Sujets de Bac (32 PDF) | ex-`src/data/examSubjects.ts`, ex-`src/components/SujetsExamen.tsx`, ex-`public/examens/` | Métadonnées (années 2019–2025, sessions « septembre », série « Sciences Naturelles ») **contredites par le contenu** des PDF ; 15/32 sont des épreuves série Mathématiques ; source non officielle ; droits non clarifiés ; 81 Mo embarqués. | Écran et données **retirés de l'app** ; originaux déplacés dans `plans/sources/sujets/{SE,M}/` ; registre réel (année/série/session lues dans le texte, SHA-256, couche texte) dans `plans/sources/REGISTRE.md`. | `en attente produit` — décision : demande ONEC / repli « sujets blancs » P1.1 | 2026-11-16 |
