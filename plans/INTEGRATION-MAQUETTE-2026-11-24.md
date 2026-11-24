# Intégrer « le nouveau système » dans l'application — analyse & plan

> Question posée : *« analyse le dépôt et dis-moi comment intégrer cette nouvelle façon de
> faire dans l'app ; je veux fusionner les deux et garder des choses de l'ancienne version,
> elle contient beaucoup d'informations précieuses. »*
> Ce document est la réponse : état des lieux, options, recommandation, plan par étapes,
> ce qu'on garde / ce qu'on jette, et les 3 décisions qui t'appartiennent.

---

## 1. État des lieux (mesuré, pas estimé)

### 1.1 L'application réelle — `src/` (React 19 + TS + Tailwind 4 + Supabase + Capacitor)

| Élément | Mesure |
|---|---|
| Fichiers TS/TSX | **159** · **31 257 lignes** |
| Écrans / composants | 44 composants, 5 onglets (`اليوم · مساري · تدريبات · البوصلة · أنا`) |
| Moteur | `moteur.ts` (Next-Best-Action), `srs.ts` (SM-2), `xp.ts`, `stats.ts`, `adaptatif.ts`, `revueCroisee.ts`, `defis.ts` |
| Contenu pédagogique | 11 unités · **58 leçons** + 11 جسور · **58 résumés dorés** (`lessonGoldSummaries.ts`, 78 Ko) |
| Banque d'exercices | **≈700 items** de drills (QCM + définitions converties, niveaux 1-3, 49 axes) · **50 leçons** × 2 QCM (`qcmLecons.ts`) + pièges |
| Sujets officiels | 2013 → 2026, **30 sujets**, 3 exercices, corrigés par exercice (`corriges/`) |
| Autres gisements | glossaire, synthèses, mindmaps, 6 schémas à légender, ateliers (4), méthodologie (3 136 lignes), mourchid, priorités, calendrier scolaire |
| Persistance | localStorage + export/import JSON atomique + **sync Supabase** (RLS + jeton) + PWA + **Android (Capacitor)** + notifications locales |
| Tests | **266 tests / 42 fichiers — tous verts** (`vitest`, 16 s) · `tsc -b` : **0 erreur** |

### 1.2 La maquette — `maquettes/super-bawssala` (vanilla JS, RTL, sans build)

| Élément | Mesure |
|---|---|
| Code | 13 scripts · **8 023 lignes** · 648 Ko (CSS, SVG, captures) |
| Écrans | 6 phases : onboarding · مساري · كويست · الباك · صيّاد الفخاخ · أنا |
| Moteur | `state-engine.js` : XP 50/palier, 8 compétences × 3 points, drapeaux, SM-2 (q = 2/4/5), plan du jour |
| Contenu | **unité 1 seulement** : 1 quête (3 étapes), 1 exercice bac (6 étapes), 8 pièges, 4 figures SVG |
| Tests | **524 assertions / 7 suites** (jsdom) + QA Chromium 320/390 + impression A4 |
| Design | jetons encre `#225342` · miel `#c9902a` · papier `#fffef8` · aucune note /20 · aucun rouge punitif |

### 1.3 Ce qui est déjà commun aux deux

Les deux appliquent déjà la même philosophie anti-anxiété : pas de note sur 20, pas de
pourcentage, pas de compte à rebours, pas de « Game Over », chiffres latins, SM-2, XP.
La maquette **n'apporte donc pas une idéologie différente** : elle apporte **une autre
forme** (rythme de 3 minutes, 4 onglets, une langue visuelle) et **trois formats neufs**
(quête 3 étapes, bac pas-à-pas, chasseur de pièges).

### 1.4 Les vraies différences à trancher

| Sujet | Application | Maquette |
|---|---|---|
| Rythme | leçon de **46 min** (6 phases) | **3 min** par jour |
| Onglets | 5 | 4 |
| Couleur de l'erreur | **rouge** (`--color-error`, `--color-clay`) | **miel** + « راجع » |
| Densité | écrans riches, beaucoup de texte | une carte = une action |
| Niveaux | `مبتدئ / متمكّن / متقدّم / خبير / بطل` (600→8000 XP) | `بحّار → قبطان` (50 XP/palier) |
| Documents bac | descriptions **textuelles** des documents | **figures SVG** réelles |
| Contenu | 11 unités, 30 sujets | unité 1 seule |

**Conclusion de l'état des lieux :** les deux versions ne sont pas concurrentes, elles sont
**complémentaires**. La maquette a la forme et trois formats ; l'app a la matière, le moteur
et la robustesse. Fusionner = **porter la forme dans l'app**, pas l'inverse.

---

## 2. Les trois options techniques

| | Option | Ce qu'on fait | Ce qu'on garde | Ce qu'on perd | Effort | Verdict |
|---|---|---|---|---|---|---|
| **A** | **Peau neuve** (recommandé) | On réécrit l'UI dans React avec le design + l'IA de la maquette ; on branche les écrans sur le moteur et les données existants | Tout : 266 tests, sync, PWA, Android, 11 unités, 30 sujets | rien (sauf 5→4 onglets) | ≈ 13-15 j | ✅ **recommandé** |
| B | Maquette comme app | On repart du vanilla et on réimplémente moteur/sync/PWA | les 8 000 lignes de la maquette | tests, sync, Android, export atomique, a11y, 700 drills, 30 sujets (tout à re-porter) | ≈ 40 j + régressions | ❌ |
| C | Deux apps côte à côte | iframe / route qui charge la maquette | tout | cohérence : deux états, deux XP, deux mémoires, lien mort entre les deux | 2 j | ❌ (dette immédiate) |

**Pourquoi A :** l'app est le seul endroit où vivent la donnée de l'élève, la synchro, la PWA
et l'APK. La maquette est une **spécification interactive** : on la traite comme un
« design system + prototypes cliquables », et on la porte composant par composant, en
laissant les 266 tests comme filet.

---

## 3. Ce qu'on garde de l'ancienne version (le patrimoine)

Rien de cette liste ne doit disparaître. C'est ce que la maquette **n'a pas**.

### 3.1 Données (le plus précieux — 6 mois de travail)

- `programme.ts` : 3 domaines → 11 unités → 58 leçons + **جسور**, avec `questionAr`,
  `fenetre` (calendrier officiel), `poidsBac`, **`piegesAr` (2 pièges officiels par unité)**.
- `lessonGoldSummaries.ts` : 58 résumés dorés en 6 champs (savoir, mots-clés, mécanisme,
  preuve documentaire, phrase-bac, erreur nodale).
- `qcmLecons.ts` : 50 leçons × (rappel + synthèse) + pièges diagnostiques.
- `drills/` : ≈700 items, 49 axes, 3 niveaux, avec explication → **matière première de la quête
  et du chasseur**.
- `sujetsOfficiels.ts` + `corriges/` + `sujetsCorriges.ts` : 2013→2026.
- `glossaire`, `syntheses`, `schemas/`, `mourchid.ts`, `priorites.ts`, `annee.ts`.

### 3.2 Moteur et règles

- `moteur.ts` : prochaine action, verrouillage du chemin, quota quotidien, mode intensif,
  position par rapport à la classe, rythme 5/7. → **c'est lui qui alimente « خطة اليوم »**.
- `srs.ts` : SM-2 complet (q 0-5, plafond intensif, `fragile`).
- `xp.ts`, `stats.ts`, `statsUnite.ts`, `adaptatif.ts`, `diagnostic.ts`, `defis.ts`,
  `revueCroisee.ts`, `melange.ts`, `dates.ts` (calendrier scolaire algérien).
- `storage.ts` + `backup.ts` + `coherenceStockage.ts` : sauvegarde/restauration **atomique**,
  tests dédiés (`restauration-atomique`, `suppression-durable`).
- `compte.ts` + `sync.ts` + `identiteSync.ts` + `schema.sql` (RLS + jeton).

### 3.3 Écrans profonds (à re-skinner, pas à supprimer)

`ProtocoleRunner` (6 phases, 46 min) · `LecteurLecon` · `JalonUnite` (جسر) · `Methodologie`
(3 136 lignes : لابورatoire de lecture des documents, 11 verbes, 6 parcours, 4 niveaux) ·
`ExamBlanc` · `SujetsOfficiels` · `Flashcards` · `Mindmap` · `SchemaALegender` · les 4
ateliers · `Diagnostic` · `Fetes` (célébrations) · `Mourchid` · `ReglagesParcours`.

### 3.4 Robustesse

266 tests · PWA offline · APK Android · notifications · sons · **accessibilité**
(`tabIndex={-1}`, focus géré, `aria-live`) — l'app gère déjà correctement le focus, ce que la
maquette vient juste d'apprendre.

---

## 4. Ce qu'on prend de la maquette

| Apport | Où ça va | Statut |
|---|---|---|
| **IA en 4 onglets** : مساري · كويست · الباك · أنا | `App.tsx` (shell) | à porter |
| **Design system** (encre/miel/papier, cartes, boutons 4 px, badges, points, mascotte) | `src/index.css` (`@theme` + `@layer components`) | à porter |
| **Quête 3 étapes** (بدّل الشرط · قارن الدليل · طبّق) — 3 min, 2 essais, correction immédiate | nouveau `Quete.tsx` | à porter + **généraliser aux 11 unités** |
| **Bac pas-à-pas** (6 étapes, aide à la 1ʳᵉ erreur, révélée à la 2ᵉ, 3/2/0 XP) | nouveau `BacPasAPas.tsx` | à porter sur les **30 sujets** |
| **Chasseur de pièges** (8 phrases vrai/faux + preuve immédiate) | `Fakh.tsx` | à porter sur `piegesAr` (22) + `qcmLecons.pieges` |
| **Écran أنا** (carte boussole, 8 compétences × 3 points, 3 drapeaux, révisions SM-2) | nouveau `AnaNew.tsx` | à porter |
| **Figures SVG** (courbe, TL, barres, ATAC) | `components/Figures.tsx` | à porter — **l'app n'a que du texte** pour les documents |
| **Carte imprimable A4** | `CarteBoussolePrint.tsx` | à porter |
| **Règle bidi** + QA visuelle | `scripts/` + doc | à porter (test automatique) |
| **Anti-rouge** dans le feedback d'apprentissage | tokens | à appliquer |

Ce qu'on **ne** porte pas : `data-svt-3as.js` (contenu de l'unité 1 → migré dans les
structures TS existantes), `state-engine.js` (l'app a mieux), le `localStorage`
`bawssala.super.v1` (aucune migration de données élève), le gabarit `appareil` (l'app est
responsive, pas un cadre de téléphone).

---

## 5. Architecture cible

```
مساري (accueil)                كويست (3 min)              الباك                     أنا
├─ خطة اليوم (moteur.ts)       ├─ 3 étapes                 ├─ تمرين خطوة بخطوة       ├─ بطاقة البوصلة
├─ ابدأ الجلسة الكاملة (46د)   ├─ correction + « ليش؟ »    ├─ 30 موضوعًا رسميًا      ├─ الجاهزية 8/8
├─ بطاقة الباك                ├─ XP + « زيد الجلسة »       ├─ الامتحان الأبيض        ├─ الدروع + الأيام
├─ بطاقة صيّاد الفخاخ         └─ fin : carte de la leçon  ├─ بنك التدريبات (700)    ├─ مراجعات اليوم (SM-2)
├─ بطاقة أنا                                              └─ مرجع البوصلة (drawer)  └─ ملفّي (compte, sync,
└─ المسار : 11 وحدة (verrouillé)                                                        export, réglages)
```

**Modes plein écran** (sans barre d'onglets, comme aujourd'hui) : `ProtocoleRunner`,
`JalonUnite`, `Methodologie`, `ExamBlanc`, `Revision`, `Ateliers`, `Mindmap`, `Flashcards`,
`SchemaALegender`, `Diagnostic`, `Fete`.

**Le pont entre les deux rythmes** (décision produit centrale) : à la fin de chaque quête,
un bouton secondaire « كمّل الجلسة كاملة (46 د) » ouvre `ProtocoleRunner` sur la leçon
correspondante. On ne remplace pas le protocole : on l'**alimente**.

---

## 6. Pont de données (mapping précis)

| Écran maquette | Source existante | Règle |
|---|---|---|
| كويست · étape 1 « بدّل الشرط » | `QCM_LECONS[lecon].rappel` | 1 QCM, 2 essais, explication `explication` |
| كويست · étape 2 « قارن الدليل » | `QCM_LECONS[lecon].synthese` ou drill `n:2` | idem |
| كويست · étape 3 « طبّق » | `QCM_LECONS[lecon].pieges[0]` ou drill `n:3` | idem + renvoi leçon |
| Quête du jour | `prochaineAction(etat)` + `composerJoueur()` | 1 quête/jour, jamais deux |
| صيّاد الفخاخ | `UNITES[].piegesAr` (22) + `QCM_LECONS[].pieges` | 8 phrases : 4 pièges + 4 vraies, preuve = `explication` |
| Bac pas-à-pas | `SUJETS_OFFICIELS[].exercices[].parties[].consignes[]` | 1 consigne = 1 étape · `surDocument` → figure |
| Aide / révélation | `corriges/` (éléments de réponse) | 1ʳᵉ erreur → indice, 2ᵉ → réponse montrée |
| الجاهزية 8 compétences | `kafaa` (cartes `methodo{n}`) + 49 `AXES` + `carnet` (fautes) | table de correspondance à écrire (c1…c8) |
| الدروع | `journal` (jours d'activité) + `rythmeSemaine` | 4 jours/7, jamais de perte brutale |
| مراجعات اليوم | `srs.ts` + `Qualite` | سهلة = 5 · متوسطة = 4 · صعيب = 2 |
| Niveau / paliers | `xp.ts` (calcul conservé) | renommer en `بحّار/قبطان…` sur les mêmes seuils |
| Carte imprimable | `xp`, `kafaa`, `journal`, `stats` | A4, aucune note /20 |

> ⚠️ Les figures manquent côté app : l'app décrit « الوثيقة 1 : courbe… » mais n'a pas le
> dessin. Porter les 4 SVG de la maquette est **le gain de contenu le plus visible** pour le
> mode الباك.

---

## 7. Design system : comment ne rien casser

1. **Traduire les jetons** dans `@theme` en gardant les noms actuels comme alias :
   `--color-primary` reste, mais passe à `#225342` ; `--color-bg` → `#f6f6ee` ;
   `--color-paper` → `#fffef8` ; `--color-line` → `#dfe5d7` ; on ajoute `--color-honey`,
   `--color-honey-soft`, `--color-sage`.
2. **Sémantique du rouge** : `--color-error` ne sert plus qu'aux actions **destructrices**
   (supprimer le compte, réinitialiser). Le feedback d'apprentissage passe en miel + texte
   neutre (« راجع هذي », « عاود »). Aucune classe `text-error` dans un exercice — un test
   de revue (grep) peut le garantir.
3. **Composants** : `btn--primaire`, `btn--secondaire`, `carte`, `mention`, `rangee`,
   `puce`, `filedattente`… sont à créer en `@layer components` (Tailwind 4) et à substituer
   progressivement aux classes utilitaires existantes.
4. **Typographie** : garder `Noto Naskh Arabic` (déjà déclarée) pour les titres, `Segoe UI`
   pour le corps.
5. **Bidi** : conserver la règle « jamais de point après un sigle latin en fin de phrase
   arabe », et l'automatiser par un test qui scanne les chaînes de `src/data/**` (coût : 30
   lignes).
6. **Écran atelier** : une route `/_design` (dev seulement) qui affiche tous les composants —
   c'est ce qui a permis à la maquette d'être cohérente.

---

## 8. Plan par étapes (chaque étape = un GO)

| # | Étape | Livrable | Critères d'acceptation | Effort |
|---|---|---|---|---|
| **0** | **Socle design** | jetons `@theme`, composants de base, shell 4 onglets + en-têtes, route `/_design` | app identique fonctionnellement · 266 tests verts · captures avant/après | 1 j |
| **1** | **مساري (accueil)** | `MasariNew` = plan du jour (`prochaineAction`) + 3 cartes (باك/فخاخ/أنا) + chemin 11 unités compact | tous les liens de l'ancien écran existent encore · tests adaptés · QA 320/390 | 2 j |
| **2** | **كويست** | `Quete.tsx` 3 étapes, 1/jour, XP, correction immédiate, pont vers le protocole | génère une quête pour **les 11 unités** · état persisté · pas de bouton mort | 2-3 j |
| **3** | **الباك** | `BacPasAPas` 6 étapes + figures SVG + aide/révélation + 3/2/0 | fonctionne sur ≥ 3 sujets réels (2022, 2024, 2025) · figures affichées · `SujetsOfficiels` et `ExamBlanc` toujours accessibles | 3 j |
| **4** | **أنا** | readiness 8 compétences, drapeaux, révisions SM-2, carte A4 + « ملفّي » (compte/sync/export) | export/import/sync intacts · impression 1 page · 266 tests + nouveaux | 2-3 j |
| **5** | **صيّاد الفخاخ** | `Fakh.tsx` 8 phrases depuis `piegesAr` | 22 pièges couverts · preuve immédiate · sans punition | 1-2 j |
| **6** | **Finition** | sons, célébrations, PWA/Android, QA bidi 4 tailles, docs, captures, archivage de `maquettes/` | build + APK · 0 `pageerror` · doc à jour | 2 j |

**Total ≈ 13-15 jours** de travail effectif, découpés en 7 GO.

### Ordre conseillé si tu veux voir vite quelque chose
`0` → `1` → `3` (le Bac est la vitrine) → `2` → `4` → `5` → `6`.

---

## 9. Risques et parades

| Risque | Parade |
|---|---|
| Deux états (localStorage maquette vs `Etat`) | **ne jamais fusionner les états** : la maquette ne fournit que du contenu et des composants |
| Régression des 266 tests | chaque étape finit par `vitest run` + `tsc -b` verts ; les tests existants ne sont modifiés qu'avec justification écrite |
| Perte de contenu en route | étape 1 vérifie explicitement que chaque entrée de l'ancien écran existe encore (checklist) |
| Le rouge revient par habitude | règle écrite + revue `grep` avant chaque GO |
| Quêtes limitées à l'unité 1 | l'étape 2 est bloquée tant que les 11 unités ne génèrent pas de quête |
| Bidi qui régresse | test automatique sur les chaînes de `src/data` |
| Scope creep (re-skinner les 44 composants) | les écrans profonds restent tels quels jusqu'à l'étape 6 ; on ne re-skinné que les 4 onglets |

---

## 10. Ce qu'il ne faut surtout pas faire

1. Réécrire l'app en vanilla pour « garder » la maquette : on perdrait sync, PWA, Android, tests.
2. Mettre la maquette dans une iframe : deux mémoires, deux XP, deux vérités.
3. Recopier `data-svt-3as.js` tel quel : l'app a déjà 11 unités ; on migre le contenu, pas le fichier.
4. Garder le rouge « parce que c'est plus clair » : la maquette a prouvé le contraire (miel + mot doux).
5. Supprimer le protocole 46 min : c'est le cœur pédagogique de l'app ; la quête est la porte d'entrée.

---

## 11. Les 3 décisions — tranchées le 2026-11-24

1. **Architecture** : **A — « peau neuve » React**. On garde `src/` entièrement (moteur,
   données, sync, PWA, Android) et on remplace l'habillage + le parcours d'écrans par ceux
   de la maquette. *Options B (réécriture vanilla) et C (iframe) abandonnées.*
2. **Le protocole 46 min** : **gardé**, et ouvert depuis la fin de quête (« كمّل الجلسة كاملة »).
   La quête devient la porte d'entrée ordinaire ; le protocole long reste accessible à qui
   veut la séance complète.
3. **Les onglets** : **4** — مساري · كويست · الباك · أنا. Les drills, la méthodologie et les
   examens blancs deviennent des sous-écrans (pas des onglets).

---

## 12. Étape 0 — le socle de design (FAIT)

Livré, testé, sans toucher une ligne de logique :

| Livrable | Où | Détail |
|---|---|---|
| Palette maquette | `src/index.css` bloc `@theme` | encre `#183d31` · primaire `#225342` · fond `#f6f6ee` · papier `#fffef8` · ligne `#dfe5d7` · miel `#b07d22` · texte miel `#79531f` · sauge claire `#eaf3e5`, + équivalents sombres |
| Composants de base | `src/index.css` `@layer components` | `.carte` `.carte__tete/__titre/__ligne/__texte` · `.mention`(+`--or`,`--vert`) · `.rangee`(+`--entre/--centre/--galerie`) · `.puce` · `.btn--primaire` `.btn--secondaire` `.btn-mini` · `.oeil` `.titre-1` `.petit` · `.filet` |
| Atelier de design | `src/components/AtelierDesign.tsx` | galerie vivante, **`?design=1`** en dev uniquement (`src/main.tsx`), bascule clair/sombre, section « 11 unités » branchée sur les vraies données |
| Contrastes | — | primaire 8,8:1 sur blanc · miel-texte 6,8:1 · muted 5,1:1 · le miel `#c9902a` **n'est plus un token de texte** (2,8:1) |
| Garde-fous | — | `npx tsc -b` 0 erreur · `npx vitest run` **266/266** · aucun `pageerror` sur l'app et sur l'atelier |

Deux corrections de lisibilité trouvées par la QA visuelle : `text-sage` sur fond clair
(`BaguetteXp`, `Exercices`) est passé à `text-mute` — l'ancien `#a3b899` était déjà à 2:1,
le nouveau l'aurait rendu invisible ; et `.btn--primaire` prend `color: var(--color-bg)`
pour rester lisible quand le primaire devient clair en thème sombre.

**Reste de l'étape 0 (reporté à l'étape 1, parce que c'est le même travail)** : shell à 4
onglets, `README.md` (il décrit encore 5 onglets), re-skin des écrans.

### Comment voir l'atelier

```bash
npx vite --host 0.0.0.0 --port 3000
# puis http://localhost:3000/?design=1
```

---

## 13. Prochaine étape : GO 1 — مساري

1. Remplacer le shell (en-tête + `.pied` à 4 onglets, éléments de 44 px).
2. Re-skinner `Masari.tsx` : une carte = une action (`.carte__ligne`), badge d'unité,
   `·` + `fenetreAr`, `poidsBac` en `.mention--or`, pont 🌉 en carte pleine largeur.
3. Brancher l'état réel (fait / en cours / verrouillé) sur `.mention`, sans changer `moteur.ts`.
4. Tests : 266 verts + captures 320/390 px.
