# Journal de création des schémas — « Zéro Texte IA »

Une ligne par visuel tenté, dans l'ordre de production. Format imposé par le protocole :
`ID | lessonId | Type | Essais | V1..V6 | Poids | Verdict | Notes`.

**Grille V1–V6** (rappel) : V1 zéro texte IA · V2 exactitude scientifique 3AS · V3 correspondance à la leçon ·
V4 précision des repères (5 ≤ x,y ≤ 95, pas de superposition) · V5 terminologie arabe officielle ·
V6 qualité visuelle et budget (≤ 100 Ko, plafond 150 Ko).

**Preuves** : `.cache/qa-composites/<id>_qa.png` (composites hors Git) et `plans/preuves-schemas/<slug>.png`.
**Reproductibilité** : `node scripts/generer-schemas-svt.mjs` puis `python scripts/previsualiser-annotations.py`.

## Lot 1 — Domaine 1A (u1, u2, u3)

| ID | lessonId | Type | Essais | V1 | V2 | V3 | V4 | V5 | V6 | Poids | Verdict | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `schema-u1-reticulum-golgi` | `phase1_chapitres_1_2` | WebP | 1 | PASS | PASS | PASS | PASS | PASS | PASS | 72 Ko | VALIDE | 7 repères. Aucun texte dans les pixels (vérifié en vision). Chaîne RER → Golgi → granule conforme au programme (pas de peptide signal). |
| `schema-u1-flux-information` | `d1-u1-l1-expression-genique` | SVG | 3 | PASS | PASS | PASS | PASS | PASS | PASS | 8 Ko | VALIDE | 9 repères. ADN confiné au noyau, export par le pore, polysome. 3 passes : pastille 7 déplacée hors des sous-unités, 1 et 2 retirées des traits. |
| `schema-u1-transcription` | `lecon_transcription` | WebP | **2** | PASS | PASS | PASS | PASS | PASS | PASS | 36 Ko | VALIDE (essai 2) | **Essai 1 REJETÉ** (V1/V6) : enzyme derrière l'ADN, bulle inexistante, ARNm traversant l'hélice. Régénéré : anneau ambré qui enserre l'ADN, brin 5′ sortant vers le bas-gauche. |
| `schema-u1-code-genetique` | `phase1_chapitres_1_2_2` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 7 repères. 4³ = 64, 20 acides aminés, 3 codons stop, activation aa-ARNt + ATP → AMP + PPi. Pastilles 1/2/3 déplacées hors codon et anticodon. |
| `schema-u1-traduction` | `phase2_chapitres_3_4` | WebP | 1 | PASS | PASS | PASS | PASS | PASS | PASS | 28 Ko | VALIDE | 8 repères. Sites P/A dans la grande sous-unité, ARNt qui progresse A → P, chaîne peptidique par le tunnel de sortie. Pastilles 1/2 recadrées sur les sous-unités. |
| `schema-u2-niveaux-structure` | `phase2_chapitres_3_4_2` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 8 Ko | VALIDE | 7 repères. Ponts S—S présentés comme **covalents**. Passes : étiquettes S—S sorties des segments rouges, marques H⁺/ioniques retirées (ambiguës sans légende locale). |
| `schema-u2-drepanocytose` | `phase3_chapitres_5_6` | SVG | 3 | PASS | PASS | PASS | PASS | PASS | PASS | 8 Ko | VALIDE | 6 repères. HbA (α₂β₂, Glu6 chargé −) → HbS (Val6 apolaire, patch adhésif) → fibres → hématie falciforme. 3 passes : croissant recalculé (deux cercles, d = 46), marqueur de mutation déplacé à l'extérieur du tétramère, pastille 5 rapprochée des fibres. |
| `schema-u2-structure-3d` | `lecon_representation` | WebP | 1 | PASS | **PASS avec réserve** | PASS | PASS | PASS | PASS | 44 Ko | VALIDE (réserve) | 5 repères. Modèle en ruban : feuilles β nettes, hélices α implicites → **aucun repère n'affirme « hélice α »**. À compléter au Lot 3 par un SVG dédié si l'enseignant le demande. |
| `schema-u2-electrophorese` | `amino_acid_behavior` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 6 repères. pH < pHi → + → cathode ; pH > pHi → − → anode ; pH = pHi → immobile. Courbe de charge calculée. Pastilles 4/5 recadrées sur les bandes. |
| `schema-u2-anfinsen` | `phase3_chapitres_5_6` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 6 repères. 100 % → 0 % → 100 %, rétablissement spontané. Étiquette « 8 mol/L » dégagée de la pastille 3. |
| `schema-u3-complexe-enzyme-substrat` | `phase3_chapitres_5_6_2` | WebP | 1 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 5 repères. Enzyme + réactif → ES (ajustement induit) → produits + enzyme inchangée. Aucun texte. |
| `schema-u3-specificite` | `lecon_activite_structure` | SVG | 3 | PASS | PASS | PASS | PASS | PASS | PASS | 8 Ko | VALIDE | 6 repères. Amidon α-1,4 hydrolysé, cellulose β-1,4 non hydrolysée. 3 passes sur la géométrie du site actif (encoche en V ouverte côté substrat). |
| `schema-u3-ph` | `phase4_chapitres_7_8` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 16 Ko | VALIDE | 6 repères. Trois pH optimaux (2 / 7 / 8,5) + effet sur l'ionisation du site actif. Bug du prévisualiseur corrigé (texte blanc sur blanc). |
| `schema-u3-temperature` | `phase4_chapitres_7_8_2` | SVG | 2 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 5 repères. Courbe asymétrique : froid réversible, > 60 °C dénaturation irréversible. Étiquettes 0/37/60 °C réaffichées après correction du rendu. |
| `schema-u3-michaelis` | `d1-u3-l1-enzyme` | SVG | 1 | PASS | PASS | PASS | PASS | PASS | PASS | 12 Ko | VALIDE | 5 repères. Vmax, Km, saturation, linéarité à faible [S]. Courbe calculée (Michaelis–Menten). |
| `schema-u3-inhibition` | `enzyme_inhibitors` | SVG | 3 | PASS | PASS | PASS | PASS | PASS | PASS | 20 Ko | VALIDE | 6 repères. Compétitif = Vmax constant / Km ↑ ; non compétitif = Vmax ↓ / Km constant ; deux sites actifs schématiques. Pastilles 4/5/6 recadrées 3 fois. |

## Synthèse

| Indicateur | Valeur |
|---|---|
| Visuels tentés | **17** (1 rejeté puis régénéré) |
| Visuels retenus | **16** — 11 SVG + 5 WebP annotées |
| Essais moyens | 1,8 par visuel |
| `BLOQUÉ_HUMAIN` | **0** |
| Poids des SVG | 104 Ko au total (8–20 Ko pièce) |
| Poids des WebP | 11–72 Ko (cible 100 Ko, plafond 150 Ko) |
| Repères | 5 à 9 par visuel, tous dans `[5, 95]` |
| `reviewed: true` | **0** — 37 entrées sur 37 en `a_valider_enseignant` |

## Défauts transverses corrigés pendant le lot

1. **Prévisualiseur** : la couleur du texte était lue sur `stroke` (le halo blanc) → libellés blancs sur fond blanc (`37 °C`, `60 °C`, `0 °C` invisibles). Corrigé : le texte se peint avec `fill`.
2. **Pastilles sur les traits** : cinq recadrages successifs ; règle adoptée — re-rendre le composite après **chaque** retouche géométrique.
3. **Étiquettes rouges sur trait rouge** (`S—S`) et `Vmax` sur ligne pointillée : décalage + halo.
4. **Réflexe retenu** : dès qu'un visuel dépasse 2 essais sur la géométrie, la cause est le **modèle mental du dessin**, pas la pastille — on redessine la forme (enzyme en V, croissant en deux cercles) au lieu de déplacer le repère.

---

# Lot 2 — `u4` (immunité) + `u5` (communication nerveuse), 2026-11-26

## 0. Prérequis budget, réglé avant le premier schéma

L'alerte du Lot 1 (coquille à 98,7 %) est levée **avant** d'écrire une ligne de SVG :

1. `src/data/illustrationsTypes.ts` créé : `AnnotationSchema`, `TypeVisuel`, `IllustrationLecon`, `typeVisuelDe`, `aDesAnnotations` — **aucune donnée**, donc importable par le composant sans tirer le registre.
2. `IllustrationsLecon.tsx` : `import { SCHEMAS_SVT }` → `import('../data/schemasSvt')` dans un `useEffect` + `useMemo` (fusion avec le legacy, `.catch` silencieux).
3. `vite.config.ts` : `/^assets\/schemasSvt-/` dans `HORS_PRECACHE`.

Mesure : `schemasSvt-tIvI3yTD.js` **26,33 Ko** (gzip 7,03) sort du graphe de démarrage, coquille **2,21 Mio** (contre 2,23), `verifier-hors-ligne` OK.

## 1. Journal des 10 planches

| # | Slug | Essais | Défaut déclencheur | Correction |
|---|---|---:|---|---|
| 1 | `u4-cmh` | 3 | pastilles 1 et 2 **aux mêmes coordonnées** ; « CMH-II » posé sur les têtes de récepteurs ; `ADN` masqué par la pastille 3 | repères dispersés (700/860/942), libellés remontés, peptide CMH-I posé **sur** la tête du récepteur, peptide CMH-II entre les deux domaines |
| 2 | `u4-groupes-abo` | 2 | pastilles 1 à 3 flottant **entre** les panneaux A/B/AB/O | repères ramenés sur les antigènes de leur propre panneau (120/420/1046), pastilles 4-5 sur les anticorps concernés |
| 3 | `u4-phagocytose` | 3 | **SVG non parsable** : `out.push(...macro(...))` éclatait la chaîne en caractères ; 4ᵉ panneau hors zone (`x = 1230 > 1200`) ; inversion Ag/Ac | spread retiré, panneaux 60/340/620/900 (largeur 260), pastilles 1 et 2 échangées |
| 4 | `u4-ltc-perforine` | 2 | LTc **à l'intérieur** de la cellule infectée, « CMH-I » sous la pastille 2, flèches H₂O partant vers l'extérieur | planche réécrite : cellule 380 × 180, LTc sous la membrane, TCR vers le peptide, CD8 décalé, pores sur l'arête + flèches verticales vers l'intérieur |
| 5 | `u4-cooperation-lt4` | 2 | `IL-2` masqué par la pastille 2 ; flèches **diagonales** vers des boîtes alignées verticalement | libellé `IL-2` sorti des boîtes, flèches verticales LT4 → LB/LTc, 7 pastilles une par acteur |
| 6 | `u4-vih` | 2 | boîte « SIDA » flottant au-dessus de la courbe, pastilles 3 et 5 redondantes | bande verticale hachurée sous 200 LT4/mm³, 5 pastilles (primo, latence, zone, seuil, effondrement) |
| 7 | `u5-potentiel-repos` | 2 | pastilles 1 et 2 posées **sur** les ions (libellés Na⁺/K⁺ masqués), `ATP` sous la pastille 5, `−70 mV` sous la pastille 6 | pastilles rejetées à côté des ions, `ATP` remonté, pastille 5 hors de la pompe, 6 à droite de la cote |
| 8 | `u5-potentiel-action` | 2 | pastille 4 sur la pente descendante, pastille 6 sur le pic de l'encart | 4 décalée à droite de la pente, 6 dans le coin vide de l'encart |
| 9 | `u5-integration` | réécrit | axone déconnecté, `+`/`Cl⁻` flottants, flèches de sommation vers le vide, 3ᵉ pastille à x = 95,5 (hors `[5, 95]`) | planche réécrite : `Na⁺`/`Cl⁻` écrits **dans** les boutons, sommation temporelle aboutissant sur un bouton précis, pastille 3 ramenée à 94,7 % |
| 10 | `u5-morphine` | 3 | morphine dessinée **dans** la terminaison, récepteur entièrement hors de la membrane, `Ca²⁺` sur le trait post-synaptique | récepteur agrandi à cheval sur la membrane (378→436) avec la morphine **dedans**, `Ca²⁺` à droite du canal, flèche barrée dégagée |

## 2. Synthèse Lot 2

| Indicateur | Valeur |
|---|---|
| Visuels retenus | **10** — 10 SVG écrits à la main, 0 WebP |
| Essais moyens | 2,2 par visuel (un seul a été réécrit entièrement) |
| `REJET` définitif | **0** |
| Poids total | **55,6 Ko** (3,1–10,6 Ko pièce) |
| Repères | 5 à 7 par visuel, tous dans `[5, 95]`, `detailAr ≤ 90` |
| Registre après lot | **26 schémas** (21 SVG + 5 WebP annotées), **47 illustrations** au total |
| `reviewed: true` | **0** — 47 entrées sur 47 en `a_valider_enseignant` |

## 3. Contrôle final

```
node scripts/generer-schemas-svt.mjs --verifier     → 21 / 21 identiques
/tmp/.venv/bin/python scripts/previsualiser-schemas.py u4-… u5-…   → 10 planches
/tmp/.venv/bin/python scripts/previsualiser-annotations.py schema-u4-… schema-u5-…  → 10 composites
npx vitest run                                      → 86 fichiers / 729 tests
npm run build && node scripts/verifier-hors-ligne.mjs → 47 illustrations, coquille 2,21 Mio, RÉSULTAT : OK
```

---

# Lot 3 — `u6` (photosynthèse) + `u7` (respiration) + `u8` (cycle), 2026-11-26

`u6`/`u7`/`u8` avaient déjà 13 WebP du manuel : le lot n'ajoute que les **6 leçons vides**.

## 1. Journal des 6 planches

| # | Slug | Essais | Défaut déclencheur | Correction |
|---|---|---:|---|---|
| 1 | `u6-cycle-calvin` | 2 | texte arabe dans le SVG (refusé par le garde-fou, illisible au rastérissage) ; pastilles sur `RuBP`/`APG`/`PGAL` | arabe retiré (symboles latins seuls), pastilles rejetées au-dessus des boîtes |
| 2 | `u6-calvin-experience` | 2 | libellés arabes d'axes ; pastilles 1 et 4 superposées au coin | axes en `¹⁴C` / `s`, 1 sur le pic APG, 4 près de l'injection |
| 3 | `u7-glycolyse` | 2 | arabe dans les boîtes, pastilles au centre des libellés | `Glucose`/`Fructose-1,6-BP`/`PGAL`/`Pyruvate`, pastilles hors boîtes |
| 4 | `u7-cycle-krebs` | 2 | pastilles au centre des 4 nœuds, « 1 ATP » posé sur le nœud bas, flèche CO₂ traversant un coin | repères sortis, sortie ATP déplacée à droite, CO₂ dégagé |
| 5 | `u7-chaine-respiratoire` | 2 | **erreur scientifique** : flèche de pompe à H⁺ sur T2 ; « ATP » écrit deux fois ; `H⁺` isolé au milieu | pompes limitées à T1/T3/T4, boîte `ATP synthase` + sortie `ATP`, `H⁺` rapproché des pompes |
| 6 | `u8-cycle-matiere-energie` | 2 | flèches de chaleur dirigées **vers** la mitochondrie (sens inversé) | flèches retournées vers l'extérieur, `chaleur` sous le compartiment |

## 2. Synthèse Lot 3

| Indicateur | Valeur |
|---|---|
| Visuels retenus | **6** — 6 SVG, 0 WebP |
| Essais moyens | 2,0 par visuel |
| Poids total | **33,4 Ko** (3,5–9,9 Ko pièce) |
| Repères | 5 à 7 par visuel, tous dans `[5, 95]` |
| Registre après lot | **32 schémas** (27 SVG + 5 WebP annotées), **53 illustrations** |
| Couverture | **44 / 55 leçons (80 %)** — Domaine 2 complet |
| `reviewed: true` | **0** sur 53 |

## 3. Contrôle final

```
node scripts/generer-schemas-svt.mjs --verifier                 → 27 / 27 identiques
/tmp/.venv/bin/python scripts/previsualiser-schemas.py u6-… u7-… u8-…   → 6 planches
/tmp/.venv/bin/python scripts/previsualiser-annotations.py schema-u6-…  → 6 composites
npx vitest run                                                  → 86 fichiers / 729 tests
npm run build && node scripts/verifier-hors-ligne.mjs           → 53 illustrations, coquille 2,21 Mio
```

# Journal de création des schémas — Lot 4 (u9, u10, u11)

**Date** : 2026-11-26 · **Périmètre** : dernier lot du prompt « schémas zéro texte IA ».

## 1. Journal des 8 planches

| Planche | Leçon | Essais | Ce qui a été corrigé après relecture du PNG |
|---|---|---:|---|
| `u9-limites-plaques` | `phase16_chapitres_31_32` | 2 | plaques en biseau de part et d'autre de la dorsale ; subduction oblique passée en bleu (panneau B) |
| `u9-expansion-oceanique` | `phase16_chapitres_31_32_2` | 2 | pastilles N/R décalées des libellés d'âge ; pastille retirée de la croix d'axe |
| `u9-energie-interne` | `phase18_chapitres_35_36` | 2 | formule `²³⁸U·²³²Th·⁴⁰K` dégagée des ronds radioactifs |
| `u10-ondes-sismiques` | `phase19_chapitres_37_38` | 3 | axe des profondeurs ré-inversé (`D = y0 + …`) ; libellés Moho/Gutenberg/Lehmann ramenés à gauche avec halo ; `Fe–Ni` remonté |
| `u10-sial-sima` | `phase19_chapitres_37_38_2` | 3 | planche réécrite (3 colonnes × 4 oxydes), hauteur 680 → 520 px, libellés d'oxydes dégagés du bord des barres |
| `u10-modelisation-terre` | `phase20_chapitres_39_40` | 3 | anneaux concentriques du noyau interne ; `SIAL`/`SIMA` replacés **dans** leurs anneaux (ils étaient hors du disque, donc invisibles) ; unité `km` ajoutée |
| `u11-plis-failles` | `phase20_chapitres_39_40_2` | 3 | panneaux C/D en strates empilées ; pastille 6 ramenée dans le cadre ; lettres C/D dégagées des strates |
| `u11-migmatite` | `d3-u11-l1-migmatite` | 3 | zone de fusion remontée, texte parasite supprimé, encoche parasite retirée des blocs crustaux |

## 2. Synthèse Lot 4

| Mesure | Lot 3 | Lot 4 | Total |
|---|---:|---:|---:|
| Schémas créés | 32 | **40** | 40 |
| SVG écrits à la main | 27 | **35** | 35 |
| Repères posés | 164 | **212** | 212 |
| Leçons illustrées | 44 / 55 | **52 / 55** | 52 / 55 (94,5 %) |
| `reviewed: true` | 0 | **0** | 0 |

## 3. Contrôle final

```
npm run lint                                                    → 0 erreur
npx tsc --noEmit                                                → 0 erreur
npx vitest run                                                  → 86 fichiers / 729 tests
npm run build                                                   → index 497,94 Ko · schemasSvt 52,47 Ko
node scripts/verifier-hors-ligne.mjs                            → OK — 61 illustrations, 0 échec
node scripts/sync-metrics.mjs --check                           → aucune dérive
node scripts/generer-schemas-svt.mjs --verifier                 → 35 / 35 identiques
/tmp/.venv/bin/python scripts/previsualiser-schemas.py u9-… …   → 8 planches relues
/tmp/.venv/bin/python scripts/previsualiser-annotations.py …    → 8 composites relus
```

## Prochains lots

Les quatre lots du prompt sont **livrés**. Ce qui reste n'est pas un lot de production mais une
**relecture** : les 40 entrées attendent la validation nominative de l'enseignant (`reviewed: false`
partout). Reliquats possibles, seulement sur sa demande : un 2ᵉ schéma sur `phase6_chapitres_11_12`
(réponse secondaire) et `phase9_chapitres_17_18` (réflexe myotatique), plus un 3ᵉ reliquat u1–u5.

**Budget** : coquille **2,21 Mio / 2,25 Mio (98,2 %)**, contenu 4,19 Mio. Les quatre lots n'ont coûté
**aucun** octet de coquille : les schémas sont hors précache et hors bundle de démarrage.
