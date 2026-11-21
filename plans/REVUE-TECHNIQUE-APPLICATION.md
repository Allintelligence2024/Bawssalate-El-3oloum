# 1. Résumé exécutif

**Verdict : non publiable en l’état comme application synchronisée destinée aux élèves.** La base offline-first, la validation des sauvegardes, le consentement explicite et la séparation du pilote Auth sont de bons points. Mais la vérification d’adresse n’autorise pas encore la synchronisation, le serveur historique ne garantit pas la non-recréation après suppression, et les tests ne couvrent pas le service réellement déployé. Une prévisualisation avec synchronisation désactivée et données fictives n’équivaut pas à une diffusion.

**Périmètre :** branche de travail, HEAD `204e858` et modifications locales de synchronisation. Architecture : React/Vite, état et compte local via localStorage, statistiques locales, worker de cache PWA, coque Capacitor, synchronisation facultative via PostgREST et pilote de vérification web indépendant. Hypothèses : apprentissage sans réseau obligatoire ; la synchro doit converger vers le dernier état admissible, sans autoriser la publication sans consentement ; pas de garantie de purge des copies externes sans confirmation opérationnelle. Revue ciblée des chemins critiques, pas certification ligne par ligne des leçons, de l’APK ou du fournisseur hébergé.

**Exécuté :** `npm test` : 193/193, 35 fichiers ; `npm run build` réussi ; contrôle HTTP build `3465418da4be0c5c4e10` : 75 ressources, zéro erreur HTTP/type, zéro incohérence. `npm audit --omit=dev --json` : un avis élevé sur Zod. Aucune requête de test contre une base réelle. Les cas ci-dessous non explicitement indiqués comme exécutés sont des scénarios de régression proposés, pas des résultats.

# 2. Constats

### BUG-001 — Adresse déclarée utilisée comme identité serveur
- **Sévérité :** High · **Confiance :** High sur le schéma, état hébergé non revérifié · **Catégorie :** Security / Data
- **Emplacement et preuve :** `supabase/schema.sql`, policy INSERT `ecriture_app` et garde du jeton ; `src/utils/sync.ts:175–204`, conflit sur `email`. Le garde ne lie pas l’adresse à un principal vérifié ; le pilote Auth est indépendant.
- **Problème / impact :** attribution non fiable, conflit avec une fiche existante et impossibilité de transférer automatiquement les anciennes fiches en confiance. Le garde proposé bloque les formes invalides de jeton, pas l’absence de preuve d’identité.
- **Vérification :** constat statique des prédicats ; pas de procédure de contournement. **Correctif :** fermer le chemin anon lors de la bascule et autoriser les RPC via l’identifiant de session vérifié, après consentement ; conserver le local en cas d’absence d’identité et ne pas importer les fiches historiques par e-mail.
- **Régression proposée :** sur le schéma corrigé isolé, refuser tout appel non authentifié et toute référence hors du principal courant ; accepter uniquement l’écriture du principal consenti. Vérifier SQL et HTTP, puis les chemins révoqués.

### BUG-002 — Suppression non durable entre clients
- **Sévérité :** High · **Confiance :** High pour le code et la simulation · **Catégorie :** Security / Reliability
- **Emplacement et preuve :** `sync.ts:117–126,221–243`. La suspension est un `Set` en mémoire ; DELETE ne révoque aucune génération serveur ; le client continue à disposer d’UPSERT.
- **Problème / impact :** un état distant ancien peut redevenir visible après une confirmation de suppression. Un succès DELETE ne couvre ni autres appareils ni sauvegardes.
- **Vérification :** scénario inter-onglets déjà couvert par la simulation existante (`suppression-durable.test.ts`), pas validé contre un serveur. **Correctif :** transaction sérialisant suppression et écriture par principal, révocation de génération et réponse idempotente. Pas d’UPSERT direct ; reprise uniquement après nouveau consentement explicite.
- **Régression proposée :** sur le correctif isolé, deux clients fictifs ; après suppression confirmée, toute écriture d’ancienne génération est refusée, y compris si la réponse initiale a été perdue ; un retry ne recrée pas de données.

### BUG-003 — Un état plus récent peut être abandonné pendant un envoi
- **Sévérité :** Medium · **Confiance :** High · **Catégorie :** Reliability / Logic
- **Emplacement et preuve :** `sync.ts:163–168,213–214`, `if (enCours) return`; `App.tsx:296–313` programme une tentative unique après 6 s, plus les événements réseau/visibilité.
- **Problème / impact :** une tentative ignorée n’est pas en attente ; une réponse lente peut laisser le dernier état non envoyé jusqu’à une autre interaction. Aucun délai applicatif n’encadre l’UPSERT ; DELETE attend `enCours`.
- **Reproduction locale proposée :** bloquer la promesse du mock UPSERT pour A ; tenter B, résoudre A ; ne déclencher aucun autre événement. B n’est pas envoyé.
- **Correctif :** garder le dernier état admissible en attente, le traiter après A avec revalidation de consentement et génération, imposer un délai borné ; ne pas annoncer une confirmation après annulation ou résultat inconnu.
- **Régression proposée :** mock contrôlé, vérifier ordre A puis B, coalescence de plusieurs mises à jour, abandon de B après retrait, timeout d’A et reprise. Ne pas traiter l’annulation client comme preuve que le serveur n’a rien écrit.

### BUG-004 — État local validé superficiellement
- **Sévérité :** Medium · **Confiance :** High · **Catégorie :** Data / Logic
- **Emplacement et preuve :** `storage.ts:16–53` valide les conteneurs, pas le type des champs scalaires internes ; `App.tsx:282–286` additionne `p.minutes` sans vérifier le type.
- **Problème / impact :** un ancien état ou un état local incohérent peut passer la lecture et produire des totaux faux, voire être réécrit comme valide.
- **Reproduction locale proposée :** stockage fictif contenant une progression avec `minutes: "5"` ; la lecture accepte la leçon et la réduction réalise une concaténation au lieu d’une addition numérique.
- **Correctif :** validation versionnée de l’état local, récupération explicite, pas de sauvegarde automatique de l’état rejeté ; ne pas réutiliser aveuglément le schéma d’import qui écarte l’identité locale.
- **Régression proposée :** valeurs `null`, chaîne, négative, limite maximale, objet incomplet ; état préservé si rejet, migration valide si champ absent historique.

### BUG-005 — L’import atomique ne protège pas contre un autre onglet obsolète
- **Sévérité :** Medium · **Confiance :** High statique · **Catégorie :** Reliability
- **Emplacement et preuve :** `storage.ts:92–113`, `stockageCommun.ts:22–31` et sauvegarde React `App.tsx:282–286`. Les clés sont enregistrées atomiquement pour l’import, mais chaque onglet garde son propre état en mémoire ; pas de comparaison de génération.
- **Problème / impact :** un onglet ancien peut ensuite publier sa progression obsolète tout en conservant les statistiques nouvellement restaurées. Une ancienne version peut également ignorer le champ interne.
- **Reproduction locale proposée :** charger A et B avec le même état fictif ; restaurer dans A ; sauvegarder l’état obsolète de B. Recharger et constater des générations mélangées.
- **Correctif :** stocker une génération et bloquer les écritures d’une instance obsolète (transaction ou verrou inter-onglets) ; notifier de recharger ; définir le comportement de retour arrière.
- **Régression proposée :** deux pages du même contexte navigateur, écritures avant/après import, fermeture brutale, retour arrière ; préserver le couple état/stats de la génération gagnante.

### BUG-006 — Dépendance de validation vulnérable signalée par le registre
- **Sévérité :** High pour l’avis npm, impact applicatif à mesurer · **Confiance :** High pour la version touchée · **Catégorie :** Security / Performance
- **Emplacement et preuve :** `package-lock.json`, `backup.ts` et `Ana.tsx` ; `npm audit` a signalé [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) sur Zod `<4.6.6`. La borne 5 Mio est utile mais n’établit pas une borne mémoire pour la validation.
- **Problème / impact :** disponibilité locale lors de la validation d’un fichier, surtout sur téléphone modeste. Pas de preuve de crash ni d’exposition distante automatique.
- **Vérification :** reproduire le résultat de registre avec `npm audit --omit=dev`; pas de fichier d’attaque. **Correctif :** évaluer Zod corrigé (changement majeur), tester explicitement les sémantiques des dictionnaires ; limiter les cardinalités avant validation profonde.
- **Régression proposée :** corpus borné de sauvegardes 1–3, limites de champs et de taille, budget de temps/mémoire ; audit CI sans cet avis une fois corrigé.

### BUG-007 — Contrôle hors ligne dépendant de ressources sans délai borné
- **Sévérité :** Medium · **Confiance :** High sur le code, reproduction navigateur non faite · **Catégorie :** Reliability / Performance
- **Emplacement et preuve :** `public/sw.js:24–32,84–109`, `pwa.ts:26–32` : trois fetch workers et un délai sur le port UI ; aucun signal d’annulation appliqué aux fetch de remplissage.
- **Problème / impact :** un fetch qui ne se résout pas maintient la promesse de remplissage et les nouvelles tentatives peuvent rejoindre la même opération ; une expiration UI n’est pas une reprise réseau.
- **Reproduction locale proposée :** mock d’une ressource qui ne répond pas, demander le remplissage puis réessayer sans redémarrer le worker.
- **Correctif :** délai par ressource, libération du travail en cours, conserver les caches déjà valides, distinguer réseau et quota.
- **Régression proposée :** timeout puis reprise, éviction partielle, interruption et deux onglets ; ne pas redemander les ressources encore valides.

### BUG-008 — Les preuves de build ne contrôlent pas le chemin de déploiement
- **Sévérité :** Medium · **Confiance :** High pour la CI versionnée · **Catégorie :** Testing / Operations
- **Emplacement et preuve :** `.github/workflows/ci.yml` exécute test, build et vérificateur de drills, pas le contrôle HTTP du manifeste. La configuration Vercel relevée précédemment exécutait `vite build` (sans `tsc -b` inclus dans `npm run build`) ; état courant non revérifié.
- **Problème / impact :** artefact servi et typecheck peuvent diverger ; aucune preuve automatisée que le manifeste déployé ni les réglages Auth sont corrects sur la cible.
- **Reproduction locale proposée :** produire un artefact de fixture dont une entrée du manifeste est absente ; vérifier que le validateur dédié le refuse et qu’il est invoqué dans la CI corrigée.
- **Correctif :** utiliser `npm run build` comme commande de référence, CI avec contrôle du manifeste, smoke de preview et séparation des variables par environnement ; conserver rollback du frontend séparé du rollback serveur.
- **Régression proposée :** retirer une ressource fictive et vérifier l’échec de la CI ; vérifier également build sans option pilote et redirection autorisée sur environnement isolé.

### BUG-009 — Le mot de passe local ne constitue pas une protection des données stockées
- **Sévérité :** Medium · **Confiance :** High sur le stockage · **Catégorie :** Security
- **Emplacement et preuve :** `compte.ts:17–44` hachage local rapide ; `storage.ts` écrit l’état du compte et la progression en JSON clair.
- **Problème / impact :** le verrou d’interface n’isole pas les données vis-à-vis du profil navigateur ; un mot de passe réutilisé ailleurs accroît le risque. Ce constat ne suppose pas un accès distant au stockage.
- **Vérification :** inspection du format et du chemin d’écriture. **Correctif :** expliciter que le verrou est local ; ne jamais demander la réutilisation d’un mot de passe, réduire les secrets locaux, séparer la session Auth. Si confidentialité sur appareil partagé exigée, définir d’abord un modèle de menace et une protection adaptée.
- **Régression proposée :** export et progression envoyée sans vérificateur de mot de passe ; UI traduite sans promesse de chiffrement ; vérifier les migrations et l’effacement du compte local.

# 3. Couverture manquante

- SQL/PostgREST réel isolé : policies, grants, RLS, INSERT/UPDATE/UPSERT/SELECT/DELETE, rôles, session révoquée, statut HTTP et conflits. Les mocks ne vérifient pas les autorisations du serveur.
- Cycle de vie du lien : courrier reçu, expiration, renouvellement, lien à usage unique, autre navigateur, perte du contexte PKCE, scanners et retour Android (actuellement exclu).
- Navigateurs et APK : stockage concurrent, quota réel, redémarrage de processus, partage annulé, cache évincé et mise à jour multi-onglets. Les tests jsdom ne constituent pas une preuve appareil.
- Vérifier les invariants métier par données de référence indépendantes plutôt que par présence de textes dans les sources : score, progression, durée, transitions interruption/reprise et contenus bilingues.
- Publication : smoke HTTPS par origine, démarrage sans configuration Auth, permissions Android, confidentialité et rétention. Les versions réellement déployées n’ont pas été inspectées pendant cette revue.

# 4. Plan de tests

| Niveau | Cas | Résultat attendu |
|---|---|---|
| Unitaire | Vide, null, types incorrects, champs manquants, limites de taille/collection, doublons et formats anciens | rejet sans mutation ou normalisation documentée ; aucune exception hors API |
| Intégration stockage | Import complet, legacy sans stats, quota, relance, deux onglets | commit unique ; ancien état préservé en cas d’échec ; refus d’un écrivain obsolète |
| Intégration serveur | Identité fictive, consentement, transaction, refus/timeout, retry | profil propre uniquement ; réponses déterministes ; une suppression rejouée ne recrée rien |
| Sécurité défensive | Rôles et générations sur schéma corrigé isolé ; inventaire des copies historiques ; audit de dépendances | refus par défaut ; aucun secret dans les preuves ; rotation révocable |
| E2E | Apprentissage puis export/import PWA/APK, coupure physique, relance, écran lecteur et RTL | activité disponible hors ligne, reprise cohérente, textes et états accessibles |
| Performance | Téléphone ≤ 2 Go, cache froid/chaud, 3G/4G intermittent, import proche de 5 Mio | mesurer temps, pic mémoire, octets ; fixer les seuils avant recette ; pas d’estimation tarifaire non vérifiée |
| Pannes et régressions | scénarios BUG-001 à BUG-009, coupure avant/après commit, versions différentes | résultat indéterminé signalé et récupérable ; chaque correctif a une preuve avant/après applicable |

# 5. Priorités

1. **Bloquants avant diffusion synchronisée :** fermer l’attribution historique non vérifiée, isoler le pilote, déployer seulement après revue le protocole de suppression/révocation ; traiter l’avis Zod et valider l’import. Revue de sécurité indépendante et données fictives pour la recette.
2. **Avant la prochaine version :** file de synchronisation bornée, validation versionnée de l’état, protection contre l’écriture obsolète, délai de téléchargement, test du manifeste dans la CI et smoke de prévisualisation.
3. **Ensuite :** mesurer sur Android, alléger les chemins coûteux sur preuve, automatiser davantage la validation métier ; effectuer les décisions humaines sur programme, bilingue, annales, notifications et conservation.
4. **Optionnel :** refactoriser les orchestrations `App.tsx` par domaine après stabilisation des tests ; ne pas remplacer toute l’architecture pour des motifs de style.

# 6. Verdict final

**Not safe to release — pour une diffusion synchronisée.** Le build est sain au sens de la compilation et du manifeste testé ; ce n’est ni une preuve d’autorisation correcte ni une preuve de suppression durable. Seconde passe : vérification des écritures après import, du cycle de vie du worker, de la dépendance de validation et du décalage CI/Vercel. Pas de correction produit revendiquée dans cette revue ; les tests proposés ne sont pas comptés dans les 193 exécutés.
