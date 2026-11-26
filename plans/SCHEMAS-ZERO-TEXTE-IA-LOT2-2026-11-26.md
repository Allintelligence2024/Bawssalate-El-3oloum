# Schémas « Zéro Texte IA » — Lot 2 (u4, u5)

**Date** : 2026-11-26 · **Branche** : `arena/0fa86abf-bawssalate-el-3oloum` · **Périmètre** : **Lot 2 uniquement** — `u4` (immunologie, 6 schémas) et `u5` (communication nerveuse, 4 schémas). Les Lots 3 (`u6`–`u8`) et 4 (`u9`–`u11`) ne sont **pas** commencés.

Règle tenue : **aucun visuel ne porte de texte généré**. Les 10 visuels sont des **SVG écrits à la main** (`scripts/generer-schemas-svt.mjs`) ; les seuls mots qu'ils contiennent sont des symboles scientifiques contrôlés (`ADN`, `ATP`, `Ca²⁺`, `Na⁺`, `K⁺`, `Cl⁻`, `CD8`, `IL-2`, `CMH-I`, `LT4`, `Ag`, `H₂O`, `SI`, `Ag–Ac`, `mV`, `ms`), tous doublés en arabe par `legendeAr` + `annotations`.

---

## 1. Prérequis de budget — débloqué avant le lot

Le Lot 1 s'était arrêté sur une alerte : coquille hors-ligne à **2,23 / 2,25 Mio (98,7 %)**, et l'import statique de `SCHEMAS_SVT` dans `IllustrationsLecon.tsx` tirait les 26 Ko de schémas au démarrage. Corrigé avant d'ajouter un octet de schéma :

| Mesure | Avant | Après |
|---|---:|---:|
| `src/data/illustrationsTypes.ts` | — | **créé** : types + `typeVisuelDe` / `aDesAnnotations`, **zéro donnée** |
| `IllustrationsLecon.tsx` | `import { SCHEMAS_SVT }` (statique) | `import('../data/schemasSvt')` dans un `useEffect` + `useMemo` |
| Chunk `schemasSvt-*.js` | dans `index-*.js` | **26,33 Ko séparés** (gzip 7,03) |
| Coquille hors-ligne | 2,23 Mio | **2,21 Mio** |

`vite.config.ts` : `/^assets\/schemasSvt-/` ajouté à `HORS_PRECACHE` — les schémas restent hors précache, comme les WebP.

---

## 2. Les 10 visuels, contrôlés un par un

Chaque planche a suivi la boucle : fiche scientifique (`lessonGoldSummaries.ts`, `missionAr`/`vocabulary`) → écriture dans le générateur → **planche rastérisée** (`plans/preuves-schemas/<slug>.png`) → **composite avec pastilles** (`.cache/qa-composites/<id>_qa.png`) → inspection 6 critères (V1 texte IA, V2 science, V3 leçon, V4 repères, V5 arabe, V6 qualité/budget) → `VALIDE` / `REJETÉ`.

| # | Fichier | Leçon cible | Poids | Repères | Verdict |
|---|---|---|---:|---:|---|
| 1 | `u4-cmh.svg` | `phase5_chapitres_9_10` | 3,6 Ko | 5 | VALIDE (3 essais) |
| 2 | `u4-groupes-abo.svg` | `phase5_chapitres_9_10_2` | 9,1 Ko | 6 | VALIDE (2 essais) |
| 3 | `u4-phagocytose.svg` | `phase6_chapitres_11_12_2` | 8,1 Ko | 6 | VALIDE (3 essais) |
| 4 | `u4-ltc-perforine.svg` | `phase7_chapitres_13_14` | 3,3 Ko | 6 | VALIDE (2 essais) |
| 5 | `u4-cooperation-lt4.svg` | `phase7_chapitres_13_14_2` | 3,1 Ko | 7 | VALIDE (2 essais) |
| 6 | `u4-vih.svg` | `immunity_hiv_aids` | 5,5 Ko | 5 | VALIDE (2 essais) |
| 7 | `u5-potentiel-repos.svg` | `phase8_chapitres_15_16` | 10,6 Ko | 6 | VALIDE (2 essais) |
| 8 | `u5-potentiel-action.svg` | `phase8_chapitres_15_16_2` | 3,3 Ko | 6 | VALIDE (2 essais) |
| 9 | `u5-integration.svg` | `phase9_chapitres_17_18_2` | 4,5 Ko | 5 | VALIDE (réécrit) |
| 10 | `u5-morphine.svg` | `phase10_chapitres_19_20` | 4,5 Ko | 6 | VALIDE (3 essais) |

- **10 SVG**, **55,6 Ko** au total (3,1–10,6 Ko pièce) — très en dessous de la cible de 100 Ko, aucun raster embarqué.
- 5 à 7 pastilles par visuel, toutes dans `[5, 95]`, `detailAr ≤ 90` caractères, libellés arabes officiels.
- Deux leçons libres restent disponibles pour un second schéma (`phase6_chapitres_11_12`, `phase9_chapitres_17_18`), sous le plafond de 2 par leçon.
- Un seul visuel par leçon : aucune leçon ne dépasse 1 schéma dans ce lot.

---

## 3. Couverture après Lot 2

| Unité | Leçons | Schémas Lot 1 | Schémas Lot 2 | Leçons illustrées |
|---|---:|---:|---:|---:|
| u1 | 5 | 5 | — | 5 / 5 |
| u2 | 4 | 5 | — | 4 / 4 |
| u3 | 6 | 6 | — | 6 / 6 |
| u4 | 8 | — | **6** | **6 / 8** |
| u5 | 5 | — | **4** | **4 / 5** |
| u6 → u11 | 27 | — | — | 13 / 27 (WebP du manuel) |
| **Total** | **55** | 16 | **10** | **38 / 55 (69 %)** |

Reste non couvert : `phase6_chapitres_11_12` et `phase9_chapitres_17_18` (un second schéma y serait possible sans dépasser le plafond), puis les unités des Lots 3 et 4.

---

## 4. Défauts détectés et corrigés pendant la boucle

| Défaut | Conséquence | Correction |
|---|---|---|
| `out.push(...macro(...))` où `macro()` renvoie une **chaîne** | le spread éclatait la chaîne en caractères, un par ligne → **SVG non parsable** (`u4-phagocytose`, ligne 10) | `out.push(macro(...))` sans spread ; garde-fou : les 10 fichiers sont re-parsés à chaque génération |
| 4 panneaux de 270 px à partir de x = 960 | le 4ᵉ panneau sortait de la zone (`1230 > 1200`) | largeur 260, pas de 280 (60/340/620/900) |
| Pastilles 1 et 2 posées aux **mêmes coordonnées** | deux numéros superposés illisibles | chaque repère re-vérifié par script (générateur ↔ registre, tolérance 0,7 %) |
| `IL-2` écrit **sous** la pastille 2 | le mot-clé de la leçon disparaissait | libellé déplacé hors des boîtes, pastille sur le trajet de la flèche |
| Flèches diagonales du LT4 vers des boîtes **alignées verticalement** | trajet incohérent, la flèche partait dans le vide | flèches verticales LT4 → LB / LTc, horizontales précurseur → effecteur |
| `u4-phagocytose` : pastille 1 (Ag) sur le corps de l'anticorps, pastille 2 sur l'antigène | **inversion sémantique** Ag/Ac | repères échangés, composite refait |
| `u4-vih` : boîte « SIDA » flottante au-dessus de la courbe | zone sans signification graphique | bande verticale hachurée sous le seuil des 200 LT4/mm³ |
| `u5-morphine` : morphine dessinée **dans** la terminaison, récepteur en dehors de la membrane | lecture inverse du mécanisme | récepteur agrandi à cheval sur la membrane, morphine insérée dedans |
| `u5-integration` : axone déconnecté, flèches de sommation vers le vide | schéma illisible | planche réécrite : boutons Na⁺/Cl⁻ avec leur ion écrit à l'intérieur, sommation temporelle qui aboutit sur un bouton précis |
| Coordonnées > 95 % (`u5-integration` n° 3 à 95,5) | test du registre rouge | repère ramené à 94,7 %, générateur et registre réalignés |
| `const cellule` déclaré sans usage | `eslint .` rouge (règle `no-unused-vars`) | helper supprimé |

**Réflexe confirmé** : après **chaque** retouche géométrique, régénérer puis refaire le composite — une pastille valide sur une version ne l'est plus sur la suivante.

---

## 5. Limites honnêtes

1. **Aucune signature humaine** : les 47 entrées restent `statut: 'a_valider_enseignant'` et `reviewed: false`. Les tests refusent `reviewed: true`.
2. **Pas de navigateur ici** : les SVG sont contrôlés par un rastériseur Python partiel (ni Chromium, ni `rsvg`, ni `cairosvg`). L'aperçu réel tourne sur `npm run dev` (port 3000) et doit être regardé une fois par l'enseignant.
3. **Trois planches restent schématiques** : `u4-cmh` (les deux récepteurs sont des pictogrammes), `u4-cooperation-lt4` (boîtes + cercles, sans forme cellulaire), `u5-morphine` (terminaison présynaptique unique). C'est un choix de lisibilité, pas une contrainte technique — à réévaluer si l'enseignant préfère un rendu plus figuratif.
4. **Pas de WebP annotée dans ce lot** : les 10 sujets se prêtaient au vectoriel (courbes, chronologies, schémas de mécanisme). La famille `webp_annote` reste à 5 visuels.
5. **Planches et composites non versionnés** (politique du dépôt).

---

## 6. Porte de validation — résultats

| Commande | Résultat |
|---|---|
| `npm run lint` (`eslint .`) | **0 erreur** |
| `npx tsc --noEmit` | **0 erreur** |
| `npm test` (`vitest run`) | **86 fichiers / 729 tests — 100 % OK** |
| `npm run build` | OK — `index-*.js` 497,94 Ko (gzip 150,58) · `schemasSvt-*.js` 26,33 Ko (7,03) |
| `node scripts/verifier-hors-ligne.mjs` | **RÉSULTAT : OK** — 47 illustrations, coquille **2,21 Mio**, contenu 4,19 Mio, 0 incohérence |
| `node scripts/sync-metrics.mjs` | README réaligné (coquille 2,21 Mio) |
| `node scripts/generer-schemas-svt.mjs --verifier` | **21 / 21 identiques** (aucune dérive générateur ↔ fichiers commités) |

### Tests mis à jour

- `src/data/__tests__/illustrationsLecons.test.ts` : 26 schémas (`{u1:5, u2:5, u3:6, u4:6, u5:4}`), 21 SVG + 5 WebP annotées, 25 leçons distinctes (≤ 2 par leçon), disque = registre (**47 fichiers**), 0 `reviewed: true`, helper `illustrationsParUnite('u10')` vide.
- `src/__tests__/metriques.test.ts` : 47 visuels, 10 unités couvertes, 21 SVG.

**Arrêt à la porte** : Lots 3 et 4 non entamés ; aucune promotion `reviewed: true`.
