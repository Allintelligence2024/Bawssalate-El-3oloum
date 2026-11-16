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
| A-002 | Hill — année | `src/data/lessonGoldSummaries.ts:38` (1939), `src/components/ExamBlanc.tsx:45,68` (1939), `src/data/programme.ts:343` (**1937**) | Le PR #1 a changé 1937→1939 dans `lessonGoldSummaries.ts` sans arbitrage ; `programme.ts` dit toujours 1937 → incohérence déplacée, pas résolue. | Aucune modification supplémentaire : l'année retenue (publication Nature 1937 vs Proc. R. Soc. 1939) doit être tranchée par le relecteur, puis appliquée aux **3** fichiers en une fois. | `en attente enseignant` | 2026-11-16 |
| A-003 | ¹⁸O — enquête Ruben & Kamen | `src/components/ExamBlanc.tsx:75, 94, 99, 125` | Baseline : ¹⁸O décrit comme « radioactif » (faux, isotope stable). PR #1 : remplacement partiel → texte désormais **auto-contradictoire** (« نظير استقرار » agrammatical + « أكسجين مشع » dans la même phrase). | Réécriture complète de l'exercice (doc 2, 3 options, 2 indices `cible`, `succes`, conclusion) en termes de **traçage isotopique** (نظير مستقر ¹⁸O، الكشف بمطياف الكتلة) — à faire valider avant publication. | `en attente enseignant` | 2026-11-16 |
