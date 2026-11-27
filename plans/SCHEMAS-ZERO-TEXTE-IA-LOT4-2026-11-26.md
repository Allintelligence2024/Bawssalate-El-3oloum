# Schémas « Zéro Texte IA » — Lot 4 (u9, u10, u11)

**Date** : 2026-11-26 · **Branche** : `arena/0fa86abf-bawssalate-el-3oloum` · **Périmètre** : **Lot 4, dernier lot** — `u9` (tectonique, 3 schémas), `u10` (structure interne du globe, **4** schémas), `u11` (déformation / migmatite, 2 schémas). Ce lot clôt les quatre lots du prompt « schémas zéro texte IA ».

Comme aux Lots 1 à 3, les **8 WebP du manuel** de ces unités restent **intactes et non promues** : le lot ne crée que ce qui **manquait**, c'est-à-dire les leçons sans aucun document — et deux leçons dont le seul WebP était de faible valeur, sans dépasser le plafond de **2 schémas par leçon**.

---

## 1. Audit de couverture avant le lot

| Unité | Leçons | WebP du manuel | Leçons sans visuel |
|---|---:|---:|---|
| u9 | 5 | 4 | `phase16_chapitres_31_32`, `phase16_chapitres_31_32_2`, `phase18_chapitres_35_36` |
| u10 | 3 | 0 | `phase19_chapitres_37_38`, `phase19_chapitres_37_38_2`, `phase20_chapitres_39_40` |
| u11 | 5 | 4 | `d3-u11-l1-migmatite` |

Les WebP restantes de faible valeur (`phase17_chapitres_33_34`, `phase17_chapitres_33_34_2`, `phase21_chapitres_41_42`, `phase21_chapitres_41_42_2`) n'ont **pas** été dupliquées : aucune leçon ne dépasse 2 schémas au total, et aucune n'a reçu un schéma « pour faire nombre ».

---

## 2. Les 9 visuels, contrôlés un par un

| # | Fichier | Leçon cible | Poids | Repères | Panneaux | Verdict |
|---|---|---|---:|---:|---:|---|
| 1 | `u9-limites-plaques.svg` | `phase16_chapitres_31_32` | 3,7 Ko | 6 | 3 (A/B/C) | VALIDE (2 essais) |
| 2 | `u9-expansion-oceanique.svg` | `phase16_chapitres_31_32_2` | 8,4 Ko | 6 | 1 | VALIDE (2 essais) |
| 3 | `u9-energie-interne.svg` | `phase18_chapitres_35_36` | 6,4 Ko | 6 | 1 | VALIDE (2 essais) |
| 4 | `u10-ondes-sismiques.svg` | `phase19_chapitres_37_38` | 7,2 Ko | 6 | 2 (globe + graphique) | VALIDE (3 essais) |
| 5 | `u10-sial-sima.svg` | `phase19_chapitres_37_38_2` | 8,2 Ko | 6 | 1 (3 colonnes) | VALIDE (3 essais) |
| 6 | `u10-modelisation-terre.svg` | `phase20_chapitres_39_40` | 12,5 Ko | 6 | 2 (globe + courbe T) | VALIDE (3 essais) |
| 7 | `u11-plis-failles.svg` | `phase20_chapitres_39_40_2` | 9,6 Ko | 6 | 4 (A/B/C/D) | VALIDE (3 essais) |
| 8 | `u11-migmatite.svg` | `d3-u11-l1-migmatite` | 5,1 Ko | 6 | 1 + zoom | VALIDE (3 essais) |
| 9 | `u10-zones-ombre.svg` | `phase19_chapitres_37_38` (2ᵉ) | 12,1 Ko | 6 | 1 (globe + anneaux P/S) | VALIDE (2 essais) |

- **9 SVG**, **73,2 Ko** au total (3,7–12,5 Ko pièce), **54 repères** posés à la main (`repere()`).
- Chaque libellé arabe vit dans le registre (`labelAr` + `detailAr ≤ 90`), jamais dans le fichier **sauf** les symboles scientifiques contrôlés : `SIAL`, `SIMA`, `SiO₂`, `Al₂O₃`, `FeO·MgO`, `CaO`, `Fe–Ni`, `Vp`, `Vs`, `Moho`, `Gutenberg`, `Lehmann`, `238U`, `232Th`, `40K`, `Ma`, `km`, `°C`, les lettres de panneau A–D et les pourcentages des barres.
- Une seule leçon reçoit **2 schémas créés** (`phase19_chapitres_37_38` : globe + courbes Vp/Vs, puis zones d'ombre) ; le plafond de 2 par leçon reste respecté partout.

### Corrections apportées pendant la passe visuelle

| Fichier | Défaut vu sur le PNG | Correction |
|---|---|---|
| `u9-limites-plaques` | plaques dessinées en parallélogrammes qui se chevauchaient | biseaux de part et d'autre de la dorsale, subduction oblique en bleu dans le panneau B |
| `u9-expansion-oceanique` | pastilles N/R sur les libellés `Ma`, pastille sur la croix d'axe | pastilles décalées sur les bandes, étiquettes d'âge déplacées, axe 0 Ma libéré |
| `u9-energie-interne` | formule `²³⁸U·²³²Th·⁴⁰K` chevauchait les ronds radioactifs | formule remontée à y = 268, ronds et pastilles déplacés |
| `u10-ondes-sismiques` | **axe des profondeurs inversé** (croûte au fond), libellés de discontinuités sur les courbes | `D(km) = y0 + (km/max)·(y1−y0)`, libellés Moho/Gutenberg/Lehmann ramenés à gauche avec halo, `Fe–Ni` remonté |
| `u10-sial-sima` | 4 colonnes illisibles, titres écrasés par les pastilles, hauteur 680 px pour 430 px de contenu | planche réécrite : 4 oxydes en lignes, 3 colonnes SIAL/SIMA/péridotite, barres 0–100 %, hauteur ramenée à **520 px**, libellés d'oxydes dégagés des barres |
| `u10-modelisation-terre` | hachures du noyau interne, `SIAL`/`SIMA` hors du disque (donc invisibles) | anneaux concentriques pour le noyau interne, `SIAL` et `SIMA` replacés **dans** leurs anneaux, échelle 5200 °C + unité `km` ajoutées |
| `u11-plis-failles` | panneaux C/D en blocs pleins, pastille 6 hors cadre à x = 1210 | panneaux C/D refaits en **strates empilées** de part et d'autre d'un plan de faille rouge, pastille 6 ramenée dans le cadre, lettres C/D dégagées des strates |
| `u11-migmatite` | zone de fusion hors du panneau, texte parasite « grana » | zone de fusion remontée à y = 462, texte supprimé, repères recalculés, encoche parasite retirée des blocs crustaux |

---

## 3. Couverture après Lot 4

| Unité | Leçons | WebP du manuel | Schémas créés | Leçons illustrées |
|---|---:|---:|---:|---:|
| u1 → u5 | 28 | 0 | 26 | 25 / 28 |
| u6 | 7 | 9 | 2 | 7 / 7 |
| u7 | 5 | 2 | 3 | 5 / 5 |
| u8 | 2 | 2 | 1 | 2 / 2 |
| u9 | 5 | 4 | **3** | **5 / 5** |
| u10 | 3 | 0 | **4** | **3 / 3** |
| u11 | 5 | 4 | **2** | **5 / 5** |
| **Total** | **55** | 21 | **41** | **52 / 55 (94,5 %)** |

Les 3 leçons encore sans visuel sont exactement, d'après `UNITES` de `src/data/programme.ts` :
**`phase6_chapitres_11_12`** (u4), **`immunity_memory_response`** (u4) et **`phase9_chapitres_17_18`** (u5). Ce sont les reliquats déjà signalés au Lot 2, laissés à la main de l'enseignant : chacune peut encore recevoir un 2ᵉ schéma sans dépasser le plafond. Les unités **u1 → u3** et **u6 → u11** sont intégralement illustrées.

> Note de comptage : `CHEMIN` contient **56** items de type `lecon` = les **55** leçons officielles + **1** leçon de prérequis (`prerequis`, ouverte avant sa unité). Les 55 leçons se répartissent en u1 5, u2 4, u3 6, u4 8, u5 5, u6 7, u7 5, u8 2, u9 5, **u10 3**, **u11 5**.

---

## 4. Règles d'acceptation — vérifiées

| Règle | Vérification |
|---|---|
| Image **muette** | `verifier-hors-ligne.mjs` refuse tout caractère arabe dans un SVG : 0 détection sur les 35 SVG |
| Seuls des symboles scientifiques | liste exhaustive au § 2 |
| Pastilles en % posées par l'app | `annotations[].x/y ∈ [5, 95]`, contrôle automatique passé pour 48/48 |
| Légende arabe RTL | `legendeAr` en `<span>` avec `<strong>` de tête, cohérente avec les Lots 1–3 |
| `statut: 'a_valider_enseignant'` + `reviewed: false` | 40/40 entrées, **0** `reviewed: true` |
| Hors précache + `loading="lazy"` | `schemasSvt` chargé par `import()`, `HORS_PRECACHE` inchangé |
| 2 schémas max par leçon | max observé : 2 (une seule leçon, `phase19_chapitres_37_38`) |
| 5 à 9 annotations | 6 pour les 9 planches |
| `detailAr ≤ 90` | test unitaire, 0 échec |

---

## 5. Porte de validation — résultats

| Commande | Résultat |
|---|---|
| `npm run lint` (`eslint .`) | **0 erreur** |
| `npx tsc --noEmit` | **0 erreur** |
| `npm test` (`vitest run`) | **86 fichiers / 729 tests — 100 % OK** |
| `npm run build` | OK — `index-*.js` 497,94 Ko · `schemasSvt-*.js` 67,59 Ko (gzip 16,94), toujours hors précache |
| `node scripts/verifier-drills.mjs` | 700 items · 120 définitions · 80 niveau 3 · **0 problème**, 8 alertes d'options proches (contrôle humain) |
| `node scripts/verifier-hors-ligne.mjs` | **RÉSULTAT : OK** — **62 illustrations**, 166 fichiers interrogés, 0 échec HTTP/type, 0 incohérence |
| `node scripts/sync-metrics.mjs --check` | README à jour, aucune dérive |
| `node scripts/generer-schemas-svt.mjs --verifier` | **36 / 36 identiques** |
| `previsualiser-schemas.py` | 9 planches relues à l'œil (2 à 3 passes) |
| `previsualiser-annotations.py` | 9 composites relus (pastilles ↔ libellés arabes) |

### Tests mis à jour

- `src/data/__tests__/illustrationsLecons.test.ts` : 41 schémas (`{u1:5, u2:5, u3:6, u4:6, u5:4, u6:2, u7:3, u8:1, u9:3, u10:4, u11:2}`), **36 SVG** + 5 WebP annotées, **39 leçons** distinctes, disque = registre (**62 fichiers**), **52 leçons illustrées**, 0 `reviewed: true`.
- `src/__tests__/metriques.test.ts` : **62 visuels**, 36 SVG, **11 unités** couvertes.

---

## 5 bis. Décision produit — pas de bascule Cloudflare R2

Décision du 2026-11-26 : **tout reste en local** dans `public/lecons/img/`.
Motifs : **2,1 Mio** pour les 62 illustrations (seuil d'alerte : 5 Mio), chunk `schemasSvt` **67,59 Ko**
(gzip 16,94) chargé à la demande hors démarrage, zéro infrastructure à maintenir, zéro coût, et un
mode hors-ligne plus simple à tester sur Android. Le helper `VITE_ILLUSTRATIONS_BASE_URL` reste en
place, prêt si le volume double — la décision sera réexaminée au-delà de **4 Mio**.

## 6. Ce qui reste ouvert

1. **Relecture nominative de l'enseignant** : les 40 entrées sont en `a_valider_enseignant`. Aucune n'est promue `reviewed: true` — la porte est ouverte, pas franchie.
2. Trois leçons de u4/u5 sans visuel (§ 3) : u1 → u3 et u6 → u11 sont closes ; **aucun schéma facultatif ne sera ajouté** (décision produit du 2026-11-26 : à 94,5 % de couverture, un 42ᵉ schéma n'apporte rien aux élèves).
3. Les 21 WebP du manuel restent telles quelles ; leur promotion éventuelle est une décision de contenu, hors périmètre des quatre lots.
