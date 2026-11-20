# Passation — reste à faire avant diffusion

## Avancement (18/11/2026 — exécution agent)

**Terminé et prouvé (preuves déposées, CI à rejouer sur le commit) :**

- **P0.1 — audit RLS + matrice d'essais : fait** → `plans/AUDIT-RLS-P0.1-2026-11-18.md` (17 cas exécutés sur le projet réel en `begin/rollback`, données fictives, 0 résidu ; propositions §4 **non approuvées**, revue humaine §5).
- **P0.2 — suppression durable : fait (qualifiée)** → `plans/preuves/suppression-durable.md` + `src/utils/__tests__/suppression-durable.test.ts` (6 tests). Garantie prouvée **dans un même onglet** ; course inter-onglets **démontrée** (avertissement UI conforme) ; conservation = aucune purge, texte UI honnête. Reste humain : coordination serveur, politique de conservation.
- **P0.3 — sauvegarde/restauration : fait (qualifié)** → `plans/preuves/sauvegarde-restauration.md` + `src/utils/__tests__/sauvegarde-compat.test.ts` (11 tests) + 2 tests UI ajoutés. Matrice v1-v3 plats/enveloppés, pannes (quota, corrompu, écriture partielle), assistance documentée. **20/11 : restauration atomique état+stats ajoutée et prouvée** (`restaurerEtatEtStats` + journal d'engagement, 9 tests, 191/191 — preuve §5). Reste humain : essais web/Android réels (quota réel), fichiers réels, écritures entre onglets.
- **P1 hors ligne — niveau 1 + volet web du niveau 2 faits, protocoles adaptés** → `scripts/verifier-hors-ligne.mjs` (75 fichiers, 0 échec sur le build `53d1377cc45ff7e56f82`) ; `plans/preuves/hors-ligne.md` documente le test sur **vrai navigateur Chrome 157** (coupure réseau CDP + rechargement complet → shell/session locale servis du cache ; leçon HTML 5 343 car. ouverte hors-ligne). `appareils.md` mis au bouton « تنزيل / استكمال الملفات » et au worker v5. **Reste humain : rejeu sur Redmi 9A / A1x et APK (mode avion physique, ≤ 2 Go, 3G, coût DA).**
- **20/11 — rapport perdu reproduit + vérificateur multiplateforme : fait** → le rapport d'agent cité le 19/11 (`plans/VALIDATION-2026-11-19.md`, « restauration atomique », « 191 tests ») **n'existait nulle part** (repo, GitHub, worktrees, stash, objets détachés vérifiés) et son contenu a été **reproduit et prouvé** : restauration atomique état+stats (P0.3 §5, 9 tests) ; `scripts/verifier-hors-ligne.mjs` ne utilise plus aucune commande propre à Windows (lancement direct de vite par `node`, arrêt par arrêt de processus — plus de `taskkill`). Rejoué sur le build `84991bee59b03156610c` : **75 fichiers, 6 198 441 octets, 0 échec** ; suite complète : **191/191 tests**, drills `700/120/80/0/0`, `git diff --check` propre.

**Reste exclusivement humain (rappel unique en fin d'exécution) :** revue de sécurité
indépendante + arbitrages F1/F6 et propositions §4 (P0.1) ; coordination serveur et
conservation (P0.2) ; essais réels appareils/web/Android (P0.3, P1 niveau 2, coûts DA) ;
pédagogie/droits/sources officielles/ONEC (P1) ; terrain, notifications, Data Safety et
publication (P2). Aucune validation humaine n'a été remplacée par une affirmation.

## État et portée

Les correctifs applicatifs de la [PR #4](https://github.com/Allintelligence2024/Bawssalate-El-3oloum/pull/4) reposent sur le merge PR #3 `62b3ee2` ; le commit applicatif est `6f863d4`. Ils améliorent les sauvegardes, les alertes de stockage, la suppression serveur dans l'onglet courant, le hors-ligne et un énoncé Hill. Ils ne constituent pas une certification de sécurité, de conformité au programme ni une validation de terrain. Une fusion Git ne signifie pas que le site, l'APK ou la base sont déployés.

**Preuves disponibles :** 163 tests locaux réussis, build réussi et CI GitHub réussie sur `6f863d4` ; contrôles du worker et du client Supabase en grande partie simulés. Le manifeste de ce build liste 72 fichiers pour environ 5,9 Mio non compressés ; le volume réseau réel et son coût en DA sont **non vérifiables** sans mesure et tarif. `plans/CORRECTIFS-PHASE-{1,2,3}-2026-11-17.md` décrit les détails et leurs limites.

**Règle de clôture :** affecter chaque tâche à un responsable, consigner la version, la date, les résultats et les preuves ; ne pas remplacer une mesure ou une validation humaine par une affirmation. Les responsables ci-dessous sont des rôles proposés, pas des personnes déjà désignées.

## Priorité 0 — sécurité et données

### 1. Sécuriser les anciens accès et les règles serveur

**Responsables proposés :** développement backend + revue sécurité indépendante.

- Les anciennes sauvegardes peuvent contenir un jeton réutilisable. Les nouvelles n'en contiennent pas, mais ne révoquent pas les anciens. Éviter de partager ces anciennes copies ; concevoir une procédure d'identification, révocation/rotation et récupération qui n'exige pas de divulguer un jeton ou des données d'élève dans un ticket public. Une sauvegarde de progression ne restaure pas un compte serveur.
- Examiner `supabase/schema.sql`, `src/utils/sync.ts` et `plans/ANALYSE-FICHIERS-ANTERIEURS-62b3ee.md`. La politique INSERT du projet connecté a été lue avec `WITH CHECK (true)` ; `maj_app` inclut une exception `jeton IS NULL`. L'exploitation et l'interaction des règles RLS ne sont **pas démontrées**. Évaluer l'usurpation de l'adresse, les créations abusives, les anciens comptes et les limites de débit.
- Sur une base de test **isolée** et avec des données fictives, vérifier SELECT, INSERT, UPDATE, UPSERT et DELETE avec bon/mauvais/aucun jeton, jeton nul/faible, email déjà pris et anciens clients. Tester aussi refus des droits et coupure réseau. Concevoir une migration compatible, un retour arrière et une procédure de support ; faire approuver avant tout déploiement. Ne pas exécuter les essais destructifs sur des données réelles.
- Le compte et le mot de passe sont locaux, pas une preuve de possession de l'email : décider si une authentification serveur est nécessaire avant de promettre récupération ou identité vérifiée.

**Clôture :** revue de sécurité écrite, matrice d'essais et plan de migration/récupération approuvés, puis preuve de déploiement contrôlé si une migration est décidée. Aucun changement de base n'a été réalisé par la PR #4.

### 2. Garantir ou qualifier la suppression durable

**Responsables proposés :** backend + QA.

- L'application suspend les nouveaux envois et attend ceux en cours **dans le même onglet** ; zéro ligne supprimée donne un résultat indéterminé. Un autre onglet/appareil peut réécrire après DELETE, et une requête dont l'issue réseau est inconnue peut encore aboutir.
- En environnement isolé, tester deux onglets, deux appareils, UPSERT retardé, coupure/réponse perdue, jeton invalide, absence de ligne et réactivation après consentement. Décider et implémenter, si nécessaire, une coordination/garantie côté serveur avant de promettre une suppression durable.
- Vérifier la durée de conservation et les éventuelles purges opérationnelles : **non vérifiable** actuellement. Définir une politique réelle et la faire correspondre à l'interface.

**Clôture :** preuves de bout en bout UI → réseau → serveur et texte utilisateur conforme à la garantie réellement obtenue.

### 3. Fiabiliser sauvegarde et restauration

**Responsables proposés :** développement client + QA.

- Tester les fichiers plats et enveloppés anciens, les versions inconnues, les fichiers mal formés et la confirmation/annulation. L'import est limité à 5 Mio et à des bornes par champ : compatibilité avec toutes les données réelles **non vérifiable**. Les anciens formats sans statistiques conservent les statistiques actuelles.
- Rejouer sur web et Android : quota plein, lecture refusée, JSON local corrompu, première ouverture, partage annulé, restauration et redémarrage. ~~L'état et les statistiques sont écrits séparément : concevoir une restauration durable/atomique ou une récupération vérifiable~~ — **l'écriture atomique a été faite et prouvée le 20/11/2026** (`restaurerEtatEtStats`, journal d'engagement, 9 tests, preuve `sauvegarde-restauration.md` §5) ; il reste à la **rejouer avec un quota réel sur web/Android** et à trancher les écritures concurrentes entre onglets. L'export après lecture impossible ne contient que les données accessibles en mémoire.
- Tester les comptes anciens sans hachage ou dotés de jetons faibles : expliquer à l'utilisateur les conséquences avant toute suppression locale ; celle-ci n'efface pas le serveur et ne récupère pas son jeton.

**Clôture :** matrice de compatibilité et tests de panne avec données fictives, preuve qu'aucune restauration invalide n'écrase l'état utile, parcours d'assistance documenté.

## Priorité 1 — hors ligne, appareils et coût

**Responsables proposés :** développement PWA/Android + QA appareils.

1. Sur un navigateur réel, lancer `npm ci`, `npm test`, `npm run build`, puis `npm run preview`. Ouvrir l'application sur un contexte sécurisé ; dans « أنا › العمل دون إنترنت », vérifier l'état, demander le téléchargement, couper la connexion pendant l'opération et reprendre. Répéter avec stockage plein ou cache évincé.
2. Après téléchargement annoncé complet, couper le réseau, fermer puis rouvrir : démarrage, une leçon HTML, drills des trois domaines, révisions, examen blanc, méthodologie et sauvegarde. Une leçon non téléchargée doit échouer explicitement, pas afficher l'accueil à sa place. La vidéo d'accueil et les ressources externes ne sont pas incluses dans le téléchargement facultatif.
3. Installer une nouvelle version avec un ancien onglet ouvert, puis fermer les anciens onglets : vérifier activation, coexistence, changement de version du cache et besoin éventuel de retéléchargement. Tester annulation et mises à jour interrompues.
4. Rejouer sur PWA et APK avec au moins un Android ≤ 2 Go, mode avion, 3G/4G intermittente et stockage réduit. Mesurer durée, mémoire et octets réellement transférés, en distinguant première installation, reprise et mise à jour. Évaluer ensuite le coût avec les tarifs pertinents pour un budget de 100–500 DA/mois ; ne pas inventer de montant.

L'essai Chromium dans le sandbox n'a pas démarré (bibliothèques NSS absentes). Aucun résultat PWA/APK réel n'est donc établi par la PR. `plans/preuves/appareils.md` et `hors-ligne.md` contiennent des protocoles historiques : adapter leurs étapes au nouveau bouton de téléchargement et au nouveau worker avant exécution.

**Clôture :** résultats datés par appareil/OS/navigateur, captures non sensibles et problèmes suivis ; preuve qu'aucune promesse d'offline complet ne dépasse le comportement observé.

## Priorité 1 — pédagogie, conformité et droits

**Responsables proposés :** enseignants SVT 3AS, relecteur bilingue et responsable juridique/éditorial.

- Revoir l'enquête Hill complète, notamment l'accepteur artificiel et les valeurs pédagogiques, puis les 58 résumés, les 700 items et les schémas ; distinguer les contrôles syntaxiques des validations scientifiques. Accorder une attention aux 80 items niveau 3 et aux 501 explications signalées dans A-018 du registre.
- Vérifier auprès des sources officielles la version du programme applicable à la filière concernée et documenter la couverture. Les catégories, pourcentages ou formats d'épreuve non confirmés restent **non vérifiables** ; ne pas les présenter comme officiels.
- Le corpus d'annales/corrigés est actif selon l'arbitrage antérieur A-009 malgré des droits et une fidélité non confirmés. Obtenir une décision écrite sur les droits, confronter les transcriptions et barèmes aux sources autorisées et décider du maintien ou retrait. Aucun avis juridique ni autorisation ONEC n'est établi ici.
- Les sources PDF préexistantes suivies dans Git représentent 32 fichiers et environ 81 Mio sur disque. Examiner leur conservation/distribution et le coût du clone ; ne pas les supprimer avant décision et conservation autorisée. Ne pas régénérer les drills sans retrouver la source manquante et réappliquer les arbitrages.

**Clôture :** registre de relecture individuel avec nom/date/décision, sources/version du programme, décision droits écrite et corrections suivies dans `plans/relecture/REGISTRE-ARBITRAGES.md`.

## Priorité 2 — terrain et publication

**Responsables proposés :** produit, enseignants, accessibilité et responsable publication.

- Observer des élèves et enseignants en conditions réelles : compréhension arabe/français, accessibilité, temps par séance, charge cognitive, stress Bac, capacité à reprendre après interruption et assimilation effective. Ne pas supposer qu'ajouter plus de contenu améliore l'apprentissage.
- Tester rappels/notifications sur appareils, puis vérifier consentement, politique de confidentialité, stockage et Data Safety avant toute diffusion. Les captures et résultats ne doivent pas exposer de données personnelles.
- Réévaluer l'activation ou le retrait des fonctionnalités selon les preuves recueillies. Les scores historiques et documents `plans/preuves/` décrivent leurs révisions respectives ; ils ne certifient pas automatiquement la version fusionnée.

**Clôture :** synthèse de terrain, arbitrages produit et décisions de publication documentés. Aucun résultat de terrain ni approbation de publication n'est établi dans cette passation.

## Reprise technique rapide

```sh
npm ci --no-audit --no-fund
npm test
npm run build
node scripts/verifier-drills.mjs
```

La CI `.github/workflows/ci.yml` lance ces contrôles ; les alertes de similarité du vérificateur restent à arbitrer humainement. Points d'entrée : `src/utils/{backup,storage,stats,sync,pwa}.ts`, `src/components/{Ana,CarteHorsLigne,Confidentialite}.tsx`, `public/sw.js`, `vite.config.ts` et `supabase/schema.sql`. Analyse des changements antérieurs : `plans/ANALYSE-FICHIERS-ANTERIEURS-62b3ee.md` et `plans/REVUE-PR3-62b3ee.md`.
