# Audit approfondi et plan d’amélioration — بوصلة العلوم

**Date :** 17 novembre 2026
**Révision examinée :** `78fdb8e6457a48d2fd4a92b3bd7fd3c3597af7de`
**Périmètre :** analyse statique du dépôt, inventaire des données, extraction partielle de texte de PDF, compilation et tests automatisés. Aucun test d’usage, appareil réel, audit de sécurité externe ou contrôle exhaustif de conformité officielle n’a été réalisé.

> Ce document est un plan d’action, pas une déclaration de conformité. Les constats sont distingués des risques et des points non vérifiés. Les estimations sont des objectifs de gestion à réviser après estimation par l’équipe.

## 1. Note actuelle

**44,1/100 (4,4/10)**, note indicative et provisoire avec les pondérations demandées. Elle mesure l’état observé de cette révision, pas la qualité d’une éventuelle application publiée sur les stores ni le gain réel sur les notes des élèves.

| Axe | Note /10 | Poids | Contribution /100 | Principale raison |
|---|---:|---:|---:|---|
| 1. Programme et exactitude | 4 | 15 % | 6,00 | Périmètre officiel non vérifié ; erreurs scientifiques constatées |
| 2. Contenus et hiérarchisation | 6 | 12 % | 7,20 | Matière abondante, mais validation et poids Bac non justifiés |
| 3. Parcours et assimilation | 5,5 | 18 % | 9,90 | Action du jour et SRS présents, mais parcours rigide et défaut en fin de parcours |
| 4. Exercices | 4 | 12 % | 4,80 | 620 items, réponses ambiguës et peu de niveaux réels |
| 5. Annales et simulation | 2 | 10 % | 2,00 | Métadonnées fausses ; entraînement guidé, pas simulation fidèle démontrée |
| 6. UX et accessibilité cognitive | 3 | 10 % | 3,00 | Navigation corrompue et entrée par compte obligatoire |
| 7. Interactivité et engagement | 5,5 | 13 % | 7,15 | Rappel actif réel ; boucle de remédiation incomplète |
| 8. Fiabilité, confidentialité et économie | 4 | 10 % | 4,00 | Sauvegarde/import incompatibles, hors-ligne non démontré ; prix et stores non vérifiés |
| **Total** | | **100 %** | **44,05 ≈ 44,1** | |

Les notes précédentes et la cible **65 → 90/100** de `plans/PLAN-AMELIORATION-90.md` sont issues d’une autre évaluation. Elles ne sont pas directement comparables et ne constituent pas une mesure indépendante. Ce plan antérieur contient des propositions à revalider : ne pas inventer une édition officielle, imposer une durée d’examen non vérifiée, ni conserver par principe un verrouillage qui bloque l’accès ciblé. Le présent document le complète et prévaut pour les constats de cette révision.

## 2. Constats approfondis

### P0 — Perte potentielle de progression : export et import incompatibles

**Fait.** `src/components/Ana.tsx`, `exporterEtatComplet`, exporte `{ application, exporteLe, etat }`. `importerFichier` attend `brut.progression` à la racine et ne lit pas `brut.etat.progression`. Un fichier produit par l’export complet est donc rejeté par le contrôle actuel. Les tests de `storage.test.ts` ne testent pas le parcours d’interface export → import.

**Impact.** La sauvegarde annoncée comme complète ne protège pas réellement l’élève contre la perte ou le changement d’appareil via le flux prévu. Aucune perte effective chez un utilisateur n’a été constatée dans cet audit. Le JSON exporté comprend aussi l’objet compte, notamment un hachage et un jeton ; éviter sa diffusion et revoir ce périmètre.

**Action.** Lire et valider la structure enveloppée, prévoir une migration contrôlée des anciens formats, écarter les secrets non nécessaires et prévenir l’utilisateur en cas d’échec de stockage. Tester sur web et Android, en conservant un état riche : leçons, SRS, notes, erreurs et jalons.

### P0 — Révisions dues masquées après la fin du chemin

**Fait.** Dans `src/utils/moteur.ts`, `prochaineAction` retourne `fini` dès que `prochainItem(etat)` est absent, avant d’appeler `revisionsDues`. L’action principale associée à `fini` dans `Aujourdhui.tsx` ouvre le jalon U1, pas la liste des révisions dues.

**Impact.** Un élève ayant terminé le chemin peut ne plus voir ses rappels dus dans l’action principale. Il ne s’agit pas d’une preuve qu’aucun autre accès aux révisions n’existe.

**Action.** Prioriser les rappels dus même après complétion, puis proposer une révision libre lorsqu’aucune échéance n’est due. Test explicite : chemin complet + une leçon due → action `rappel`.

### P0 — Contenu pédagogique et annales

- `ExamBlanc.tsx` parle d’un « donneur » artificiel pour l’expérience de Hill alors que l’expérience fait appel à un **accepteur** ; il qualifie l’oxygène 18 de radioactif alors qu’il est stable. À corriger et faire relire ([cours universitaire](https://phycolab.ua.edu/wp-content/uploads/2010/10/3-Photosynthesis-.pdf), [référence sur le marquage ¹⁸O](https://isotope.bocsci.com/services/oxygen-18-stable-isotope-labeling-services.html)).
- `d008` et `d032` dans `src/data/drills/domaine1.ts` contiennent chacun deux formulations équivalentes, dont une seule est acceptée. `d101` présente le même type de problème sur Gutenberg.
- `examSubjects.ts` classe `dzexams-bac-sciences-2311208.pdf` en 2024 ; le texte extrait de la première page indique 2022. `dzexams-bac-sciences-2356016.pdf` est catalogué 2023 tandis que le texte extrait indique 2020. Vérifier visuellement chaque document : l’extraction d’arabe peut être imparfaite et les PDF scannés requièrent une lecture humaine.
- `Exercices.tsx` affiche **34 sujets**, tandis que le catalogue et `public/examens` en comptent **32**. Utiliser une valeur calculée.
- Le programme actuel et la durée officielle d’épreuve par filière/session restent **non vérifiables** ici. La page du ministère répertorie des ressources pour les filières mathématiques et sciences expérimentales, mais n’a pas permis une confrontation complète au texte actuel ([ministère](https://www.education.gov.dz/fr/ressources-pedagogique-et-didactiques/)).

### P0 — Consentement et sauvegarde locale

**Fait.** Le nouvel état `etatVierge()` et la création de compte initialisent le consentement à `false`. Toutefois, `envoyerSnapshot` n’exclut que `consentementSync === false`, et `consentementEtat` traite `undefined` comme « oui ». Un état qui contient explicitement `undefined` ou qui atteint directement cette fonction sans normalisation pourrait ainsi être interprété comme autorisé si la synchronisation est configurée. Les anciens états sans propriété passent normalement par la valeur par défaut de `etatDepuisBrut`. Le test intitulé « aucun envoi avant opt-in » ne configure pas réellement de client Supabase et ne vérifie pas l’absence d’appel réseau pour les trois valeurs `true`, `false`, `undefined`.

**Impact.** Risque conditionnel et défaut de garantie, pas preuve d’un envoi non consenti en production. L’instance et sa configuration réelles ne sont pas connues.

**Action.** Exiger `consentementSync === true` au point d’envoi ; tester avec un client réseau simulé et des états migrés ; réexaminer les règles RLS et supprimer les données inutiles. L’e-mail, la wilaya, la daïra, le nom et la progression sont des données personnelles si le sync est activé. Pas de conclusion juridique sans audit compétent.

### P1 — Charge de travail, calendrier et mesure

1. **Rigidité.** `CHEMIN` est séquentiel, et `itemVerrouille` exige tous les éléments précédents. Les exercices d’une unité sont également conditionnés par le déverrouillage de cette unité. Un élève arrivé tard ne peut pas se concentrer librement sur une faiblesse avancée.
2. **Charge.** Le protocole additionne **46 minutes** par leçon. Sur les **58 leçons annoncées**, cela représente **44 h 28 min indicatives**, hors jalons, rappels, navigation et interruptions. Ce n’est pas un temps mesuré : certains élèves iront plus vite ou moins vite.
3. **Calendrier.** `DEBUT_ANNEE` est fixé au 14 septembre 2026. La semaine 41 commence le 21 juin 2027, la semaine 45 le 19 juillet et la semaine 48 le 9 août, alors que certaines étiquettes d’unités indiquent mai/juin. C’est une incohérence interne ; la date officielle du Bac 2027 n’a pas été vérifiée. Ne pas présenter ces fenêtres comme officielles.
4. **Temps comptabilisé.** `ProtocoleRunner.tsx` enregistre la durée prévue des phases, non une mesure fiable de temps réellement passé. En reprise, `minutesDepart` est ajouté à la somme des phases depuis le début : après 8 minutes créditées en phase 1, la validation de la phase 2 peut produire 8 + (8 + 3) = 19 minutes au lieu de 11 minutes prévues cumulées. Vérifier ce scénario par test de composant.
5. **SRS.** L’algorithme adapte les intervalles ; les écrans promettent parfois une grille fixe J+3/J+7/J+14/J+28. Les deux descriptions ne sont pas toujours équivalentes. Afficher la prochaine date calculée, sans promettre une courbe d’oubli individuelle mesurée.

### P1 — Exercices et boucles de remédiation

- Inventaire du code : **620 items**, dont **120 au niveau 1** et **500 au niveau 2** ; **aucun au niveau 3**, même si le type et le filtre permettent ce niveau. Ce classement code n’est pas une mesure empirique de difficulté.
- Les **120 définitions** ont un champ explication vide ; l’interface remplace ce vide par la réponse, ce qui n’explique pas pourquoi les distracteurs sont faux.
- `composerJoueur` privilégie les questions non réussies et ne remplit pas nécessairement une session de 10 avec d’anciennes questions si quelques nouvelles seulement restent ; le nombre de questions proposées peut donc être inférieur à 10. À clarifier ou à changer avec un test.
- Une réussite après plusieurs essais est enregistrée comme item réussi dans la banque ; la trace `drills` est un booléen. Cela limite l’identification des erreurs et la différence entre réussite immédiate et réussite après aide.

### P1 — Hors-ligne et tests

- `npm run build` réussit ; bundle principal minifié environ **720 kB**, **197 kB gzip**, avec avertissement Vite > 500 kB. Taille brute du dossier `public` : environ **98 Mio** ; ce chiffre n’est **ni** le poids de l’APK, **ni** la quantité automatiquement téléchargée.
- Le service worker demande au précache la vidéo d’environ **13 Mio** et les leçons HTML ; l’installation globale peut échouer si un fichier de `cache.addAll` échoue. Les PDF ne sont pas tous précachés. Les modules chargés à la demande ne sont pas nécessairement téléchargés lors de la première visite. Tester la production hors connexion, pas uniquement le développement.
- `sauvegarderEtat` ignore les exceptions de stockage : risque de perte silencieuse lorsque le quota ou le stockage privé pose problème.
- Le 17 novembre 2026 : **35/41 tests réussis**, 6 échecs liés à des dates fixes. Cela ne prouve pas que le moteur SRS est faux ; les tests doivent figer l’horloge. Couverture des composants, parcours de sauvegarde et tests de service worker : insuffisamment démontrée.

## 3. Vision produit

L’élève doit pouvoir ouvrir l’application sans compte, indiquer son niveau et son temps disponible, puis recevoir **une seule action réalisable**, par exemple :

> « Aujourd’hui : 3 minutes de rappel sur les enzymes, 7 minutes de micro-leçon, 3 questions et une correction ciblée. »

Cette proposition est un **prototype d’expérience**, non une fonctionnalité déjà présente. L’élève peut aussi choisir librement un chapitre ou le mode approfondi. Les niveaux et priorités doivent être fondés sur des observations, jamais sur des promesses de réussite ou une fréquence inventée.

## 4. Feuille de route sur 12 semaines

**Hypothèse :** 1 développeur principal, 1 personne QA partagée, 1–2 enseignants SVT 3AS pour la revue éditoriale et un référent sécurité/protection des données. Les calendriers se chevauchent ; sans disponibilité enseignante ni accès au programme, la validation éditoriale est bloquée et la date de sortie doit être décalée.

### Phase 0 — Sécuriser l’existant (semaines 1–2)

| ID | Action et responsable | Critère de validation mesurable |
|---|---|---|
| P0.1 | **Dév + QA :** réparer export/import versionné ; conserver les données lors de la migration. | Test d’intégration export → import → comparaison progression, SRS, notes et jalons ; test de fichier invalide sans écrasement ; test Android réel. |
| P0.2 | **Dév :** corriger `prochaineAction` pour faire passer les rappels dus avant `fini`. | Tests : parcours terminé avec rappel dû, sans rappel dû, et parcours non terminé. |
| P0.3 | **Dév + enseignant :** corriger Hill, ¹⁸O et QCM `d008`, `d032`, `d101`. | 0 ambiguïté connue sur ces cas ; chaque correction accompagnée de source et relecture. |
| P0.4 | **Dév + QA :** réparer l’encodage de `App.tsx`, y compris les labels ARIA ; calculer le nombre de PDF depuis le catalogue. | Les 5 onglets et le thème lisibles ; test de régression des chaînes et contrôle visuel petit écran. |
| P0.5 | **Dév + sécurité :** rendre le consentement strictement opt-in, informer du contenu envoyé et supprimer les secrets non indispensables des exports. | Test réseau simulé : aucun envoi pour `false` et `undefined`, envoi possible uniquement pour `true` ; migration et révocation testées. |
| P0.6 | **QA :** figer les dates des tests et ajouter tests des flux critiques. | Suite verte sur au moins deux dates simulées ; aucune modification de données réelles pendant les tests. |
| P0.7 | **Dév :** afficher une erreur actionnable si le stockage échoue. | Simulation quota plein : avertissement visible, possibilité d’exporter les données encore disponibles. |

**Porte de sortie :** aucune anomalie P0 ouverte, compilation et tests verts, décision écrite de maintenir ou suspendre le déploiement. Cela n’établit pas encore la conformité pédagogique.

### Phase 1 — Fiabiliser les preuves et le contenu (semaines 2–6)

| ID | Action | Livrable / acceptation |
|---|---|---|
| P1.1 | **Enseignants :** obtenir le programme 3AS applicable par filière et son édition ; construire une matrice objectifs → leçons → évaluations. | 100 % des unités publiées liées à une source réellement consultée ; lacunes et hors-programme indiqués. Si la source manque : statut « non vérifié », pas de label officiel. |
| P1.2 | **Enseignants + QA :** vérifier les **32 notices PDF** : année, session, filière, provenance, corrigé, droits de diffusion. | 32/32 classées `vérifié`, `incertain` ou `retiré` ; toute entrée incertaine cesse d’être présentée comme officielle. Contrôle visuel des scans. |
| P1.3 | **Éditorial :** revue des 58 résumés et de leur lien au contenu réel. | Statut, source, personne et date de revue pour chaque résumé ; divergence scientifique corrigée avant publication de l’unité. |
| P1.4 | **Éditorial + QA :** revue progressive des **620 items** ; vérifier vérité, unicité de réponse, plausibilité et explication. | 100 % des items publiés relus ou clairement marqués non validés ; 0 double réponse connue ; ne pas confondre détection automatique et validation scientifique. |
| P1.5 | **Dév + éditorial :** retirer les poids Bac non sourcés ou publier une méthode. | Source, années, filière, méthode et limites visibles ; aucune prédiction « tombe chaque année » sans preuve. |
| P1.6 | **Dév + QA :** réparer le calendrier fixe et le comptage des minutes. | Date saisie ou calendrier officiellement sourcé ; pas de promesse de rythme garanti ; test de reprise 8 + 3 = 11 minutes prévues et distinction temps estimé/mesuré. |

### Phase 2 — Construire l’assimilation sans surcharge (semaines 4–9)

| ID | Action | Livrable / acceptation |
|---|---|---|
| P2.1 | **Produit + enseignants :** diagnostic initial facultatif de 12–20 questions, par compétences et avec niveau de confiance. | Test pilote ; résultats présentés comme indicatifs ; l’élève peut changer de niveau ou sauter le diagnostic. |
| P2.2 | **Dév + UX :** accès direct aux chapitres avec prérequis suggérés, sans effacer le parcours guidé. | Un élève peut ouvrir immunologie ou géologie depuis une nouvelle installation ; pas de déverrouillage forcé d’étapes. |
| P2.3 | **Éditorial + dév :** modes 10 min, 25 min et approfondi ; micro-leçons avec objectif, rappel et auto-évaluation. | Tester au moins 1 unité pilote avec élèves ; indicateurs de durée observée plutôt que durée imposée. |
| P2.4 | **Dév :** boucle erreur → rappel ciblé → exercice différent → SRS. | Les erreurs de la banque sont rattachées à une notion ; après une erreur, un rappel pertinent et un retest différent sont accessibles ; qualité de rappel influencée par les tentatives. |
| P2.5 | **Produit :** plan ajustable jusqu’à la date renseignée ; mode express facultatif. | Cas J-7, J-30, aucun Bac saisi et plan irréaliste ; l’appli indique explicitement quand tout ne tient pas dans le temps disponible. |
| P2.6 | **Éditorial :** exercices documentaires et rédaction. | Objectif initial : 3 exercices par unité publiée, avec sources, grille, exemples alternatifs acceptables et possibilité de comparer sans notation automatique trompeuse. |

### Phase 3 — Examen, accessibilité et pilote (semaines 8–12)

| ID | Action | Livrable / acceptation |
|---|---|---|
| P3.1 | **Enseignant + dév :** mode examen sur un sujet vérifié par filière. | Format et durée justifiés pour la session ; chronométrage optionnel ou mode examen distinct ; correction inaccessible avant remise ; progression sauvegardée. |
| P3.2 | **Dév + QA :** téléchargement sélectif des unités/annales, service worker robuste et contrôle de version. | Parcours : première visite en ligne → téléchargement choisi → redémarrage hors ligne → leçon, exercice, rappel et PDF choisi ; échec de téléchargement visible. |
| P3.3 | **UX + QA :** mode invité, taille de texte, navigation accessible. | 5 parcours clés réussis sur petit écran, clavier et lecteur d’écran ; pas de collecte obligatoire de wilaya/daïra pour apprendre localement. |
| P3.4 | **QA :** tests réels sur 3 profils Android, dont au moins un appareil ≤ 2 Go, et navigateur iOS si visé. | Mesurer poids installé, premier chargement, reprise, stabilité et stockage ; publier appareils, réseau, médianes et limites. Aucune promesse < 2 s sans mesure. |
| P3.5 | **Produit + enseignants :** pilote volontaire avec 15–30 élèves de profils variés. | Observer sans collecter plus de données que nécessaire ; mesurer compréhension des consignes, complétion, abandon et rappel différé ; pas d’affirmation causale sans groupe comparateur. |
| P3.6 | **Responsable produit/juridique :** support, politique de confidentialité et modèle économique. | Prix, publicité, conditions gratuites, support et disponibilité de distribution documentés ; examen juridique applicable avant publication. |

## 5. Stratégie de test et critères de lancement

### Tests automatisés minimaux

- **Moteur :** les priorités reprise/rappel/nouveau/fin ; parcours complet + rappel dû ; plusieurs échéances et changement de date.
- **Persistance :** export/import de la structure exacte produite, anciens formats, validation et absence d’écrasement sur erreur ; échec de quota ; reprise de séance et comptage.
- **Confidentialité :** `true`, `false`, `undefined`, migration, retrait de consentement, réseau simulé ; test des règles de sécurité sur une instance isolée.
- **Contenu :** identifiants uniques, toutes les références existantes, fichiers PDF réellement présents, étiquettes de filière, réponse unique, explication non vide si publication. La validité scientifique exige une revue humaine.
- **PWA :** test navigateur de production en ligne, hors ligne et après mise à jour ; contrôle des modules dynamiques et des ressources choisies.
- **Accessibilité :** texte lisible, navigation clavier, labels ARIA, contrastes, zoom et interfaces à droite/gauche selon la langue.

### Indicateurs produit à mesurer pendant le pilote

Cibles proposées, non résultats :

1. **100 %** des problèmes scientifiques bloquants connus et **100 %** des notices publiées vérifiées ou explicitement signalées.
2. **100 %** des scénarios export/import automatisés réussis ; aucun effacement silencieux dans les scénarios de test.
3. **≥ 80 %** des participants du pilote trouvent une notion ciblée et lancent un exercice en autonomie ; documenter taille d’échantillon et protocole.
4. **≥ 80 %** terminent une micro-session dans le temps qu’ils avaient choisi, à confirmer sur observations réelles et non sur durées codées.
5. Mesurer un rappel à J+1 et J+7 sur des questions comparables ; comparer à un groupe témoin si possible. Un gain de notes au Bac n’est pas déductible de la seule utilisation.
6. Mesurer octets réellement téléchargés, stockage occupé, temps d’ouverture et échecs hors ligne par appareil et réseau. Fixer ensuite un budget technique réaliste ; 50 Mo est un objectif, pas une mesure actuelle.

### Go / no-go

**Pas de lancement public revendiquant une conformité officielle ou une préparation complète** tant que :

- les défauts P0 sont ouverts ;
- les filières et notices publiées ne sont pas vérifiées ;
- la relecture scientifique minimale des contenus proposés au pilote n’est pas achevée ;
- export/import et hors-ligne promis ne passent pas sur appareil réel ;
- les engagements de confidentialité et les conditions commerciales ne sont pas documentés.

Une **version pilote encadrée** peut être envisagée plus tôt, limitée aux unités relues, avec consentement et signalement des limites.

## 6. Score cible et limites

**Objectif de produit : 70–75/100 après la feuille de route**, à confirmer par un nouvel audit indépendant et des tests utilisateurs. Cette fourchette est un objectif de pilotage, non un score automatique obtenu en cochant des tâches. Elle suppose notamment la correction des P0, la validation du périmètre réellement diffusé, des annales exactes, des boucles de remédiation et des preuves sur appareils réels.

Un objectif ultérieur de **85+/100** nécessitera davantage : contrôle de couverture officielle, évaluations pédagogiques longitudinales, stabilité, accessibilité et sécurité vérifiées, et modèle économique établi. Aucun calendrier ou hausse de note ne peut être garanti avant l’exécution et la validation humaine.
