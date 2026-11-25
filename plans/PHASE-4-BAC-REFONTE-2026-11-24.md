# Phase 4 — « الباك خطوة بخطوة » · méthode d'examen, figures et preuves

Date : 2026-11-24 (maj tardive) · Maquette : `maquettes/super-bawssala` · Version affichée : **1.7** · Assets `?v=32`

## 1. Les retours qui ont déclenché la refonte

> « la phase 4 est très mauvaise, le système de correction est totalement faux et
> difficile à faire, l'élève ne comprend rien […] do something that will let him learn
> and be better like other phases »

> « there is so much bugs and errors pls fix them and evolve more the system make it
> more simple than this in just phase 4 so the student get it more freely and know much
> better how to use his methode in the exam bac »

> « the bouttons don't work and there is some bugs and also where they are the preuves
> or media that are related to that exos or photos where they are fix this also »

Trois exigences : **moins d'écran, plus de méthode**, **zéro bouton mort**, et
**l'exercice doit montrer ses documents, ses figures et ses preuves**.

## 2. La méthode d'abord (écran d'entrée)

Avant la première question, un écran unique — vu **une seule fois** par profil
(`bac.vu`, réinitialisable via `?reset=1`) — enseigne les 3 gestes de l'examen :

1. **شوف الوثيقة** — qu'est-ce qui change ? le chiffre, la condition, le temps…
2. **فسّر الآلية** — comment ça se passe ? relier le document à l'idée du cours.
3. **استنتج** — quelle conséquence sur la cellule ? une phrase, sans remplissage.

Chaque question est ensuite **exactement** ce cycle (وثيقة ← آلية ← نتيجة), et l'étape
courante est rappelée dans la progression (« خطوة 2 من 6 · الآلية »). La méthode est
accessible à tout moment via le tiroir **مرجع البوصلة › الطريقة**.

## 3. L'écran d'étape

| Avant | Maintenant |
|---|---|
| 6 pastilles + libellé | 1 jauge + « خطوة N من 6 · <geste> » |
| intitulé + mention + question + doc + bande de 4 documents | 1 carte : mention + question + **document illustré** + 4 vignettes أ/ب/ج/د |
| 2 boutons | 1 bouton-icône « المرجع » + vignettes cliquables |
| aide uniquement après une erreur | **« عاونّي بفكرة صغيرة »** : indice à la demande, sans coût |

Le reste ne bouge pas : 4 choix, retour immédiat, « الخطوة الجاية ».

## 4. Les documents ont enfin un visuel (v32)

`js/component-figure.js` (nouveau) dessine en SVG inline, style « cahier » (encre
`#225342`, miel `#c9902a`), quatre figures de 260 × 140 :

| Document | Figure |
|---|---|
| أ · activité enzymatique | **courbe** 100 → 60 (10 µg/ml) → 22 → 8, axes gradués, points miel |
| ب · boucle TL | ADN double brin + ARNm naissant + enzyme barrée d'un ✕ |
| ج · croissance tumorale | **barres** 3 groupes (اليوم 0 / 7 / 15), بلا دواء vs ATAC, max 2000 mm³ |
| د · mécanisme ATAC | flux en 4 temps : ATAC (Y + 2 toxines) → protéine de membrane → endocytose + lysosome → noyau barré |

- `B.figure(type, opts)` renvoie le SVG ; `role="img"` + `aria-label` décrivent chaque figure.
- Chaque document porte `figure:{type}` dans `js/data-svt-3as.js`.
- La figure du document **affiché** est rendue dans la carte de la question ; les 4
  vignettes permettent de comparer les documents sans quitter la question (C4).
- `rendreFigure()` protège l'écran : si `B.figure` manque ou lève, la carte s'affiche
  sans figure plutôt que de casser.

## 5. Les preuves du sujet (v32)

- `BAC_PREUVES` (dans `js/data-svt-3as.js`) : `bac-c4` (« بكالوريا 2022 · تمرين 2 · س 1 »,
  figure courbe) et `bac-c5` (« … س 2 », figure ATAC), chacune avec `code`, `source`,
  `competence`, `texte`, `figure`.
- Elles sont concaténées à `registrePreuves`, donc visibles dans le **registre commun**
  (tiroir › الأدلة) comme les preuves des autres phases.
- `bacTerminer()` les ajoute à `etat.preuves` (une fois chacune).
- Le bilan gagne la section **« أدلتك من هذا التمرين »** (badge « 2 بطاقة ») : chaque
  carte montre sa source, sa figure et sa phrase de cours.
- La feuille A4 imprimée intègre la courbe (question 1) et le schéma ATAC (question 2) —
  toujours **1 page**.

## 6. Boutons morts : ce qui a été trouvé et corrigé

Audit par clic systématique (Playwright, `tmp-deadclicks.mjs`), sur مساري et sur l'étape.

1. **`TypeError: Cannot set properties of undefined (setting 'choix')`** au clic sur une
   réponse quand `bac.id` existait mais `bac.etapes` était vide ou partiel (profil
   restauré d'une version antérieure). ⇒ `Etat.bac()` **normalise chaque étape à chaque
   appel** (`choix/essais` clampé 0..2, `juste/revele/xp/gain/donne`), plus un garde-fou
   `if (!r)` dans `bacRepondre`. Vérifié : 6 étapes normalisées, clic → XP, 0 erreur.
2. **Vignettes أ/ب/ج/د inertes** : `[data-doc]` n'avait aucun handler. ⇒ délégation
   `click` sur la carte, `S.docAffiche`, retour « رجع لوثيقة الخطوة ».
3. **Onglet de navigation actif** (`مساري`) : clic sans effet. ⇒ `aria-selected` +
   no-op explicite quand on est déjà dessus.
4. **Onglets des phases non construites** (`تدريبات`, `أنا`) : boutons qui ne faisaient
   rien. ⇒ `aria-disabled="true"` + mention « قريبًا » sous le libellé (plus de faux CTA).
5. **Onglet « البوصلة »** ambigu (il ouvrait le bac) : renommé **« الباك »**.

Le reste des « MORT » de l'audit sont des no-ops légitimes (thème, son, reset, déjà
sélectionné) — vérifiés un par un (`tmp-check-chrome.mjs` : thème light→dark, son
`aria-pressed` true→false, reset → مساري + 0 XP).

## 7. Le retour immédiat doit être VU

Avec la figure du document, la carte dépasse la hauteur d'un téléphone : après une erreur,
l'élève ne voyait qu'une croix et devait deviner qu'il fallait faire défiler.

- `montrerRetour()` : après chaque réponse, `.contenu--bac` défile en douceur jusqu'au
  panneau de retour (explication / indice / « الجواب: … »).
- `hautDePage()` : chaque changement d'étape ou de vue repart du haut.
- Le pied collant reste visible : CTA « الخطوة الجاية » + note (« جواب باش تكمّل »).

## 8. Autres corrections de la passe

1. **XP de clôture re-crédités** : `bac.bonus` reste acquis après un replay ; une étape
   révélée marque `donne: true` (plus de points gagnables en se trompant exprès).
2. **Brouillon inaccessible** puis **brouillon perdu à l'impression** : zone toujours
   affichée + `flushPapier()` avant imprimer / rejouer / quitter / re-rendu.
3. **Pied de page coupé** sur portable bas : `transform: scale()` → `zoom`.
4. **Panneaux non focalisables** : `tabindex="-1"`. **`data-retour` ambigu** : la
   délégation ne réagit qu'aux `button`/`a`.
5. **Numérotation imprimée instable** (bidi) : `<span>` explicite en RTL.
6. **Cache** : `?v=32` sur **tous** les assets (11 scripts + CSS), `component-figure.js`
   chargé avant `state-engine.js`.

## 9. Modèle de données / état

- `BAC` : 4 documents (`figure`), 2 questions (q1 C4 · 3.25 pts, q2 C5 · 3.75 pts),
  **6 étapes** (`consigne`, `aide`, `cle`, 4 options avec `retour`) + `briques`.
- État : `bac{id, etapes, papier, fini, bonus, vu, le}`, chaque étape
  `{choix, essais, juste, revele, xp, donne, gain}`.
- API : `bac()`, `bacEtape(id)`, `bacEtapes()`, `bacProgression()`, `bacRepondre(id,opt)`,
  `bacPapier`, `bacTerminer()`, `bacReinitialiser()`, `bacBilan()`, `bacVu()`,
  `bacMarquerVu()`.
- Write-back à la clôture : `observe = round(clamp(3 × premierCoup / 6 − 0.5 × révélées, 0..3))`
  → `kafaa.c4` / `kafaa.c5`, +6 XP une seule fois, événement
  `learning.attempt.completed {source:"bac", timed:false, …}`. Jamais de /20.

## 10. Vérifications

- `node --check js/*.js` : OK (11 scripts).
- jsdom : **phase1 50 · phase2 58 · phase3 48 · phase4 179 · robustesse 12** (347 assertions).
  Nouveaux tests phase 4 : figure du document affiché (1 `.figure`, `role="img"`,
  `aria-label`), les 4 documents savent se dessiner, 2 preuves bac dans le registre +
  rendues dans le bilan avec leur figure, état partiel (`bac.etapes = {}`) → 6 étapes
  normalisées et clic sans crash.
- Chromium 390×844 et 320×568 : parcours complet (méthode → 6 étapes avec aide, erreur,
  comparaison de documents → bilan → preuves → tiroir › الأدلة → feuille → rejouer),
  **0 `pageerror`**.
- Feuille imprimée : **1 page A4** (852 px de haut en média print, ~226 mm), figures incluses.
- `curl` preview : 13 assets servis en `?v=32`, `component-figure.js` = 200.

## 11. Captures

- `maquettes/apercu-phase-4-acces.png` — carte « تمرين الباك » + onglets (الباك, قريبًا)
- `maquettes/apercu-phase-4-methode.png` — les 3 gestes
- `maquettes/apercu-phase-4-bac.png` — étape 1 avec la **courbe** du document أ
- `maquettes/apercu-phase-4-doc-atac.png` — document د et son **schéma ATAC**
- `maquettes/apercu-phase-4-aide.png` — indice à la demande (sans coût)
- `maquettes/apercu-phase-4-erreur.png` — pourquoi le choix est faux + coup de pouce
- `maquettes/apercu-phase-4-bilan.png` — corrigé assemblé + **أدلتك من هذا التمرين**
- `maquettes/apercu-phase-4-tiroir.png` — مرجع البوصلة › الأدلة (preuves bac avec figures)
- `maquettes/apercu-phase-4-feuille.png` — ورقة البكالوريا (A4, figures incluses)

## 12. Accès

Carte **تمرين الباك** en tête de « مساري » · onglet **الباك** (barre du bas) ·
URL directe `?vue=bac` (ou `#bac`), `?reset=1` pour repartir de zéro (méthode incluse).
Aucune manipulation de cache : tout est en `?v=32`.

## 13. Suite

Phase 5 (**صيّاد الفخاخ + تحدّي 60 ثانية**) : **livrée** — voir `plans/PHASE-5-FAKH-2026-11-24.md`.
