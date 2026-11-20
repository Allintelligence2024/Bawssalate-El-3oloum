# Plan de remédiation après revue technique

Référence : [constats BUG-001 à BUG-009](REVUE-TECHNIQUE-APPLICATION.md). La synchronisation de données réelles reste exclue de la recette. Aucune modification de la base réelle sans approbation. Une prévisualisation n’autorise pas une diffusion.

| Phase | Travaux | Preuve de sortie | État |
|---|---|---|---|
| 1 — Import et CI (BUG-006, partie de BUG-008) | Mettre à niveau Zod, borner la cardinalité avant validation des valeurs, ajouter les contrôles au pipeline | Témoin de l’avis avant/après, régressions v1–v3 et bornes, build, contrôle HTTP, audit prod | Vérifiée localement |
| 2 — Identité et effacement (BUG-001/002) | Piloter le lien en environnement isolé ; autoriser les écritures par identifiant vérifié et génération de consentement ; supprimer et révoquer dans une transaction ; fermer les routes historiques à la bascule | Matrice SQL/HTTP de refus par défaut sur le schéma corrigé, concurrence, perte de réponse, retry, révocation, revue indépendante, retour arrière sans rouvrir les accès anonymes | En cours — prototype SQL isolé |
| 3 — Fiabilité des données locales et de la synchro (BUG-003/004/005) | File coalescente bornée avec revalidation du consentement ; validation versionnée de l’état ; protection contre onglet obsolète et procédure de retour arrière | Régressions avant/après : A bloqué puis B envoyé, retrait pendant l’attente, état historique mal typé sans écrasement, import et écriture concurrente | À faire |
| 4 — PWA, APK et déploiement (BUG-007/008/009) | Borner les requêtes de cache et tester reprise/éviction ; vérifier le build de preview ; clarifier les limites du verrou local ; tester partage et hors ligne Android | Smoke HTTPS non productif, appareil ≤ 2 Go, mode avion, cache froid/chaud, durée/mémoire/octets et scénarios de récupération | En cours — délai par ressource vérifié en simulation |
| 5 — Décision de diffusion | Confirmer conservation/purge, confidentialité et notifications ; relecture bilingue/scientifique, programme 3AS, droits et essais terrain | Décisions écrites et revue de sécurité indépendante avant diffusion | À faire |

La phase 1 est autonome et ne dépend pas de l’accès aux services hébergés. En phase 2, l’usage local doit rester gratuit d’accès et ne pas exiger la vérification d’un e-mail ; la récupération d’une ancienne fiche et le sort des fiches non réclamées restent des décisions distinctes.

## Phase 1 — Résultats

- Zod `4.6.7` épinglé. Avant : avis GHSA-mrhx-c7xc-m3w5 dans l’audit production. Après : `npm audit --omit=dev --audit-level=high` rapporte zéro vulnérabilité. L’audit complet rapporte toujours six alertes d’outillage de développement, dont deux critiques dans la chaîne Vitest ; traiter séparément la migration majeure et ne pas exposer le serveur de tests.
- Les deux nouveaux tests de cardinalité échouent avec l’ancienne implémentation exécutée via `zod/v3`, et réussissent avec le correctif : 5 000 éléments valides acceptés ; 5 001 refusés avant lecture des valeurs. Les tests de formats historiques et de taille UTF-8 restent verts. Aucun benchmark sur téléphone n’a été fait.
- 195 tests réussis, compilation réussie ; 75 ressources servies sans erreur HTTP dans le build `52263de3d352d111ca8c`. Ajout du contrôle du manifeste et de l’audit production élevé/critique dans le workflow. Vérification locale uniquement : pas de nouvelle CI distante ni de déploiement.
- Suite : lancer la phase 2 sur une instance isolée, sans utiliser la base réelle comme banc de test ; planifier en parallèle l’évaluation et la mise à niveau de l’outillage de développement.

## Phase 2 — Premier jalon SQL isolé

`supabase/propositions/02-synchronisation-verifiee.sql` est une proposition, pas une migration appliquée. Les quatre RPC utilisent l’identité de session, exigent une adresse confirmée et ne prennent pas d’identifiant d’élève en entrée. La table privée n’a pas d’accès direct pour anon ou authenticated. Le contrat pilote accepte des compteurs bornés uniquement. L’écriture et l’effacement conditionnent leur mutation à la génération courante du profil et passent par la même ligne PostgreSQL ; la suppression retire le résumé et incrémente la génération en une instruction. Une répétition confirme si cette suppression est encore la dernière transition ; après nouveau consentement elle ne touche pas la nouvelle génération. Ce mécanisme ne prouve pas l’intention humaine : l’UI doit demander un consentement frais et ne jamais rejouer automatiquement un appel de consentement obsolète.

Preuves exécutées sur PGlite 0.3.15, trois scripts dans l’ordre `supabase/tests/02-fixture.sql`, proposition 02, `supabase/tests/02-cycle.sql` : refus anon/non vérifié, isolement des identités, consentement avant écriture, format, suppression, retry séquentiel simulant une réponse perdue, rejet d’une génération obsolète et nouveau consentement. La fixture simule `auth.uid()` et ne valide pas le fournisseur de jetons, les grants réels de la passerelle ou les verrous sous deux connexions HTTP. Le pilote email et le client ne sont pas raccordés à ces RPC. L’ancien chemin anon reste inchangé : avant toute bascule, le fermer côté serveur et n’autoriser que le nouveau chemin, sans migration automatique par adresse ni réactivation lors d’un retour arrière. Ni l’instance réelle, ni ses sauvegardes, ni sa rétention n’ont été modifiées ou vérifiées.

### Phase 2 — Contrat client, non activé

`src/utils/protocoleSyncVerifiee.ts` adapte les quatre RPC, valide les réponses, borne chaque appel par un signal d’expiration de 12 s, et distingue refus explicite, confirmation et résultat indéterminé. En cas d’effacement incertain, la répétition doit reprendre **la génération initiale**, jamais la génération fraîchement relue : autrement elle pourrait viser un nouveau consentement. Le module ne relance aucune mutation automatiquement et ne collecte ni n’envoie la progression existante. Deux tests de contrat avec RPC simulé : réponse mal typée/refus, puis résultat perdu et répétition explicite avec même génération. 197 tests locaux et build réussis. Pas de test de délai réel, de serveur HTTP ni de mutation déclenchée par l’interface. Étape restante : intégrer ce client dans un pilote en environnement Auth/PostgREST isolé, puis vérifier sous concurrence et réseau interrompu avant d’envisager la bascule.

### Phase 2 — Écran de recette des RPC

`VITE_VERIFICATION_RPC_PILOTE=false` par défaut, en plus de l’option de vérification web. Sur un projet de recette distinct configuré et après retour d’une adresse confirmée, l’écran propose quatre gestes explicites : lire l’état, consentir à l’essai, envoyer trois compteurs constants, effacer. Il ne lit pas la progression ni le consentement local. Le client RPC reste lié au jeton de la session de recette capturée, sans renouvellement automatique. Si le résultat d’effacement est indéterminé, seule la répétition avec la même génération est proposée tant que l’écran reste ouvert ; l’état n’est pas persisté après fermeture. Un test jsdom vérifie l’absence d’appel automatique, le contenu fictif, et deux appels d’effacement ciblant la même génération. 198 tests locaux et build réussis. Aucun projet hébergé ni boîte de recette configurés ici ; pas de test Auth/PostgREST de bout en bout, ni de déploiement.

### Phase 4 — Reprise du cache bornée (BUG-007)

En parallèle du jalon Auth/PostgREST non exécuté, le service worker borne à 30 s la requête d’installation ou de téléchargement explicite de chaque ressource. Le signal reste actif pendant la consommation du corps. Un échec laisse la ressource manquante, ne supprime pas les entrées valides lors d’un téléchargement explicite et libère le remplissage pour une nouvelle tentative. La navigation ordinaire et l’activation multi-onglets n’ont pas changé. Simulation avec horloge contrôlée : requête bloquée annulée, aucun minuteur résiduel, reprise de la seule ressource manquante. Le test ne mesure pas le comportement réel du navigateur lors d'un stockage bloqué ni la stabilité sur Android. 199 tests ; build réussi ; manifeste `fd0892368bfcf06b8386`, 75 ressources HTTP sans incohérence. Aucun déploiement.

### Phase 3 — File locale (BUG-003, partiel)

Le transport historique conserve un emplacement d’attente par onglet pendant un envoi : les états intermédiaires sont remplacés par le dernier résumé. La suspension efface le résumé en attente pour le compte concerné. Test simulé : A bloqué, B puis C demandés, seuls A et C partent ; variante avec suspension, seul A part. Aucun délai d’envoi historique ajouté ici ; état local mal typé et concurrence inter-onglets restent ouverts.

### Intégration avec `main`

`main` a avancé jusqu’à `ee9baf1` et contient déjà une restauration via journal d’engagement (`bc5870b`). Pour éviter deux formats concurrents, cette PR conserve l’implémentation et les tests de `main` : la preuve de l’enregistrement unique intégré décrite historiquement dans le rapport du 19/11 ne décrit donc pas le code final de la PR. L’import UI conserve la validation unique et le test de borne UTF-8. Les garanties de quota, de rejeu et de concurrence doivent être évaluées sur le mécanisme retenu.

### Phase 3 — Durées locales invalides (BUG-004, partiel)

Contrôle ciblé des minutes par leçon, du total et de la lecture directe utilisée par le chronomètre. Une chaîne, `null`, une valeur négative ou au-delà de la borne d’import n’est pas traitée comme une durée ; si l’état ne peut être chargé, l’écriture automatique ne remplace pas les octets initiaux. Les champs historiques absents restent tolérés. 211 tests et build réussis localement. Ce contrôle ne remplace pas la validation de tous les champs ni la coordination entre onglets. Voir [recette isolée pas à pas](RECETTE-ISOLEE-PAS-A-PAS.md) pour la préparation externe nécessaire au pilote.

### Outillage et recette sans changement de forfait

Vitest `5.1.1` et Vite `8.3.8` remplacent les versions signalées ; types Node 22 déclarés pour la compilation des tests. L’audit complet rapporte zéro vulnérabilité au moment du contrôle et la CI vérifie désormais les dépendances de développement aussi. 211 tests, build et 76 ressources HTTP réussis. Aucun changement d’infrastructure.

La recette hébergée du lien et de PostgREST est **reportée**, sans achat ni changement du forfait. Alternative pour plus tard : lancer Supabase CLI et Docker sur une machine de développement, avec base et boîte de capture locales (Mailpit), et un frontend de test servi sur une origine HTTPS compatible avec le pilote. Ne pas réutiliser les données, clés ou paramètres de production. PGlite reste adapté aux tests SQL séquentiels déjà passés, mais ne remplace pas cette recette. D’ici là, continuer les travaux indépendants et conserver le pilote désactivé ; ne pas autoriser une diffusion de la synchronisation sur ces seules preuves.
