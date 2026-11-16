> **Provenance :** grille d'audit transmise par le porteur du projet le 16/11/2026 et déposée **telle quelle**
> (aucune ligne modifiée sous cette note). Elle constitue la baseline de référence du plan
> (`plans/PLAN-AMELIORATION-90.md` §0 / §9) : **60,5/100**, pondération 15/12/18/12/10/10/13/10.
> Le ré-audit de sortie devra appliquer exactement ces critères.
> La lecture critère par critère de l'état **courant** du dépôt (sans nouvelle note) est dans `ETAT-VS-BASELINE.md`.

---

# Audit pédagogique, cognitif et technique — « Bawssalate El-3oloum Lite » (بوصلة العلوم Lite)

> **Objet audité :** code source du dépôt `Bawssalate-El-3oloum`, branche `arena/655e9526-bawssalate-el-3oloum`, commit de base `cab5100` (v0.9.3), audité le 16/11/2026.
> **Méthode :** audit statique du code et des données (React 19 + Vite + Capacitor 8, PWA manuelle), comptages automatisés sur les banques de contenus, lecture des fichiers de données (`src/data/`), des moteurs (`src/utils/`) et des écrans (`src/components/`). Aucun test utilisateur, aucun déploiement Play Store/App Store et aucun sujet officiel n'ont été fournis : ces points sont notés **« Non vérifiable »** plutôt que supposés.
> **Convention :** **[Constat]** = fait vérifiable dans le code (fichier cité). **[Interprétation]** = jugement de l'auditeur.

---

## 1. 📊 Tableau de synthèse

| Axe | Note /10 | Résumé en 1 phrase |
|---|---|---|
| 1. Conformité au programme officiel | **6,0** | Programme 3AS Sciences Expérimentales couvert en structure (3 domaines → 11 unités → 58 leçons), mais **0 contenu re relu par un enseignant** et aucune validation externe traçable. |
| 2. Richesse et hiérarchisation des contenus | **6,5** | Base réelle (58 résumés « or », 25 leçons HTML du manuel, mindmap, poids Bac /5), mais pas d'étiquettes de priorité par leçon, pas de glossaire FR–AR, et des leçons de 42 min contraires au *chunking* 5–10 min. |
| 3. Parcours d'apprentissage et assimilation ⭐ | **8,0** | Le point fort du produit : moteur « Next Best Action », chemin verrouillé, SM-2 **bloquant**, quota d'1 leçon/jour — mais aucun test de positionnement, aucun choix de filière/objectif, aucun mode « J-7 », et un calendrier codé en dur (rentrée 14/09/2026, Bac par défaut le 10/06/2027). |
| 4. Exercices et tests | **5,0** | 620 items… mais 100 % de QCM à 4 options, seulement 2 niveaux de difficulté réellement utilisés, génération par gabarits répétitifs et aucune rédaction évaluée. |
| 5. Sujets Bac + simulation | **2,5** | Le maillon faible : **aucun sujet officiel intégré** (les 4 PDF du dépôt sont des pointeurs Git LFS de 132 octets, jamais référencés dans l'app) et un « examen blanc » unique, non chronométré, sur un seul scénario (photosynthèse). |
| 6. UX/UI et ergonomie cognitive | **6,5** | *Progressive disclosure* exemplaire (une seule tâche par jour), mode sombre, RTL natif — mais aucune recherche plein texte, aucun favori, aucune taille de texte réglable, et une vidéo d'ouverture de 13 Mo pré-chargée. |
| 7. Interactivité et engagement | **6,0** | Boucle Apprendre → Tester → Identifier → Réviser → Retester réellement fermée (SM-2 + carnet de failles), XP non punitifs ; mais pas de flashcards générales, pas de quiz adaptatif, pas d'IA, pas de communauté, pas de notifications. |
| 8. Fiabilité technique et accessibilité économique | **6,5** | Offline-first exemplaire et gratuité totale sans publicité, gâchés par un **consentement de synchronisation activé par défaut**, zéro test automatisé et l'absence de dossier iOS. |

---

## 2. 📈 Score global pondéré : **60,5 / 100**

| Axe | Poids | Note /10 | Contribution /100 |
|---|---|---|---|
| 1. Conformité programme | 15 % | 6,0 | 9,00 |
| 2. Contenus | 12 % | 6,5 | 7,80 |
| 3. Assimilation ⭐ | 18 % | 8,0 | 14,40 |
| 4. Exercices | 12 % | 5,0 | 6,00 |
| 5. Sujets Bac + simulation | 10 % | 2,5 | 2,50 |
| 6. UX/UI cognitive | 10 % | 6,5 | 6,50 |
| 7. Interactivité | 13 % | 6,0 | 7,80 |
| 8. Technique / économie | 10 % | 6,5 | 6,50 |
| **Total** | **100 %** | | **60,50** |

**Lecture :** un excellent *moteur d'assimilation* (Axe 3) monté sur une banque d'entraînement et d'examen encore insuffisante (Axes 4–5). L'application apprend à l'élève **comment** réviser mieux qu'elle ne lui donne de quoi s'entraîner en conditions réelles.

---

## 3. ✅ Points forts (par impact)

1. **[Axe 3 — impact majeur] Un vrai moteur d'assimilation, pas une bibliothèque.** `src/utils/moteur.ts` (`prochaineAction`) impose une priorité unique : reprise d'une leçon interrompue → rappels SM-2 échus (**bloquants** avant tout nouveau contenu) → 1 nouvelle leçon/jour (+1 bonus) → repos légitimé. C'est l'exact antidote à la surcharge cognitive demandée dans le cahier des charges, et c'est rare dans les apps de révision algériennes.
2. **[Axes 1/3] Alignement structurel traçable sur le manuel officiel.** `src/data/programme.ts` : 3 domaines, 11 unités avec `page` du manuel, fenêtre du *tadrîj sannawî* (progression annuelle), compétence officielle, question d'unité et 2 pièges officiels par unité — franchis dans les « ponts » (`JalonUnite.tsx`).
3. **[Axe 3] Répétition espacée intégrée au parcours (pas en option).** SM-2 réelle (`src/utils/srs.ts`, facilité, intervalles, grille 1→3→7→14→28 j), leçon « fragile » (2 échecs) reprogrammée à J+1 au lieu de J+3, cartes de compétence méthodologie (`kafaa`) révisées par le même moteur.
4. **[Axes 6/8] Offline-first pensé pour l'Algérie réelle.** Service worker maison (`public/sw.js`, précache des 25 leçons HTML), `localStorage` comme source de vérité, sons synthétisés en Web Audio (0 fichier audio), banques de QCM chargées par domaine à la demande (*code splitting* dans `src/utils/drills.ts`), aucune dépendance lourde (pas de d3/jspdf, cf. `vite.config.ts`).
5. **[Axe 7] Psychologie anti-stress cohérente et assumée.** Zéro pourcentage affiché, zéro chronomètre, zéro série « cassée », bonne réponse **jamais révélée avant le bon choix** (remélange + message doux), XP calculés (`src/utils/xp.ts`) sans classement public. Pour un public de terminale sous stress, c'est un choix de design défendable et appliqué partout.

---

## 4. ❌ Points faibles (par gravité)

1. **[Axe 5 — bloquant] Aucun sujet de Bac officiel utilisable.** Les fichiers `bac-svt-sujet-2023.pdf` … `2026.pdf` à la racine font **132 octets** : ce sont des pointeurs Git LFS, et `grep` ne trouve **aucune référence** à un PDF dans `src/`. L'« examen blanc » (`ExamBlanc.tsx`) est un scénario unique codé en dur (Hill/Ruben & Kamen, photosynthèse) + 6 QCM tirés de la banque interne, **sans chronomètre** (choix anti-stress explicite dans l'en-tête du fichier), sans barème chiffré /20 et sans interface « copie d'examen ». Un élève ne peut pas s'entraîner une seule fois en conditions réelles.
2. **[Axe 1 — risque scientifique] Aucune relecture enseignante.** Comptage automatisé sur `src/data/lessonGoldSummaries.ts` : **58/58 résumés portent `review: { reviewed: false }` et le statut `adaptation_pedagogique`** (le code prévoit honnêtement le statut `manuel_officiel_verifie`, jamais utilisé). Le code est louablement transparent (« jamais "validé par un professeur" sans `reviewedBy` réel »), mais factuellement : tout le contenu scientifique repose sur une seule source non re lue. **Non vérifiable** sans relecture externe par un enseignant de SVT 3AS.
3. **[Axe 4 — grave] Monoculture du QCM généré par gabarits.** `scripts/drills-rapport.md` : 620 items, mais les énoncés les plus fréquents sont des gabarits répétés 40–50 fois (« اختر العبارة العلمية الصحيحة » ×50…) ; difficulté codée `n:1` (121) / `n:2` (500), **`n:3` jamais utilisé**. Aucune rédaction corrigée, aucun schéma à légender hors les 10 exercices de l'unité 1 dans `Methodologie.tsx`, aucun barème /20.
4. **[Axes 3/8 — grave] Consentement de synchronisation activé par défaut.** `etatVierge()` pose `consentementSync: true` (`src/types.ts:155`) et la validation du compte le force à `true` (`src/App.tsx:113`), alors que les commentaires promettent une « موافقة صريحة » (accord explicite). Le snapshot Supabase contient email, wilaya/daïra et nom (`src/utils/sync.ts`). Points positifs : aucun mot de passe envoyé, RLS sans `SELECT` pour `anon` (`supabase/schema.sql`), jeton d'écriture par élève. À corriger en *opt-in* avant toute diffusion.
5. **[Axe 3 — structurel] Parcours unique, rigide et daté en dur.** Aucun test de positionnement, aucun choix de filière ni d'objectif de note, aucun mode « Révision express J-7 » : un élève qui ouvre l'app en mai doit théoriquement franchir 58 leçons × 42 min verrouillées dans l'ordre. Constantes figées : `DEBUT_ANNEE = '2026-09-14'` (`programme.ts`) et `dateBac` par défaut `'2027-06-10'` (`types.ts`) — dès l'année suivante, la « position par rapport à la classe » sera fausse sans mise à jour du code.

---
## 5. Détail par axe

### Axe 1 — Conformité au programme officiel : 6,0/10
- **[Constat]** Couverture structurelle complète *pour la filière Sciences Expérimentales uniquement* : 3 domaines, 11 unités, 56 leçons + 2 prérequis = 58 résumés (`programme.ts`, en-tête du fichier). Les intitulés génériques du cahier des charges d'audit (« Biologie animale/végétale, Écologie… ») ne correspondent pas aux domaines officiels 3AS algériens ; l'app suit, elle, la vraie structure (spécialisation fonctionnelle des protéines / transformations énergétiques / tectonique générale). Ni filière « SVT » distincte ni « EXP renforcé » n'existent comme parcours dans le code : **un seul parcours**.
- **[Constat]** Chaque unité cite la page du manuel, la compétence officielle, sa fenêtre dans le *tadrîj* annuel et 2 pièges (`piegesAr`) réutilisés dans les ponts de fin d'unité.
- **[Constat]** Terminologie : app **100 % arabe (RTL)**, sigles latins conservés (ADN, ATP, LTc, CMH…) — conforme à l'usage des classes scientifiques algériennes ; mais **aucun glossaire bilingue FR–AR** : les `vocabulary` des résumés sont en arabe seul.
- **[Constat]** Erreur ponctuelle relevée : l'expérience de Hill est datée **1939** dans `ExamBlanc.tsx` (lignes 45, 68) et **1937** dans la source du résumé `d2-u6-l1-hill-ruben`. Mineure, mais symptomatique de l'absence de relecture (58/58 `reviewed:false`).
- **[Interprétation]** Sans relecture enseignante ni confrontation aux sujets officiels (absents, Axe 5), la conformité fine (formulations attendues par les correcteurs, mots-clés du barème officiel) reste **non vérifiable**.

### Axe 2 — Richesse et hiérarchisation : 6,5/10
- **[Constat]** Richesse brute réelle : 58 résumés « or » structurés (problématique, 4–6 étapes causales, preuve documentaire, 4–8 mots-clés, phrase-cadre type Bac, erreur nucléaire, question de rappel) ; 25 fichiers HTML du manuel (2,2 Mo, 48 SVG, 5 images seulement) réutilisés pour ~49 entrées via ancres `#chN` (`leconsPassives.ts`) ; mindmap complète (`Mindmap.tsx`) ; 4 ateliers de synthèse ; 3 leçons « dorées » HTML dédiées (transcription, représentation, activité enzymatique).
- **[Constat]** Hiérarchisation partielle : `poidsBac` de 1 à 5 par unité (affiché en points dans la mindmap, **jamais en %** — choix anti-stress), fenêtre annuelle, pièges par unité. En revanche : **aucune étiquette 🔴/🟡/🟢 par leçon**, aucun indicateur « tombe chaque année », aucune fiche « Ce qu'il faut retenir » autonome (le résumé or en tient lieu, sans le statut éditorial qui le certifierait).
- **[Constat]** Anti-*chunking* : la leçon est un bloc de **42 min** (6 phases de 3–15 min, `protocole.ts`). Les phases découpent, mais il n'existe ni micro-leçon autonome de 5–10 min, ni mode « je n'ai que 10 minutes ». Objectif d'ouverture présent (question/problématique), synthèse de fin présente (phase 6, phrase-cadre + erreur nucléaire) — les deux critères formels sont donc remplis, à l'échelle de la leçon entière.

### Axe 3 — Parcours et assimilation ⭐ : 8,0/10
- **[Constat]** Diagnostic : **aucun test de positionnement** ; l'inscription (`Inscription.tsx`) ne demande qu'email/mot de passe/wilaya/daïra. Aucun choix de filière, d'objectif (10/14/18 sur 20) ni de profil (en difficulté/avancé) : la personnalisation est *comportementale* (fragilité détectée, SM-2), pas *déclarative*.
- **[Constat]** Structuration : chemin unique verrouillé séquentiellement (`CHEMIN` : 58 leçons + 11 ponts, aucun saut possible), quota 1 leçon/jour + 1 bonus, rythme cible 5 j/7, comparaison à la classe via les fenêtres du *tadrîj* (`positionClasse`), progression affichée sans pourcentage (compteurs « X sur 69 بنية »).
- **[Constat]** Surcharge cognitive : *progressive disclosure* radicale (écran « اليوم » = une seule carte d'action), portes dures sans bouton « passer » à chaque phase, contenu de consolidation des ateliers révélé **après** reconstruction. Contrepartie : la rigidité linéaire interdit à un élève avancé ou en retard de cibler un chapitre précis hors mindmap (lecture seule).
- **[Constat]** Mémorisation : SM-2 intégrée et bloquante, cartes `kafaa` méthodologie par le même moteur (plafonnées à 2 revues/semaine), révisions « croisées » uniquement via l'examen blanc (2 QCM/domaine). Pas de courbe d'oubli visualisée ni de rappels externes (aucune notification).
- **[Constat]** Métacognition : diagnostic de lacune en 4 types (T1 terminologie, T2 séquence, T3 preuve, T4 production — `protocole.ts`), carnet de failles exportable (`Ana.tsx`), auto-évaluation `note` 0–10 par leçon utilisée pour repérer « la leçon la plus fragile » d'une unité. C'est le volet métacognitif le plus abouti de l'app. La production écrite, elle, se fait « sur papier ou à voix haute » et n'est jamais vérifiée par l'app.
- **[Interprétation]** Il manque le mode qui décide du sort d'un produit Bac en Algérie : **« J-30 / J-7 »**, qui court-circuite le verrouillage, ne garde que les unités à fort `poidsBac` et enchaîne rappels + sujets. Sans lui, l'app sert septembre→mai et abandonne l'élève au moment de stress maximal.

### Axe 4 — Exercices et tests : 5,0/10
- **[Constat]** 620 items (500 QCM + 120 définitions converties en QCM) sur 49 axes, 2 QCM de leçon (rappel/synthèse) × ~46 leçons (`qcmLecons.ts`), 10 exercices méthodologie interactifs pour l'**unité 1 uniquement**, 4 ateliers de manipulation (ordonner/relier/comparer, zéro écriture libre), examen blanc en 2 parties.
- **[Constat]** Correspondance au format Bac : restitution (Partie I) bien couverte ; analyse de documents guidée présente dans l'examen blanc (extraire → relier → conclure) et la rubrique منهجية (11 verbes d'action officiels, méthode « فعل ← دليل ← جواب ← فحص ») ; **Partie III (synthèse rédigée) jamais entraînée ni corrigée**.
- **[Constat]** Corrections : feedback immédiat vert/rouge + son, explication courte par item de leçon ; pour les drills, l'explication dégénère souvent en « الجواب الصحيح: … » (`Exercices.tsx:500`). Aucun barème, aucune notation /20, aucun niveau 3 de difficulté, aucun chrono (choix assumé). Boucle de remédiation : l'échec marque la leçon « fragile » (J+1) — réelle, mais générique (revoir la leçon entière, pas le micro-concept fautif, sauf diagnostics ciblés de l'examen blanc/méthodologie).
### Axe 5 — Sujets Bac + simulation : 2,5/10
- **[Constat]** Sujets officiels : **0 intégré**. Les 4 PDF racine sont des pointeurs Git LFS (132 octets) non référencés dans le code ; aucune année (2018–2025), aucun rattrapage, aucun corrigé du jury, aucune réponse alternative signalée.
- **[Constat]** Simulation : 1 scénario d'enquête unique (photosynthèse) recyclé à chaque lancement, 6 QCM, pas de minuteur, pas d'interdiction effective des corrigés (la correction n'existe tout simplement pas avant le bon choix), grille « سند/تحليل/ربط/استنتاج » affichée mais non notée. Statistiques par type de sujet : inexistantes.
- **[Interprétation]** C'est l'écart le plus dangereux entre la promesse (« révision du Bac ») et l'usage réel d'un terminale algérien, dont l'entraînement d'avril–juin est dominé par les annales.

### Axe 6 — UX/UI et ergonomie cognitive : 6,5/10
- **[Constat]** 5 onglets à rôle unique (اليوم / مساري / منهجية / تدريبات / أنا), cible atteignable en ≤ 3 taps depuis l'action du jour, mode sombre complet (`[data-theme='dark']`, `index.css`), mascotte-guide, sons Web Audio, chiffres latins sans pourcentages.
- **[Constat]** Absents : recherche plein texte, favoris/signets, réglage de taille de texte, téléchargement « par chapitre » explicite (le précache est tout-ou-rien au premier chargement).
- **[Constat]** Poids : `public/` = 18 Mo dont **`ouverture.mp4` = 13 Mo, inclus dans le précache du service worker** (`sw.js`) — le premier chargement en 3G rurale paie une vidéo de 5 s avant toute pédagogie. Le build vérifié pendant l'audit (`npm ci && npm run build` ✅) produit `dist/` = 20 Mo et un chunk principal de **694,75 Ko JS (190 Ko gzip)**, au-dessus du seuil d'avertissement Vite de 500 Ko ; les banques par domaine et `Methodologie` sont, elles, chargées à la demande.
- **[Constat]** Langue : arabe intégral + sigles latins. Pour des élèves de classes scientifiques souvent scolarisés avec appui français (cours particuliers, annales francophones), l'absence de bascule FR est un frein réel, quoique cohérent avec l'épreuve du Bac en arabe.

### Axe 7 — Interactivité et engagement : 6,0/10
- **[Constat]** Présents : ateliers de reconstruction par clic (ordonner/relier), schémas SVG interactifs à zones cliquables (10 exercices unité 1), XP (15/phase, 60/leçon, 200/pont…) et 5 paliers, jours consécutifs calculés **sans affichage de la perte**, célébrations de fin de phase, statistiques par source (phase/révision/pont/atelier/exercice) et par jour sur 45 jours (`stats.ts`), carnet de failles.
- **[Constat]** Absents : flashcards au sens propre (les cartes `kafaa` ne couvrent que la méthodologie), quiz adaptatif (le tirage des drills est un mélange aléatoire des non-réussis, `composerJoueur` ; la difficulté `n` n'est exploitée que pour exclure `n:3`… qui n'existe pas), défis, classements, notifications intelligentes, chatbot/IA, forum. Aucun générateur de résumé (les résumés sont statiques).
- **[Interprétation]** La boucle d'apprentissage est fermée pour le *cours* (protocole → portes → SM-2 → ponts) mais pas pour l'*examen* (pas de note, pas de sujet, pas de re-test ciblé par compétence du barème).

### Axe 8 — Fiabilité technique et accessibilité économique : 6,5/10
- **[Constat]** Stabilité : build propre vérifié pendant l'audit ; **aucun test automatisé** dans le dépôt (recherche `*.test.*`/`*.spec.*` négative) ; état 100 % `localStorage` avec import/export JSON de sauvegarde complète (`Ana.tsx`) — perte de données possible si l'élève vide le cache navigateur, mitigée par l'export manuel.
- **[Constat]** Hors-ligne : total après premier chargement (précache interface + 25 leçons). Android : projet Capacitor présent (`android/`, `appId com.bousala.ouloum`). iOS : **aucun dossier `ios/`** — « compatible iOS » = PWA Safari uniquement, **non vérifiable** sans test sur appareil.
- **[Constat]** Vie privée : voir point faible n° 4 (consentement par défaut). Aucune politique de confidentialité affichée dans l'app ; emails collectés côté Supabase si l'instance est configurée (les clés sont vides par défaut, `.env.example`).
- **[Constat]** Économie : gratuit, sans publicité ni paywall dans le code ; coût premium **non applicable**. Notes/avis Play Store et volume d'installations : **non vérifiables** depuis le dépôt.
- **[Interprétation]** Le modèle (gratuit + offline + léger hors vidéo) est exactement celui que supporte un budget de 100–500 DA/mois : le risque économique est nul, le risque est la pérennité (qui paie la relecture enseignante et les annales ?).

---

## 6. 🔧 Recommandations priorisées

### 🔴 Haute priorité (bloquant pour l'apprentissage ou la confiance)
1. **[Axe 5]** Intégrer les annales : minimum **8 sujets officiels (2018–2025, sessions normale + rattrapage) avec corrigés-barèmes**, hébergés en PDF compressés (< 1 Mo/sujet) téléchargeables à la demande (pas dans le précache). Transformer `ExamBlanc` en simulateur paramétrable : tirage par domaine, **mode chronométré optionnel** (durée officielle de l'épreuve), notation indicative /20 affichée uniquement à la fin, variantes de scénarios (≥ 6 enquêtes, une par unité à `poidsBac ≥ 4`).
2. **[Axe 1]** Faire relire les 58 résumés par **au moins 1 enseignant SVT 3AS** (champ `reviewedBy/reviewedAt` déjà prévu) et corriger les incohérences relevées (Hill 1937/1939). Tant que `reviewed:false`, afficher dans l'app la mention « شرح Kunz — en cours de validation » déjà prévue par le modèle éditorial.
3. **[Axe 8]** Passer la synchronisation en **opt-in explicite** : `consentementSync: false` par défaut, case décochée à l'inscription, page « données envoyées » lisible. (3 lignes de code, un risque juridique et réputationnel en moins.)
4. **[Axe 3]** Ajouter le **mode « Révision express »** : si la date du Bac − aujourd'hui < 60 jours (ou choix manuel), déverrouiller un parcours parallèle limité aux unités `poidsBac ≥ 4`, rappels SM-2 quotidiens et 1 sujet/semaine. Externaliser `DEBUT_ANNEE` et `dateBac` dans une config annuelle éditable sans redéploiement du code métier.

### 🟡 Moyenne priorité (améliore nettement l'expérience)
5. **[Axe 4]** Diversifier la banque : porter **30 % des items au niveau 3**, ajouter par unité ≥ 2 schémas à légender (glisser-déposer), ≥ 1 question rédactionnelle courte avec grille d'auto-correction par mots-clés, et réécrire les 250 items à énoncé-gabarit en énoncés contextualisés (données d'expérience réelles).
6. **[Axe 3]** Test de positionnement d'entrée : **22 QCM (2/unité, ~10 min)** qui pré-positionnent l'élève dans le chemin (unités déjà maîtrisées marquées « à réviser » plutôt qu'à apprendre) + choix d'objectif (10/14/18) réglant le quota quotidien (1/2/3 leçons).
7. **[Axe 2]** Étiqueter chaque leçon 🔴/🟡/🟢 (dérivé de `poidsBac` + fréquence dans les annales dès la reco n° 1 faite), publier le **glossaire bilingue** (~300 termes, en réutilisant les `vocabulary` existants + équivalents français) et une fiche « L'essentiel en 3 phrases » générée depuis `missionAr` + `commonErrorAr`.
8. **[Axe 6]** Sortir `ouverture.mp4` (13 Mo) du précache : poster statique + vidéo chargée en différé ou supprimée sur connexions lentes (`navigator.connection`). Ajouter recherche plein texte (index des titres + `vocabulary`, faisable en local) et favoris. Découper le chunk principal (694 Ko) : `ProtocoleRunner`, `ExamBlanc`, `Ana` en `React.lazy` comme `Methodologie`.

### 🟢 Basse priorité (confort / bonus)
9. **[Axe 7]** Flashcards générées automatiquement depuis les résumés (recto `recallQuestionAr` / verso étapes causales) branchées sur le SM-2 existant ; défi hebdomadaire « 5 jours actifs » déjà mesuré par `rythmeSemaine`.
10. **[Axe 8]** Ajouter une suite de tests minimale (les moteurs `moteur.ts`, `srs.ts`, `xp.ts` sont purs et testables en < 20 tests Vitest), un dossier `ios/` Capacitor si l'App Store est visé, et une page FAQ/aide dans l'onglet أنا.
11. **[Axe 7]** Notifications locales opt-in alignées sur `prochaineRevision` (rappel le matin, jamais le soir), en réutilisant `revisionsDues()`.

---

## 7. 🏆 Verdict final

- **Prête pour le marché ?** **Oui comme outil de révision guidée de septembre à mars, non comme produit « Bac » complet.** Il manque les deux objets que l'élève algérien cherche d'abord en avril–juin : les annales et le chronomètre.
- **À recommander aux élèves ?** Oui, sans réserve, à un élève de Sciences Expérimentales qui commence tôt et accepte d'être guidé (chemin imposé) ; avec un complément obligatoire (annales papier/PDF externes) pour la dernière ligne droite. À déconseiller, en l'état, comme outil unique à J-30.
- **Risque principal :** ni la surcharge (excellente gestion) ni l'inexactitude avérée, mais **l'écart promesse/réalité sur l'examen** combiné à un contenu **non re relu par un enseignant** : le jour où un résumé contient une erreur de barème, elle sera apprise avec la même belle mécanique SM-2 que le reste.
- **Les 3 ajouts les plus urgents :** (1) annales 2018–2025 corrigées + simulateur chronométré paramétrable ; (2) relecture enseignante tracée des 58 résumés ; (3) mode « Révision express J-60/J-30/J-7 » déverrouillant le parcours.
- **Note de confiance globale : ⭐⭐⭐⭐☆ (4/5)** — 5ᵉ étoile suspendue à la validation enseignante et aux annales.

> **En une phrase :** « Bawssalate El-3oloum » a déjà résolu le problème le plus difficile — faire assimiler sans submerger, grâce à son moteur de prochaine action et à son SM-2 bloquant. Il lui reste à prouver, sujets officiels et relecture à l'appui, que ce qu'elle fait si bien assimiler est exactement ce que le jury du Bac algérien attend.
