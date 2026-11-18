# État courant lu avec la grille de la baseline — sans nouvelle note

> **Règle :** ce document ne réattribue **aucune note**. Il reprend chaque [Constat] de `GRILLE-BASELINE.md`
> (audit v0.9.3 `cab5100`, 60,5/100) et dit, preuve à l'appui, s'il est **toujours vrai**, **corrigé** ou
> **partiellement traité** sur le dépôt au **17/11/2026, après la phase P-1** (`plans/PLAN-90-CORRIGE.md`).
> La note appartient au ré-auditeur (plan §6). Légende : ✅ corrigé · 🟡 partiel · ❌ inchangé · 🔒 dépend d'une décision ou d'un tiers.
> **Mise à jour 17/11 (P-1) :** export→import réparé (P-1.1), rappels dus avant `fini` (P-1.2),
> d008/d032/d044/d047/d068 + script réparé (P-1.3), échec de stockage visible (P-1.4),
> minutes de reprise exactes (P-1.5), consentement prouvé par client réseau simulé (P-1.6),
> bandeau + registre A-010…A-014 + 3 preuves déposées. **134 tests / 23 fichiers verts, build 389 Ko.**
> **Mise à jour 17/11 (P-1.3 éditorial, D6) :** **120 explications `def` rédigées** ; règle du
> vérificateur inversée (`def && e.trim()` → `!e.trim()` pour tous) + portes anti-copie `def`-only ;
> `d097` reformulé (A-017) ; 501 échos `qXXX` signalés pour la relecture (A-018) ;
> **vérificateur 700 items · 0/0 · 134 tests · build gzip 117,00 kB** (`banque-rapport.md`).
> **Mise à jour 17/11 (P-2.1, dépôt 3) :** banque n3 complétée à **80 items** (n041–n080, distribution
> finale des 11 unités, A-005) ; **134 tests / 23 fichiers verts, build 389 Ko ; vérificateur 700 items, 0/0.**
> **Mise à jour 18/11 (P-1.7) :** schéma de confidentialité **déployé sur le projet Supabase réel**
> (`kpjcgiwysmqysanqtfkj`, via MCP OAuth — aucun secret demandé) ; matrice DELETE prouvée en direct
> **0/0/1** ; correctif découvert par le test et appliqué (policy SELECT `lecture_proprietaire`, A-019) ;
> preuve : `plans/preuves/confidentialite-serveur.md`.

## Axe 1 — Conformité au programme officiel (baseline 6,0)

| Constat de la baseline | État | Preuve |
|---|---|---|
| 58/58 résumés `reviewed: false`, statut `manuel_officiel_verifie` jamais utilisé | ❌ 🔒 | `grep -c "reviewed: false" src/data/lessonGoldSummaries.ts` → 58 ; relecture enseignante non commencée (P0.5) |
| Hill 1939 dans `ExamBlanc.tsx` vs 1937 dans le résumé | ✅ | 1937 dans les 3 fichiers, `grep -rn 1939 src` → 0 ; arbitrage A-002 (`plans/relecture/REGISTRE-ARBITRAGES.md`) |
| Aucun glossaire bilingue FR–AR | ❌ | — (P2.5) |
| Un seul parcours (SE) | ❌ par design | Le plan rejette l'ajout d'unités hors SE (§0) |
| Défauts scientifiques non relevés par la baseline mais trouvés depuis : ¹⁸O « radioactif », `d101` à deux bonnes réponses | ✅ correctif-dev | A-003, A-001 ; **17/11 (P-1.3) : 5 équivalences d'options de plus corrigées (d008, d032, d044, d047, d068 — A-010…A-014)** ; `node scripts/verifier-drills.mjs` → **660/660 items, 0 problème, 0 avertissement** (le script ne couvrait que 429 items : CRLF + normalisation arabe réparés, `plans/preuves/banque-rapport.md`) |

## Axe 2 — Richesse et hiérarchisation (baseline 6,5)

| Constat | État | Preuve |
|---|---|---|
| Aucune étiquette de priorité par leçon, aucun « tombe chaque année » | 🟡 | P1.7 : `scripts/frequence-bac.py` → `plans/analyse-frequence-bac.md` + `src/data/priorites.ts` (9 épreuves texte 2016–2023 ; 8 scans à lire par un humain) ; badge « يتكرّر في البكالوريا » dans مساري ; validation enseignante de l'attribution exercice/unité encore due — 16/11 |
| Leçon = bloc de « 42 min » | ❌ (commentaire corrigé) | `protocole.ts` l.1 dit désormais 46 min (somme réelle) ; aucun mode « 10 minutes » |
| 25 HTML, 58 résumés, mindmap, 4 ateliers | ❌ inchangé (acquis) | — |

## Axe 3 — Parcours et assimilation ⭐ (baseline 8,0)

| Constat | État | Preuve |
|---|---|---|
| Aucun test de positionnement | ✅ | 22 questions (2/unité), rejetable, bilan en mots, ne déverrouille rien (test vert) — 16/11 |
| Aucun objectif de note | ✅ | P2.2 : `etat.objectif` 10/14/18 → `QUOTA_PAR_OBJECTIF` (1 · 1+bonus · 2+bonus, kafaa 2/2/3 par semaine), réglable dans « أنا » ; tests `parcours.test.ts` (transitions de quota, bonus, plafond kafaa) |
| Aucun mode J-60 / J-30 / J-7 | ✅ | P2.3 : bascule auto à ≤ 60 j de la date de Bac **de l'élève** (ou manuelle on/off) ; phases J60 (leçons P1) → J30 (P1–P2) → J7 ; items prioritaires déverrouillés entre unités (ordre des prioritaires conservé) ; quota 3 ; SRS J+1/J+3 avec **sortie après 2 réussites** ; **suivi « 1 sujet/semaine »** réel ; plan hebdo dans « اليوم ». Tests J-45, SRS intensive, sujet/semaine verts — 16/11 |
| `DEBUT_ANNEE` et `dateBac` codés en dur | ✅ | `src/config/annee.ts` : seul fichier à éditer chaque été ; au-delà du dernier calendrier confirmé, dérivation estimée (2e lundi de septembre, 10 juin) marquée `estime` ; `etatVierge().dateBac` et `semaineActuelle()` lisent ce calendrier ; tests `annee.test.ts` |
| Production écrite jamais vérifiée par l'app | 🟡 | `SyntheseLibre` : rédaction + auto-évaluation par grille + modèle après coup, branchée SM-2 (kafaa) — **les 11 unités** (11 situations, `syntheses.ts`, 16/11 ; à valider, A-007) |
| SM-2 bloquant, moteur de prochaine action, carnet de failles | ✅ 17/11 | **133 tests** (23 fichiers) couvrent `moteur`, `srs`, `dates`, `storage`, `sync`, `parcours`, `protocole`… ; **P-1.2 (D2)** : `prochaineAction` vérifie `revisionsDues` **avant** `fini` — les rappels restent visibles après la fin du chemin (4 tests nouveaux dont régressions) ; **P-1.5 (D5)** : reprise de séance = 8+3 = **11 min** au lieu de 19 (`minutesCumulees` pure + `indiceDepart`, test du scénario exact de l'audit) |

## Axe 4 — Exercices et tests (baseline 5,0)

| Constat | État | Preuve |
|---|---|---|
| 100 % QCM, gabarits répétés ×50 | 🟡 | Mesure exacte désormais possible (script réparé) : les 5 tiges générées tombent **50 ×** sur 700 ; **cible n3 atteinte 17/11 (P-2.1) : aucune tige des 80 n3 répétée (1 occurrence chacune)** ; la réécriture des tiges générées reste un chantier éditorial |
| `n:3` jamais utilisé **mais** un bouton « تحدي المستوى 3 » l'annonçait | ✅ **17/11 (P-2.1)** | bouton mensonger retiré ; **80 items n3 réels** (`niveau3.ts`, 3 dépôts, A-005) — distribution finale des 11 unités (u4=8, u10=10, u8=9…), chaque item relié à un `piegesAr` officiel ou à une expérience de référence ; escalier adaptatif [1,3] branché ; vérificateur 700 items · 0/0 (`plans/preuves/banque-rapport.md`) |
| Partie III (synthèse rédigée) jamais entraînée ni corrigée | 🟡 | `SyntheseLibre` + 11 situations (une par unité, `syntheses.ts`, 16/11) ; auto-évaluation sans note ; contenu à valider (A-007), traces terrain à venir (P-4.3) |
| Schémas à légender : 10 exercices U1 seulement | 🟡 | **6 schémas** à légender (`schemas.ts`) + galerie décrite statique ; usage réel à prouver en terrain (P-4.3) |
| Explications « الجواب الصحيح : … » | ✅ **17/11 (P-1.3 éditorial)** | 120 explications rédigées — « pourquoi les distracteurs sont faux », sans « الجواب الصحيح », sans écho verbatim de l'option correcte ; la règle UI n'affiche **plus la réponse** quand l'explication manque (fallback neutre, `Exercices.tsx`) ; portes anti-copie `def`-only dans `verifier-drills.mjs` ; 700 items · 0/0 (`plans/preuves/banque-rapport.md`, A-015/A-016). Formulations à valider en relecture (P-3.1) |

## Axe 5 — Sujets Bac + simulation (baseline 2,5)

| Constat | État | Preuve |
|---|---|---|
| 0 sujet officiel intégré (pointeurs LFS) | 🟡 🔒 | 32 PDF réels archivés hors app dans `plans/sources/sujets/`, **tous identifiés** (17 SE 2013→2026, 15 M) ; **aucun PDF n'est publié** (A-004). Depuis le 16/11 : **30 sujets SE structurés** (consignes typées, barème, unités, étiquette de fidélité a/b/c) + **عناصر الإجابة condensés pour les 30** (`src/data/corriges/`), masqués par défaut, attribution ONEC, drapeau `CORRIGES_ACTIVES` — droits à trancher (A-008, A-009) |
| Examen blanc : scénario unique, **sans chronomètre** | 🟡 | Chrono **opt-in** réel (case décochée par défaut, badge discret, temps au bilan) ; scénario toujours unique |
| Pas de barème, pas d'interface copie | 🟡 | Barème par exercice et par consigne affiché (ONEC, avec `baremeCorrige` quand l'ONEC l'a rectifié) ; « حاول الإجابة كتابةً أوّلًا، ثمّ قارن » = comparaison manuelle, **pas d'interface copie** ni de correction automatique (hors périmètre, honnêtement) |
| Durée officielle inconnue | ✅ | **4 h 30** lue sur 18 en-têtes d'épreuves SE (`REGISTRE.md`) |

## Axe 6 — UX/UI et ergonomie cognitive (baseline 6,5)

| Constat | État | Preuve |
|---|---|---|
| `ouverture.mp4` 13 Mo dans le précache | ✅ | 1,65 Mo (`poids.md`) |
| Chunk principal 694 kB (> seuil 500 kB) | ✅ | **348 kB** (gzip 106 kB) après lazy-loading de 12 écrans ; `poids.md` |
| `dist/` 20 Mo (puis 90 Mo avec le PR #1) | ✅ | 8,2 Mo |
| Précache tout-ou-rien, risque d'échec silencieux | 🟡 | Manifeste de build + SW v4 ; 59/59 entrées vérifiées HTTP 200 (`hors-ligne.md` niveau 1) ; test appareil (niveau 2) **non fait** |
| Pas de recherche, favoris, taille de texte | ✅ | Taille s/m/l ; recherche locale (titres, termes, إشكالية) depuis « مساري » ; favoris ☆ + révision des favoris terminés depuis « أنا » — 16/11 |
| Pas de bascule FR | ❌ par design | — |

## Axe 7 — Interactivité et engagement (baseline 6,0)

| Constat | État | Preuve |
|---|---|---|
| Pas de flashcards générales, pas de quiz adaptatif, pas de notifications | 🟡 | Flashcards ✅ (3/leçon dérivées des fiches, Leitner, après protocole) ; rappel quotidien local opt-in ✅ côté code (preuve sur appareil due) ; quiz adaptatif ✅ (escalier 2 réussites ↑ / 2 échecs ↓ + lien cours ; 2 marches effectives tant que la banque n'a pas d'items n3) — 16/11 |
| Boucle fermée pour le cours, pas pour l'examen | 🟡 | L'examen blanc alimente désormais kafaa + carnet via le chrono/bilan ; pas encore de re-test ciblé par compétence |

## Axe 8 — Fiabilité technique et accessibilité économique (baseline 6,5)

| Constat | État | Preuve |
|---|---|---|
| Consentement sync **activé par défaut** | ✅ **prouvé 17/11 (P-1.6)** | Porte de code inchangée (`consentementSync === true && decideLe`) ; désormais **prouvée par client réseau simulé** : false → 0 requête, undefined → 0, `true` sans date → 0, true+date → exactement 1 upsert sans aucun secret, révocation → 0, DELETE → `supprime` (`plans/preuves/consentement-reseau.md`) |
| Snapshot contient email, wilaya/daïra, nom — non dit à l'élève | ✅ | `DONNEES_ENVOYEES` / `DONNEES_JAMAIS_ENVOYEES` (`sync.ts`) affichées **mot pour mot** dans l'écran de consentement et dans « أنا » ; test « inventaire P0.8 » : tout champ du snapshot doit être couvert par la liste, sinon le test casse |
| Aucun test automatisé | ✅ | **134 tests Vitest** (23 fichiers) — `npm test` vert ; build vert, chunk principal 389 Ko (gzip 117) |
| Aucune politique de confidentialité affichée | ✅ **18/11 (P-1.7)** | Inventaire + écran « الخصوصية » + suppression serveur en place ; **schéma déployé sur le projet réel** `kpjcgiwysmqysanqtfkj` via MCP OAuth (migrations `init_eleves_et_rls` + `ajouter_lecture_proprietaire`) ; matrice DELETE prouvée en direct : sans en-tête → 0 · mauvais jeton → 0 · bon jeton → **1** ; correctif découvert par le test : sans policy SELECT, `anon` ne voit rien et le DELETE ne matche jamais (A-019) (`plans/preuves/confidentialite-serveur.md`) |
| Pas de dossier `ios/` | ❌ | — |
| Perte de données si cache vidé (export manuel) | ✅ 17/11 | **P-1.1 (D1)** : l'export complet enveloppé (`{application, version, exporteLe, etat}`) est **accepté par l'import** (le format plat historique aussi) ; aucun secret réutilisable dans le fichier (hachage vidé, jeton conservé) ; aller-retour champ par champ testé (`storage.test.ts`) ; **P-1.4 (D4)** : l'échec d'écriture localStorage n'est plus silencieux — `surEchecSauvegarde` + bandeau « صدّر نسخة احتياطية » dans l'app (tests verts) |

## Lecture d'ensemble (sans chiffre) — au 17/11, après la phase P-1

- **Corrigés avec preuve :** tout ce qui était déjà fait au 16/11 **+** export→import réparé et
  sécrétisé, rappels dus avant `fini`, minutes de reprise exactes, 5 équivalences d'options
  (d008/d032/d044/d047/d068), script de banque réparé (660/660, 0/0), échec de stockage visible
  avec bandeau, consentement prouvé appel par appel. Preuves : `plans/preuves/` +
  `plans/relecture/REGISTRE-ARBITRAGES.md` (A-010…A-014). **P-2.1 (17/11) : banque n3 à 80/80**,
  vérificateur 700/700 (0/0), invariant `qcm+defs=ids` testé (`plans/preuves/banque-rapport.md`).
- **Partiels :** rédaction libre (11/11 situations, à valider), hors-ligne (niveau 1 sur 2),
  sujets (identifiés mais droits non tranchés), 80/80 n3 déposés **mais à valider** (P-3.1),
  120 explications rédigées **mais à valider** (P-3.1) ; échos `qXXX` (501) à arbitrer (A-018).
- **Inchangés et dépendants d'un tiers :** relecture enseignante (58/58), droits des sujets,
  terrain (appareils, élèves), publication (track fermée). **P-1.7 (18/11) fait : policy DELETE
  déployée et prouvée sur le projet réel** (0/0/1) — le flux réel depuis l'écran « الخصوصية »
  (appareil → réseau → 0 ligne restante) reste à jouer sur le terrain.
- Porte de sortie P-1 : `npm test` = **134 verts**, `npm run build` vert,
  D1–D5 corrigés avec tests, D7 prouvé. D6 **fait** (rédaction + portes anti-copie) — validation
  des formulations en relecture (P-3.1).

Le ré-audit de sortie devra refaire chaque mesure ci-dessus plutôt que reprendre ce tableau.
