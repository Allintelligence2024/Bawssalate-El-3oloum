# 🎯 Plan corrigé — بوصلة العلوم vers 90/100 (v2, 17/11/2026)

> **Base :** état du dépôt vérifié le 17/11/2026 sur HEAD `fa624f8` (PR #2, branche `arena/4eaeaa75`).
> **Suspend :** `plans/PLAN-AMELIORATION-90.md` v1, dont il reprend la discipline de preuve et la grille
> (`plans/preuves/GRILLE-BASELINE.md`, pondération 15/12/18/12/10/10/13/10).
> **Origine des nouveaux constats :** contre-audit externe du PR #1 (révision `78fdb8e`), faits re-vérifiés
> un par un sur le code actuel — 7 confirmés ouverts, 10 corrigés entre-temps (voir §0).
> **Règle inchangée :** aucun point n'est gagné par une intention. Chaque gain exige une preuve déposée
> dans `plans/preuves/`. La note finale appartient au ré-auditeur (§6), jamais à ce plan.

---

## 0. Point de départ vérifié (17/11/2026)

### Acquis prouvés (re-vérifiés à l'instant)
- **112 tests Vitest / 22 fichiers, tous verts** (`npm test`, 2,9 s) — cible ≥ 100 du plan v1 tenue.
- **Build vert** ; chunk principal **387 Ko (gzip 117 Ko)** < cible 400 Ko ; `dist/` ≈ 9 Mo.
- Splash **1,65 Mo** ; précache 46 entrées toutes HTTP 200 (`hors-ligne.md` niveau 1).
- Opt-in sync strict (`sync.ts:131, 210`) + écran confidentialité + policy DELETE dans `schema.sql`.
- 30 sujets SE structurés + 313 عناصر الإجابة masqués par défaut (`CORRIGES_ACTIVES`), étiquettes a/b/c.
- Chrono opt-in, 11 rédactions libres, 6 schémas à légender, glossaire 317 entrées, diagnostic 22 Q,
  objectif 10/14/18, mode J-60/J-30/J-7, quiz adaptatif, défis, recherche/favoris, Mourchid, rappels.

### Défauts confirmés ouverts (contre-audit externe, re-vérifiés)

| # | Défaut | Localisation | Gravité |
|---|---|---|---|
| D1 | Export complet (`{application, exporteLe, etat}`) rejeté par l'import qui exige `brut.progression` à la racine | `Ana.tsx:97-105` vs `163-166` | 🔴 P0 — la sauvegarde « complète » ne se restaure pas |
| D2 | `prochaineAction` retourne `fini` avant de vérifier `revisionsDues` : rappels dus invisibles après la fin du chemin | `moteur.ts:341` avant `:348` | 🔴 P0 — boucle SM-2 morte en fin de parcours |
| D3 | `d008` et `d032` : deux options équivalentes, une seule acceptée | `domaine1.ts:228, 252` | 🔴 P0 — même défaut que d101 (corrigé, lui) |
| D4 | Échec d'écriture `localStorage` avalé en silence | `storage.ts:38-39` (`catch {}`) | 🟡 P1 — perte sans avertissement |
| D5 | Double comptage des minutes en reprise de séance (8 → 19 au lieu de 11) | `ProtocoleRunner.tsx:253, 290, 322` | 🟡 P1 — statistiques fausses |
| D6 | ~120 définitions sans explication (`e: ""`), l'UI affiche la réponse à la place | `domaine1/2/3.ts`, items `def: true` | ✅ **fait (P-1.3)** — 120 explications rédigées + porte anti-copie (`banque-rapport.md`, A-015/A-016) |
| D7 | Test de consentement sans client réseau simulé : la garantie « 0 POST si false/undefined » est codée mais jamais prouvée par test | `sync.test.ts` | 🟡 P1 — preuve à renforcer |

### Dépendances externes toujours ouvertes (plan v1, inchangées)
- **Relecture enseignante : 0/58** (`reviewed: false` ×58) + arbitrages A-001…A-009 « à valider ».
- **Droits des sujets (ONEC)** non tranchés — 30 sujets actifs sous réserve (A-009).
- **Items n3 : 80/80** (dépôt 3 livré, P-2.1).
- **Terrain :** test appareil mode avion (P0.7 niveau 2), mesures Redmi 9A / Galaxy A1x, 12–15 élèves,
  Play Store track fermée + Data Safety, preuve notification sur appareil.
- **Documentation :** `ETAT-VS-BASELINE.md` périmé (annonce 45 tests, SyntheseLibre 1/11…).

### Estimation honnête de la note actuelle (grille baseline, à titre indicatif)

| Axe | Poids | Estimation actuelle | Plafond si dépendances restent bloquées |
|---|---|---:|---:|
| 1 Conformité | 15 % | 6,5 | 6,5 (0/58 relu) |
| 2 Contenus | 12 % | 8,0 | 8,0 |
| 3 Assimilation ⭐ | 18 % | 8,5 | 8,0 (sans terrain) |
| 4 Exercices | 12 % | 7,0 | 7,0 (40/80 n3, D3/D6) |
| 5 Sujets Bac | 10 % | 7,5 | 7,5 (droits non tranchés) |
| 6 UX/UI | 10 % | 8,5 | 8,5 |
| 7 Engagement | 13 % | 8,0 | 8,0 |
| 8 Technique | 10 % | 7,0 | 7,5 (D1, policy non déployée, 0 mesure appareil) |
| **Total pondéré** | | **≈ 76–78** | **≈ 77** |

La distance réelle jusqu'à 90 n'est donc **pas dans le code** : elle est dans **6 correctifs dev (1 semaine),
40 items n3 (1 semaine éditoriale), la relecture, les droits, et le terrain**. C'est l'objet de ce plan.

---

## 1. Phase P-1 — Correctifs de fiabilité (semaine 1, ~6,5 j dev) 🔴

> ### ⚡ État d'avancement au 17/11/2026 (fin de journée dev)
> | Tâche | Statut | Preuve |
> |---|---|---|
> | P-1.1 Export→import | ✅ **fait** — format enveloppé + plat acceptés, `version: 2`, hachage vidé du fichier, re-tétée Inscription | tests aller-retour `storage.test.ts` (13 tests) |
> | P-1.2 Rappels dus avant `fini` | ✅ **fait** — réordre reprise → dues → fini → nouvelle → repos | 4 tests `moteur.test.ts` |
> | P-1.3 Banque | ✅ **fait** — détection (script réparé 660/660, CRLF + normalisation) + 5 correctifs (d008, d032, d044, d047, d068) + **120 explications de définitions rédigées** (D6) ; règle « تعريف يحمل تفسيرًا » inversée, portes anti-copie `def`-only (A-015, A-016, A-017) | `plans/preuves/banque-rapport.md` (700 items, 0 problème, 0 alerte) + A-010…A-018 |
> | P-1.4 Échec de stockage visible | ✅ **fait** — `surEchecSauvegarde` + bandeau export dans l'app | tests `storage.test.ts` |
> | P-1.5 Minutes de reprise | ✅ **fait** — `indiceDepart` + 3 sites + affichage « الوقت المقدّر » | fix 8→19 devenu 8→11 (analyse `ProtocoleRunner.tsx`, re-lecture due en terrain) |
> | P-1.6 Preuve réseau du consentement | ✅ **fait** — client Supabase simulé, 7 scénarios a→g | `plans/preuves/consentement-reseau.md` |
> | P-1.7 Policy DELETE déployée | ✅ **fait (18/11)** — schéma appliqué sur le projet réel `kpjcgiwysmqysanqtfkj` via MCP OAuth + correctif A-019 (policy SELECT `lecture_proprietaire` : sans elle, le DELETE anon ne matche jamais) ; matrice 0/0/1 prouvée en direct | `plans/preuves/confidentialite-serveur.md` |
> | P-1.8 Doc de suivi | ✅ **fait** — tenu à jour au 17/11 (P-1.3 éditorial) puis au 18/11 (P-1.7) | `plans/preuves/ETAT-VS-BASELINE.md` |
> | **Porte de sortie** | ✅ `npm test` = **133 verts / 23 fichiers** (≥ 125) · build vert (389 Ko) · D1–D5 corrigés avec tests · test P-1.5 du scénario 8→19→11 | |

> Un seul développeur. Chaque correctif s'accompagne de son test dans la suite existante.
> Aucun autre travail moteur ne démarre avant la fin de cette phase.

### P-1.1 — Réparer export → import (D1) · 1 j
- `importerFichier` (`Ana.tsx`) accepte **deux formats** : enveloppé (`brut.etat` + `brut.application`) et
  plat (`brut.progression` à la racine, format historique). Validation douce inchangée, `etatDepuisBrut`
  appliqué dans les deux cas, message d'erreur explicite si ni l'un ni l'autre.
- Ajouter un champ `version: 2` dans l'export ; l'import ignore proprement `version: 1`.
- **Secrets :** exclure le hachage et le jeton d'écriture de l'objet `compte` dans `exporterEtatComplet`
  (l'export ne doit pas contenir de secret réutilisable) ; à l'import d'un fichier qui en contient, ne pas
  les restaurer (le compte local est revalidé par la session).
- **Tests (`storage.test.ts`) :** aller-retour export → import → comparaison champ par champ (progression,
  SRS, carnet, notes, jalons, stats `kunz_stats_v1`) ; fichier invalide → rejet **sans écraser** l'état courant ;
  fichier enveloppé sans `etat` → rejet.
- **Preuve :** tests verts + une capture du flux réel (export, suppression du stockage, import, reprise exacte).

### P-1.2 — Rappels dus avant `fini` (D2) · 0,5 j
- Dans `prochaineAction` (`moteur.ts:339`) : si `!prochainItem(etat)`, calculer `revisionsDues(etat)` ;
  si des rappels sont dus → `{ type: 'rappel', lessonIds: dues }` ; sinon seulement `fini`.
  Prévoir ensuite une « révision libre » quand aucune échéance n'est due (phase 6 de `repos` actuelle suffit
  — garder le comportement actuel pour ce cas, documenter le choix).
- **Tests (`moteur.test.ts`) :** (a) chemin complet + 1 leçon due → `rappel` ; (b) chemin complet + rien de dû
  → `fini` ; (c) chemin non fini + dues → `rappel` (régression).
- **Preuve :** tests verts + capture de l'écran « اليوم » dans le cas (a).

### P-1.3 — Ambiguïtés de la banque : d008, d032 + détection générale (D3, D6) · 1,5 j dev + éditorial
- Corriger immédiatement `d008` et `d032` comme `d101` (A-001) : remplacer l'option doublon par un
  distracteur **faux et identifiable**, tracer dans `plans/relecture/REGISTRE-ARBITRAGES.md` (A-010, A-011),
  arbitrage enseignant sur la formulation finale.
- **Étendre `scripts/verifier-drills.mjs`** : critère « deux options à similarité de texte > seuil
  (normalisation des diacritiques + distance de Levenshtein relative) » sur les 660 items, sortie = liste
  d'items suspects **renvoyés à l'arbitrage humain** (le script détecte, l'enseignant tranche).
  Passer la liste en revue et corriger tout doublon avéré de type d101.
- **Explications des 120 définitions (D6) :** rédiger `e:` pour chaque item `def: true` — une phrase
  « pourquoi les distracteurs sont faux » (pas « الجواب الصحيح : … »). Rédaction dev, validation dans le
  flux de relecture (§3). Si l'explication reste vide, l'UI n'affiche **pas** la réponse à la place.
- **Tests :** `verifier-drills.mjs` → 0 équivalence avérée ; cas d008/d032 ajoutés comme régression.
- **Preuve :** registre A-010/A-011 + sortie du script déposée dans `plans/preuves/banque-rapport.md`.

### P-1.4 — Échec de stockage visible (D4) · 1 j
- `sauvegarderEtat` (`storage.ts:36`) : au `catch`, déclencher un événement/callback qui fait apparaître,
  dans « اليوم » et « أنا », un bandeau persistant « تعذّر الحفظ — صدّر نسخة احتياطية الآن » avec bouton
  d'export immédiat (réutilisant P-1.1). Retry silencieux à la prochaine sauvegarde.
- **Tests :** simulation d'un `setItem` qui lève (quota plein) → le bandeau apparaît, l'export est proposé,
  aucune donnée n'est perdue dans l'état en mémoire.
- **Preuve :** tests + capture du bandeau.

### P-1.5 — Comptage des minutes en reprise (D5) · 1 j
- `ProtocoleRunner.tsx:253/290/322` : la reprise doit sommer **uniquement les phases validées depuis
  le début de la session courante** (`minutesDepart` + `PROTOCOLE.slice(indiceDepartSession, index+1)`),
  pas les phases déjà comptées dans `minutesDepart`. Afficher systématiquement « الوقت المقدّر » (temps
  estimé prévu), jamais présenté comme temps mesuré.
- **Tests (`parcours.test.ts` ou test dédié) :** scénario de l'audit — validation phase 1 (8 min), quitte,
  reprise, validation phase 2 (3 min) → **11 min**, pas 19.
- **Preuve :** test vert + vérification dans le journal (`etat.journal`).

### P-1.6 — Preuve réseau du consentement (D7) · 1 j
- Test d'intégration `sync.test.ts` avec **client Supabase simulé** (injection de `fetch` espion ou client
  mocké via la fabrique `clientSupabase`) : (a) `consentementSync: false` → 0 requête ; (b) `undefined`
  (ancien état migré) → 0 requête ; (c) `true` **sans** `consentementSyncDecideLe` (installation v0.9.3) →
  0 requête + écran de consentement demandé ; (d) `true` + date → exactement 1 upsert ; (e) révocation
  (true → false) → plus aucun envoi ensuite.
- **Preuve :** sortie de test déposée dans `plans/preuves/consentement-reseau.md`.

### P-1.7 — Déployer la policy DELETE sur l'instance réelle · 0,5 j
- Exécuter `supabase/schema.sql` (ou le diff policy) sur la base Supabase **déployée**, vérifier :
  suppression anon d'une ligne possédant le jeton → OK ; sans jeton → refusée ; puis tester le flux réel
  depuis l'écran « الخصوصية » (suppression → requête réseau → 0 ligne restante côté serveur).
- **Preuve :** transcription des résultats dans `plans/preuves/confidentialite-serveur.md`.

### P-1.8 — Mise à jour de la documentation de suivi · 0,5 j
- Réécrire `plans/preuves/ETAT-VS-BASELINE.md` sur l'état du 17/11 : 112 tests, SyntheseLibre 11/11,
  40 n3, 6 schémas, glossaire, 30 sujets + corrigés, config annuelle — et y ajouter la ligne
  « correctifs P-1 » une fois déposés.

### Porte de sortie P-1
`npm test` ≥ 125 verts · `npm run build` vert · D1–D5 corrigés avec tests · D6 rédigé (validation en §3) ·
policy déployée. **Aucun déploiement public tant que cette porte n'est pas passée.**

---

## 2. Phase P-2 — Banque de niveau 3 (semaine 2, ~5 j éditorial) ✅ (P-2.1 fait le 17/11)

### P-2.1 — 40 items n3 restants (n041–n080)

> **✅ Fait le 17/11 (dépôt 3) :** 40 items `n041`–`n080` écrits dans `niveau3.ts` (80 au total),
> distribution finale atteinte exactement — u1=7, u2=7, u3=5, u4=8, u5=8, u6=8, u7=8, u8=9,
> u9=5, u10=10, u11=5 — chaque item relié à un `piegesAr` officiel ou à une expérience de référence
> (Jagendorf, Hill, Calvin ¹⁴C, Anfinsen, 2,4-DNP, membrane artificielle…), commentaire
> `← فخّ/محور · à valider` au-dessus de chaque ligne, ids ajoutés aux `axe.ids` + compteurs `qcm`
> recalés (34 axes, invariant `qcm+defs = ids.length` désormais testé), `TOTAL_QCM = 580`.
> Preuves : `node scripts/verifier-drills.mjs` → **700 items · 80 n3 · 0 مشاكل · 0 تنبيهات** ;
> `npm test` → **134 verts / 23 fichiers** (nouveau test d'invariant des compteurs d'axes) ;
> build vert (389 Ko) ; statut `à valider` tracé dans le registre (A-005, dépôt 3).
- Même gabarit que les dépôts 1–2 (`niveau3.ts`) : source = `piegesAr` officiels + mini-documents
  (courbe/tableau interprétables), tiges **variées** (situation, document, négation, comparaison),
  explication « pourquoi », commentaire `← source · à valider`.
- **Distribution :** U4 ×8, U3/U9/U11 ×5 chacun, solde sur les unités restantes.
- **Critère de qualité (hérité du plan v1) :** aucune tige > 10 occurrences parmi les 80 n3 ;
  chaque item relié à un piège documenté ; au plus un distracteur défendable.
- Étendre l'escalier adaptatif si la banque le justifie (déjà borné [1,3], testé).
- **Preuve :** `verifier-drills.mjs` (nouveau critère tiges de P-1.3) → alertes traitées ; banque à
  660 items / 3 niveaux ; 80 items tracés dans le registre des arbitrages.

---

## 3. Phase P-3 — Relecture et droits (fond, S1 → S6, humain) 🔴

> C'est le goulot qui conditionne les Axes 1, 2 et 5. Il démarre **dès la semaine 1**, en parallèle de P-1.

### P-3.1 — Relecture professorale (2 enseignants SVT 3AS, dont 1 correcteur)
- Périmètre **contractuel** inchangé (plan v1 P0.5) : 58 résumés + QCM de leçon + 660 drills (les 620
  existants + 80 n3) + exercices `Methodologie`/`ExamBlanc` + 11 situations de synthèse + glossaire 317
  + les عناصر الإجابة des 30 sujets + les 120 explications rédigées en P-1.3.
- Lot pilote : **U4 complète** (résumés, QCM, drills) chronométrée → recalage du rythme réel.
- Ordre : U4 (poids 5) → U3/U9/U11 → reste. Exception prioritaire : A-010/A-011 (d008/d032) et
  A-001 (d101) arbitrés **avant** le lot pilote.
- Chaque validation remplit `reviewedBy/reviewedAt` réel dans `lessonGoldSummaries.ts` ; mention
  « قيد المراجعة » reste affichée tant que `reviewed: false`.
- **Preuve :** checklist signée dans `plans/relecture/` + registre des arbitrages mis à jour.

### P-3.2 — Décision droits des sujets (ONEC)
- Demande écrite d'autorisation à la source officielle pour reproduction/adaptation des 30 sujets et de
  leurs éléments de correction ; en cas de refus ou de silence au-delà du délai fixé : `CORRIGES_ACTIVES
  = false` et bascule sur **sujets blancs originaux** rédigés par le correcteur (jamais présentés comme
  officiels), conformément au plan v1 (§7) et à A-009.
- **Preuve :** réponse ou décision tracée dans `plans/sources/REGISTRE.md`.

### Porte P-3
Relecture ≥ 40/58 (unités à fort poids d'abord) pour prétendre à 9/10 sur l'Axe 1 ; à défaut, mention
honnête dans l'app et plafond assumé ( Axe 1 ≈ 7, score final ~85–86 — annoncé comme tel).

---

## 4. Phase P-4 — Terrain et publication (semaines 3–6) 🔴

### P-4.1 — Hors-ligne niveau 2 (P0.7 du plan v1, toujours due)
- Protocole `hors-ligne.md` §2 rejoué sur PWA **et** APK, mode avion, les deux appareils ; matrice
  remplie ligne par ligne + captures. **Obligatoirement rejoué** après P-1 (le découpage en chunks a
  changé depuis le niveau 1 : 46 entrées de manifeste).
- **Preuve :** tableau rempli dans `hors-ligne.md`.

### P-4.2 — Mesures appareils bas de gamme (P3.4-1 du plan v1)
- Redmi 9A / Galaxy A1x : les 8 mesures du protocole `appareils.md` (cold start < 4 s, zéro ANR,
  précache complet en 3G simulée, PSS < 250 Mo). Cibles inchangées ; aucune valeur d'émulateur.
- **Preuve :** `appareils.md` rempli + rapport + captures.

### P-4.3 — Test utilisateurs (P3.4-2 du plan v1)
- 12–15 élèves de terminale SE (≥ 4 en zone à faible connectivité) ; tâches observées : première leçon,
  reprise après 3 jours, rédaction libre, examen chrono, mode J-60 fictif. Critères : ≥ 80 % de tâches
  réussies sans aide ; incompréhensions corrigées avant publication.
- **Preuve :** rapport `plans/preuves/terrain-utilisateurs.md`.

### P-4.4 — Publication
- AAB signé en track fermée Play Store ; fiche Data Safety construite depuis l'inventaire vérifié
  (`DONNEES_ENVOYEES`, P0.8) ; FAQ/à-propos/privacy déjà en place dans « أنا ».
- Preuve de la notification locale (rappel quotidien) sur l'appareil de test.
- **Preuve :** capture track fermée + `audit-reseau.md` re-vérifié + notification reçue documentée.

---

## 5. Correspondance preuves → note cible (grille baseline)

| Axe | Poids | Cible | Preuves qui l'ouvrent |
|---|---|---:|---|
| 1 Conformité | 15 % | 9,0 | 58/58 `reviewedBy` signés (P-3.1) + 0 ambiguïté banque (P-1.3) |
| 2 Contenus | 12 % | 9,0 | glossaire validé + priorités sourcées validées + 120 explications (P-3.1) |
| 3 Assimilation ⭐ | 18 % | 9,0 | D2 corrigé (P-1.2) + minutes fiables (P-1.5) + terrain 12–15 élèves (P-4.3) |
| 4 Exercices | 12 % | 9,0 | 80 n3 tracés (P-2.1) + 0 équivalence (P-1.3) + 6 schémas en usage réel (P-4.3) |
| 5 Sujets Bac | 10 % | 9,0 | droits tranchés (P-3.2) + corrigés relus par le correcteur (P-3.1) |
| 6 UX/UI | 10 % | 9,0 | mesures 2 Go RAM (P-4.2) + hors-ligne niveau 2 (P-4.1) |
| 7 Engagement | 13 % | 9,0 | boucle examens→kafaa→re-test confirmée en terrain (P-4.3) + notification prouvée (P-4.4) |
| 8 Technique | 10 % | 8,5 | D1/D4/D7 corrigés et testés (P-1) + policy déployée (P-1.7) + track fermée (P-4.4) |
| **Total pondéré** | | **89,5 ≈ 90** | |

**Arithmétique :** 13,5 + 10,8 + 16,2 + 10,8 + 9,0 + 9,0 + 11,7 + 8,5 = **89,5 /100**.

**Calendrier conditionnel (réaliste, équipe : 1 dev + 1 éditorial + 2 enseignants + 1 organisateur terrain) :**

| Semaine | Contenu | Livrable |
|---|---|---|
| S1 | P-1 (correctifs, 6,5 j) + lancement relecture (lot U4) + demande ONEC | porte P-1 passée |
| S2 | P-2 (40 n3) + relecture (2–3 unités) | banque 660/3 niveaux |
| S3 | P-4.1 + P-4.2 (terrain) + relecture continue | matrices hors-ligne + appareils remplies |
| S4 | P-4.3 (test utilisateurs) + corrections de terrain | rapport utilisateurs |
| S5–6 | P-4.4 (track fermée) + fin de relecture + ré-audit | preuves complètes sur la table |

Une personne seule : ~3 semaines dev/éditorial + terrain + relecture en fond → **6–8 semaines**, hors
réponses externes (ONEC, recrutement enseignants, accès aux appareils/élèves).

---

## 6. Re-audit de sortie

Mêmes règles que le plan v1 §9 : ré-audit indépendant sur la grille baseline, critères positifs **et
négatifs**, preuves nécessaires mais non suffisantes. Les seuils d'éligibilité au 90 :

1. Axe 1 → 9 : 58/58 signés + 0 ambiguïté d'options dans toute la banque (script + arbitrage).
2. Axe 4 → 9 : 80 n3 relus + explications non vides + 6 schémas en usage réel.
3. Axes 3/6/7 → 9 : rapports appareils + utilisateurs déposés, boucle post-examen démontrée.
4. Axe 5 → 9 : droits tranchés (ou sujets blancs étiquetés comme tels) + corrigés signés.
5. Axe 8 → 8,5 : export→import testé sur appareil réel + 0 envoi sans consentement prouvé par test
   réseau + policy DELETE vérifiée sur l'instance déployée + track fermée active.

> **En une phrase :** le code est prêt à ~76–78 ; le chemin vers 89,5 tient en 1 semaine de correctifs
> dev (D1–D7), 1 semaine de banque n3, et surtout en trois dépendances humaines — relecture, droits,
> terrain — qui ne s'accélèrent pas en écrivant du code.
