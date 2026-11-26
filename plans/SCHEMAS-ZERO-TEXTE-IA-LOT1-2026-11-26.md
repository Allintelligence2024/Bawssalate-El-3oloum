# Schémas « Zéro Texte IA » — Étape 0 + Lot 1 (u1, u2, u3)

**Date** : 2026-11-26 · **Branche** : `arena/0fa86abf-bawssalate-el-3oloum` · **Périmètre** : Étape 0 (architecture d'annotation + audit de couverture) puis **Lot 1 uniquement**. Les Lots 2 (`u4`, `u5`) et 3 (`u10`, compléments `u6`–`u11`) ne sont **pas** commencés.

Règle tenue de bout en bout : **aucun visuel ne porte de texte généré**. L'image est muette ; les numéros, les termes arabes, les précisions et les formules sont rendus par l'application à partir du registre TypeScript.

---

## 1. Étape 0 — architecture d'annotation

### 1.1 Contrat de données (`src/data/illustrationsLecons.ts`)

```ts
export interface AnnotationSchema {
  num: number;        // 1..n, ordre d'affichage de la légende
  x: number;          // % depuis la gauche de l'image
  y: number;          // % depuis le haut de l'image
  labelAr: string;    // terme officiel 3AS Algérie
  detailAr?: string;  // précision ≤ 90 caractères
}

export type TypeVisuel = 'webp_annote' | 'svg_vectoriel' | 'webp_legacy';
// IllustrationLecon gagne `typeVisuel?` et `annotations?` — sans toucher aux 21 entrées du manuel.
```

Les 21 WebP du manuel vivent dans `src/data/illustrationsLegacy.gen.ts` (généré, jamais édité à la main) avec `typeVisuel: 'webp_legacy'` ; les nouveaux visuels dans `src/data/schemasSvt.ts` (écrit à la main, 15 entrées). `illustrationsLecons.ts` fusionne les deux et expose les helpers (`illustrationsParLecon`, `illustrationsParUnite`, `typeVisuelDe`, `aDesAnnotations`).

### 1.2 Rendu (`src/components/SchemaAnnote.tsx`)

- `VisuelAnnote` : `<img loading="lazy" decoding="async" width height>` + calque `aria-hidden` de pastilles positionnées en `left/top` en pourcentage — donc justes à toutes les largeurs, sans mesure JavaScript.
- `LegendeAnnotations` : `<ol dir="rtl" aria-label="مفتاح المخطط">`, numéro + terme + précision. Le lecteur d'écran lit la liste, jamais des chiffres flottants.

### 1.3 Routage par type visuel appliqué

| Type | Critère retenu | Lot 1 |
|---|---|---|
| **A — SVG écrit à la main** | courbes, graphiques, électrophorèse, coupes géométriques | 10 schémas (`scripts/generer-schemas-svt.mjs`) |
| **B — image muette + pastilles** | illustrations biologiques riches (ultrastructure, complexes moléculaires, modélisation 3D) | 5 images générées, contrôlées une par une, converties en WebP |

Hors-ligne et budget : aucune illustration dans le précache (`vite.config.ts`, `public/sw.js`), toutes les URL passent par `urlIllustration()` (bascule R2 via `VITE_ILLUSTRATIONS_BASE_URL`), le service worker accepte désormais `.webp` **et** `.svg` en cache à la volée.

---

## 2. Audit de couverture (avant → après Lot 1)

55 leçons officielles dans `CHEMIN` (les 2 leçons d'enrichissement `phase22_chapitres_43_44*` restent hors périmètre).

| Unité | Leçons | Illustrations avant | Schémas Lot 1 | Leçons illustrées après |
|---|---:|---:|---:|---:|
| u1 | 5 | 0 | 5 | **5 / 5** |
| u2 | 4 | 0 | 4 | **4 / 4** |
| u3 | 6 | 0 | 6 | **6 / 6** |
| u4 | 8 | 0 | — | 0 / 8 |
| u5 | 5 | 0 | — | 0 / 5 |
| u6 | 7 | 9 | — | 5 / 7 |
| u7 | 5 | 2 | — | 2 / 5 |
| u8 | 2 | 2 | — | 1 / 2 |
| u9 | 5 | 4 | — | 2 / 5 |
| u10 | 3 | 0 | — | 0 / 3 |
| u11 | 5 | 4 | — | 3 / 5 |
| **Total** | **55** | **21** | **15** | **28 / 55 (51 %)** |

Les 21 WebP existantes sont **intactes** (aucun octet modifié) : les tests vérifient que le dossier `public/lecons/img/` contient exactement 21 `.webp` du manuel + 15 nouveaux fichiers.

---

## 3. Lot 1 — les 15 visuels, validés un par un

Chaque visuel a suivi la boucle : spécification → création → rendu composite avec pastilles → **inspection visuelle** → `VALIDE` / `REJETÉ`.

| # | Fichier | Type | Leçon cible | Poids | Repères | Verdict |
|---|---|---|---|---:|---:|---|
| 1 | `u1-reticulum-golgi.webp` | B | `phase1_chapitres_1_2` | 72 Ko | 7 | VALIDE |
| 2 | `u1-flux-information.svg` | A | `d1-u1-l1-expression-genique` | 6 Ko | 9 | VALIDE |
| 3 | `u1-transcription.webp` | B | `lecon_transcription` | 32 Ko | 5 | VALIDE (v2 après REJET de v1) |
| 4 | `u1-code-genetique.svg` | A | `phase1_chapitres_1_2_2` | 10 Ko | 7 | VALIDE |
| 5 | `u1-traduction.webp` | B | `phase2_chapitres_3_4` | 26 Ko | 8 | VALIDE |
| 6 | `u2-niveaux-structure.svg` | A | `phase2_chapitres_3_4_2` | 7 Ko | 7 | VALIDE |
| 7 | `u2-structure-3d.webp` | B | `lecon_representation` | 41 Ko | 5 | VALIDE (avec réserve, §5) |
| 8 | `u2-electrophorese.svg` | A | `amino_acid_behavior` | 10 Ko | 6 | VALIDE |
| 9 | `u2-anfinsen.svg` | A | `phase3_chapitres_5_6` | 9 Ko | 6 | VALIDE |
| 10 | `u3-complexe-enzyme-substrat.webp` | B | `phase3_chapitres_5_6_2` | 11 Ko | 5 | VALIDE |
| 11 | `u3-specificite.svg` | A | `lecon_activite_structure` | 5 Ko | 6 | VALIDE |
| 12 | `u3-ph.svg` | A | `phase4_chapitres_7_8` | 13 Ko | 6 | VALIDE |
| 13 | `u3-temperature.svg` | A | `phase4_chapitres_7_8_2` | 10 Ko | 5 | VALIDE |
| 14 | `u3-michaelis.svg` | A | `d1-u3-l1-enzyme` | 11 Ko | 5 | VALIDE |
| 15 | `u3-inhibition.svg` | A | `enzyme_inhibitors` | 16 Ko | 6 | VALIDE |

- **SVG** : 10 fichiers, 98 369 octets au total (5 à 16 Ko), écrits par `scripts/generer-schemas-svt.mjs` (mode `--verifier` : dérive nulle).
- **WebP** : 5 fichiers, 11 à 72 Ko (plafond 150 Ko, cible 100 Ko), 1200 × 896 px, bandes EXIF supprimées (`convert -strip`), `quality 80`.
- Chaque entrée porte 5 à 9 pastilles, un `labelAr` officiel et un `detailAr ≤ 90` caractères.

### Fichiers de contrôle

`plans/preuves-schemas/<slug>.png` : planches 900 px, visuel + pastilles posées aux coordonnées du registre. **Non versionnées** (preuves QA locales, `.gitignore`), régénérables :

```bash
node scripts/generer-schemas-svt.mjs                 # écrit les 10 SVG + les coordonnées
/tmp/.venv/bin/python scripts/previsualiser-schemas.py   # planches SVG
# WebP : composition identique via plans/_travail-images/reperes-webp.json
```

---

## 4. Défauts détectés et corrigés pendant la boucle

| Défaut | Conséquence | Correction |
|---|---|---|
| Texte dans des commentaires XML | le prévisualiseur « lisait » du faux contenu | générateur v3 : tout `<text>` est un nœud unique, jamais coupé |
| Libellé multi-caractères en nœuds séparés | `4` + `3` rendus `43` | chaque libellé = un seul `texte()` |
| Enzyme de `u3-specificite` fermée avec une micro-encoche | lisait comme un trou infaisable | polygone en V **ouvert vers la gauche** (côté substrat), amidon incliné qui pénètre dans l'encoche |
| Pastilles posées sur les traits/étiquettes | numéros illisibles, structure masquée | re-coordonnées après chaque retouche géométrique (5 itérations sur `u3-inhibition` et `u1-code-genetique`) |
| `S—S` rouge tracé **sur** la liaison rouge | étiquette invisible | libellés décalés hors du segment + halo |
| `Vmax` posé sur la ligne pointillée | texte coupé | libellé remonté de 6 px + halo |
| Planche `u3-temperature` : `37 °C` / `60 °C` / `0 °C` invisibles | trois informations majeures perdues | bug du **prévisualiseur** (couleur prise sur `stroke` du halo → blanc sur blanc), corrigé : le texte se peint avec `fill` |
| 1ʳᵉ image `u1-transcription` : enzyme derrière l'ADN, pas de bulle | **REJETÉE** (anatomie ambiguë) | régénérée : anneau ambré qui enserre l'ADN, ouverture nette, ARNm sortant vers le bas-gauche |

---

## 5. Limites honnêtes

1. **Aucune signature humaine** : les 36 entrées restent `statut: 'a_valider_enseignant'` et `reviewed: false`. Rien ne peut passer `true` sans relecture d'un enseignant (tests + `src/data/*.ts` scannés).
2. **Pas de rendu navigateur dans cet environnement** : ni Chromium (installation Playwright impossible), ni `rsvg`/`cairosvg`. Les SVG sont contrôlés par un rastériseur Python partiel (`scripts/previsualiser-schemas.py`) qui ne gère qu'un sous-ensemble SVG. Le rendu **final** doit être vu une fois dans l'app (ordinateur ou Android) avant toute validation pédagogique.
3. **`u2-structure-3d.webp`** : le modèle en ruban montre clairement des **feuilles β** (flèches) et des boucles, mais les **hélices α** ne sont pas explicites. Les libellés ont donc été rédigés prudemment (aucun repère n'affirme « hélice α » sur cette image). À compléter au Lot 3 par un schéma A dédié si l'enseignant le juge nécessaire.
4. **Budget hors-ligne serré** : coquille **2,23 Mio / 2,25 Mio** (98,7 %). Le Lot 1 coûte ~0,03 Mio (composant d'annotation + registre arabe). Avant le Lot 2, il faudra sortir `schemasSvt.ts` du bundle de démarrage (import différé) ou gagner de la place ailleurs, sinon la porte CI tombera.
5. **Aucune photo `u1`/`u2`/`u3` réutilisée du manuel** : le dossier source n'avait aucune image exploitable pour ces unités (0 / 0 / 1, la seule étant un texte à corriger). Tout a été créé.
6. **Taille de la preuve visuelle** : les planches `plans/preuves-schemas/*.png` ne sont pas versionnées (politique du dépôt) ; elles existent sur le poste après exécution du script.

---

## 6. Porte de validation — résultats

| Commande | Résultat |
|---|---|
| `npx tsc --noEmit` | **0 erreur** |
| `npx eslint .` | **0 erreur, 0 avertissement** |
| `npx vitest run` | **86 fichiers / 725 tests — 100 % OK** |
| `npm run build` | OK (`✓ built in ~1 s`) |
| `node scripts/verifier-hors-ligne.mjs` | **RÉSULTAT : OK** — 36 illustrations servies (WebP + SVG), hors précache, max 99,6 Ko ; 0 problème de cohérence, 0 échec HTTP/type |
| `node scripts/generer-schemas-svt.mjs --verifier` | **10 / 10 identiques** (aucune dérive entre le générateur et les fichiers commités) |
| `node scripts/sync-metrics.mjs` | README à jour (coquille 2,23 Mio) |

### Tests ajoutés ou réécrits

- `src/data/__tests__/illustrationsLecons.test.ts` (10 tests) : 21 entrées du manuel intactes, 15 schémas sur 15 leçons distinctes, pastilles `1..n` dans l'image, `detailAr ≤ 90`, libellés réellement arabes, SVG sans raster ni texte arabe incrusté, disque = registre (36 fichiers), 0 `reviewed: true`.
- `src/components/__tests__/SchemaAnnote.test.tsx` (**nouveau**, 6 tests) : une pastille par annotation aux bonnes coordonnées, `loading="lazy"` + dimensions, légende RTL complète pour les 15 schémas, rien pour les 21 WebP du manuel.
- `src/__tests__/metriques.test.ts` : 36 visuels (21 legacy / 10 SVG / 5 WebP annotées), 8 unités couvertes.
- `scripts/verifier-hors-ligne.mjs` : accepte `.svg`, refuse raster embarqué et texte arabe incrusté, plafond 150 Ko inchangé.

**Arrêt à la porte** : Lots 2 et 3 non entamés, conformément à la consigne.
