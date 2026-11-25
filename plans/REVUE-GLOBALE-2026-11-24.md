# Revue globale de la maquette — bugs, bidi, design

> Demande : « review all your work and fix bugs and errors … words in arabe + some
> character in french is disorientated … fix design and colors ».
> Portée : les six phases (1 → 6), pas seulement l'écran « أنا ».
> Version des assets : `?v=39` (15 occurrences dans `index.html`).

---

## 1. Méthode

| Ce qui a été regardé | Comment |
|---|---|
| Contrat fonctionnel | les 7 suites `tests/phase1…6 + robustesse` — **524 assertions vertes** |
| Texte arabe + latin/chiffres | audit programmatique des nœuds texte (4 routes), puis test visuel de 7 variantes de ponctuation (`/tmp/bidi-variantes*.png`) |
| Mise en page | Chromium 320×568 · 360×640 · 390×844 · 430×932, 4 routes, débordement + barre d'onglets + zone défilable |
| Impression | PDF A4, `.carte-print` mesurée (**529 px ≈ 140 mm**, **1 page**) |
| Couleurs | ratios de contraste calculés (WCAG) sur 16 paires clair + 9 paires sombre |
| Thème sombre | capture `ana` + `masari` en `data-theme="dark"` |
| Erreurs JS | `pageerror` sur chaque route et chaque taille — **aucune** |

---

## 2. Bugs corrigés

### 2.1 La fin de « مساري » était inaccessible (bloquant)

`.contenu { overflow: hidden }` ne rendait défilable qu'en dessous de 740 px de
hauteur. Sur un écran 390×844, les cartes « الانتظام », « خطة اليوم », « بطاقات
الأدلة » et la feuille de route étaient **coupées et impossibles à atteindre** —
aucun moyen de faire défiler.

→ `.contenu` défile toujours quand le contenu dépasse (`overflow-y: auto`,
`overscroll-behavior: contain`, `scrollbar-width: thin`). Vérifié :
`clientHeight 625 / scrollHeight 1891` sur 390×844, bas de page atteignable.

### 2.2 Texte « désorienté » : point final après un mot latin

Une phrase arabe qui finit par un sigle latin + point (« … ARNm. ») affiche le
point **à l'autre bout de la ligne** : « .ARNm ».

Variantes testées, résultat visuel :

| Variante | Rendu | Verdict |
|---|---|---|
| point simple | `.ARNm` | ✗ |
| `.\u200F` (RLM) | `.ARNm` | ✗ sans effet |
| `.\u200E` (LRM) | `ARNm.` | ✓ sur une ligne… mais **casse le retour à la ligne** (la fin de phrase passe au début de la ligne suivante) |
| sans point | `ARNm` | ✓ |
| point arabe `\u06D4` | ▯ (glyphe absent de la police) | ✗ |
| `\u200F.` / `.\u200F ` | `.ARNm` | ✗ |

**Décision : correction éditoriale, pas de hack invisible.** 25 chaînes de
`js/data-svt-3as.js` finissaient par `[A-Za-z].` ; le point final a été retiré
dans la donnée. Avantages : les tests continuent de comparer le DOM au contenu
(pas de transformation cachée), et la phrase reste lisible. Règle retenue :

> Une phrase arabe ne doit pas se terminer par « mot latin + ponctuation ».
> On enlève le point, ou on réécrit la fin de phrase en arabe. Un chiffre suivi
> d'un point (`2022.`) est correct et n'est pas touché.

Deux phrases ont en plus été **réécrites** parce qu'elles mélangeaient plusieurs
paires « unité: valeur » collées à de l'arabe :

- avant : `بلا α-amanitine: 100 %. مع 10 µg/ml: 60 %. التناسب عكسي مع التركيز.`
- après : `الوثيقة أ: النشاط 100 % بلا α-amanitine، و60 % مع 10 µg/ml. التناسب عكسي مع التركيز.`

### 2.3 Badge « السؤال 1 · 3,25 · C4 نقطة »

Trois problèmes en un : la note décimale (interdite par la règle « pas de note »),
la virgule française (`,`) dans un texte arabe, et le réordonnancement bidi qui
affichait `السؤال 1 · 3,25 · C4` au lieu de `السؤال 1 · C4 · 3,25`.

→ badge réduit à `السؤال 1 · C4` (la compétence, pas la note). Même nettoyage au
bilan et sur la feuille imprimée. `pointsTexte()` (qui convertissait `.` en `,`)
est supprimée.

### 2.4 Figure « courbe » : graduations illisibles

- Les étiquettes de l'axe vertical étaient ancrées en `end` alors que le SVG
  héritait de `direction: rtl` : elles partaient **vers la droite** et se
  faisaient recouvrir par le premier point (`1()` au lieu de `100`).
- Le point de départ (x = 0) était collé à l'axe et à l'étiquette.

→ `direction="ltr"` sur la racine des SVG (`cadre()`), marge de gauche élargie
(`gx 42 → 48`, `gw 196 → 188`), étiquettes à `gx - 9`. Rendu vérifié à 3× :
`100 / 50 / 0` et `0 / 10 / 100` nets.

### 2.5 Cadre épais autour de la consigne de quête

`B.focus()` cible un `tabindex="-1"` ; le navigateur dessinait son anneau de
focus par défaut, qui ressemblait à une bordure miel de 3 px autour de la
question.

→ règle globale `[tabindex="-1"]:focus { outline: none }` (les éléments
réellement focusables au clavier gardent le leur).

### 2.6 Bouton grisé qui ne dit rien

Dans la quête et dans le bac, le CTA restait `الخطوة الجاية` en grisé avant la
réponse. Il dit maintenant **`اختار جواب أوّلًا`**, puis reprend son libellé.
Le test de phase 4 a été mis à jour pour vérifier cette nouvelle formulation
(`CTA guidé tant qu'on n'a pas répondu`).

### 2.7 Carte de phrase du chasseur de pièges

`.fakh-carte { justify-content: center }` n'avait aucun effet : la carte n'était
pas un conteneur flex, donc la phrase restait collée en haut d'un bloc de 190 px.

→ `display: flex; flex-direction: column; justify-content: center`, phrase
centrée. `gap` ajouté pour séparer l'en-tête du texte.

### 2.8 Onglet « الأدلة » vide du tiroir

Une seule ligne de texte en haut d'un panneau plein écran. → état vide assumé :
icône, titre `ما زال ما عندك أدلة`, explication, encadré pointillé.

### 2.9 Thème sombre : vert d'encre illisible

`--pine` (#32705c en sombre) servait à la fois de **fond de bouton** et de
**couleur de texte** : 2,88:1 sur le papier sombre, très en dessous du seuil.

→ nouveau jeton `--pine-texte` (`#225342` en clair, `#7fbfa4` en sombre,
**7,90:1**), appliqué aux 23 usages « texte » ; `--pine` reste réservé aux fonds.

---

## 3. Design & couleurs

| Écran | Avant | Après |
|---|---|---|
| Onboarding | grand vide au-dessus de la mascotte | halo miel doux, mascotte 202 px, titre 30 px, espace réparti |
| Quête | question collée en haut, 600 px de vide sous les options | bloc question + réponses centré optiquement (marges automatiques : rien n'est coupé si ça déborde) |
| Masari — cartes فخاخ / أنا | deux gros pavés avec boutons pleine largeur | cartes compactes sur une ligne, liseré de couleur, bouton `افتح` 44 px |
| Masari — fin de page | inaccessible | défile, et la feuille de route 6 phases + le rappel des droits sont atteignables |
| أنا — carte | rose à gauche, textes serrés à droite, zone morte en bas | rose + niveau à droite, bandeau de 3 chiffres (أدلة · أيام · دروع) sous un filet |
| Carte imprimée | niveau écrit deux fois | mode compact : en-tête + rose + 3 chiffres, sans répétition |
| Onglet actif | sous-libellé gris à 75 % sur fond vert | lisible (`--pine-texte`, opacité 1) |
| Chasseur — phrase | collée en haut | centrée, carte stable 190 px |

Palette inchangée (encre `#225342`, miel `#c9902a`, papier `#fffef8`) : les
ratios étaient déjà bons. Contrôles : `ink/paper 11,87` · `muted/paper 6,25` ·
`miel-ink/miel 8,93` · `sauge-ink/sauge 8,83` · `honey/or-clair 5,59` ·
`paper/pine 8,72` · sombre : `ink/paper 14,89` · `muted/paper 8,48` ·
`pine-texte/paper 7,90`.

---

## 4. Ce qui n'a pas bougé (contrats)

- Aucune note sur 20 : niveaux 50 XP, indicateur directionnel, mention
  « تدريب / مؤشّر توجيهي غير مُعايَر ».
- Pas de Game Over, pas de chrono qui punit, pas de CTA mort.
- Mécanique du bac (6 étapes, aide à la 1ʳᵉ erreur, révélée à la 2ᵉ, 3/2/0 XP +6),
  chasseur de pièges (8 jugements, `faux` = piège), SM-2, drapeaux, kafaa 8/8.
- Phase 4 « validée » : comportement conservé, seuls ses tests ont gagné deux
  assertions sur le nouveau libellé du CTA.

---

## 5. Preuves

- Suites : **phase1 50 · phase2 58 · phase3 48 · phase4 181 · phase5 105 ·
  phase6 70 · robustesse 12 = 524** assertions, toutes vertes.
- `node --check` : 13 scripts, aucun échec.
- Grille : 4 tailles × 4 routes → `scrollX:false` partout, aucun élément hors
  cadre, `pageerror` : aucune.
- Impression : `.carte-print` 529 × 501 px, PDF **1 page** A4.
- Captures : `maquettes/apercu-phase-6-{acces,ana,kafaa,revisions,carte}.png`
  et `maquettes/apercu-revue-{onboarding,masari,masari-fin,quete,fakh,fakh-jouer,
  fakh-retour,bac-etape,tiroir}.png`.

---

## 6. Limites connues

- La phrase reste top-alignée sur les très grands écrans quand il n'y a rien à
  centrer (onboarding) : c'est un choix, pas un bug.
- Les étiquettes SVG de la carte sont en arabe + chiffres arabes orientaux ;
  une police système très pauvre pourrait dégrader le rendu (aucun test réel
  sur appareil, seulement Chromium).
- Le tiroir garde sa hauteur pleine même quand l'onglet est court (feuille
  latérale) ; l'état vide est maintenant explicite.
