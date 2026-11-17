# État courant lu avec la grille de la baseline — sans nouvelle note

> **Règle :** ce document ne réattribue **aucune note**. Il reprend chaque [Constat] de `GRILLE-BASELINE.md`
> (audit v0.9.3 `cab5100`, 60,5/100) et dit, preuve à l'appui, s'il est **toujours vrai**, **corrigé** ou
> **partiellement traité** sur la branche `arena/4eaeaa75-bawssalate-el-3oloum` au 16/11/2026.
> La note appartient au ré-auditeur (plan §9). Légende : ✅ corrigé · 🟡 partiel · ❌ inchangé · 🔒 dépend d'une décision ou d'un tiers.

## Axe 1 — Conformité au programme officiel (baseline 6,0)

| Constat de la baseline | État | Preuve |
|---|---|---|
| 58/58 résumés `reviewed: false`, statut `manuel_officiel_verifie` jamais utilisé | ❌ 🔒 | `grep -c "reviewed: false" src/data/lessonGoldSummaries.ts` → 58 ; relecture enseignante non commencée (P0.5) |
| Hill 1939 dans `ExamBlanc.tsx` vs 1937 dans le résumé | ✅ | 1937 dans les 3 fichiers, `grep -rn 1939 src` → 0 ; arbitrage A-002 (`plans/relecture/REGISTRE-ARBITRAGES.md`) |
| Aucun glossaire bilingue FR–AR | ❌ | — (P2.5) |
| Un seul parcours (SE) | ❌ par design | Le plan rejette l'ajout d'unités hors SE (§0) |
| Défauts scientifiques non relevés par la baseline mais trouvés depuis : ¹⁸O « radioactif », `d101` à deux bonnes réponses | ✅ correctif-dev | A-003, A-001 ; `node scripts/verifier-drills.mjs` → 0 problème |

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
| Production écrite jamais vérifiée par l'app | 🟡 | `SyntheseLibre` : rédaction + auto-évaluation par grille + modèle après coup, branchée SM-2 (kafaa) — **unité 1 seulement** |
| SM-2 bloquant, moteur de prochaine action, carnet de failles | ❌ inchangé (acquis) | 44 → 45 tests couvrent `moteur`, `srs`, `dates`, `storage`, `sync` |

## Axe 4 — Exercices et tests (baseline 5,0)

| Constat | État | Preuve |
|---|---|---|
| 100 % QCM, gabarits répétés ×50 | ❌ 🔒 | `verifier-drills.mjs` : 5 tiges × 50 ; réécriture = P1.5 éditorial |
| `n:3` jamais utilisé **mais** un bouton « تحدي المستوى 3 » l'annonçait | ✅ (honnêteté) | Bouton et option « 1–3 » retirés de `Exercices.tsx` ; `grep -o "n: *3" src/data/drills/*.ts` → 0 (toujours 0 item n3) |
| Partie III (synthèse rédigée) jamais entraînée ni corrigée | 🟡 | `SyntheseLibre` + 11 situations (une par unité, `syntheses.ts`, 16/11) ; auto-évaluation sans note ; contenu à valider (A-007), traces terrain à venir (P3.4) |
| Schémas à légender : 10 exercices U1 seulement | ❌ | Galerie désormais décrite comme **statique** (plus de « تفاعلية » mensonger) ; P1.6 non commencé |
| Explications « الجواب الصحيح : … » | ❌ | — |

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
| Consentement sync **activé par défaut** | ✅ | `consentementSync: false` par défaut ; envoi **seulement** si `consentementSync === true` **et** `consentementSyncDecideLe` daté ; les comptes antérieurs voient l'écran de consentement ; tests `sync.test.ts` (ancien `true` sans date → aucun envoi) |
| Snapshot contient email, wilaya/daïra, nom — non dit à l'élève | ✅ | `DONNEES_ENVOYEES` / `DONNEES_JAMAIS_ENVOYEES` (`sync.ts`) affichées **mot pour mot** dans l'écran de consentement et dans « أنا » ; test « inventaire P0.8 » : tout champ du snapshot doit être couvert par la liste, sinon le test casse |
| Aucun test automatisé | ✅ | **45 tests Vitest** (`npm test`), 5 fichiers : dates, moteur, srs, storage, sync |
| Aucune politique de confidentialité affichée | 🟡 | L'inventaire ci-dessus en tient lieu ; une page dédiée (conservation, suppression) reste à écrire (P0.8) |
| Pas de dossier `ios/` | ❌ | — |
| Perte de données si cache vidé (export manuel) | ❌ | — |

## Lecture d'ensemble (sans chiffre)

- **Corrigés avec preuve :** opt-in sync complet (y compris inventaire honnête), mp4, bundle, dist, Hill, ¹⁸O, d101, chrono opt-in, bouton « niveau 3 » mensonger, durée officielle, harnais de tests.
- **Partiels :** rédaction libre (1/11 unités), hors-ligne (niveau 1 sur 2), sujets (identifiés mais non publiables).
- **Inchangés et dépendants d'un tiers :** relecture enseignante (58/58), droits des sujets, contenu éditorial (n3, gabarits, glossaire, priorités), terrain (appareils, élèves).
- **Plus rien d'« inchangé et purement dev » dans cette liste** : politique de confidentialité dédiée + suppression serveur (écran « الخصوصية », 16/11), quiz adaptatif, stats par unité, revue croisée, défis + badges, historique d'examens, filtres de recherche, source des drills protégée — tous faits le 16/11. Ce qui reste est éditorial (items n3, glossaire, المرشد الموسّع) ou humain (appareils, terrain, relecture, droits, déploiement de la policy DELETE). (Flashcards et rappels : faits le 16/11.) (Objectif, mode J-60, config annuelle, taille de texte, positionnement, recherche/favoris : faits le 16/11 — voir lignes ci-dessus.)

Le ré-audit de sortie devra refaire chaque mesure ci-dessus plutôt que reprendre ce tableau.
