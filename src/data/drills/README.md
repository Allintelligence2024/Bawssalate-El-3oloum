# Banque de drills — source de vérité (P1.4-bis)

Les fichiers `axes.ts`, `domaine1.ts`, `domaine2.ts`, `domaine3.ts` et `niveau3.ts` (items n3 écrits à la main, P1.5) de ce dossier **sont la source de référence versionnée** de la banque (620 items : 500 QCM + 120 définitions converties). Le document Markdown d'origine n'est pas dans le dépôt (chemin local de l'auteur) et n'a plus autorité.

## Règles

1. **Toute correction d'item se fait ici**, dans les `.ts`, et est tracée dans `plans/relecture/REGISTRE-ARBITRAGES.md` (id de l'item, avant/après, statut, date).
2. **Régénération interdite par défaut** : `scripts/importer-drills.mjs` refuse de tourner sans chemin explicite **et** `--force`. Si une régénération est vraiment nécessaire (nouvelle source éditoriale validée par les enseignants), ré-appliquer ensuite chaque correction du tableau ci-dessous, puis lancer `node scripts/verifier-drills.mjs` (attendu : 0 problème).
3. Les nouveaux items de niveau 3 (P1.5) vont dans **`niveau3.ts`** (un par ligne, même format, commentaire `// nXXX ← source · statut` au-dessus) **et** dans `axes.ts` (`ids` + compteur `qcm`) et `TOTAL_QCM`. `utils/drills.ts` les fusionne au chargement du domaine de leur unité ; `verifier-drills.mjs` les contrôle comme les autres. Statut de relecture : registre A-005.

## Corrections tracées à ré-appliquer après toute régénération

| Registre | Item | Fichier | Correction |
|---|---|---|---|
| A-005 | `n001`–`n028` | `niveau3.ts` | Fichier manuel, hors générateur — ne pas supprimer lors d'une régénération ; vérifier que les ids restent dans `axes.ts`. |
| A-001 | `d101` (U10, axe 42, سطح غوتنبرغ) | `domaine3.ts` | `o[2]` remplacée par un distracteur distinct (définition du Moho) — l'original était équivalent à `o[0]`. Formulation finale à arbitrer par l'enseignant. |

## Vérification

```
node scripts/verifier-drills.mjs
```
Contrôle : 4 options distinctes, bonne réponse en position 0, ids uniques, axes cohérents, alerte « tige répétée » et « options proches ».

*16/11 — dépôt 2 niveau 3 : `n029`–`n040` (u8 ×4, u10 ×4, u1/u2/u5 ×1 +1 u5) → 40 items n3, `TOTAL_QCM = 540`, `verifier-drills.mjs` : 660 items, 0 problème. Toutes les 11 unités ont ≥ 2 items n3. Statut inchangé : « à valider » (A-005).*
