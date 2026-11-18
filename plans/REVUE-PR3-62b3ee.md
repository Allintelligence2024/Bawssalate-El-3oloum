# Revue indépendante de la PR #3

**Périmètre examiné :** merge commit GitHub `62b3ee2252290f4c8a9238249ba4afebd32e53b1` de la PR [#3](https://github.com/Allintelligence2024/Bawssalate-El-3oloum/pull/3), fusionnée dans `main`. L’examen a été effectué dans une copie temporaire du commit ; la branche de cette session reste basée sur `78fdb8e`. Aucun changement n’a été apporté au code ni à la base.

**Conclusion :** les progrès sont réels et une grande partie des correctifs annoncés est présente. **Il ne reste cependant pas uniquement du travail humain : des problèmes de code et de sécurité subsistent**, notamment la protection des sauvegardes et la confirmation de suppression serveur.

## 1. Vérifications indépendantes

| Point | Résultat | Limite |
|---|---|---|
| `npm test` | **134/134 tests réussis**, 23 fichiers | Tests majoritairement unitaires ; pas une preuve de fonctionnement sur appareil. |
| `npm run build` | **Réussi** ; chunk principal 389,11 kB, gzip 116,99 kB | Pas une mesure de démarrage ou de consommation réseau réelle. |
| `node scripts/verifier-drills.mjs` | **700 items**, 120 définitions, 80 niveau 3 ; 0 problème/alerte signalé | Vérification syntaxique et de similarité ; ne prouve pas l’unicité sémantique ni l’exactitude scientifique. |
| Révisions à la fin du parcours | `src/utils/moteur.ts:339-351` vérifie bien les rappels avant `fini` | Test unitaire présent ; expérience sur appareil non testée. |
| Export/import | `paquetExportComplet` et `etatDepuisFichier` prennent en charge le format enveloppé ; test aller-retour présent | Import superficiellement validé ; statistiques séparées et secret omis/non omis : voir §2. |
| Questions signalées | `d008`, `d032`, `d101` modifiées ; 120 explications ajoutées | Validation scientifique enseignante nécessaire. |
| Reprise et minutes | `minutesCumulees` et tests du scénario 8 → 11 présents | Durée estimée, non temps réel ; pas de test de composant complet. |
| Consentement | Tests avec client Supabase simulé pour `false`, absence de décision, consentement et révocation | Ne prouve pas la gestion de requêtes déjà en vol ou la suppression réelle depuis l’app. |
| Supabase | Lecture seule : les migrations `init_eleves_et_rls` et `ajouter_lecture_proprietaire` et quatre politiques INSERT/SELECT/UPDATE/DELETE existent sur le projet connecté | Aucun test destructif ou test de suppression HTTP n’a été réalisé par cette revue. La présence des politiques ne constitue pas un audit complet de sécurité. |
| Vérifications GitHub | `gh pr checks 3` indique qu’aucun check n’est reporté | Les résultats locaux ci-dessus ne sont pas une CI publiée. |

## 2. Problèmes encore ouverts, classés par gravité

### 🔴 R1 — La sauvegarde dite « sans secret » contient le jeton donnant accès à la ligne Supabase

**Preuve :** `src/utils/storage.ts:53-68` vide uniquement `motDePasse` et conserve `compte.jeton`. Le test `storage.test.ts:127-129` vérifie explicitement que le jeton est conservé. `supabase/schema.sql:75-94` utilise ce même jeton comme contrôle d’accès en lecture et suppression ; `sync.ts:142-170` l’utilise pour l’écriture.

**Impact :** une personne obtenant une sauvegarde non chiffrée peut récupérer ce jeton et, si elle connaît l’endpoint et la clé publique applicables et que la ligne correspondante existe, agir sur la ligne associée. Ce n’est pas une preuve de fuite effective ; c’est une capacité portée par le fichier. La phrase « aucun secret réutilisable » est incorrecte.

**Correctif :** ne pas exporter de jeton dans la sauvegarde ordinaire ; séparer sauvegarde de progression et récupération de compte ; si la récupération du jeton est indispensable, définir une procédure de chiffrement et de réauthentification conçue et auditée, et informer l’élève. Tester qu’aucun jeton ni mot de passe/hachage ne figure dans l’export standard.

### 🔴 R2 — Restauration : validation faible et remise de mot de passe non authentifiée

**Preuve :** `storage.ts:77-86` ne vérifie essentiellement que l’existence de `progression`, puis restaure le compte et les autres champs du fichier. `Inscription.tsx:58-66` accepte n’importe quel mot de passe non vide lorsque le hachage est vide, et installe ce nouveau hachage. `App.tsx:496-500` restaure l’état complet.

**Impact :** un fichier de sauvegarde est traité comme une preuve suffisante de possession ; cette opération n’authentifie pas le propriétaire initial. En présence du jeton exporté et d’un consentement précédemment enregistré, une restauration peut aussi réintroduire une identité et des préférences de synchronisation. L’import d’un fichier mal formé peut écraser l’état courant : un simple objet avec une propriété `progression` de type inattendu peut passer le premier contrôle. Pas de test de bout en bout effectué.

**Correctif :** valider les types, versions et limites de tous les champs avant remplacement ; prévisualiser et confirmer ; conserver l’état précédent si l’import échoue ; ne jamais importer les secrets ni réactiver automatiquement le consentement distant. Tester import malveillant, migration et restauration sur nouvel appareil.

### 🔴 R3 — Suppression serveur : le succès affiché n’est pas démontré

**Preuve :** `src/utils/sync.ts:188-201` interprète l’absence d’erreur Supabase comme une suppression réussie sans vérifier le nombre de lignes supprimées. Avec RLS, une requête peut réussir en supprimant zéro ligne. `Confidentialite.tsx:34-38` ne révoque le consentement qu’après retour de la requête ; `envoyerSnapshot` peut être en cours en parallèle et utilise un `upsert`.

**Impact :** risque de faux message de suppression ; une requête d’envoi concurrente pourrait recréer une ligne après suppression selon son ordre d’exécution. Ces cas sont déduits du code et **n’ont pas été reproduits contre la base réelle**. Le test SQL 0/0/1 documenté valide les politiques dans les conditions de ce test, pas l’ensemble du parcours applicatif concurrent.

**Correctif :** arrêter les nouveaux envois avant suppression, traiter les requêtes en vol, vérifier le résultat/absence de ligne de façon fiable et afficher `absent`, `supprimé` ou `erreur` selon le cas. Ajouter tests de mauvais jeton, 0 ligne, réseau, révocation et envoi simultané ; confirmer en environnement de test isolé.

### 🟠 R4 — Sauvegarde incomplète des statistiques et alertes de stockage partielles

**Preuve :** l’export contient `Etat` mais `src/utils/stats.ts:29` stocke les statistiques de réponses séparément sous `kunz_stats_v1`. Ce module ignore encore les exceptions d’écriture (`stats.ts:89-93`). Dans `App.tsx:258-265`, l’effet de sauvegarde est déclaré avant l’abonnement aux erreurs ; le tout premier échec peut donc ne pas être signalé. L’alerte globale est conditionnée à `pret` (`App.tsx:905`).

**Impact :** la promesse d’une sauvegarde incluant toutes les statistiques (`Confidentialite.tsx:23`) n’est pas satisfaite par ce format ; certains échecs peuvent rester silencieux. L’expérience exacte à l’écran n’a pas été vérifiée sur navigateur/appareil.

**Correctif :** inclure et restaurer les statistiques versionnées, brancher les alertes avant toute écriture et couvrir toutes les voies de stockage ; tests UI et test quota plein, y compris première ouverture.

### 🟠 R5 — Erreur scientifique Hill persistante

**Preuve :** `src/components/ExamBlanc.tsx:72` utilise « مانحًا صناعيًا للإلكترونات » (donneur artificiel) pour l’expérience de Hill. La réaction de Hill met en jeu un **accepteur artificiel d’électrons**, comme le rappelle le résumé `lessonGoldSummaries.ts` et le [cours universitaire de photosynthèse](https://phycolab.ua.edu/wp-content/uploads/2010/10/3-Photosynthesis-.pdf). L’erreur sur l’oxygène 18 a, elle, été corrigée.

**Correctif :** corriger la formulation et la faire relire avec l’ensemble de l’enquête. La réussite des tests ne valide pas la science.

### 🟠 R6 — Droits et fidélité des annales non clôturés

**Preuve :** `src/data/sujetsCorriges.ts:7` a `CORRIGES_ACTIVES = true`. Le registre `plans/relecture/REGISTRE-ARBITRAGES.md`, A-008/A-009, décrit des transcriptions condensées, des barèmes parfois déduits et des droits à trancher. Il indique également que les fichiers PDF sont des copies issues de tiers et non une source institutionnelle obtenue ici.

**Impact :** présence de 30 sujets structurés et de corrigés reformulés ≠ 30 corrections officiellement validées ou autorisées. Ne pas conclure à une infraction juridique sans avis compétent.

**Correctif :** décision écrite sur les droits et validation des transcriptions/barèmes ; jusqu’à décision, envisager la désactivation des contenus concernés et des exercices originaux étiquetés comme tels. Afficher clairement les limites.

### 🟡 R7 — Accès hors ligne et parcours réel restent à prouver et à durcir

- `public/sw.js` exige tous les fichiers statiques via `cache.addAll`, puis télécharge les chunks séparément, en tolérant des échecs et un manifeste indisponible. Une installation peut être partielle ; la FAQ affiche pourtant une garantie large après premier chargement.
- Les exercices de certaines unités restent verrouillés dans le parcours normal, même si la recherche donne accès à la lecture libre et si un mode intensif existe (`moteur.ts`, `Exercices.tsx:631`).
- Le compte local est obligatoire pour accéder à l’application (`App.tsx`/`Inscription.tsx`), alors que `Confidentialite.tsx:74` indique qu’aucun compte n’est obligatoire.
- `Confidentialite.tsx:98` annonce une suppression après une année au-delà de la date de Bac ; aucun mécanisme correspondant n’a été identifié dans le code du dépôt. La présence éventuelle d’une procédure opérationnelle externe est **non vérifiée**.

**Correctif :** test réel PWA/Android après téléchargement complet et coupure réseau, état de téléchargement visible et reprise ; rendre les déclarations conformes aux comportements réellement déployés ; mode invité et choix ciblé si souhaités.

## 3. Ce qui reste à l’humain

1. Relecture scientifique et linguistique des 58 résumés, des 700 items publiés, des schémas et des corrigés, avec date, nom et décision.
2. Vérification de la version applicable du programme 3AS et des filières ; matrice de couverture et arbitrage sur les contenus complémentaires.
3. Décision sur les droits d’utilisation et de reformulation des sujets et corrigés.
4. Tests de terrain avec élèves et enseignants, en mode avion et sur appareils modestes ; validation de l’utilisabilité, de la durée et du stress.
5. Revue sécurité/confidentialité et vérification des pratiques réelles de conservation et suppression.

Ces tâches humaines sont indispensables, **mais elles ne remplacent pas R1–R7**, qui exigent aussi du développement, des tests et des décisions produit.

## 4. Priorités recommandées

1. **Avant toute diffusion :** corriger R1–R3 (sauvegarde, restauration et suppression), et R5 (Hill).
2. **Avant une promesse de sauvegarde/offline fiable :** corriger R4/R7 et faire les tests de bout en bout sur web et Android.
3. **Avant publication des annales/corrigés :** trancher R6 et limiter les contenus aux droits et à la fidélité établis.
4. Reprendre la note des huit axes après validation ; les scores antérieurs 44,1 et 76–78 concernent des révisions et des grilles d’appréciation différentes. Cette revue technique ne suffit pas pour certifier un nouveau score ni une conformité officielle.
