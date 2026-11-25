# Phase 4 — « Gabarit » : rapport d'exécution (2026-11-21)

Branche `arena/a897fbff-bawssalate-el-3oloum` (PR #13), base `54e034d`.
Ce rapport couvre **la revue de la phase 3** (vérifications refaites, un défaut trouvé) puis
**la phase 4** (gabarit de jeu + un exemple par unité prioritaire u3/u4).

Rapports précédents : `PHASE-1-…`, `PHASE-2-…`, `PHASE-3-GUIDE-FIRST-2026-11-21.md`.

---

## 1. Revue de la phase 3 — ce qui a été revérifié

| Vérification | Résultat |
|---|---|
| `npm test` avant toute modification | **658 tests / 80 fichiers verts**, arbre de travail propre |
| Parcours réel nœuds → protocole → fierté | **test ajouté** (`fierte-parcours-ui.test.tsx`) : il monte `App` entière avec `Aujourdhui`, `MicroNoeuds` et `ProtocoleRunner` remplacés par des boutons. Il prouve que (a) une leçon non terminée passe par `{ type: 'nœuds' }`, (b) **ouvrir ne compte aucune séance**, (c) la clôture ouvre « خلّصت الدرس » avec `6 / 6` et **aucun `%`**, (d) la séance passe à 1, une seule fois. |
| Double clôture | même test, second cas : `onTerminer` rappelé → la séance reste à 1 (`cloturerSeance` idempotente). |
| `Ana` en trois volets | cartes de progression (forces/faiblesses, badges, boucliers, examens, favoris) et réglages (objectif, intensif, taille, rappel, sync, confidentialité) **n'étaient pas groupés** : ils restaient visibles dans les trois volets. Corrigé par deux groupes `<div hidden>` ; l'identité reste dans `تقدّمي` avec la fiche A4 qu'elle imprime (c'est aussi ce qui garde `#nom` accessible aux parcours de conflit d'onglets). |
| `MicroNoeuds` | un seul CTA (« ابدأ · N دقائق »), la séance complète est une ligne d'information ; plus aucune prop morte. |
| CI | **verte** sur `33b377e` (Vérifications + Vercel), scénarios Playwright `integration`, `recovery`, `account` compris. |

**Défaut trouvé pendant la phase 4** : `situationDeUnite('u3b')` ne distingue pas les deux
situations d'une unité (elles partagent `uniteId: 'u3'` ; seul l'`id` vaut `u3b`). Le premier
jet du jeu u3 tombait donc sur la situation des courbes au lieu du ribonucléase. Corrigé par
`situationsDeUnite('u3').find((s) => s.id === 'u3b')`, et le test de contenu vérifie que le
`document` du jeu est **exactement** le `sujet` de la situation `u3b`.

Second défaut, dans l'outillage : `sync-metrics` comptait les jeux de briques par
`^ {4}id: 'jb:` et ratait ceux construits par le gabarit (indentation différente). Corrigé par
`\bid: 'jb:` — la métrique passe de 6 à **8** jeux.

---

## 2. Phase 4 — le gabarit

### 2.1 `src/data/briques/gabarit.ts` (nouveau)

Trois exports, trois responsabilités :

| Fonction | Ce qu'elle garantit |
|---|---|
| `jeuBriques(config)` | numérotation `b:<jeuId>:<n>` dans l'ordre, statut `a_valider_enseignant` par défaut (surchargeable), **refus d'un jeu vide** (une erreur, pas un écran muet) |
| `rolesDepuisModele(n)` | répartition canonique : dernier élément = `conclusion` (la خلاصة de la synthèse), première moitié des autres = `observation`, seconde = `interpretation` |
| `jeuDepuisSituation(situation, options)` | découpe une situation de synthèse **sans aucun texte nouveau** : `document` = `sujet`, `question` = `question`, briques = `modele` verbatim, pièges = `piegesAr` de l'unité |

Les options ne portent que des choix éditoriaux : identifiant, verbe de consigne, `attendu`.
Le module documente pourquoi (règle du dépôt : aucun énoncé inventé) et pourquoi
`jeuBriques()` reste disponible pour le gabarit Bac 2025-1 (qui découpe un corrigé officiel).

### 2.2 Un jeu par unité prioritaire

| Jeu | Source | Contenu |
|---|---|---|
| `jb:u3:e1` | `syntheses.ts` · situation `u3b` (الريبونوكلياز والتمسّخ العكوس) | document + question verbatim, 5 briques (2 observations, 2 interprétations, 1 conclusion), 2 pièges de l'unité |
| `jb:u4:e1` | `syntheses.ts` · situation `u4` (تجربتا النقل: مصل / لمفاويات T) | idem : 5 briques, 2 pièges (dont « الجسم المضاد يقتل المستضد بنفسه ») |
| `jb:u2:e1` … `jb:u11:e1` | `syntheses.ts` · première situation de chaque unité (u3 garde `u3b`) | même gabarit : un jeu par unité, `unites.ts` ne portant que situation + verbe + attendu |

Total du catalogue : **16 jeux** — 4 `actif` (u1, écrits à la main depuis les exercices de
méthodologie), 12 `a_valider_enseignant` (2 du sujet pilote 2025-1, 10 des unités `u2`…`u11`).
`u1` n'a pas de jeu dérivé : ses jeux actifs resteraient seuls jouables, et un doublon en revue
n'apporterait rien.

Statut `a_valider_enseignant` dans les deux cas : ils ne sont **pas** jouables. `EcranBriques`
affiche la porte « هذا التدريب قيد مراجعة الأستاذ », puis « افتح المعاينة (محتوى قيد المراجعة) »,
puis la mention « معاينة: محتوى قيد المراجعة — ليس جوابًا نموذجيًا معتمدًا » pendant l'exercice.

### 2.3 Catalogue et budget

- `chargerJeuxUnite` a deux origines : un fichier **écrit à la main** (`u1`) ou, à défaut, le
  module **chargé à la demande** `unites.ts` qui dérive le jeu de la synthèse. `UNITES_AVEC_BRIQUES`
  est écrit en clair (importer `unites.ts` ferait entrer `syntheses.ts` dans le chunk de
  démarrage) et un test vérifie qu'il vaut exactement `['u1', ...UNITES_SYNTHESE]`.
- Le choix d'unité marque celles qui ont du contenu (`UNITES_AVEC_BRIQUES`) au lieu d'affirmer
  que « seule l'unité 1 est prête ».
- `vite.config.ts` : `unites-*` exclu du précache comme `u1-*` (chunks mesurés : `unites`
  3,72 ko / gzip 1,79 ko, `u1` 5,37 ko ; servis à la demande). Coquille inchangée : **2,18 Mio**.
- **Coque Android** : `versionName` passe de `0.10.5` à `0.13.0`, `versionCode` de 3 à 4 —
  elle annonçait deux versions de retard.

### 2.4 Métrique

`sync-metrics.mjs` ajoute une ligne comptée : **« Jeux de briques · 16 (actifs : 4) »**
(u1 : 4 actifs ; sujet 2025-1 : 2 en revue ; unités dérivées : 10, comptées par la table
`CHOIX_UNITES` puisque leur identifiant est construit dans le code).

---

## 3. Fichiers touchés

| Fichier | Nature |
|---|---|
| `src/data/briques/gabarit.ts` | **nouveau** — `jeuBriques`, `rolesDepuisModele`, `jeuDepuisSituation` |
| `src/data/briques/unites.ts` | **nouveau** — table `CHOIX_UNITES` (situation, verbe, attendu) + `jeuxSynthese()` : un jeu par unité `u2`…`u11` |
| `src/data/briques/index.ts` | chargeurs normalisés (`u1`, `u3`, `u4`) |
| `src/components/EcranBriques.tsx` | choix d'unité : mention « تمارين بالبنى », texte d'introduction honnête |
| `src/components/Ana.tsx` | groupes de volets pour les cartes de progression et les réglages (revue phase 3) |
| `vite.config.ts` | `unites-*` hors précache |
| `android/app/build.gradle` | `versionName 0.13.0`, `versionCode 4` |
| `scripts/sync-metrics.mjs` | métrique « Jeux de briques » |
| `src/utils/__tests__/briques-gabarit.test.ts` | **nouveau** (7 tests : gabarit, catalogue, aperçu, verbatim) |
| `src/__tests__/briques-apreciation-ui.test.tsx` | +1 test : porte d'aperçu de l'unité 3 puis mention |
| `src/__tests__/fierte-parcours-ui.test.tsx` | **nouveau** (2 tests : parcours complet, double clôture) |
| `README.md` | journal v0.13 Phase 4 + métrique générée |

---

## 4. QA (dernier passage, dans cet ordre)

| Étape | Résultat |
|---|---|
| `npm test` | **670 tests / 82 fichiers verts** (658 → 670, +12) |
| `npm run lint` | 0 erreur |
| `npm run build` | OK — `unites-6sK9nHnf.js` 3,72 ko (gzip 1,79 ko), `u1-lHtELbmW.js` 5,37 ko |
| `node scripts/verifier-hors-ligne.mjs` | OK — 103 fichiers, 6 689 670 o servis vs 6 674 798 o déclarés, **0 incohérence** |
| `node scripts/sync-metrics.mjs --check` | aucune dérive |
| Coquille | **2,18 Mio** (7 entrées) — inchangée : les nouveaux jeux ne sont pas précachés |

---

## 5. Voir la phase 4 à l'écran

1. **Boussole 1-2-3** : ouvrir l'atelier sans unité → le choix d'unité montre « تمارين بالبنى »
   sur u1, u3 et u4.
2. Choisir **الوحدة 3** → « هذا التدريب قيد مراجعة الأستاذ » → « افتح المعاينة » → la mention
   « محتوى قيد المراجعة » reste visible pendant l'assemblage des briques.
3. Revenir, choisir **الوحدة 1** → l'exercice s'ouvre directement (jeux `actif`), sans porte.
4. Effacer le stockage et recharger → rien de tout cela n'est précaché : les jeux se chargent à
   la demande, la coquille reste à 2,18 Mio.

---

## 6. Reste ouvert (humain uniquement)

- **Validation éditoriale** : 12 jeux `a_valider_enseignant` attendent un professeur de SVT.
  Le geste est mécanique : relire, puis passer le statut à `'actif'` (jeu dérivé : ajouter
  `statut: 'actif'` à son entrée dans `CHOIX_UNITES`). Tant que ce n'est pas fait, ils restent
  derrière la porte d'aperçu — c'est la règle, pas un oubli.
- **APK signé** : la coque est alignée (`0.13.0` / code 4) mais la signature, les icônes
  adaptatives finales et l'essai sur appareil réel restent à faire côté Android.
- **Reste du programme produit** (hors plan Guide-First) : voir
  `plans/PASSATION-RESTE-A-FAIRE.md` — revue de sécurité RLS, appareils réels, droits des PDF.
