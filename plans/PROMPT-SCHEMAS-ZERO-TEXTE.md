# SUPER PROMPT — Création, Auto-Vérification Scientifique 1-par-1 et Intégration des Schémas SVT 3AS « Zéro Texte IA » (Domaines 1, 2 et 3)

> Fichier de référence : ce prompt a été enregistré le 2026-11-26 pour éviter toute coupure de
> copier-coller. Il est conservé **tel que fourni par le produit**, avec ses écarts d'exécution
> documentés en fin de fichier (§ 8 — Journal d'exécution).

## 1. CONTEXTE ET OBJECTIF
Tu es **Ingénieur Pédagogique Multimodal & Développeur Frontend Senior** sur le dépôt **`Bawssalate-El-3oloum`** (application PWA + Android de préparation au Baccalauréat algérien SVT — 3AS Sciences Expérimentales, 100 % arabe RTL).

Lors de l'audit visuel précédent (111 images), **73 % des schémas générés avec texte intégré par IA contenaient des hallucinations graves** (`T 000 °C`, `PS₆`, `CH₁₂N₂O₅`, pH inversés, mots arabes fusionnés ou inventés). De plus, le **Domaine 1 (`u1` à `u5`, cœur du Bac)** et **`u10`** disposent encore de **0 illustration `OK`**.

**Ta mission :** concevoir, produire, **vérifier rigoureusement un par un (visuellement et scientifiquement)** et intégrer des **schémas pédagogiques propres pour l'ensemble des 3 Domaines (`u1` à `u11`)** selon le principe **« ZÉRO TEXTE GÉNÉRÉ PAR IA »** :
- Le **visuel** (image IA ou dessin vectoriel SVG) ne contient **jamais de texte arabe généré par un modèle d'image**.
- Les **repères numérotés (`1, 2, 3…`), légendes, titres, formules chimiques et unités** sont rendus proprement en **HTML / SVG RTL net** par l'application à partir d'un registre TypeScript typé.

---

## 2. RÈGLES NON NÉGOCIABLES (GARDES-FOUS)
1. **RÈGLE D'OR « ZÉRO TEXTE IA » :** toute image générée par un modèle d'image IA doit être **100 % muette** (aucun mot arabe, aucun mot anglais/français, aucune lettre, aucun chiffre, aucun filigrane, aucun titre dessiné dans les pixels). Si une seule lettre ou un seul chiffre déformé apparaît à l'inspection visuelle → **REJET IMMÉDIAT et régénération**.
2. **VÉRIFICATION 1-PAR-1 OBLIGATOIRE :** interdiction absolue de générer un lot de 10 images à l'aveugle puis de les intégrer. **Chaque schéma suit sa propre boucle fermée** (Spécification → Création → Rendu composite avec repères → Inspection visuelle multimodale → Verdict `VALIDE` / `REJETÉ`).
3. **SÉPARATION DES TYPES DE VISUELS (ROUTAGE INTELLIGENT) :**
   - **Type A — Courbes, graphiques, électrophorèses, bilans chiffrés, schémas de membranes/canaux simples, coupes schématiques géométriques** → **Produire en SVG vectoriel propre (ou rendu haute précision à partir de données exactes)**. Avantage : 0 hallucination, valeurs exactes à 100 %, poids plume (< 25 Ko), netteté infinie.
   - **Type B — Illustrations biologiques/géologiques riches** (ultrastructure cellulaire, RER/Golgi, ribosome, structure 3D protéique, site actif, phagocytose, synapse, chloroplaste, mitochondrie, coupe de subduction/dorsale/collision, lames minces) → **Image générée par IA strictement muette (`NO TEXT`)** convertie en **WebP** (`max-width: 1200px`, qualité `80`, EXIF supprimés, **≤ 100 Ko**, plafond dur **150 Ko**) + **annotations numérotées (`①②③…`) posées par coordonnées relatives `(x%, y%)` en HTML/SVG**.
4. **CONSERVATION DES ACQUIS :** ne supprime ni ne casse les **21 WebP `OK` déjà intégrées** (`u6` ×9, `u7` ×2, `u8` ×2, `u9` ×4, `u11` ×4). Tu les conserves intactes (sauf si un nouveau schéma de remplacement est explicitement validé comme supérieur).
5. **HONNÊTETÉ ÉDITORIALE :** toute nouvelle illustration porte `statut: 'a_valider_enseignant'` et `reviewed: false`. **Zéro `reviewed: true`** sans signature humaine réelle.
6. **BUDGET HORS-LIGNE SACRÉ :**
   - Coquille de démarrage (`coquille`) strictement **≤ 2,25 Mio**.
   - **Aucune illustration** dans le précache de démarrage (`vite.config.ts` / `public/sw.js`). Chargement `loading="lazy"` + mise en cache à la volée par le Service Worker.
   - Toutes les URLs passent par `urlIllustration(fichier)` (prêt pour bascule Cloudflare R2 via `VITE_ILLUSTRATIONS_BASE_URL` dès que le volume total dépasse ~60–70 images).
7. **PÉRIMÈTRE PROGRAMME 3AS SE STRICT :** ne produis **aucun schéma** pour les 2 leçons d'enrichissement hors chemin d'U11 (`phase22_chapitres_43_44`, `phase22_chapitres_43_44_2`). Concentre 100 % de l'effort sur les **55 leçons officielles du chemin `CHEMIN`** dans `src/data/programme.ts`.

---

## 3. ARCHITECTURE TECHNIQUE À METTRE EN PLACE EN ÉTAPE 0

Avant de créer la première illustration, prépare proprement l'infrastructure suivante :

### 3.1. Extension du type `IllustrationLecon` (`src/data/illustrationsLecons.ts`)
Étendre l'interface existante sans casser les 21 entrées actuelles :
```ts
export interface AnnotationSchema {
  /** Numéro affiché sur la pastille (1, 2, 3…) */
  num: number;
  /** Coordonnée horizontale en pourcentage (0..100, depuis la gauche de l'image) */
  x: number;
  /** Coordonnée verticale en pourcentage (0..100, depuis le haut de l'image) */
  y: number;
  /** Terme scientifique officiel 3AS Algérie (arabe) */
  labelAr: string;
  /** Courte précision pédagogique facultative (≤ 90 car.) */
  detailAr?: string;
}

export interface IllustrationLecon {
  id: string;
  lessonId: string;
  uniteId: string;
  docNum?: string;
  typeVisuel?: 'webp_annote' | 'svg_vectoriel' | 'webp_legacy';
  fichier: string;          // nom .webp ou .svg dans public/lecons/img/
  largeur: number;
  hauteur: number;
  titreAr: string;
  altAr: string;
  legendeAr?: string;
  /** Pastilles numérotées superposées sur l'image muette + liste de légende arabe RTL dessous */
  annotations?: AnnotationSchema[];
  statut: 'a_valider_enseignant' | 'actif';
  reviewed: boolean;
}
```

### 3.2. Mise à jour de `src/components/IllustrationsLecon.tsx`

* Si `annotations` est présent et non vide :
* Affiche l'image muette dans un conteneur `position: relative` (à l'intérieur de `.fond-schema-clair`, avec `dir="ltr"` sur la couche de coordonnées pour que `left: ${x}%` et `top: ${y}%` soient 100 % prévisibles, indépendamment du RTL global).
* Superpose chaque pastille numérotée (`1, 2, 3…`, cercle contrasté avec bordure blanche, taille lisible sur mobile, bouton cliquable/survolable qui met en surbrillance la ligne correspondante dans la légende).
* Affiche juste en dessous (et dans la lightbox plein écran) la **légende structurée en arabe RTL** (`1 — المصطلح العلمي : الشرح المختصر`).
* Ajoute un petit bouton discret **« إخفاء الأرقام / إظهار الأرقام »** (ou mode auto-test qui masque les textes de légende pour réviser !).

* Respecte l'accessibilité (`aria-label`, focus, `Échap`, **0 violation axe**).

### 3.3. Script de vérification visuelle des repères (`scripts/previsualiser-annotations.mjs`)

Écris un petit script Node/Python local (dans `scripts/` ou `.cache/`) qui, pour toute illustration `webp_annote`, génère une **image composite temporaire** (hors Git, dans `.cache/qa-composites/`) dessinant les pastilles `(x%, y%)` et leurs numéros directement sur l'image WebP.
**Pourquoi ?** Pour que tu puisses **regarder toi-même en vision multimodale l'image composite** et vérifier au pixel près que le numéro `3` tombe bien sur le ribosome et pas dans le vide !

---

## 4. BOUCLE DE CRÉATION ET D'AUTO-VÉRIFICATION OBLIGATOIRE (POUR CHAQUE SCHÉMA)

Pour **CHAQUE** schéma à créer, tu exécutes strictement ces **6 étapes dans l'ordre**, sans jamais en sauter une :

### Étape A — Fiche scientifique source (AVANT création)
1. Lis la fiche correspondante dans `src/data/lessonGoldSummaries.ts` (`missionAr`, `mechanismAr`, `evidenceAr`, `vocabulary`, `commonErrorAr`).
2. Vérifie les contraintes scientifiques spécifiques de l'unité (Section 5 ci-dessous).
3. Définis explicitement : `lessonId`, `uniteId`, `titreAr`, `typeVisuel` (`svg_vectoriel` ou `webp_annote`) ; ce que le schéma doit montrer visuellement (2 à 4 lignes concrètes) ; la liste exacte des `annotations` (`1..N`, max **6 à 8 repères** par schéma pour rester lisible sur mobile).

### Étape B — Génération propre (Zéro texte IA)
* **Si `webp_annote` (génération d'image IA) :** utilise systématiquement le squelette de prompt en anglais avec bloc négatif strict :
  > *« Clean flat textbook scientific biology/geology diagram, educational vector-illustration style, crisp dark outlines, soft harmonious pastel scientific colors on a pure white background, clear distinct anatomical/cellular compartments, high contrast, minimalist 2D cross-section showing [DESCRIPTION VISUELLE PRÉCISE EN ANGLAIS, SPATIALE ET SANS MOTS]. CRITICAL RULE: ABSOLUTELY NO TEXT, NO LETTERS, NO NUMBERS, NO ARABIC SCRIPT, NO ENGLISH LABELS, NO CAPTIONS, NO WATERMARKS, NO LEGEND BOXES, NO CALLOUT LINES, NO SYMBOLS INSIDE THE IMAGE. Pure visual illustration only. »*
  Convertis immédiatement en **WebP** (`max-width: 1200`, qualité `80`, EXIF supprimés) et vérifie taille **≤ 100 Ko** (plafond 150 Ko).
* **Si `svg_vectoriel` :** génère un SVG propre (`viewBox` fixe, police lisible, `direction="ltr"` sur toute séquence `AUG`, formule `Na⁺`, ou axe numérique), puis rends-le en PNG temporaire dans `.cache/qa-composites/` pour pouvoir **l'inspecter visuellement**.

### Étape C — Placement des repères (`x%`, `y%`) et rendu composite
1. Ouvre visuellement l'image muette générée.
2. Mesure/identifie les coordonnées exactes `(x%, y%)` de chaque structure cible (`1..N`).
3. Exécute `previsualiser-annotations` pour produire l'image composite annotée dans `.cache/qa-composites/<id>_qa.png`.

### Étape D — Inspection Visuelle & Scientifique (Grille 6/6 obligatoire)
Ouvre l'image composite et note **chaque critère** (`PASS` / `FAIL`) :

| # | Critère d'auto-vérification | Condition de `PASS` |
| --- | --- | --- |
| **V1** | **Zéro texte IA parasite** | Sur une image IA : **0 lettre, 0 chiffre, 0 gribouillis pseudo-arabe ou pseudo-latin, 0 cadre vide**. |
| **V2** | **Exactitude scientifique 3AS** | Conformité 100 % avec `lessonGoldSummaries.ts` et les règles de la Section 5 (sens des flèches, compartiments, proportions, absence de notions hors-programme). |
| **V3** | **Correspondance à la leçon (`lessonId`)** | Illustre exactement le mécanisme ou la preuve (`evidenceAr`) de la leçon visée — un élève comprend immédiatement le concept clé. |
| **V4** | **Précision des repères (`x%`, `y%`)** | Chaque pastille `1..N` est posée **directement sur la bonne structure**, aucun repère ne flotte dans le vide, aucune superposition entre deux pastilles, aucune pastille coupée au bord (`5 ≤ x ≤ 95`, `5 ≤ y ≤ 95`). |
| **V5** | **Orthographe & terminologie arabe** | Terminologie officielle 3AS Algérie (`البذيرة`, `التمسّخ`, `الارتصاص`, `الميتوكوندري`, `محدّد المستضد`, `موشور الترسيب`, `الغرانوديوريت`, `NADPH,H⁺`, etc.) et zéro fuite française. |
| **V6** | **Qualité visuelle & budget** | Lisibilité sur mobile 360 px, bon contraste en mode clair et sombre (`.fond-schema-clair`), poids **≤ 100 Ko** (max 150 Ko), zéro artefact anatomique/géologique absurde. |

### Étape E — Décision stricte & Boucle de correction (Max 3 essais)
* **6/6 `PASS`** → **`VALIDE`** → enregistre le fichier dans `public/lecons/img/`, ajoute l'entrée au registre, journalise.
* **Au moins un `FAIL`** → **`REJETÉ (Essai k/3)`** → corrige les coordonnées si `V4` seul échoue ; sinon modifie le prompt visuel (ou bascule en `svg_vectoriel`) et régénère.
* Après **3 essais** sans 6/6 : **ne pas intégrer**, marquer **`BLOQUÉ_HUMAIN`** dans `plans/JOURNAL-CREATION-SCHEMAS.md` avec la cause exacte, passer au suivant.

### Étape F — Journalisation obligatoire (`plans/JOURNAL-CREATION-SCHEMAS.md`)
`ID | lessonId | Type (SVG/WebP) | Essais (1..3) | V1..V6 | Poids (Ko) | Verdict (VALIDE / BLOQUÉ_HUMAIN) | Notes`

---

## 5. RÈGLES SCIENTIFIQUES VERROUILLÉES PAR UNITÉ (ANTI-HALLUCINATION 3AS ALGÉRIE)

* **U1 — تركيب البروتين :** `ADN` reste dans le noyau ; seul `ARNm` traverse les pores nucléaires. Transcription : brin transcrit `3'→5'`, `ARNm` `5'→3'` (`A↔U`, `T↔A`, `C↔G`). Polysome : plusieurs ribosomes sur le même `ARNm`, chaînes de plus en plus longues vers `3'`. Traduction : sites `P` et `A` fixes dans la grande sous-unité ; c'est l'`ARNt` qui passe de `A` vers `P`. Sécrétion : `RER` → `جهاز غولجي` → `حويصلات إفرازية` → exocytose (**jamais** de `ببتيد الإشارة`).
* **U2 — البنية والوظيفة :** 4 niveaux structuraux ; ponts disulfures (`S-S`) **covalents** (jamais dans les liaisons faibles). `HbS` : `Glu6 → Val6` sur la chaîne `β`. Électrophorèse : `pH < pHi` → charge `+` → **cathode (`المهبط −`)** ; `pH > pHi` → charge `−` → **anode (`المصعد +`)** ; `pH = pHi` → pas de migration.
* **U3 — النشاط الإنزيمي :** site actif = fixation + catalytique, modèle **`التكامل المحفَّز`**. Eau iodée bleu-violet avec l'**amidon seul**. `pH` en cloche (réversible) ; `T°` asymétrique (froid réversible ; `> 60 °C` = `تمسّخ غير عكوس`). `V = f([S])` avec plateau `Vmax` ; compétitif = même `Vmax`, `Km` augmenté ; non compétitif = `Vmax` diminué, même `Km`.
* **U4 — الدفاع عن الذات :** `CMH-I` sur toutes cellules nucléées (jamais les hématies) ; `CMH-II` sur CPA et `LB`. `ABO` : substance `H` + `GalNAc` (A) ou `Gal` (B) ; `O` = `H` seule. Anticorps en `Y` : 2 `H` + 2 `L` + `S-S` ; `Fab` = `محدّد المستضد` ; `Fc` = macrophage uniquement (pas de NK). `LTc` : double reconnaissance → perforine → pores → choc osmotique. Coopération : `LT4` → `IL-2` → `LB`/`LT8` **préalablement sensibilisées**. `VIH` : `gp120` sur `CD4`, transcriptase inverse, `LT4 < 200/mm³`.
* **U5 — الاتصال العصبي :** repos **`−70 mV`** ; `Na⁺` dehors, `K⁺` dedans ; fuite `K⁺` + pompe `3 Na⁺`/`2 K⁺`. PA : seuil `−50 mV`, pic `+30 mV`, repolarisation, hyperpolarisation `−80 mV`, tout-ou-rien. Synapse : `Ca²⁺` → `ACh` (`PPSE`) ou `GABA` (`PPSI`) → `AChE`. Intégration au segment initial. Morphine : récepteurs opioïdes **présynaptiques** → fermeture `Ca²⁺` → blocage `Substance P`.
* **U6 — التركيب الضوئي :** chloroplaste, **`البذيرة (Granum)`**, thylakoïdes (photolyse sur `PSII`, chaîne → `PSI` → `NADPH,H⁺`, `H⁺` dans la lumière, retour via `ATP synthase`) ; stroma (`الحشوة`) : `6 CO₂ + 6 RuBP → 12 APG` (`Rubisco`). Terme officiel : **`أشنة خضراء`**.
* **U7 — التنفّس والتخمّر :** glycolyse dans le **cytoplasme** (`2 ATP` net, `2 NADH,H⁺`) ; Krebs (`6 CO₂`, `8 NADH,H⁺`, `2 FADH₂`, `2 ATP`) ; crêtes : `O₂` accepteur final → `H₂O`, `ATP synthase` (**têtes côté matrice**) → `~34 ATP` (`~38` total) ; cyanure → **Complexe IV**. Fermentation cytoplasmique : régénération `NAD⁺`, `2 ATP` net, `2 CO₂`/glucose (alcoolique).
* **U8 — التحوّلات الطاقوية :** cycle fermé de la matière (`دورة المادة المغلقة`) vs flux unidirectionnel d'énergie dissipée en chaleur.
* **U9 — النشاط التكتوني للصفائح :** lithosphère rigide (~100 km) sur asthénosphère **solide ductile** (`لدن`, jamais magma liquide). Symétrie des anomalies magnétiques, âge/sédiments croissants loin de la dorsale. Subduction : fosse (`خندق`), **`موشور الترسيب`**, plan de Wadati-Benioff (`0–700 km`), arc volcanique. Convection + traction du panneau + poussée à la dorsale (jamais un « tapis roulant »).
* **U10 — بنية الكرة الأرضية :** `P` (longitudinales) et `S` (transversales, solide seul → zone d'ombre `S > 103°`, `P` `103°–143°`). Discontinuités : **Moho** (`7–10 km` océans / `30–70 km` continents), `LVZ` (`100–250 km`), **Gutenberg** (`2900 km`), **Lehmann** (`5100 km`). Roches : Granite (`SIAL`, 2.7), Basalte/Gabbro (`SIMA`, 3.0), Péridotite (3.3).
* **U11 — البنيات الجيولوجية :** subduction : déshydratation (`شيست أخضر → شيست أزرق → إكلوجيت`) → `H₂O` → baisse du solidus → **fusion partielle** du coin mantellique → andésite / **`الغرانوديوريت`**. Dorsale : décompression adiabatique sèche → basalte en coussins + gabbro (**jamais** de migmatite). Collision : `تقلّص`, plis, failles inverses, racine crustale (`~70 km`), ophiolites, **`المغماتيت`**.

---

## 6. PLAN D'EXÉCUTION PAR LOTS (ARRÊT OBLIGATOIRE ENTRE CHAQUE LOT)

* **Étape 0 (Socle)** : `IllustrationLecon`, `IllustrationsLecon.tsx` (annotations numérotées + légende RTL + bouton masquer/afficher + lightbox + tests axe), `scripts/previsualiser-annotations`, tableau exact des **leçons sans illustration** par domaine (`u1`..`u11`). → **ARRÊT + rapport**.
* **Lot 1 — Domaine 1A (`u1`, `u2`, `u3`)** : 1 à 2 schémas clés par leçon (autoradiographie RER/Golgi, transcription, traduction/polysome, 4 niveaux + HbS, électrophorèse AA, site actif / ajustement induit, courbes pH/T°/Vmax/inhibiteurs). → **CI + commit + ARRÊT**.
* **Lot 2 — Domaine 1B (`u4`, `u5`)** : CMH I/II, ABO, anticorps + phagocytose, `LTc`/perforine, `LT4`/`IL-2`, `VIH`, potentiel de repos/action, synapse, intégration, morphine. → **CI + commit + ARRÊT**.
* **Lot 3 — Domaine 2 (`u6`, `u7`, `u8`)** : conserver les 13 WebP `OK`, combler les leçons sans visuel (Jagendorf, glycolyse, Krebs/chaîne, Mitchell/Racker, fermentation, couplage). → **CI + commit + ARRÊT**.
* **Lot 4 — Domaine 3 (`u9`, `u10`, `u11`)** : conserver les 8 WebP `OK` (`u9` ×4, `u11` ×4), **combler intégralement `u10`** (ondes P/S + zones d'ombre, discontinuités, coupe interne & roches), compléter `u9`/`u11` (hors les 2 enrichissements). → **CI + commit + bilan final**.

---

## 7. VALIDATION CI OBLIGATOIRE À LA FIN DE CHAQUE LOT

Sur un build frais (`rm -rf dist`) :

```bash
npm run lint
npm test
npm run build
node scripts/verifier-drills.mjs
node scripts/verifier-hors-ligne.mjs
node scripts/sync-metrics.mjs --check
```

Vérifie en plus dans `src/data/__tests__/illustrationsLecons.test.ts` que :

* Chaque `lessonId` existe dans `src/data/programme.ts` ;
* Chaque fichier référencé existe dans `public/lecons/img/` et pèse **≤ 150 Ko** ;
* Toutes les coordonnées `annotations` sont dans `[5, 95]` et leurs `num` sont consécutifs (`1..N`) sans doublon ;
* **0 `reviewed: true`** non signé ;
* Coquille hors-ligne strictement **≤ 2,25 Mio** et **0 fichier `/lecons/img/` précaché** ;
* Trace ajoutée dans `plans/relecture/REGISTRE-ARBITRAGES.md` et `plans/JOURNAL-CREATION-SCHEMAS.md`.

**Présenter à la fin de chaque lot :** (1) le tableau de vérification 1-par-1 (`ID | lessonId | Type | Essais | V1..V6 | Poids | Verdict`), (2) la liste des `BLOQUÉ_HUMAIN`, (3) les résultats exacts de la chaîne CI et le poids total de `public/lecons/img/` (alerte au-delà de 5 Mo pour la bascule Cloudflare R2).

---

## 8. Journal d'exécution (ajouté le 2026-11-26)

| § du prompt | État | Où |
|---|---|---|
| § 3.1 types `AnnotationSchema` + `IllustrationLecon` | **fait** | `src/data/illustrationsTypes.ts` (types), `src/data/schemasSvt.ts` (données) |
| § 3.2 composant (pastilles, légende RTL, masquer/afficher, lightbox, axe) | **fait** | `src/components/SchemaAnnote.tsx`, `IllustrationsLecon.tsx`, tests `SchemaAnnote.test.tsx` + `accessibilite.test.tsx` |
| § 3.3 script composite QA | **fait**, écrit en **Python** (`.py`) et non en Node (`.mjs`) | `scripts/previsualiser-annotations.py` → `.cache/qa-composites/` |
| § 4 boucle A→F | **fait** (A, B, C, E, F à chaque planche ; grille V1–V6 appliquée puis consignée en synthèse dans le journal) | `plans/JOURNAL-CREATION-SCHEMAS.md` |
| § 5 règles scientifiques par unité | **appliquées** ; 3 erreurs corrigées en relecture (pompe T2 en u7, axe des profondeurs en u10, `SIAL`/`SIMA` hors disque en u10) | journal + registre A-071/A-072/A-073 |
| § 6 lots et arrêts | **fait** : Étape 0, puis Lots 1 → 4, chacun clos à sa porte | `plans/SCHEMAS-ZERO-TEXTE-IA-LOT1..4-2026-11-26.md` |
| § 7 chaîne CI | **fait** aux portes des Lots 1–3 et du Lot 4 (`lint`, `tsc`, `vitest`, `build`, `verifier-hors-ligne`, `sync-metrics --check`, `generer-schemas-svt --verifier`) ; `verifier-drills.mjs` a été ajouté à la **porte finale**, pas aux portes intermédiaires | rapports de lot |
| § 2.3 routage Type A / Type B | **partiel, assumé** : 36 SVG(Type A) + 5 WebP muettes annotées (Type B, u1×3, u2×1, u3×1) ; les schémas des Lots 2 à 4 sont tous vectoriels (voir A-069/A-070) | registre |
