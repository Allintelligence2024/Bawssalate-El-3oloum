# Correctifs — phase 2 : stockage et transparence hors ligne

## Changements

- En cas d'échec de lecture de l'état local, de JSON illisible ou de certains types de base incohérents, l'application n'écrase plus automatiquement la clé d'état avec un état vierge. L'écriture reste bloquée jusqu'à une restauration explicitement confirmée, une réinitialisation réussie ou une nouvelle lecture réussie.
- Les statistiques sont protégées contre l'écrasement après une lecture inaccessible ou de structure incohérente ; les erreurs de suppression sont également signalées. Une restauration de statistiques explicitement confirmée peut remplacer les données précédentes.
- L'avertissement est visible dès le démarrage et avant l'inscription, et aussi dans les écrans plein écran. Il indique que les données antérieures peuvent ne pas être visibles et qu'un export ne contient que les données affichées. Dans un écran plein écran, l'avertissement ne propose pas de le quitter automatiquement pour éviter d'interrompre une session.
- Les échecs d'accès au `sessionStorage` ne bloquent plus l'écran de démarrage.
- La FAQ ne promet plus que tous les fichiers sont disponibles hors ligne après une première visite. Elle mentionne la possibilité d'un téléchargement incomplet. La confidentialité précise que l'entrée exige actuellement un compte local ; elle ne promet plus le contraire.

## Tests et limites

- `npm test` : 152 tests réussis, dont tests simulant une lecture impossible ou incohérente, un effacement refusé et des tests React/jsdom du premier échec de sauvegarde, du stockage inaccessible et de l'avertissement en plein écran.
- `npm run build` : réussi. Chunk d'entrée 394,20 kB (118,40 kB gzip) ; écran Ana 93,93 kB (23,80 kB gzip). Ces chiffres ne mesurent ni le trafic réel ni l'expérience sur un appareil.
- Les tests UI tournent dans jsdom, pas sur un téléphone. La validation de l'état chargé localement est **partielle**, et ne garantit pas la détection de toute corruption. La sauvegarde de l'état et celle des statistiques ne sont toujours pas atomiques. Une copie exportée après un échec de lecture peut omettre les données antérieures inaccessibles.
- Aucun changement au service worker dans cette phase : aucun indicateur fiable de téléchargement terminé ni reprise contrôlée n'a encore été ajouté. Le fonctionnement hors ligne complet sur PWA et Android, en cas de coupure 3G/4G ou de quota plein, demeure **non vérifié**.
- La vérification scientifique/pédagogique, la décision sur les droits des annales, les essais terrain et l'audit sécurité indépendant restent ouverts.

## Phase suivante proposée

Tester et durcir le service worker : installation interrompue, état de téléchargement effectivement vérifié, reprise économe en données, mises à jour et compatibilité entre versions ; couvrir les scénarios avec un navigateur réel et mesurer sur appareils modestes avant toute promesse hors ligne générale. Ne pas déployer de changement de base de données sans scénario de test isolé et validation adaptée.
