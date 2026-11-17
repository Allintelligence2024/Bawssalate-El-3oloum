# Contre-audit du PR #1 — « Intégration des sujets de Bac SVT (PDF), synthèse libre et suite de tests »

> **Objet :** branche `feature/sujets-bac-et-ameliorations`, commit `1f7dcfb` (85 fichiers, +5 463 / −792), comparé à `origin/main` (`ed93224`).
> **Référentiel :** `plans/PLAN-AMELIORATION-90.md` (plan final 60,5 → 89,5), règle d'or : *aucun point n'est gagné par une intention*.
> **Date :** 16/11/2026. Toutes les vérifications ci-dessous sont reproductibles (commande indiquée).
> **Mise à jour :** §6 liste les correctifs appliqués ensuite sur la branche `arena/4eaeaa75-bawssalate-el-3oloum`.

---

## 0. Verdict

Le PR **n'apporte aucune preuve au sens du plan** et introduit **trois régressions bloquantes** :
interface principale corrompue (R1), composant de rédaction libre inutilisable (R2), métadonnées de sujets
fabriquées et étiquetées « officielles » (R3). Publié tel quel, il ferait **baisser** les axes 1, 4, 5, 6 et 8.

Acquis réels : harnais Vitest (41 tests verts), `consentementSync: false` par défaut, nettoyage de la marque
dans les 23 titres HTML, commentaire « 46 min ». ≈ 2 jours sur les 23 jours de P0.

---

## 1. Vérifications de base

| Vérification | Commande | Résultat |
|---|---|---|
| Tests | `npm ci && npm test` | ✅ 41 tests / 5 fichiers (`dates`, `moteur`, `srs`, `storage`, `sync`) |
| Build | `npm run build` | ✅ — chunk principal **720 Ko** (baseline ≈ 695 Ko ; cible P3.6 < 400 Ko) |
| Poids `dist/` | `du -sh dist` | **100 Mo** : 81 Mo de PDF (`public/examens/`) + 13,4 Mo `ouverture.mp4` — embarqués dans l'APK (`capacitor.config.ts` → `webDir: 'dist'`) |
| Doublon des PDF | `cmp M/… public/examens/…` | identiques : `M/` + `SE/` (81 Mo, déjà sur main) **et** `public/examens/` (81 Mo) → 162 Mo dans le dépôt, hors LFS |
| Dossier `plans/` | `ls -R plans` | uniquement `PLAN-AMELIORATION-90.md` = **le plan GLM (65 → 90)**, pas le plan final. Aucun `plans/preuves/`, `plans/sources/REGISTRE.md`, `plans/relecture/` |

---

## 2. Régressions bloquantes

### R1 — `src/App.tsx` : tout l'arabe est corrompu (double encodage UTF-8 → cp1252 → UTF-8)
48 lignes touchées (`grep -c "Ø" src/App.tsx`), dont des chaînes **visibles par l'élève** :

```
src/App.tsx:65-69  labels des 5 onglets : 'Ø§Ù„ÙŠÙˆÙ…' (était 'اليوم'), 'Ù…Ø³Ø§Ø±ÙŠ', 'Ù…Ù†Ù‡Ø¬ÙŠØ©', 'ØªØ¯Ø±ÙŠØ¨Ø§Øª', 'Ø£Ù†Ø§'
src/App.tsx:76     écran d'attente « لحظة، أفتح المنهجية… »
src/App.tsx:638    <h1> marque 'بوصلة العلوم'
src/App.tsx:639    sous-titre ; :649 aria-labels du thème ; :635 emoji 🧭
```
Seul `App.tsx` est touché (`grep -rl "Ø§Ù" src public index.html`).

### R2 — `SyntheseLibre.tsx` est une impasse fonctionnelle
- L'étape `'saisie'` est déclarée (`type Etape`) mais **jamais rendue** : après « ابدأ الكتابة », écran vide. `setSaisie` n'est jamais appelé, aucun `<textarea>`, `valider()` injoignable, `setEtape('modele')` n'existe nulle part.
- `Methodologie.tsx:1447` **détourne l'exercice de synthèse U1 existant** vers ce composant → un exercice fonctionnel au baseline est cassé.
- `App.tsx` monte `SyntheseLibre` **sans** `onResultatKafaa` ni `onCarnetFaute` → la « carte kafaa SM-2 » n'est jamais enregistrée.
- Arabe hallucinatoire visible : « السَّمْيَة الْحُرَّة », « مُدَلِّك », « أنتِ ننتج », « بدون مَغْلَب », « قبل التسلّق », « الإجابة المسحة », « نموذج باعد ».

### R3 — `src/data/examSubjects.ts` : métadonnées fabriquées, étiquetées « officielles »
Les nombres des noms de fichiers (`dzexams-bac-sciences-1343688.pdf`) sont des **tailles en octets**
(`ls -l` : 1 343 688 octets), pas des identifiants ; les années/sessions ont été inventées.
Contre-vérification sur le texte extrait des PDF (`pypdf`, pages 1–6, champs « دورة » et « الشعبة ») :

| Fichier | Déclaré dans le code | Lu dans le PDF |
|---|---|---|
| `1777391` | SVT 2024 **septembre** (M) | دورة **2022**, الشعبة **رياضيات** |
| `1803994` | SVT 2023 juin (M) | الدورة الاستثنائية **2017**, رياضيات |
| `1967487` | SVT 2023 septembre (M) | **2018**, رياضيات |
| `2068087` | SVT 2022 juin (M) | **2021**, رياضيات |
| `2273619` | SVT 2022 septembre (M) | **2020**, رياضيات |
| `2280992` | SVT 2021 septembre (M) | **2019**, رياضيات |
| `1413929`, `2275712` | SVT 2024 / 2021 (M) | رياضيات, année illisible |
| `2116452` | SVT 2024 juin (SE) | الدورة الاستثنائية **2017**, علوم تجريبية |
| `2311208` | SVT 2024 juin (SE) | **2022**, علوم تجريبية |
| `2356016` | SVT 2023 juin (SE) | **2020**, علوم تجريبية |
| `2581269` | SVT 2023 juin (SE) | 2017 (probable), علوم تجريبية |
| `2728849` | SVT 2022 juin (SE) | **2021**, علوم تجريبية |
| `3051478` | SVT 2021 (SE) | **2019** |
| `3509975` | SVT 2021 (SE) | **2018**, علوم تجريبية |
| `naturelles-1077342` | « Sciences Naturelles » 2024 (M) | **2023**, **رياضيات** |
| `naturelles-1780707` | « Sciences Naturelles » 2023 (SE) | 2023, علوم تجريبية |
| 13 autres (dont `BAC2025_*`) | années précises | **scans sans couche texte** (page 1 = « www.dzexams.com ») — invérifiables |

Conséquences :
- Les 15 fichiers de `M/` sont des épreuves de la **série Mathématiques** (programme SVT allégé, épreuve ≈ 2 h d'après les en-têtes) présentées comme « SVT » à des élèves Sciences Expérimentales ; l'UI affiche « Source : M », sans sens pour un élève.
- « Sciences Naturelles » n'est pas une série du Bac : c'est un mot du nom de fichier dzexams.
- Source réelle : dzexams.com / ency-education.com (`/Author: ency-education.com` dans les métadonnées PDF), **pas l'ONEC** ; droits non clarifiés. L'UI affirme pourtant « PDF officiels, sans modification » et « 34 موضوعات رسمية » (32 fichiers).
- Aucun étiquetage reproduction fidèle / adaptation / sujet blanc (P1.1).
- Les PDF ne sont pas dans le précache → **inaccessibles hors ligne** ; `window.open` vers un PDF n'est pas un « sujet jouable ».
- Durée lue dans les en-têtes SE : de l'ordre de 4 h (lecture brute « 04 سا و 30 د » probable, à confirmer en P0.1) — ni 3 h 30, ni ce que supposerait le chrono.

---

## 3. Lecture tâche par tâche

| Tâche | État dans le PR | Preuve exigée | Preuve livrée |
|---|---|---|---|
| **P0.1** Acquisition légale + registre | ❌ 32 PDF dzexams/ency copiés et dupliqués | `plans/sources/REGISTRE.md` | aucune |
| **P0.2** Opt-in sync | 🟡 `consentementSync: false` (`types.ts:155`), écran نعم / لا، لاحقًا, test « pas d'envoi si `false` » | capture + console réseau | test unitaire seul ; écran affiché aussi au simple login ; **installations existantes avec `true` continuent d'envoyer** (`sync.ts:111` ne coupe que sur `=== false`) ; pas de politique de confidentialité |
| **P0.3** Splash ≤ 3 Mo | ❌ `ouverture.mp4` 13,4 Mo, toujours précaché (`sw.js`) | `poids.md` | aucune |
| **P0.4** Harnais ≥ 30 tests | ✅ 41 tests verts | `npm test` | ✅ — mais pas de test `xp.ts`, env `node` (jsdom installé mais inutilisé), profondeur faible |
| **P0.5** Relecture + d101 | ❌ `d101` (`domaine3.ts:176`) toujours à **deux options équivalentes** | checklist signée, lot U4 | aucune |
| **P0.6** Hygiène | 🟡 marque : 0 occurrence ✅ ; 46 min ✅ ; Hill : `lessonGoldSummaries.ts` → 1939 mais **`programme.ts:343` = 1937** (incohérence déplacée, sans arbitrage) | grep de contrôle | non déposé |
| **Correctif ¹⁸O** | ❌ **aggravé** : « نظير استقرار » + « أكسجين مشع » dans la même phrase (`ExamBlanc.tsx:75, 94, 99, 125`) | validation enseignante | aucune |
| **P0.7** Hors-ligne réel | ❌ `warmAssetsCache` lit les `/assets/*.js` d'`index.html`, qui ne contient que `index-*.js/css` (`grep -o '/assets/[^"]*' dist/index.html`) → chunks lazy **non préchauffés** ; fallback `index.html` servi à la place d'un module JS en cas d'échec | `hors-ligne.md` | aucune |
| **P0.8** Confidentialité complète | ❌ snapshot inchangé (jeton, daïra, nom…), pas de suppression serveur, pas d'inventaire | inventaire + captures | aucune |
| **P1.1** Sujets structurés + corrigés | ❌ liste de liens `window.open` ; UI en français dans une app RTL | 6 sujets jouables hors ligne | aucune |
| **P1.2** Chrono opt-in | 🟡 case à cocher qui **disparaît une fois cochée** (`{!chronoActif && …}`) ; chrono **absent des écrans partie 1 / partie 2** ; `setInterval` global `window.__examTimer` jamais nettoyé ; intro dit toujours « ليس هناك مؤقّت » ; « (P1.2) » et « ⏱️ وُسّع » visibles ; corrigé toujours révélé question par question | session enregistrée | aucune |
| **P1.3** Rédaction libre | ❌ voir R2 | 11 exercices + traces | aucune |
| **P1.5** Niveau 3 | ❌ **0 item `n:3`** (120 n1, 500 n2). « تحدي المستوى 3 — أسئلة صعبة فقط » règle `niveauMax=3` = *tous* les niveaux | 80 items relus | aucune |
| **P1.6** Schémas à légender | ❌ 10 SVG statiques U1 + chips, annoncés « قابلة للنقر » sans interaction ; aucun des 6 schémas du plan | 6 schémas jouables | aucune |
| **P1.7** Priorités sourcées | ❌ badge `poidsBac/5` = donnée pré-existante par unité | tableau de fréquence | aucune |
| **P3.6** Bundle < 400 Ko | ❌ 695 → **720 Ko** | build avant/après | aucune |
| `JalonUnite.tsx` | refactor en constantes `TXT_*` sans effet fonctionnel | — | — |

---

## 4. Impact sur la grille si publié tel quel

| Axe | Mouvement | Raison |
|---|---|---|
| 1 Conformité | ⬇️ | sujets série Maths présentés comme SE ; ¹⁸O incohérent ; Hill toujours double |
| 4 Exercices | ⬇️ | exercice de synthèse U1 cassé ; « niveau 3 » mensonger |
| 5 Sujets Bac | ➡️ 2,5 | aucun sujet structuré, aucun corrigé, aucun registre |
| 6 UX | ⬇️⬇️ | navigation illisible (R1), écrans en français, impasse (R2) |
| 8 Technique | ⬇️ | APK ≈ 100 Mo ; SW servant du HTML pour un module JS ; +25 Ko sur le chunk principal. Le harnais de tests (+≈ 0,5) est annulé par le reste |

---

## 5. Recommandations

1. **Ne pas fusionner** en l'état ; découper en PR portant chacun sa preuve.
2. Garder : harnais Vitest (+ tests `xp.ts`, migration), défaut `false` **+ coupure des envois pour les comptes existants tant qu'ils n'ont pas répondu**, titres HTML, `protocole.ts`, `d101`.
3. Sujets : retirer `public/examens/` et les doublons ; d'abord le **registre** (année/session/série/source/droits lus **dans le PDF**) ; écarter ou étiqueter les 15 sujets série Maths ; n'intégrer que des sujets **structurés** avec corrigé-barème signé.
4. ¹⁸O / Hill : attendre l'arbitrage enseignant plutôt qu'un demi-correctif incohérent.
5. `SyntheseLibre`, chrono, « niveau 3 », schémas : sortir du PR tant qu'ils ne font pas ce que leur libellé promet ; ne pas rebrancher l'exercice U1.
6. `sw.js` : retirer le fallback HTML-pour-JS ; préchauffer les chunks lazy depuis le **manifeste de build**, pas depuis `index.html`.
7. Remplacer le plan GLM par le plan final ; créer `plans/preuves/` dès le premier PR.

---

## 6. Correctifs appliqués sur `arena/4eaeaa75-bawssalate-el-3oloum` (16/11/2026)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| R1 | Inversion du double encodage sur les 62 lignes mojibake d'`App.tsx` | `src/App.tsx` | `grep -c "Ø\|Ù\|Ã©" src/App.tsx` → 0 ; `git diff origin/main -- src/App.tsx` ne montre plus que les ajouts fonctionnels (3 lignes supprimées, toutes intentionnelles) |
| d101 | `o[2]` remplacée par un distracteur distinct (définition du Moho) ; arbitrage tracé | `src/data/drills/domaine3.ts`, `plans/relecture/REGISTRE-ARBITRAGES.md` (A-001) | `node scripts/verifier-drills.mjs` → **0 problème** (était 1) |
| P0.7 (partiel) | Plugin Vite `kunz-precache-manifest` → `dist/precache-manifest.json` (liste des `assets/*.js|css` réellement produits) ; SW v4 : précache des chunks à l'installation depuis ce manifeste, complément à chaque navigation en ligne, purge des hash obsolètes à l'activation, **plus aucun `index.html` servi à la place d'un JS/CSS** (503 explicite) | `vite.config.ts`, `public/sw.js` | `npm run build` → manifeste de 9 entrées (dont `Methodologie-*`, `domaine1/2/3-*`, `dist-*`) ; `vite preview` : 9/9 chunks à HTTP 200. **Le protocole mode avion (PWA + Android) reste à rejouer → `hors-ligne.md`** |
| §7 | Plan GLM remplacé par le plan final ; `plans/preuves/README.md` ; ce document | `plans/PLAN-AMELIORATION-90.md`, `plans/preuves/`, `plans/relecture/` | — |

### 6 bis — Seconde passe (même jour, « continue le reste »)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| R2 | `SyntheseLibre` réécrit : situation → rédaction (textarea, brouillon conservé) → **auto-évaluation par grille cochable** (points attendus + « piège évité ? ») → modèle de réponse (affiché **après** l'auto-évaluation seulement) → résultat. Enregistre la kafaa (`onResultatKafaa`, qualité 5 si grille complète, 3 sinon) et alimente le carnet de fautes. Pilote U1 ; la généralisation aux autres unités dépend de P1.3 | `src/components/SyntheseLibre.tsx`, `src/App.tsx`, `src/components/Methodologie.tsx` | `tsc --noEmit` propre ; parcours testé en preview |
| R3 | Écran « بنك المواضيع », `examSubjects.ts`, `public/examens/` (81 Mo) et `bac-svt-sujet-2026.pdf` **retirés** ; 32 PDF archivés dans `plans/sources/sujets/{SE,M}/` ; registre honnête | `plans/sources/REGISTRE.md`, `src/components/Exercices.tsx`, `src/App.tsx` | `dist/` : **8,2 Mo** (était ≈ 90 Mo) ; `grep -rn examens src public` → 0 |
| P0.2 / P0.8 | Consentement **explicite et daté** (`consentementSyncDecideLe`) ; `envoyerSnapshot` coupe tant qu'il n'existe pas, y compris pour les comptes créés avant v0.9.4 avec `consentementSync: true` par défaut ; l'écran de consentement s'affiche à ces comptes à l'ouverture | `src/types.ts`, `src/utils/sync.ts`, `src/App.tsx`, `src/utils/__tests__/sync.test.ts` | 44 tests verts (+3 : ancien `true` sans date → pas d'envoi ; `consentementEtat` « oui » seulement si daté ; `doitDemanderConsentement`) |
| P0.3 | `ouverture.mp4` 13,4 Mo → **1,65 Mo** (720×1280, 6,6 s, CRF 30, AAC 64 kb/s mono) | `public/ouverture.mp4` | `curl -w %{size_download}` → 1 650 764 octets ; frame t=3 s vérifiée. Source 1080p d'origine uniquement dans l'historique git (`bf849b3`) |
| P1.2 | Chrono de l'examen blanc **réellement implémenté** (opt-in à la consigne, `setInterval` nettoyé, badge discret en partie 1 et 2, temps écoulé rappelé au bilan, jamais bloquant) ; mentions « (P1.2) », « ليس هناك مؤقّت » retirées | `src/components/ExamBlanc.tsx` | preview : case décochée par défaut, badge n'apparaît que si cochée |
| ¹⁸O | Exercice réécrit en traçage isotopique stable (A-003) | `src/components/ExamBlanc.tsx` | `grep -c مشع` → 0 |
| Hill | `lessonGoldSummaries.ts` remis à 1937 (= baseline) ; décision finale A-002 | `src/data/lessonGoldSummaries.ts` | — |
| « niveau 3 » | Bouton « تحدي المستوى 3 » et option « 1–3 » **retirés** (0 item `n:3` en banque) ; reviennent avec les 80 items relus de P1.5 | `src/components/Exercices.tsx` | — |
| P1.6 (textes) | Galerie de schémas : « تفاعلية » / « انقر » retirés ; décrite comme galerie statique | `src/components/Methodologie.tsx` | — |

### 6 ter — Troisième passe (même jour)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| P0.1 (registre) | Lecture **à l'œil** des 13 scans + 5 fichiers ambigus (en-tête page 1 rendu à 100 dpi) : les 32 PDF sont identifiés. 17 SE (2013→2026, 14 années distinctes) + 15 M. **Durée imprimée : 4 h 30 en SE, 2 h 30 en M** (le « 3 h 30 » du plan GLM était faux) | `plans/sources/REGISTRE.md`, `plans/PLAN-AMELIORATION-90.md` (P0.1, P1.1) | tableau avec colonne « Vérif. » ; droits toujours non clarifiés → rien n'est publié |
| A-002 Hill | Alignement **1937** dans les 3 fichiers (année de l'expérience et de la note *Nature* 139:881) | `src/components/ExamBlanc.tsx`, `src/data/lessonGoldSummaries.ts`, `src/data/programme.ts` | `grep -rn 1939 src` → 0 |
| P3.6 | 12 écrans plein écran passés en `React.lazy` sous un seul `Suspense` ; `lessonGoldSummaries` et `qcmLecons` sortent du chunk de démarrage | `src/App.tsx` | chunk principal **709 → 345 kB** (gzip 194 → 105 kB) ; `tsc` propre ; 44 tests verts |
| P0.7 (niveau 1) | Vérification automatisée du précache : 32 statiques + 27 chunks, **59/59 HTTP 200**, 6,6 Mo | `plans/preuves/hors-ligne.md` | script dans le document ; niveau 2 (appareil) toujours à faire |

### 6 quater — Quatrième passe (grille de baseline reçue)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| Baseline | Grille d'audit déposée **telle quelle** : **60,5/100** (Axe 4 = 5,0). Le plan annonçait 61,1 avec Axe 4 = 5,5 → corrigé partout en 60,5 | `plans/preuves/GRILLE-BASELINE.md`, `plans/PLAN-AMELIORATION-90.md` | `grep -n "61,1" plans/` → uniquement la mention du correctif |
| Relecture | Chaque [Constat] de la baseline relu sur l'état courant, sans note | `plans/preuves/ETAT-VS-BASELINE.md` | — |
| P0.8 | Inventaire **mot pour mot** des données envoyées (`DONNEES_ENVOYEES`, `DONNEES_JAMAIS_ENVOYEES`) affiché dans l'écran de consentement et dans « أنا » ; test qui casse si un champ du snapshot n'est pas documenté | `src/utils/sync.ts`, `src/components/CarteSync.tsx`, `src/App.tsx`, `sync.test.ts` | **45 tests verts** |
| P0.6 | Commentaire « 42 min » → 46 min (`protocole.ts`) ; les `<title>` « منصة بنزر العلم » étaient déjà corrigés (0 occurrence) | `src/data/protocole.ts` | `grep -l بنزر public/lecons/*.html` → 0 |

### 6 quinquies — Cinquième passe (P2.2, P2.3, config annuelle, taille de texte)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| Config annuelle | `src/config/annee.ts` remplace `DEBUT_ANNEE` et `dateBac: '2027-06-10'` ; dérivation estimée au-delà du dernier calendrier confirmé | `src/config/annee.ts`, `programme.ts`, `types.ts`, `moteur.ts` | `annee.test.ts` (4 tests) |
| P2.2 | Objectif 10/14/18 → `QUOTA_PAR_OBJECTIF` ; `prochaineAction`, bonus, `competenceDue` et le marquage `bonusJour` dans `App.tsx` lisent `quotaDe()` ; réglage dans « أنا » | `moteur.ts`, `App.tsx`, `ReglagesParcours.tsx`, `Ana.tsx` | `parcours.test.ts` : transitions de quota, bonus objectif 10, kafaa 3/sem |
| P2.3 | Mode intensif auto (≤ 60 j) / on / off ; phases J60/J30/J7 ; `itemVerrouille` relâché entre unités prioritaires ; `prochainItem` prioritaire ; quota 3 ; SRS plafonnée J+3 ; `planIntensif` affiché dans « اليوم » | `moteur.ts`, `srs.ts`, `App.tsx`, `Aujourdhui.tsx`, `ReglagesParcours.tsx` | scénario « installe à J-45 » : toutes les premières leçons prioritaires ouvertes, ordre interne conservé, unités non prioritaires verrouillées ; hors mode, chemin strictement séquentiel |
| P3.3 (partiel) | Taille de texte s/m/l | `index.css`, `App.tsx`, `LecteurLecon.tsx` | build OK ; capture appareil à faire |

Total : **60 tests verts**, chunk principal 352 kB.

Toujours ouverts : hors-ligne niveau 2, appareils.md, droits des sujets (A-004), validations enseignant (A-001 → A-003), P2.1 positionnement, recherche/favoris, flashcards, notifications, et dans P2.3 : priorité par leçon (P1.7), sortie SRS après 2 réussites, suivi réel « 1 sujet/semaine ».

### 6 sexies — Sixième passe (P2.1 positionnement, P3.3 recherche + favoris)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| P2.1 | Test de positionnement : 22 questions « synthèse » (2/unité, déterministes), ≈ 12 min, proposé une fois après l'écran de consentement, « لاحقًا » en un geste, rejouable depuis « أنا » ; bilan par unité en mots (متين / متوسّط / للتثبيت), message d'accueil dans « اليوم » sans chiffre ni % | `utils/diagnosticQuestions.ts`, `utils/diagnostic.ts`, `components/Diagnostic.tsx` (lazy), `CarteDiagnosticFavoris.tsx`, `Ana.tsx`, `Aujourdhui.tsx`, `App.tsx`, `types.ts` | `diagnostic.test.ts` (4) : 22 q., évaluation, message sans chiffre, **chemin identique avec ou sans diagnostic** (`prochainItem`, `itemVerrouille` sur tout `CHEMIN`) |
| P3.3 | Recherche locale (index mémoire : titres, `vocabulary`, إشكالية ; normalisation arabe), ouverture en lecture seule | `utils/recherche.ts`, `components/Recherche.tsx` (lazy), `Masari.tsx`, `App.tsx` | `recherche.test.ts` (4) : normalisation, 58/58 indexées, « كالفن » → domaine 2, multi-mots |
| P3.3 | Favoris : ☆ dans le lecteur, liste dans « أنا », « راجع المفضّلة المُنجزة » (SessionRevision sur leçons terminées seulement) | `LecteurLecon.tsx`, `CarteDiagnosticFavoris.tsx`, `App.tsx`, `types.ts` | tsc 0 ; `etatDepuisBrut` conserve `favoris`/`diagnostic` (spread) |

Total : **68 tests verts**, chunk principal 360 kB (gzip 109) ; `Diagnostic` 5,5 kB et `Recherche` 3,8 kB en chunks séparés ; le banc QCM (92 kB) reste hors du chunk d'entrée.

Toujours ouverts : hors-ligne niveau 2, appareils.md, droits des sujets (A-004), validations enseignant (A-001 → A-003), flashcards, notifications, et dans P2.3 : priorité par leçon (P1.7), sortie SRS après 2 réussites, suivi réel « 1 sujet/semaine ».

### 6 septies — Septième passe (P1.7 priorités sourcées, fin de P2.3)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| P1.7 | Analyse de fréquence reproductible sur les sujets SE archivés : extraction pypdf, coupe du corrigé, découpage en تمارين, lexique par unité (bornes de mot pour les jetons latins), citation des leçons via leur `vocabulary` ; priorité 1/2/3 par leçon **générée** | `scripts/frequence-bac.py`, `plans/analyse-frequence-bac.md`, `src/data/priorites.ts` | 9 épreuves texte 2016–2023 ; u3 8/9, u1/u4/u5 7/9, u7/u11 5/9, u2 4/9, u6 3/9, u10 1/9, u8/u9 0/9 ; 16 P1 / 30 P2 / 12 P3 ; section 3 (attribution exercice par exercice) à relire par un enseignant |
| P1.7 | Badge qualitatif discret « يتكرّر في البكالوريا » sur les leçons P1 non faites — jamais un chiffre | `Masari.tsx` | build OK |
| P2.3 | Phases du mode intensif sur la priorité par leçon (J60 = P1 ; J30/J7 = P1–P2 ; P3 jamais) ; verrou relâché entre items prioritaires, ordre des prioritaires conservé dans l'unité | `moteur.ts` (`seuilPriorite`, `leconPrioritaire`, `itemPrioritaire`, `itemVerrouille`) | `parcours.test.ts` réécrit : phases, scénario J-45, couverture 58/58 des priorités |
| P2.3 | Sortie SRS après 2 réussites consécutives (`reussitesIntensif`, `acquisIntensifLe`) ; erreur → compteur 0, J+1 | `srs.ts` (`mettreAJourSrsIntensif`), `App.tsx`, `types.ts` | test dédié (3 transitions) |
| P2.3 | Suivi réel « 1 sujet/semaine » : `etat.examensBlancs` alimenté à l'écran de bilan de l'examen blanc, `sujetCetteSemaine`, ligne cochée dans la carte du plan + compte des leçons « ثبتت » | `ExamBlanc.tsx` (`onTermine`), `moteur.ts`, `Aujourdhui.tsx` | test (fenêtre 7 jours) ; champ **non** envoyé par la sync (liste blanche `construireSnapshot`, ajouté à `DONNEES_JAMAIS_ENVOYEES`) |

Total : **71 tests verts**, chunk principal 363 kB (gzip 110).

Toujours ouverts : lecture humaine des 8 scans (2013–2015, 2024–2026) et validation enseignante du lexique/attribution ; hors-ligne niveau 2 ; appareils.md ; droits des sujets (A-004) ; validations enseignant (A-001 → A-003) ; flashcards ; notifications.

### 6 octies — Huitième passe (rappels locaux, flashcards, horloge des tests)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| P2.4 | Rappel quotidien local **opt-in** : 1 notification/jour (id fixe), heure choisie, 4 textes neutres sans chiffre, permission demandée uniquement à l'activation, refus → rien de programmé, web → « indisponible » annoncé ; resynchronisation silencieuse au lancement si actif et autorisé | `utils/rappels.ts`, `components/ReglageRappel.tsx`, `Ana.tsx`, `App.tsx`, `types.ts` (`rappel`) | `rappels.test.ts` (6) via adaptateur factice ; plugin chargé en import dynamique (hors chunk d'entrée) |
| P2.4 | Intégration native : `@capacitor/local-notifications@8.3.1`, `cap sync android` (gradle), `SCHEDULE_EXACT_ALARM` retiré via `tools:node="remove"` (alarme inexacte suffisante) | `package.json`, `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`, `AndroidManifest.xml` | à prouver sur appareil (capture) — tâche humaine |
| Flashcards | 3 cartes/leçon dérivées des fiches (`recallQuestionAr`→`mechanismAr`, `evidenceAr`, `commonErrorAr`), ouvertes après protocole ou favori, Leitner 1/3/7 j indépendant du SM-2, session ≤ 12 | `utils/flashcards.ts`, `components/Flashcards.tsx` (lazy), `Exercices.tsx`, `App.tsx`, `types.ts` (`flashcards`) | `flashcards.test.ts` (5) : 58/58, ouverture, Leitner, tri de session, indépendance chemin/SRS |
| Tests | `srs.test.ts` et `moteur.test.ts` supposaient « aujourd'hui = 16/11/2026 » en dur → échouaient dès le 17/11. Horloge fixée par `vi.setSystemTime` | 2 fichiers de tests | 82/82 verts le 17/11 UTC |
| CSS | classe `.field` utilisée (inscription, recherche, rappel) mais jamais définie → définie dans `@layer components` | `index.css` | build OK |

Total : **82 tests verts**, chunk principal 367 kB (gzip 111) ; nouveaux chunks `Flashcards` 6,7 kB, plugin notifications hors entrée.

Toujours ouverts (dev) : quiz adaptatif P3.1, revue croisée + stats par unité (P2.4), filtres de recherche. Humain : notification reçue sur appareil, lecture des 8 scans, droits des sujets, relecture 58/58, appareils.md.

### 6 nonies — Neuvième passe (quiz adaptatif, stats par unité)

| # | Correctif | Fichiers | Vérification |
|---|---|---|---|
| P3.1 | Escalier adaptatif : départ au niveau le plus bas du pool de l'axe, 2 réussites consécutives → +1, 2 échecs consécutifs → −1 + invitation cours (au plancher : invitation seule) ; bornes = niveaux réellement présents dans le pool ; « juste » = première tentative ; bilan en mots + schéma, sans % ; sélecteur « niveau max » retiré | `utils/adaptatif.ts`, `Exercices.tsx` (vues `seance`/`bilan`), `Communs.tsx` (`onPremiereTentative`), `App.tsx` (`onOuvrirLecon`) | `adaptatif.test.ts` (5) : bornes, transitions, plancher, choix d'item (niveau courant puis voisins, non faits d'abord), session montée 1→2→3 puis descente 3→2→1 sur pool synthétique |
| P3.1 | Constat banque : n1 = 120, n2 = 500, **n3 = 0** → 2 marches effectives ; affiché à l'élève sans marche vide | — | `verifier-drills.mjs` ; dépend de P1.5 |
| P2.4 | Stats par unité « الأقوى / الأضعف » : calcul local (leçons terminées, fragiles SM-2, couverture drills, positionnement) sur les unités commencées seulement, résultat en mots avec action (révision des fragiles / tab تدريبات) | `utils/statsUnite.ts`, `components/CarteForcesFaiblesses.tsx`, `Ana.tsx`, `App.tsx` | `statsUnite.test.ts` (3) |

Total : **90 tests verts**, chunk principal 372,5 kB (gzip 112,7).

Toujours ouverts (dev) : revue croisée hebdomadaire (P2.4), filtres de recherche par unité, items de niveau 3 (P1.5). Humain : notification reçue sur appareil, lecture des 8 scans, droits des sujets, relecture 58/58, appareils.md, session adaptative enregistrée sur appareil (capture du bilan).
