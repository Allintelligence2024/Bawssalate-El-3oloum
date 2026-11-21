# P0 — protocole de confidentialité, sauvegarde et accessibilité

**21 novembre 2026 — fiche de travail, pas certificat de conformité ni autorisation de publication.** Les essais automatisés locaux déjà réalisés ne remplacent pas les cases « appareil réel » ci-dessous. Ne jamais utiliser les comptes, textes, sauvegardes ou données réelles d'un élève pour ces tests.

## 1. Préparer un essai isolé

1. Tester un build local explicitement identifié, dans un **profil de navigateur vierge** ou un conteneur temporaire. Ne pas pointer les scénarios d'intégration vers une instance publique ; désactiver la configuration de synchronisation ou utiliser un serveur de test séparé expressément autorisé.
2. Noter commit/branche et état du diff, empreinte du `public/boussole/index.html`, navigateur et version, OS, appareil, taille d'écran, mode web/PWA/WebView, date et nom du testeur. Noter l'origine exacte et `window.isSecureContext` : HTTP sur une adresse réseau n'offre pas nécessairement les mêmes API qu'un contexte sécurisé ou `localhost`.
3. Créer un compte et des textes **fictifs**, sans mot de passe réutilisé. Fermer tout autre onglet sauf ceux requis par le scénario. Ne pas transmettre les sauvegardes ou captures contenant des secrets ou des données personnelles.
4. Pour les essais hors ligne, laisser finir le téléchargement de l'application, vérifier l'état annoncé, puis couper le réseau et rouvrir. Tester séparément un premier chargement incomplet : il ne doit pas être présenté comme un contenu disponible hors ligne.
5. À la fin, supprimer uniquement le profil et les fichiers **de test** créés pour l'essai. Une capture d'écran n'est une preuve que si la version, le scénario et le résultat y sont reliés ; masquer toute donnée sensible.

### Environnement réellement exercé en automatisation

| Environnement / scénario | Résultat observé | Ce que cela ne prouve pas |
|---|---|---|
| Chromium 141.0.7390.0 sans interface, Linux x86_64, 320 × 568, `recovery.cjs` | Reprise du brouillon, focus initial dans le dialogue, Échap bloqué, tabulation dans le dialogue ; conflits avant livraison de `storage`, confirmation d'import/reset sur carnet changé ; focus et annulation clavier de l'import. | Pas un lecteur d'écran, ni une preuve de comportement sur Android/iOS, ni une exclusion de toute course simultanée. |
| Même Chromium, HTML autonome, `storage.cjs` | Quota et lecture refusée simulés, conservation d'un texte temporaire même si le chargement de la copie échoue ou si un journal apparaît ; conservation et téléchargement de la dernière copie affichée quand le stockage devient illisible ; suppression d'une copie périmée refusée. | Quota et interruption sont simulés ; le stockage et la gestion de `file:` varient selon navigateur. |
| Tests React avec client de synchronisation simulé | État ou statistiques illisibles : aucun envoi ; retrait du consentement enregistré quand l'état reste lisible, même si les statistiques sont corrompues ; témoin positif après réparation explicite. | Aucun service réel n'a été contacté ; ne valide ni les règles serveur ni le retrait sur d'autres appareils. |
| Même Chromium, build local, `integration.cjs` | Navigation, export/réimport/reset et coupure après téléchargement ; tailles 320, 390 et 1024 CSS px. | Pas un essai d'impression visuelle du PDF, ni un test de tous les parcours ou appareils réels. |
| Scans automatiques du laboratoire | Scans axe et contrôles clavier sur pages sélectionnées. | L'analyse de contraste est incomplète ; aucun résultat automatisé ne remplace un contrôle humain. |

### Dernière vérification automatisée locale

Le 21 novembre 2026, sur Linux x86_64 avec Node 22.22.3 et npm 10.9.8 :

- Racine : `npm test` — **245 tests Vitest et 5 tests Node réussis** ; build et vérification des exercices réussis. Les erreurs réseau affichées par certains tests sont des simulations attendues.
- Module : typecheck et reconstruction reproductible du HTML (`sha256:99c0031c39ba494da6e8ef0dc7fddf66ccf10115f26ed4c986e48541fa167553`), puis logique, stockage et 24 contrôles/4 scans sur 5 tailles réussis dans Chromium 141 sans interface.
- Intégration : 11 parcours sur build local, scénarios de reprise et de compte réussis ; contrôle hors ligne niveau 1 : **85 fichiers** servis, aucune incohérence ou erreur HTTP détectée. Les tailles 320/390/1024 px sont des fenêtres simulées, pas des appareils réels.
- Audits npm racine et module : aucune vulnérabilité signalée lors du contrôle. Les premières exécutions de la CI distante ont échoué à l'installation de Chromium : Playwright 1.56.1 ne prend pas en charge Ubuntu 26.04 (`ubuntu-latest`). Le workflow est désormais fixé sur Ubuntu 24.04 ; consulter les contrôles GitHub Actions du commit courant pour connaître le résultat de la relance.

La commande et les dépendances de test sont décrites dans `modules/boussole/README.md`. Les résultats ci-dessus sont des observations locales à la date indiquée, pas une validation du contenu ou de ses droits.

## 2. Matrice à réaliser et signer

**Toutes les lignes ci-dessous sont non réalisées sur appareil réel.** Le responsable QA peut ajouter des appareils selon la population ; ne pas remplacer « non réalisé » par « réussi » sans preuve et identité du testeur.

| Plateforme / mode | Sauvegarde, reset, conflits | Hors ligne et stockage | Clavier, zoom et contraste | Lecteur d'écran arabe / tactile | Testeur, date, version, preuve |
|---|---|---|---|---|---|
| Android · Chrome récent · web et PWA | Non réalisé | Non réalisé | Non réalisé | TalkBack : non réalisé | À renseigner |
| Android · WebView/Capacitor réellement livrée | Non réalisé | Non réalisé | Non réalisé | TalkBack : non réalisé | À renseigner |
| iPhone/iPad · Safari récent · web et ajout à l'écran d'accueil | Non réalisé | Non réalisé | Non réalisé | VoiceOver : non réalisé | À renseigner |
| Ordinateur · Firefox récent | Non réalisé | Non réalisé | Non réalisé | NVDA ou équivalent : non réalisé | À renseigner |
| Ordinateur · Chromium/Chrome et Safari si disponible | Non réalisé | Non réalisé | Non réalisé | Lecteur d'écran adapté : non réalisé | À renseigner |

Consigner aussi les échecs, versions, écarts de comportement et correctifs ; refaire le scénario après correction. Tester sur les versions effectivement prises en charge, sur petit écran et en orientation portrait/paysage.

## 3. Scénarios fonctionnels et confidentialité

| ID | Étapes avec données fictives | Résultat attendu / portée |
|---|---|---|
| **S1 · accès partagé** | Ouvrir le laboratoire, saisir un texte fictif, se déconnecter de Lite puis rouvrir le laboratoire directement. Examiner avec un second profil de compte de la même origine. | Le carnet courant reste après déconnexion et est visible sur le même stockage : le compte ne chiffre ni ne protège les brouillons. Un autre navigateur/origine peut avoir un stockage distinct. |
| **S2 · export** | Écrire des marqueurs fictifs dans progression, statistiques et carnet ; exporter depuis « أنا », inspecter le JSON en local et le rouvrir. | Présence des données attendues et de `carnetBoussole`, absence du compte, mot de passe, jeton et consentement. Le fichier est **en clair** ; vérifier son emplacement et sa suppression en fin de test. |
| **S3 · import complet** | Modifier les marqueurs, puis importer la copie de S2 et accepter la confirmation. | Progression, statistiques et carnet contenus dans le fichier réapparaissent ; identité et consentement courants restent locaux. Vérifier l'état après rechargement. |
| **S4 · formats anciens** | Importer un fichier validé sans champ `carnetBoussole`, puis une copie avec `carnetBoussole: null`. | Le champ absent conserve le carnet courant ; `null` l'efface après la confirmation explicitant cette conséquence. Les fichiers mal formés ou trop grands sont refusés avant écriture. |
| **S5 · stockage et données illisibles** | En profil de test seulement, simuler refus de lecture, quota d'écriture, valeur d'état/statistiques/carnet corrompue ou vide. Avec un brouillon temporaire en conflit, refuser ensuite la lecture du carnet pendant la demande de chargement. | Avertissement visible ; données antérieures non écrasées par l'état de secours ; un export complet est refusé si les données nécessaires sont illisibles. La demande de chargement qui échoue conserve le texte temporaire. Une simulation ne démontre pas le comportement de tous les quotas réels. |
| **S6 · restauration interrompue** | Avec des fixtures uniquement, arrêter l'application entre journal et application, puis recharger ; répéter avec journal illisible et suppression du journal refusée. | Rejeu possible si le journal est valide ; sinon écran de reprise, écritures suspendues et journal conservé. L'abandon confirmé ne supprime que le journal et peut laisser des données partielles. |
| **S7 · deux onglets** | Ouvrir deux onglets de la même origine avec les mêmes données fictives ; modifier l'un, puis essayer de modifier/exporter/importer/effacer dans l'autre. Modifier aussi uniquement le carnet après l'ouverture des confirmations d'import et de reset. Répéter avec un brouillon temporaire et avec événement différé dans l'automatisation. | L'onglet récent devenu périmé se bloque s'il détecte le changement ; le brouillon peut être copié ou téléchargé avant rechargement. Pas de fusion automatique, et aucune garantie en cas d'écritures vraiment simultanées ou d'ancien code. Fermer les autres onglets avant import/reset. |
| **S8 · reset et fichiers** | Exporter une copie fictive, fermer les autres onglets, confirmer le reset depuis « أنا » puis vérifier après rechargement ; inspecter séparément les fichiers téléchargés. | État, statistiques et carnet courant supprimés si succès ; déconnexion seule ne les efface pas. Copies JSON/texte, anciennes clés et données serveur ne sont pas supprimées par ce reset. Un échec partiel n'est pas annoncé comme un succès. |
| **S9 · sync** | En premier lieu, sans configuration distante, observer l'onglet réseau ; si un environnement de test séparé est autorisé, tester refus puis retrait de consentement et suppression serveur avec données fictives. | Aucun envoi sans configuration ou consentement explicite ; aucun texte de brouillon transmis. Un retrait arrête les nouveaux envois locaux, pas nécessairement ceux déjà partis ni les autres appareils. Le résultat serveur n'est confirmé que par sa réponse. |
| **S10 · versions anciennes** | En profil fictif et uniquement si les anciennes versions sont disponibles légalement, créer des marqueurs, essayer export/reset récents, puis examiner séparément les stockages et copies téléchargées. | Ne pas déduire que les anciennes clés ont été incluses ou effacées. Tracer par version/origine ce qui a réellement été vérifié ; décision produit sur conservation/migration encore ouverte. |

### Préserver puis effacer d'anciens carnets sur appareil partagé

1. Identifier **chaque navigateur, profil et origine** utilisés, y compris d'anciens HTML téléchargés. La clé connue pour l'ancienne entrée 1.4 ب est `boussole.bac.entree14b.carnet.1` ; l'inventaire complet des autres versions n'est pas établi ici. Le comportement de `file:` varie selon le navigateur.
2. Si le propriétaire souhaite garder un texte, ouvrir la version concernée et utiliser sa propre fonction d'export ou copier le texte vers un emplacement privé. Vérifier la copie avec lui avant toute suppression ; les exports peuvent être en clair.
3. Fermer les onglets de cette origine, puis utiliser les **réglages du navigateur concerné** pour effacer ses données de site, seulement après confirmation de la personne. Cette opération peut aussi supprimer la progression courante, les caches hors ligne et d'autres données de cette origine. Elle ne supprime pas automatiquement les fichiers déjà téléchargés, d'autres profils/navigateurs/origines ou les données serveur.
4. Vérifier séparément les fichiers téléchargés et, lorsque c'est possible sur le navigateur précis, que les données de site ciblées ont disparu. Ne pas promettre une suppression globale si ces emplacements n'ont pas été inspectés. Si la version ou son origine reste inconnue, signaler l'incertitude au lieu d'effacer au hasard.

## 4. Scénarios d'accessibilité à documenter

- **Clavier :** depuis l'ouverture, tabuler jusqu'à la navigation, l'iframe, les champs, aides, modèles et bouton d'impression. Ouvrir le dialogue d'aide, le fermer et vérifier le retour du focus. Dans la reprise, vérifier l'annonce du titre, l'ordre de tabulation, l'impossibilité de fermer par Échap et le bouton de retour pour copier le brouillon ; documenter comment rouvrir les options depuis le bandeau. Vérifier aussi le focus, la confirmation et l'annulation de l'import, du reset et du chargement du carnet.
- **Lecteur d'écran :** écouter en arabe les libellés des quatre cas, tableaux (en-têtes et unités), descriptions des figures, critères facultatifs, alertes et dialogue. Vérifier ordre de lecture et changements annoncés, sans conclure à partir d'attributs seuls.
- **Zoom/reflow :** tester au moins 200 % et un petit écran à 320 CSS px ; vérifier qu'aucune action essentielle n'est inaccessible, que le texte n'est pas coupé et que les dialogues restent utilisables. Noter les défilements nécessaires, notamment dans l'iframe.
- **Contraste et états :** mesurer manuellement les couples texte/fond et états interactifs là où l'outil automatique ne conclut pas ; relever les valeurs, tailles de texte et exceptions appliquées. Vérifier visibilité du focus, contraste de l'état sélectionné et absence d'information portée par la seule couleur.
- **Tactile et impression :** tester les cibles sur téléphone, l'orientation, la fermeture des dialogues et le retour au brouillon. Imprimer ou prévisualiser chaque fiche et les PDF : absence de texte coupé, lisibilité, titres et tableaux ; le seul en-tête `%PDF` ne vérifie pas le rendu.

## 5. Critère de clôture

Un responsable QA rassemble la matrice renseignée et signée, les écarts, leurs correctifs et les essais de non-régression. Une validation d'accessibilité nécessite des essais humains et des résultats mesurés ; une validation de confidentialité requiert aussi la vérification des flux réels de l'environnement cible. **Ni cette fiche ni des tests verts ne valident les droits ou la science.** L'accord donné pour le push, la fusion et les déploiements automatiques éventuels ne vaut pas validation de ces portes.
