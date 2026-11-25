# Boussole Lite : remplacement de Miftah

**Application publiée** : https://bawssalate-el-3oloum.vercel.app/ → troisième onglet **البوصلة**. Il ouvre directement le laboratoire dans l’application. **Accès de classe au même module**, sans profil : https://bawssalate-el-3oloum.vercel.app/boussole/index.html . Les deux PDF et le téléchargement facultatif sont dans «أوراق للكتابة ونسخة بلا إنترنت». Aucun autre site n’a été créé.

## Ce qui reste à faire dans le dépôt

Le remplacement est actif sur **Vercel**. L’accès disponible ne permettait pas d’écrire dans le dépôt GitHub `Allintelligence2024/Bawssalate-El-3oloum`. La production a été construite depuis le même commit que la version en service, avec le correctif d’interface appliqué avant `vite build`. **Fusionner le correctif une fois dans `main` avant le prochain déploiement ordinaire du dépôt** ; sinon ce dernier pourra remettre Miftah. Le patch est pour le dépôt, jamais pour les élèves.

Sur une copie du dépôt et une branche de travail propre :

```sh
git switch main
git pull --ff-only
git switch -c boussole-remplace-miftah
git am /chemin/vers/remplacer-miftah.patch
npm ci
npm run build
npm test
```

Puis pousser cette branche et la fusionner par la procédure habituelle. Si `main` a avancé et qu’un conflit apparaît, **ne pas forcer ni écraser la nouvelle version**. `git am --abort` permet de revenir à la branche de travail avant application. Le répertoire `fichiers-du-depot/` du ZIP contient aussi les fichiers complets aux bons chemins, pour revue ou intégration manuelle : ce n’est **pas** un projet entier à substituer au dépôt.

## Périmètre

- Le libellé, l’icône clé, l’ancien accueil, les cartes et l’écran «المفتاح» de la rubrique méthodologie ont été remplacés. L’aide d’un exercice ouvre le vrai laboratoire ; en revenant, la zone sélectionnée, la réponse en cours et le focus sont conservés.
- Les ateliers complémentaires, les quatre autres onglets et la voie «تدريبات ← تمارين المنهجية» sont conservés. Aucun effacement ni migration de données, aucun changement du schéma ni appel à une base pour la Boussole. Les archives 1.4 ب et 1.5 ne sont pas modifiées.
- `public/boussole/` : HTML autonome et deux PDF. `modules/boussole/` : sources modifiables, reproduction du HTML, licences et contrôles. Les trois fichiers publics entrent dans le cache PWA **lors du téléchargement complet** ; les élèves peuvent aussi choisir de télécharger le fichier HTML seul.
- La variante d’intégration ajoute notamment le rapprochement stimulation/injection à ج3, les symboles originaux en aide facultative, et une lecture de la laminine (sujet 1 du Bac 2022, ex. 3, doc. 1, fig. جـ). Les conclusions dépendent de la consigne, sans note de maîtrise. Les feuilles sont des adaptations, pas le sujet et le corrigé complets.

## Vérifications et traçabilité

- Base réellement servie avant remplacement : `ee9baf193e34679467c7c357112974853fe28223`. Correctif complet vérifié par `git am` sur cette base : arbre Git `30ca84a154fa4b4202e95e21fcfdbfe42f38f19b` identique à la source de livraison. SHA-256 du patch de maintenance : `5d8f6d21fbf42ba7c236738f7c1102ff22a74f9faf3f072e3346c29f9a97b557`.
- Production Vercel promue : `dpl_8LsT7M6BFyNELK8boLLT3kWqnSiq`. Empreinte du HTML du labo servi : `4b4baa0cfee613ae5bf719731b7d0c8d073348e0cc84cee34e844c2eba1cf32e`. Le navigateur élève n’a besoin ni de Drive ni d’un ZIP. Le paquet de construction vérifié par empreinte ne sert qu’à reconstruire ce déploiement, pas à faire fonctionner le laboratoire.
- Contrôle anonyme HTTPS : vrai HTML, PDF `application/pdf`, cinq pages de fiches au total, deux observations scientifiques, téléchargement exact. Contrôle du site de production à 390 × 844 via l’interface normale, avec un profil fictif limité au navigateur du test et sans envoi de données. Voir `contrôles/production-navigation.json`.
- Build de l’app, 192 tests unitaires/UI réussis ; essai Chromium du retour à l’exercice, des brouillons, des PDF, et de l’onglet après coupure réseau et préparation du cache. Contrôles du laboratoire autonome et hébergé à cinq tailles. Ces contrôles techniques ne mesurent pas l’efficacité pédagogique réelle.

**Si un téléphone affiche encore l’ancienne version** : se connecter, ouvrir l’application une fois, puis fermer tous ses onglets/fenêtres et la rouvrir. L’ancien worker peut attendre la fermeture des fenêtres avant activation ; ne pas vider le stockage, qui contient les notes. Cette livraison concerne l’application web/PWA ; aucun APK ni paquet de boutique n’a été publié.
