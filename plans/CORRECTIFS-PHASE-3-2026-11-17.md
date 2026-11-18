# Phase 3 — hors ligne et limites des contenus

## Travail réalisé

- Le service worker installe une interface et ses fichiers de démarrage compatibles avec un manifeste portant le même identifiant de version. Une installation incomplète est abandonnée ; un nouveau worker attend la fermeture des onglets utilisant l'ancien, sans `skipWaiting` forcé.
- Dans « أنا », l'élève peut consulter l'état du cache de **la version ouverte**, puis demander explicitement le téléchargement ou la reprise des fichiers manquants. Le service worker limite à trois les téléchargements simultanés ; un échec ne compte pas comme fichier mis en cache. Un total approximatif non compressé est affiché avant téléchargement : ce n'est ni une mesure de trafic ni une garantie que le quota est suffisant.
- Les leçons manquantes retournent une erreur hors ligne au lieu de recevoir silencieusement `index.html`. Les requêtes d'API ne sont pas mises en cache par ce worker. Les caches ne sont effacés que pour les préfixes appartenant à cette application.
- La vidéo d'accueil et les ressources externes ne font pas partie du téléchargement demandé. L'installation d'une mise à jour crée un nouveau cache : il faut vérifier et, si nécessaire, retélécharger les fichiers. Le navigateur peut toujours évincer son cache.
- Les éléments d'annales restent actifs conformément à l'arbitrage produit antérieur A-009, mais leur écran signale explicitement que les droits et la fidélité complète n'ont pas été confirmés. Cela ne constitue ni une autorisation juridique, ni une validation pédagogique.
- Sur Android natif, l'export ne présente plus une copie temporaire ou un partage annulé comme une sauvegarde durable. Sur web, le message demande de vérifier que le téléchargement a effectivement abouti.

## Vérifications et restrictions

Un workflow GitHub Actions est ajouté pour exécuter installation, tests, build et contrôle structurel de la banque. Le vérificateur renvoie désormais un code d'échec pour une banque vide, une ligne non analysée ou une erreur structurelle ; les alertes de similarité restent soumises à l'arbitrage humain. Son exécution sur GitHub est à vérifier après publication.

Les tests du worker simulent l'installation, une interruption, la reprise, une ressource absente, un type MIME incorrect, les requêtes d'API et le nettoyage des caches. Les tests de l'interface de sauvegarde simulent les fichiers invalides et la confirmation. Les tests de version refusent un état provenant d'un autre worker.

Un essai Chromium réel a été tenté après installation temporaire d'un navigateur de test, mais son démarrage a échoué dans l'environnement (`libnspr4.so`, `libnss3.so` et `libnssutil3.so` absentes). Le parcours dans un navigateur réel, la gestion des mises à jour multi-onglets, l'APK, l'éviction du cache, le quota plein et le comportement sur appareil Android ≤ 2 Go restent **non vérifiés**. Les tests simulés ne prouvent pas ces points. Les téléchargements étant facultatifs et variables selon compression, cache et réseau, aucune dépense en DA ne peut être estimée sans mesure et tarif réels.

Pas de modification ni migration de la base Supabase. Les opérations serveur et la rotation des anciens jetons exigent une conception et des tests isolés. La relecture scientifique et linguistique, les droits des annales et la validation de terrain demeurent des tâches humaines.

Vérification finale locale : `npm ci`, **163/163 tests (30 fichiers)**, build réussi, vérificateur des drills : 700 items, 0 problème et 0 alerte. Manifeste : 72 fichiers, 6 151 968 octets non compressés (environ 5,9 Mio), identifiant identique sur deux builds consécutifs. Ces chiffres ne remplacent pas les tests terrain.
