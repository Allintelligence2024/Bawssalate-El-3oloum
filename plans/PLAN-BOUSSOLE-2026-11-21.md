# Plan d'amélioration — Boussole et usages Bac

**21 novembre 2026 — plan de travail.** Après information sur les risques, l'utilisateur a autorisé le push public, la PR et la fusion, y compris les déploiements automatiques éventuels. Un aperçu Vercel a été créé ; une fusion dans `main` peut déclencher la production. Ce document ne valide ni les droits ni les contenus. Les délais ci-dessous sont indicatifs et les validations externes restent ouvertes.

## 1. Objectif et critères de réussite

Permettre à un élève de passer d'une consigne et de données à une **réponse personnelle soutenue par des preuves**, puis de vérifier ce qu'il a écrit et de réutiliser la démarche sur un document nouveau. La réussite ne se mesure pas au seul nombre de clics, à l'affichage d'un modèle ou à une note produite automatiquement.

**Portes de validation non closes :** décision écrite sur les droits de chaque extrait et PDF, relecture scientifique/pédagogique documentée, tests de confidentialité et d'accessibilité sur appareils pertinents, et décision du responsable produit sur ces points. Le module reste un prototype non validé ; la branche a été publiée dans un dépôt public et un aperçu Vercel a été créé. Ni cette publication technique ni l'accord pour les déploiements éventuels n'établissent les droits.

## 2. Déjà fait dans cette branche — ne pas refaire dans le plan

| Correction | État | Limite conservée |
|---|---|---|
| Entrée Boussole et accès aux anciens ateliers | Intégré dans la branche ; l'aide de l'unité 1 ouvre un exemple voisin sur les protéines et rend le focus à l'exercice. | Ce n'est pas une aide calculée à partir de chaque erreur, ni une couverture de toutes les unités. |
| Repère et relecture | Quatre mouvements explicités ; critères facultatifs pour les pages immunité, protéines et réponse Bac. Comparaison toujours possible sur papier. | Aucun jugement automatisé du texte, aucune preuve de maîtrise. |
| Sauvegarde/réinitialisation | Carnet courant inclus dans le JSON, restauration validée et journalisée, suppression lors de la remise à zéro, protection des journaux illisibles et des onglets périmés. Un brouillon temporaire peut être téléchargé avant rechargement. Anciennes sauvegardes sans champ conservées. | Stockage non lié au compte, fichiers téléchargés et carnets des versions plus anciennes hors périmètre ; les protections ne fusionnent pas toutes les opérations concurrentes ni les anciennes versions. Fermer les autres onglets. |
| Compte local | Compatibilité des hachages anciens avec ou sans WebCrypto ; migration de l'ancien repli après connexion vérifiée. Avertissement : le compte ne chiffre pas les données. | Le SHA-256 historique a un préfixe fixe et n'est pas une dérivation lente ; il ne constitue ni un chiffrement ni une authentification serveur. |
| Tests techniques | Build, tests automatisés et parcours Chromium local, y compris conflits inter-onglets, compte local et coupure réseau simulée après téléchargement complet. | Ils ne valident ni le contenu, ni l'efficacité pédagogique, ni tous les navigateurs et appareils. |

### Avancement P0 après reprise du plan

- **Inventaire préparé** : [28 fichiers avec empreintes et familles de droits](sources/INVENTAIRE-BOUSSOLE-2026-11-21.md), plus les consignes et modèles à relire. L'inventaire et son contrôle technique n'établissent aucun accord ; titulaire, décision écrite, relecteur et décision produit restent à obtenir pour chaque usage concerné.
- **Protection locale renforcée** : comparaison de l'état et des statistiques avant les opérations sensibles et les nouveaux envois sync, même avant réception de `storage` ; l'import et la remise à zéro comparent le carnet vu avant leur confirmation. Le laboratoire refuse une suppression sur une copie périmée et conserve un brouillon temporaire si le chargement demandé échoue. La confirmation d'import ne bloque plus le traitement du navigateur. Régressions Chromium et tests unitaires sur notifications différées. Ce n'est ni un verrou, ni une transaction, ni une garantie contre les écritures simultanées ou les anciennes versions.
- **Sauvegarde et sync honnêtes** : l'export complet et les nouveaux envois sync refusent les états ou statistiques de secours illisibles ; l'export refuse aussi un carnet illisible. Le retrait de consentement reste enregistrable quand l'état est lisible, même si les statistiques ne le sont pas. Les textes temporaires ne sont pas pour autant automatiquement sauvegardés.
- **QA préparée, non clôturée** : [protocole, résultats locaux et matrice](QA-BOUSSOLE-2026-11-21.md), avec procédures pour les anciens carnets et scénarios d'accessibilité. Les confirmations d'import/reset ont un focus initial et un retour après annulation ; une FAQ expose son état aux technologies d'assistance. Les premières exécutions CI distantes ont révélé une incompatibilité Chromium/Ubuntu 26.04 ; le workflow est fixé sur Ubuntu 24.04. Vérifier les contrôles du commit courant. Les lignes Android, iOS, Firefox, lecteurs d'écran et appareils réels ne sont pas réalisées ni signées.

Détails reproductibles et limites : `modules/boussole/README.md` et `plans/ANALYSE-PEDAGOGIQUE-BOUSSOLE-2026-11-21.md`.

## 3. Backlog priorisé

| Priorité / responsable proposé | Travail futur | Livrable et critère d'acceptation | Dépendances / estimation indicative |
|---|---|---|---|
| **P0 · produit + droits** | Inventaire descriptif préparé ; identifier les titulaires, demander une décision de reproduction ou produire un remplacement original autorisé. | Compléter le registre par ressource : source confirmée, titulaire, usage, autorisation écrite ou remplacement, décision datée. Arbitrer la diffusion déjà engagée des ressources au statut inconnu. | A-021 ; attente externe potentiellement longue, sans délai garanti. |
| **P0 · enseignant SVT Bac** | Relire source par source les traces, figures, unités, conditions, liens preuve–conclusion, modèles, liste de relecture et cahier. | Relecteur nommé et date ; anomalies, corrections et validation tracées ; sujets reconstitués distingués des documents d'origine. Deuxième regard conseillé sur les points ambigus. | Accès licite à l'épreuve et à la correction ; 2–5 jours de travail indicatifs, à calibrer. |
| **P0 · dév + QA** | Protocole préparé ; tester confidentialité et sauvegardes sur navigateurs et appareils réels, y compris onglets anciens, stockage refusé/saturé, reset et fichiers externes. Décider le sort des carnets historiques. | Matrice signée : aucune promesse de suppression ou de sauvegarde au-delà de ce qui a réellement été vérifié ; procédure claire pour sauvegarder puis effacer les anciens stockages. | Les tests simulés actuels ne remplacent pas l'appareil ; environ 2–4 jours. |
| **P0 · accessibilité + terrain** | Vérifier lecteur d'écran arabe, ordre du focus, contraste, zoom, mode clavier, cibles tactiles, impression, Android et iOS. | Scénarios critiques réussis sans blocage ; contrastes mesurés manuellement quand le scan est incomplet ; écarts et solutions documentés. | 2–5 jours plus disponibilité des appareils et testeurs. |
| **P1 · sécurité + dév** | Définir le rôle du compte local, le modèle de menace et la nécessité d'une authentification réelle. Étudier une dérivation lente avec sel individuel et migration versionnée des hachages existants. | Conception et essais revus : migration après vérification, fonctionnement hors ligne et sur appareils pris en charge, pas de promesse de chiffrement ou d'identité vérifiée sans dispositif adapté. | Arbitrage produit et expertise sécurité ; estimation après conception. |
| **P1 · enseignant + produit** | Concevoir un pilote pré/post sur document inédit et une tâche différée ; préparer la grille d'analyse. | Deux supports comparables, grille à quatre dimensions, consentements et protocole ; copies corrigées par deux personnes sur un échantillon ; compte rendu avec limites. | Après portes P0 pour les ressources utilisées ; 1–2 semaines de préparation et terrain. |
| **P1 · dév + enseignant** | Raffiner l'aide selon le verbe, la preuve et le type d'erreur, sans donner la réponse au premier indice. Prévoir un accès stable pour revenir au travail. | Pour chaque exercice pilote : indice d'orientation, aide procédurale et règle générale relus ; retour préservant saisie et focus ; test sans lien trompeur vers un autre chapitre. | Taxonomie d'erreurs et relecture ; 1–2 semaines pour un petit lot, non pour tout le programme. |
| **P1 · enseignant + UX** | Mieux accompagner la comparaison : exemples de réponse acceptable, lacunaire et non soutenue par la preuve ; reformulation personnelle après lecture. | Critères spécifiques reliés à la consigne ; plusieurs formulations recevables ; parcours papier et numérique restent facultatifs ; zéro jugement automatique du texte. | Relecture des modèles et pilote ; 1–2 semaines pour un premier dossier. |
| **P2 · équipe éditoriale** | Construire progressivement des dossiers de transfert dans les unités manquantes, à partir de supports autorisés. | Pour chaque unité ciblée : un document, deux conditions si pertinent, consignes et critères relus, au moins une tâche indépendante sur support différent ; source et statut connus. | Ne pas promettre les 11 unités avant estimation et relecture ; lot pilote puis extension. |
| **P2 · produit + dév** | Étudier un suivi volontaire et minimal, distinct d'une évaluation de maîtrise. | Schéma de données et consentement documentés ; événements à faible sensibilité ; pas de texte libre transmis ; essais de retrait/effacement et de fonctionnement hors ligne. Décider **avant** de connecter `kafaa` ou SM-2. | Un modèle de compétences et des preuves d'usage ; aucune collecte supplémentaire dans cette branche. |
| **P3 · contenu + QA** | Étendre les formats et préparer la maintenance. | Jeu de régression multi-documents, reproduction du build, registre des contenus/versions/licences, procédure de correction et de retrait ; essais à chaque version. | À partir des retours du pilote et des droits. |

## 4. Carte de couverture pour l'extension

La correspondance ci-dessous suit `src/data/programme.ts`. « Approche présente » signifie qu'un **mini-cas** existe, pas que l'unité est couverte ou validée. Les idées sont des pistes à concevoir, pas des activités déjà disponibles.

| Unité | Situation actuelle du laboratoire | Piste de transfert à faire concevoir et relire |
|---|---|---|
| U1 · تركيب البروتين | Mini-cas laminine et ateliers existants de l'app | Relier un tableau ou une séquence à une conclusion sur le produit, sur un document différent. |
| U2 · البنية والوظيفة | Pas de dossier dédié | Comparer structure et fonction sans confondre corrélation et mécanisme établi. |
| U3 · النشاط الإنزيمي | Courbe d'entraînement pH / activité | Lire une autre courbe puis expliciter condition, unité et limites de la comparaison. |
| U4 · الدفاع عن الذات | Mesures d'anticorps construites | Comparer d'autres conditions ou témoins, puis justifier sans extrapolation. |
| U5 · الاتصال العصبي | Dossier synapses Bac et traces | Transférer la lecture de traces vers un autre circuit ou une autre condition. |
| U6 · التركيب الضوئي | Pas de dossier dédié | Lire des résultats expérimentaux et distinguer observation, témoin et inférence. |
| U7 · التنفّس الخلوي وإنتاج ATP | Pas de dossier dédié | Comparer des mesures de transformation énergétique avec conditions explicites. |
| U8 · توظيف المكتسبات الطاقوية | Pas de dossier dédié | Relier deux documents sur une situation énergétique, sans modèle immédiat. |
| U9 · النشاط التكتوني للصفائح | Pas de dossier dédié | Utiliser des observations spatiales comme indices, avec incertitudes. |
| U10 · بنية الكرة الأرضية | Pas de dossier dédié | Comparer des mesures en profondeur et justifier une limite d'interprétation. |
| U11 · البنيات الجيولوجية الناتجة عن النشاط التكتوني | Pas de dossier dédié | Relier observations de structures, document et hypothèse argumentée. |

Pour chaque nouveau cas : fiche de source et droits, consigne précise, données vérifiables, indice gradué, rédaction libre/papier, critères qui ne donnent pas la réponse, deux exemples de formulations acceptables, limites d'inférence, tâche de transfert et relecture signée. Ne pas transformer les propositions du tableau en contenu élève sans ce travail.

## 5. Séquence de décision

1. **Arbitrer la diffusion déjà engagée** des ressources litigieuses, désormais présentes dans le dépôt public ; obtenir une autorisation par usage ou remplacer les supports et faire relire les remplacements. A-009 n'est pas une autorisation pour les figures ajoutées.
2. **Relire le prototype** et corriger les anomalies de science, d'arabe et de consignes. La présence d'un test vert ne vaut pas validation scientifique.
3. **Sécuriser les conditions d'usage** : appareils partagés, anciens carnets, copies JSON en clair, essais matériels et accessibilité.
4. **Mener un petit pilote**, observer l'autonomie et la qualité de preuves sur des documents inédits ; ne pas conclure à une efficacité généralisable sur un échantillon de faisabilité.
5. **Décider ensuite** d'un premier lot d'unités supplémentaires et du besoin réel d'un suivi ; ne jamais inférer la maîtrise à partir de l'ouverture du modèle.
6. Pour les déploiements ultérieurs, **demander une autorisation explicite** et vérifier les portes de droits, relecture et QA ; l'accord donné pour le push et la fusion de cette branche ne constitue pas leur validation.

## 6. Points à trancher par le responsable

- Qui porte la demande de droits et quelle solution de remplacement est acceptable si l'accord n'est pas obtenu ?
- Quel enseignant ou binôme signe la relecture des figures, consignes et modèles ?
- Quelles unités et quels élèves sont prioritaires pour le pilote, avec quelles autorisations parentales ou institutionnelles si nécessaires ?
- Faut-il préserver, exporter ou supprimer les anciens carnets autonomes, et comment éviter de les exposer sur un appareil partagé ?
- Quel suivi minimal serait utile sans collecter les réponses rédigées ni fabriquer un score de maîtrise ?
