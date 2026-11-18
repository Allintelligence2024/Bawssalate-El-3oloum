# Correctifs — première phase, 17 novembre 2026

Base de travail : PR #3 intégrée dans la branche de travail. Cette note décrit des modifications locales ; elle ne constitue ni un déploiement ni une validation indépendante de sécurité.

## Réalisé dans le code

- **Sauvegarde** : le format v3 exclut entièrement le compte, le jeton, le hachage et le consentement ; il inclut les statistiques séparées. Les fichiers plats et enveloppés connus passent par une validation Zod, puis une confirmation avant remplacement. Le compte et le consentement de l'appareil restent inchangés. La taille d'import est plafonnée à 5 Mio. Un fichier ancien sans statistiques laisse les statistiques existantes inchangées.
- **Suppression du serveur** : dans l'onglet courant, la révocation bloque les nouveaux envois et l'opération attend la fin de l'envoi en cours avant DELETE. La réponse demande les lignes supprimées : zéro ligne est indéterminé (absence ou accès refusé), pas une confirmation. Même hors ligne ou en cas d'erreur, le consentement local est retiré ; une nouvelle action explicite est nécessaire pour reprendre. L'interface permet de réessayer.
- **Jetons** : aucun jeton n'est généré sans source cryptographique ; les jetons historiques manifestement faibles (tous zéros ou ancien repli `j-`) ne peuvent pas servir aux nouveaux envois. Un compte dépourvu de hachage ne se connecte plus avec un mot de passe arbitraire ; la suppression locale du compte conserve la progression mais ne récupère pas les accès serveur.
- **Hill** : « donneur artificiel » corrigé en « accepteur artificiel ».
- **Stockage** : les échecs de sauvegarde des statistiques remontent au même avertissement ; un échec antérieur à l'abonnement est conservé. Les accès au thème ne bloquent plus l'interface lorsqu'ils échouent. La promesse non vérifiée de purge annuelle automatique a été retirée.

## Limites importantes

- Les **anciennes sauvegardes** peuvent déjà contenir un jeton réutilisable ; le nouveau format ne rend pas ces copies inoffensives. Éviter de les partager et évaluer avec le responsable une révocation/rotation sécurisée côté serveur. Aucun mécanisme de rotation ou de récupération serveur n'a été déployé ici. Les sauvegardes restent des données personnelles lisibles en clair.
- La coordination des requêtes ne s'applique qu'à **cet onglet** : un autre onglet ou appareil peut recréer la ligne. Une requête dont le résultat réseau est incertain peut encore être traitée côté serveur. Un test d'intégration et une coordination serveur sont nécessaires avant de garantir une suppression durable.
- Les bornes de validation et le plafond de 5 Mio peuvent refuser des sauvegardes volumineuses ou de formats anciens atypiques, sans les modifier ; leur compatibilité avec toutes les données réelles est **non vérifiable** à ce stade. Les anciennes copies ne contiennent pas forcément de statistiques. Une sauvegarde de progression ne rétablit pas un compte serveur.
- Les écritures de l'état et des statistiques sont distinctes : une panne de stockage peut empêcher une restauration entièrement persistante malgré l'alerte. Tests UI de quota plein et de refus total du stockage encore nécessaires.
- La purge externe automatique est **non vérifiable** ; la durée de conservation effective reste à établir. Aucun changement de base ni test réel de suppression n'a été effectué.

## Validations et suite

Les tests unitaires simulent le client Supabase, y compris attente de l'envoi, zéro ligne et erreur. Il reste les essais UI → réseau → base avec données de test et bon/mauvais jeton, les essais multionglets et réseau interrompu, et l'examen indépendant des règles RLS. Vérifier l'export/import sur Android, en mode avion, en stockage plein et sur téléphone ≤ 2 Go ; mesurer le chargement de l'écran « أنا » (Zod est chargé avec cet écran). Relecture scientifique et pédagogique humaine, conformité au programme, droits des annales, tests terrain et accessibilité restent ouverts.
