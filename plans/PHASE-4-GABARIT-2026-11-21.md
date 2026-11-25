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

Statut `a_valider_enseignant` dans les deux cas : ils ne sont **pas** jouables. `EcranBriques`
affiche la porte « هذا التدريب قيد مراجعة الأستاذ », puis « افتح المعاينة (محتوى قيد المراجعة) »,
puis la mention « معاينة: محتوى قيد المراجعة — ليس جوابًا نموذجيًا معتمدًا » pendant l'exercice.

### 2.3 Catalogue et budget

- `CHARGEURS_UNITES` est normalisé (`u1` → `JEUX_UNITE1`, `u3` → `JEUX_UNITE3`,
  `u4` → `JEUX_UNITE4`) : le nom d'export d'une unité n'est plus une contrainte cachée.
- Le choix d'unité marque celles qui ont du contenu (`UNITES_AVEC_BRIQUES`) au lieu d'affirmer
  que « seule l'unité 1 est prête ».
- `vite.config.ts` : `u3-*` et `u4-*` exclus du précache, comme `u1-*` (chunks mesurés :
  0,46 ko et 0,36 ko ; ils s'ouvrent à la demande). Coquille inchangée : **2,18 Mio**.

### 2.4 Métrique

`sync-metrics.mjs` ajoute une ligne comptée : **« Jeux de briques · 8 (actifs : 4) »**
(u1 : 4 actifs ; sujet 2025-1 : 2 en revue ; u3 : 1 ; u4 : 1).

---

## 3. Fichiers touchés

| Fichier | Nature |
|---|---|
| `src/data/briques/gabarit.ts` | **nouveau** — `jeuBriques`, `rolesDepuisModele`, `jeuDepuisSituation` |
| `src/data/briques/u3.ts`, `u4.ts` | **nouveaux** — un jeu chacun, construits par le gabarit |
| `src/data/briques/index.ts` | chargeurs normalisés (`u1`, `u3`, `u4`) |
| `src/components/EcranBriques.tsx` | choix d'unité : mention « تمارين بالبنى », texte d'introduction honnête |
| `src/components/Ana.tsx` | groupes de volets pour les cartes de progression et les réglages (revue phase 3) |
| `vite.config.ts` | `u3-*`, `u4-*` hors précache |
| `scripts/sync-metrics.mjs` | métrique « Jeux de briques » |
| `src/utils/__tests__/briques-gabarit.test.ts` | **nouveau** (7 tests : gabarit, catalogue, aperçu, verbatim) |
| `src/__tests__/briques-apreciation-ui.test.tsx` | +1 test : porte d'aperçu de l'unité 3 puis mention |
| `src/__tests__/fierte-parcours-ui.test.tsx` | **nouveau** (2 tests : parcours complet, double clôture) |
| `README.md` | journal v0.13 Phase 4 + métrique générée |

---

## 4. QA (dernier passage, dans cet ordre)

| Étape | Résultat |
|---|---|
| `npm test` | **668 tests / 82 fichiers verts** (658 → 668, +10) |
| `npm run lint` | 0 erreur |
| `npm run build` | OK — `u3-Curjdc95.js` 0,46 ko, `u4-bbVUd0G3.js` 0,36 ko |
| `node scripts/verifier-hors-ligne.mjs` | OK — 104 fichiers, 6 690 919 o servis vs 6 675 917 o déclarés, **0 incohérence** |
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

## 6. Reste ouvert

- **Validation éditoriale** : les 4 jeux non relus (sujet 2025-1, u3, u4) attendent un
  enseignant. Le geste est simple : passer `statut` à `'actif'` dans le jeu ou sa configuration.
- **Contenu** : une seule situation par unité prioritaire. Les unités 2, 5–11 n'ont pas encore
  de briques ; le gabarit est prêt (`jeuDepuisSituation` + `syntheses.ts` en fournit déjà 13).
- `versionName` Android reste `0.10.5` — à aligner sur `0.13.0` au prochain build APK.
