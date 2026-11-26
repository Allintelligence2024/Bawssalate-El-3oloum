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

## Prochains lots (non commencés)

- **Lot 2** — `u4` (8 leçons) et `u5` (5 leçons) : 0 illustration aujourd'hui.
- **Lot 3** — `u6`/`u7`/`u8` : conserver les 13 WebP, combler les leçons sans visuel (Jagendorf, glycolyse/Krebs/Mitchell-Racker, fermentation, couplage).
- **Lot 4** — `u9`/`u10`/`u11` : `u10` intégralement (ondes P/S + zones d'ombre, discontinuités, coupe interne).

**Alerte budget** : coquille hors-ligne à **2,23 Mio / 2,25 Mio (98,7 %)**. Avant le Lot 2, sortir
`src/data/schemasSvt.ts` du bundle de démarrage (import différé) ou gagner de la place ailleurs,
sinon la porte CI tombera au premier schéma ajouté.
