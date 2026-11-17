# 🎯 Plan final d'amélioration — بوصلة العلوم Lite : vers 90/100

> **Version :** finale 1.0 — 16/11/2026
> **Base prouvée :** audit du code v0.9.3 (branche `arena/655e9526-bawssalate-el-3oloum`, commit `cab5100`) + contre-audit du rapport GLM 5.3 Flash et de son plan.
> **Règle d'or de ce plan :** aucun point de note n'est « gagné » par une intention. Chaque gain exige une **preuve livrable et vérifiable** (fichier, test vert, relecture signée, mesure sur appareil). Si la preuve n'existe pas au re-audit, la note ne bouge pas.

---

## 0. Baseline corrigée et honnête

Le plan GLM partait de 65/100 et promettait 90 en « 75–90 jours-homme ». Deux corrections s'imposent avant tout engagement :

| Élément | Plan GLM | Réalité vérifiée dans le dépôt | Conséquence |
|---|---|---|---|
| Score de départ | 65/100 | **60,5/100** selon la grille critère par critère déposée le 16/11 (`plans/preuves/GRILLE-BASELINE.md`) — jugement d'audit reproductible, pas une vérité objective. *Correctif : les versions antérieures de ce plan annonçaient 61,1 en comptant l'Axe 4 à 5,5 ; la grille déposée le note 5,0.* | Le chemin réel est **60,5 → 89,5**, pas 65 → 90 |
| Effort total | « 75–90 j-homme » | La somme de ses 41 tâches fait **234 j-homme** (addition vérifiée) | Budget réel : **237 j-homme** (détail §6 : 187 dev/éditorial + 50 relecture étendue, sans double comptage P1/relecture ; marge d'imprévus à ajouter par le planning par rôle), soit 14 semaines à ~4 personnes en scénario conditionnel, ou 20–24 semaines à capacité réduite |
| Tests | « 40/40 verts, cible 115 » | **aucun test applicatif dans le dépôt** (2 tests Android d'exemple existent, sans rapport avec les fonctionnalités), pas de vitest dans `package.json` | Le harnais de tests est à **créer** (tâche P0.4) avant toute modification du moteur |
| Sujets Bac | « déjà en PDF dans le dépôt » | `bac-svt-sujet-*.pdf` = pointeurs Git LFS de **132 octets**, non référencés dans `src/` | L'acquisition légale des vrais sujets devient la tâche **P0.1**, prérequis de tout l'Axe 5 |
| `bacSentenceFrameAr` manquant (leçon 1) | Tâche T1.2 du plan GLM | **0/58 leçon sans `bacSentenceFrameAr`** (comptage exhaustif) | Tâche supprimée (fantôme) |
| Série « SVT » (génétique/écologie) | Unités U12/U13 proposées | La structure du code correspond aux 3 domaines des **Sciences Expérimentales** — conformité à confirmer sur la source officielle actuelle (édition citée au registre P0.1) et par les enseignants avant toute déclaration définitive | **Rejeté** : ajouter ces unités dégraderait la conformité. Seule la déclaration de périmètre est conservée (P1.3) |
| « Position douce » (T7.4 GLM) | Classement doux via Supabase | `supabase/schema.sql` interdit tout `SELECT` anon ; comparaison sociale contraire au design anti-stress et sensible pour des mineurs | **Supprimée définitivement** |

### Notes de départ retenues (corrigées) et cibles

| Axe | Poids | Départ | Cible | Preuve maîtresse du gain |
|---|---|---|---|---|
| 1. Conformité programme | 15 % | 6,0 | **9,0** | 58/58 leçons `manuel_officiel_verifie` avec `reviewedBy/reviewedAt` réels |
| 2. Richesse & hiérarchisation | 12 % | 6,5 | **9,0** | Priorité par leçon sourcée annales + glossaire bilingue + 58/58 leçons avec contenu |
| 3. Parcours & assimilation ⭐ | 18 % | 8,0 | **9,0** | Diagnostic + objectif + mode J-60 testés avec de vrais élèves |
| 4. Exercices & tests | 12 % | 5,0 | **9,0** | Rédaction libre par unité + niveau 3 réel + schémas à légender |
| 5. Sujets Bac + simulation | 10 % | 2,5 | **9,0** | ≥ 6 sujets officiels structurés + chrono opt-in + corrigés-barèmes |
| 6. UX/UI cognitive | 10 % | 6,5 | **9,0** | Recherche + favoris + texte ajustable + mesures sur appareils 2 Go RAM |
| 7. Interactivité & engagement | 13 % | 6,0 | **9,0** | Quiz adaptatif + défis de régularité (sans classement) + boucle mesurée |
| 8. Technique & économie | 10 % | 6,5 | **8,5** | Opt-in sync + harnais de tests + Play Store track fermée |
| **Total pondéré** | | **60,5** | **89,5 (≈ 90 par arrondi explicite)** | Re-audit indépendant sur preuves (§9) — la note finale appartient au ré-auditeur, jamais au plan |

> ⚠️ **Engagement de méthode :** 90/100 est une cible **conditionnelle**, pas une promesse calendaire. Si au re-audit une preuve manque (ex. relecture à 40/58), la note publiée sera celle mesurée — attendue entre 82 et 86 dans ce cas. Mieux vaut annoncer 85 et livrer 85 que promettre 90 et livrer 80.

---
## 1. Fil rouge — conventions maison amendées explicitement

Le plan GLM proclamait 5 conventions « non négociables » puis les violait (chrono, %). Ce plan les amende **par écrit**, une fois pour toutes :

1. **Jamais révéler la bonne réponse avant le bon choix** — *exception unique et bornée :* en mode examen (P5.2), le corrigé est verrouillé pendant l'épreuve puis révélé **après** remise, comme au vrai Bac. Hors mode examen, la règle reste absolue.
2. **Zéro pourcentage de réussite affiché à l'élève** — *exception interne :* les fréquences d'annales (P2.1) servent à calculer les priorités en coulisses ; l'élève ne voit que des badges qualitatifs (« يُكرَّر كثيرًا »), jamais « 30 % du Bac ».
3. **Zéro chronomètre agressif** — *exception opt-in :* le minuteur n'existe qu'en mode examen, choisi par l'élève, jamais imposé.
4. **Zéro comparaison sociale** — aucun classement, aucune position par rapport aux autres élèves (suppression définitive de l'idée « position douce »).
5. **Chiffres latins, messages non culpabilisants, bonne réponse jamais offerte** — inchangés.

### Principe de preuve (applicable à chaque tâche)
Chaque tâche se termine par un artefact déposé dans `plans/preuves/` :
- code : fichier + build vert (`npm run build`, déjà vérifié fonctionnel sur v0.9.3) ;
- contenu : source citée (page du manuel, sujet officiel, relecteur nommé) ;
- pédagogie : test utilisateur ou scénario de test écrit et rejoué ;
- performance : mesure chiffrée sur appareil réel, jamais une impression.

---
## 2. Phase P0 — Fondations et preuves (Sprint 0, sem. 1–2) — *avant tout le reste*

### P0.1 🔴 Acquisition légale des sujets officiels (3 j + délai externe)
Récupérer les sujets officiels Sciences Expérimentales **2018–2025 + rattrapages** auprès de la source officielle (ONEC / sujets publiés), vérifier les droits de reproduction, archiver les originaux dans `plans/sources/sujets/` avec provenance datée. Vérifier au passage la **durée officielle de l'épreuve** (le « 3 h 30 » du plan GLM est une affirmation non sourcée). *Mise à jour 16/11 : les en-têtes de 18 épreuves 2013→2026 archivées dans `plans/sources/sujets/` impriment tous **4 h 30** pour la série Sciences Expérimentales (2 h 30 en Mathématiques) — voir `plans/sources/REGISTRE.md`.*
**Preuve :** registre `plans/sources/REGISTRE.md` (année, session, source, date, intégrité du fichier). *Sans ce registre, tout l'Axe 5 reste à 2,5/10.*

### P0.2 🔴 Consentement sync en opt-in explicite (2 j)
`consentementSync: false` par défaut (`src/types.ts`), écran d'accord dédié après inscription (نعم / لا، لاحقًا), politique de confidentialité visible dans أنا. Pour les installations existantes : **envois suspendus jusqu'à confirmation explicite** (un vrai opt-in ne conserve pas un envoi par défaut — voir P0.8).
**Preuve :** capture de l'écran + test : aucune requête Supabase tant que l'élève n'a pas dit oui (console réseau).

### P0.3 🔴 Compression du splash (1 j)
`ouverture.mp4` : 13 Mo → **≤ 3 Mo** (720p, 2–3 s) ou image animée WebP ; retrait du précache lourd. Gain immédiat pour la 3G prépayée.
**Preuve :** taille du fichier + poids total du précache avant/après dans `plans/preuves/poids.md`.

### P0.4 🔴 Harnais de tests créé from scratch (5 j)
Vitest + jsdom (le banc « audit-5 » cité par le README n'est pas livré : on le reconstruit dans le dépôt). Cible P0 : **30 tests** sur les fonctions pures — `moteur.ts` (priorités NBA, verrouillage), `srs.ts` (transitions SM-2, fragile J+1), `xp.ts`, `dates.ts`, migration d'état `etatDepuisBrut`.
**Preuve :** `npm test` vert en CI locale, rapport déposé. *Toute tâche ultérieure qui touche au moteur doit ajouter ses tests dans le même sprint.*

### P0.5 🔴 Lancement de la relecture professorale (2 j + fond continu)
Recrutement de **2 enseignants SVT 3AS** (dont 1 correcteur du Bac), checklist de relecture écrite (exactitude, vocabulaire du manuel, ordre causal de `mechanismAr`, pièges réalistes, QCM sans ambiguïté), ordre de priorité U4 (poids 5) → U3/U9/U11 (poids 4) → reste.
**Périmètre de relecture — verrouillé et étendu (correctif audits n° 3 et 4, leçon directe de l'erreur ¹⁸O)** : la relecture couvre **les 58 résumés + les QCM de leçon associés (`qcmLecons.ts`) + les 620 drills + les exercices de `Methodologie.tsx` et `ExamBlanc.tsx` (énoncés, options, explications) + tous les corrigés de sujets produits en P1.1**. Borner la relecture aux résumés laisserait passer la prochaine erreur de type ¹⁸O dans un drill : ce périmètre étendu est donc contractuel, pas optionnel. Rythme réajusté en conséquence : un lot = 1 unité complète (résumés + QCM + drills de l'unité), cible 1 unité / 1,5 semaine ; l'arbitrage de l'item **d101** (deux options géologiquement vraies selon la lecture — Gutenberg ≈ 2 900 km, Lehmann ≈ 5 100 km : le script signale une proximité, seul l'enseignant arbitre la formulation). **Précision vérifiée sur `d101` (`domaine3.ts`, U10, axe 42)** : le défaut réel est plus grave — les options 1 et 3 y sont **équivalentes** (« sépare le manteau du noyau externe vers 2 900 km » formulé deux fois) alors qu'une seule est comptée juste : un élève peut donc être marqué faux pour une réponse correcte. Correction immédiate en **exception prioritaire dès P0** (avant tout lot, sans attendre U10), puis arbitrage enseignant sur la formulation.
**Preuve :** checklist signée dans `plans/relecture/` + premier lot (U4 complète : résumés, QCM, drills) avec `reviewedBy/reviewedAt` et registre des arbitrages (dont d101).

### P0.6 🟡 Hygiène immédiate (1 j)
Remplacer « منصة بنزر العلم » par بوصلة العلوم dans les `<title>` des **23 HTML concernés sur 25** (vérifié par `grep -l`) ; corriger l'incohérence Hill 1937/1939 (`lessonGoldSummaries.ts:38` vs `ExamBlanc.tsx:68`) après arbitrage du relecteur ; corriger le commentaire « 42 min » de `protocole.ts` (la somme réelle est 46 min, affichée à l'élève) — *fait 16/11*.
**Preuve :** `grep` de contrôle déposé (0 occurrence de l'ancienne marque).

**Portes de fin P0 (différenciées — correctif audit n° 3, plus de blocage unique) :** (a) *publier un sujet officiel* exige source + droits clarifiés au registre ; (b) *modifier le moteur/SRS* exige le harnais de tests vert ; (c) *affirmer « vérifié par un enseignant »* exige la relecture signée. Les travaux sans dépendance externe (hors-ligne P0.7, confidentialité P0.8, prototypes) avancent en parallèle sans attendre les annales ni les enseignants.

### P0.7 🔴 Fiabilité hors-ligne réelle (4 j) — *ajout audit n° 3*
Le service worker précache l'app shell et les 25 HTML, mais les chunks chargés à la demande (`Methodologie`, banques de drills par domaine) ne sont mis en cache qu'après un premier fetch en ligne : **une fonctionnalité jamais ouverte peut échouer à sa première ouverture hors ligne.** Protocole : installation → mode avion → première ouverture de chaque onglet, des 3 banques et d'un examen ; puis mise à jour et réouverture ; sur PWA **et** Android séparément. Correction selon résultats (précache étendu ou préchargement des chunks critiques), budget de poids suivi (P0.3).
**Preuve :** matrice fonctionnalité × en-ligne/hors-ligne dans `plans/preuves/hors-ligne.md`, 100 % des parcours critiques ouverts hors ligne.

### P0.8 🔴 Confidentialité complète, pas seulement l'opt-in (5 j) — *ajout audit n° 3*
Inventaire réel des données transmises (le snapshot inclut daïra, nom, date du Bac, identifiants de progression et **jeton d'écriture**, jusque dans `charge_utile` — la fiche Data Safety décrira la version publiée, pas une intention) ; minimisation ; durée de conservation ; **suppression côté serveur** à la demande (la suppression locale ne prouve rien côté Supabase) ; retrait du consentement effectif ; pour les installations existantes, arrêt des envois jusqu'à confirmation (un vrai opt-in ne « conserve » pas un envoi par défaut) ; audit de la configuration Supabase **déployée** (le schéma du dépôt ne prouve pas l'état d'une base existante). Test export → effacement → import comparant progression, SRS, carnet, compte **et statistiques** (clé distincte `kunz_stats_v1` dans `stats.ts`, aujourd'hui hors de l'export `etat`).
**Preuve :** inventaire déposé + captures réseau avant/après + test de restauration complet vert.

*16/11 (12ᵉ passe) : **suppression côté serveur** livrée côté code — `supprimerSnapshotServeur()` (`sync.ts`, résultat explicite : supprimé / hors ligne / pas de compte / sync inactive / erreur) + policy `suppression_app` (DELETE pour `anon` exigeant le jeton, `supabase/schema.sql`) ; bouton « احذف سجلّي من الخادم » avec confirmation dans l'écran dédié **« الخصوصية · الأسئلة الشائعة · عن التطبيق »** (`Confidentialite.tsx`, lazy, ouvert depuis « أنا ») qui reprend la liste réelle `DONNEES_ENVOYEES` / `DONNEES_JAMAIS_ENVOYEES`, dit quand et vers où ça part, les 4 droits (retrait, export, suppression, durée de conservation), 9 FAQ et l'à-propos (version, sources, droits des sujets, signalement). Réussite de la suppression → consentement retiré automatiquement. **Reste humain/ops :** déployer la policy sur la base réelle, test réseau avant/après sur appareil, et mettre en place la purge « > 1 an après la date du Bac » annoncée dans l'écran (aujourd'hui un engagement, pas un cron). Test `sync.test.ts` (+1 : sans configuration → `sync_inactive`, aucun appel).*

### Correctifs de précision intégrés (audit n° 3)
- Marque HTML : l'ancienne marque apparaît dans **23 des 25** titres (vérifié par `grep -l`) — P0.6 vise ces 23 fichiers.
- **Erreur scientifique avérée, à corriger en priorité** : `ExamBlanc.tsx` décrit ¹⁸O comme « radioactif » (lignes 75 et 94–120) alors que ¹⁸O est un isotope **stable** (traceur isotopique). Correction dans tout l'exercice, validation enseignante ; la relecture couvre donc **aussi les exercices et leurs explications**, pas seulement les 58 résumés. L'item `d101` signalé par `scripts/verifier-drills.mjs` (options proches) est à faire arbitrer par les enseignants.
- Axes de drills numérotés **0–48** (`axes.ts`) : la correspondance axe → leçon (P1.4) est à construire et valider, elle n'existe pas comme mapping complet.
- Mode examen : critère réaliste = corrigé **non affiché dans l'interface** avant remise (des réponses embarquées hors ligne ne sont pas un secret cryptographique).
- Mode J-60 (P2.3) : spécifier **avant développement** l'exception à `itemVerrouille()` — lecture seule ou parcours complet, prérequis minimaux, effet sur la progression normale, retour en mode normal, tests de migration et de retour arrière.
- Priorités (P1.7) : publier la méthode (années et nombre de sujets réellement analysés, correspondance question → leçon, désaccords entre correcteurs) ; badges = **aide à la révision**, jamais prédiction du prochain Bac ; à défaut d'échantillon suffisant, priorités provisoires validées par les enseignants et étiquetées comme telles.
- Diagnostic (P2.1) et objectif de note (P2.2) : affichés comme **indications provisoires / hypothèses produit**, sans décision forte ni culpabilisation.
- Terrain avancé : micro-test de la rédaction libre avec 3–5 élèves dès le prototype (P1.3), puis validation finale 12–15 élèves (P3.4) présentée comme **signal exploratoire** (tâches critiques, aide autorisée et critères par tâche définis à l'avance).

---
## 3. Phase P1 — Le Bac réel (S1–S3, sem. 3–6) — Axes 5, 4, 1

### P1.1 🔴 Sujets officiels structurés et corrigés (25 j dev + éditorial prof)
**Distinction obligatoire (correctif audit n° 5)** : chaque épreuve intégrée est étiquetée dans l'app et au registre comme (a) **reproduction fidèle** d'un sujet officiel, (b) **adaptation inspirée** d'un sujet officiel, ou (c) **sujet blanc original** — convertir des questions ouvertes en QCM peut être pédagogique, mais ne sera jamais présenté comme une simulation fidèle sans validation du correcteur.
Pour chaque sujet acquis (cible : **6 sujets** dont ≥ 2 rattrapages) : transcription structurée réutilisant les gabarits existants (QCM Partie I, enquête Partie II de `Methodologie.tsx`/`ExamBlanc.tsx`, synthèse Partie III via P1.3), corrigé type jury avec barème par point, mots-clés attendus et réponses alternatives (« يُقبل أيضًا… ») validés par le correcteur du Bac. Consultation hors ligne (données locales, pas de PDF précaché lourd).
**Preuve :** 6 sujets jouables de bout en bout hors ligne + corrigés signés par le correcteur dans `plans/relecture/`.
**Vigilance d'estimation (correctif contre-audit GLM) :** 25 j suppose les gabarits existants réutilisés et le correcteur disponible en parallèle ; à défaut, appliquer le repli chiffré dès la fin de S1 — **3 sujets officiels + 2 sujets blancs rédigés par le correcteur (≈ 15 j dev + 8 j éditorial)** — et reporter les 3 sujets restants après P2 sans bloquer P1.7 ni P2.3.

*16/11 : **phase « structure sans corrigé » livrée** — `src/data/sujetsOfficiels.ts` : 6 sujets SE (2020, 2021, 2023 × الموضوع الأول/الثاني ; 18 exercices, 44 consignes) transcrits depuis la couche texte des PDF (`pypdf`) : barème, parties, **texte des consignes** avec verbe opératoire typé (20 verbes), unité(s) ciblée(s), description d'une phrase du support. **Volontairement absents** : les documents (figures, tableaux) et les عناصر الإجابة officiels — tant que A-004 n'est pas réglé. Écran `SujetsOfficiels.tsx` (lazy 31 kB) : navigation année/sujet, tap sur un verbe → « ما يُنتظر » (attendus du jury, sans barème), bouton vers la synthèse libre de l'unité, recherche dans les cours ; carte de fréquences (verbes, unités) **calculée** depuis les données (`frequenceVerbes`, `frequenceUnites`) avec l'avertissement « 3 ans = orientation, pas prédiction ». Carte « بنية مواضيع البكالوريا » dans التدريبات (remplace le بنك PDF retiré). Tests `sujetsOfficiels.test.ts` (2). **Constat utile** : les PDF SE contiennent la **correction officielle ONEC** (الإجابة النموذجية, pages 11–20) — la phase 2 n'est donc pas une rédaction mais une transcription + validation, dès que les droits sont clarifiés. 2022 et 2020 ont une couche texte dégradée (glyphes) → consignes 2020 reformulées, à confronter à l'œil (A-008). 2024–2026 sont des scans : transcription manuelle ou OCR à prévoir.*


### P1.2 🔴 Mode examen chronométré opt-in (7 j)
Sur chaque sujet : minuteur optionnel (4 h 30 pour un sujet complet, durée lue sur les épreuves — `plans/sources/REGISTRE.md`), interface sobre type copie (pas de mascotte ni de célébration), corrigé **non affiché dans l'interface** jusqu'à remise, bilan final avec grille سند·تحليل·ربط·استنتاج et temps passé — sans note en % (compte de points du barème autorisé, c'est la langue du Bac).
**Preuve :** session complète enregistrée sur appareil ; corrigé **non affiché dans l'interface** avant remise (test d'interface — des réponses embarquées hors ligne ne sont pas un secret cryptographique).

### P1.3 🔴 Rédaction libre par unité (12 j)
Composant `SyntheseLibre` : situation Bac → **saisie clavier libre** → auto-évaluation guidée sur la grille du jury (l'élève coche ce qu'il a réellement produit) → modèle + erreur nucléaire → carte `kafaa` SM-2. Déploiement progressif : 4 unités pilotes (U1, U4, U6, U9) en S2, les 7 autres en S3 après retour des pilotes. Aucune note machine.
**Preuve :** 11 exercices en production + traces d'auto-évaluations dans le carnet lors du test utilisateurs (P3.4).

*16/11 : **11 situations en production** (`src/data/syntheses.ts`, une par unité : sand + consigne ouverte + 5 éléments de réponse + pièges officiels de l'unité + erreur nucléaire T1–T4), écran de choix `ChoixSynthese.tsx` (carte « التركيب الحرّ » dans التدريبات, chunk lazy 21 kB) → `SyntheseLibre` existant (saisie libre, auto-évaluation, modèle, carte `kafaa` `syntheseU<n>`). Toujours aucune note machine. Rédaction dev à partir des fiches or et des `piegesAr` : **à valider** (registre A-007). Test `syntheses.test.ts`. Reste : traces d'auto-évaluation lors du test terrain (P3.4) et, après validation, un deuxième sujet par unité prioritaire (U3, U1, U4, U5).*

*16/11 (suite) : **deuxième situation** pour les 4 unités les plus fréquentes au Bac (U3 ribonucléase/dénaturation réversible, U1 inhibiteur de traduction + codon stop, U4 anticorps thérapeutique Her2, U5 toxine et message douloureux) → **15 situations**, ids `u3b`… (carte kafaa distincte `syntheseU3B`), titre affiché dans la liste. Même statut A-007.*


### P1.4 🟡 Renvoi au cours après échec + stats d'examens (5 j)
2 échecs consécutifs sur un axe de drills → carte « 📖 راجع الدرس » vers `urlLecon()` (le mapping axe→unité existe dans `axes.ts`, mais la correspondance **axe → leçon précise est à construire et à faire valider par les enseignants** — tâche incluse dans ces 5 j) ; historique `etat.examens[]` (date, sujet, axes faibles, temps) consultable dans أنا et relié au carnet de failles.
**Preuve :** capture du renvoi déclenché + historique après 2 examens.

*16/11 : renvoi au cours fait via l'escalier adaptatif (P3.1 : 2 échecs → « افتح درس الوحدة », leçon en cours ou première non terminée de l'unité de l'axe — mapping axe→unité de `axes.ts`, la leçon précise reste à valider par les enseignants). **Historique d'examens fait (12ᵉ passe)** : `Etat.examens[]` (`BilanExamen` : date, secondes, chrono, QCM/directs, erreurs sur documents, unités en échec en Partie I ; 20 derniers), rempli par `ExamBlanc.onTermine(bilan)` ; carte « امتحاناتي التجريبية » dans « أنا » (`CarteExamens.tsx`) : 5 derniers, durée, « تعثّر في الوحدة… », unités qui reviennent dans les 2 derniers examens → lien vers les تدريبات ; les erreurs elles-mêmes restent dans la كرّاسة الأخطاء (déjà alimentée). Reste : capture après 2 examens.*

### P1.4-bis ✅ Source éditoriale des drills protégée (2 j) — *ajout audit n° 5*
Les fichiers `src/data/drills/*.ts` sont générés par `scripts/importer-drills.mjs`, dont le chemin source par défaut est un chemin local Windows non exploitable dans ce dépôt : toute correction d'item (d101, relecture, nouveaux n3) risque d'être écrasée par une régénération. Avant toute modification de la banque : figer une **source éditoriale de référence versionnée dans le dépôt** (ou déclarer les fichiers générés comme source de vérité avec régénération interdite sans ré-application des corrections tracées au registre des arbitrages).
**Preuve :** source de référence déposée + une régénération d'essai qui ne perd aucune correction tracée.

*16/11 : option « fichiers générés = source de vérité » retenue (le MD d'origine n'est pas dans le dépôt). `src/data/drills/README.md` fixe la règle, la procédure et le tableau des corrections à ré-appliquer (A-001 `d101`) ; `scripts/importer-drills.mjs` **refuse** de tourner sans chemin explicite **et** `--force` (code de sortie 2, message qui renvoie au README), et rappelle de relancer `verifier-drills.mjs`. La « régénération d'essai » n'a pas de sens sans source : la preuve est le refus du script + le registre.*

### P1.5 🟡 Items niveau 3 — qualité avant quantité (12 j éditorial)
**80 items `n:3`** (et non 200 médiocres) : pièges composés des `piegesAr` d'unité, mini-documents (courbe/tableau) à interpréter, relus par les enseignants dans le flux P0.5 (périmètre étendu). Distribution prioritaire : U4 (16), U3/U9/U11 (10 chacun), solde équilibré.
**Diversification des tiges — ajout audit n° 4 (découverte du script de vérification)** : la sortie de `scripts/verifier-drills.mjs` montre que **5 intitulés de tiges couvrent 250 des 620 items (40 %)**, et 40 autres partagent « أي مصطلح في البرنامج يُعرَّف » — l'élève risque d'apprendre à reconnaître le format plutôt que la notion. Les items n:3 devront donc varier les tiges (situation, document, négation, comparaison), et le script de vérification gagne un **critère d'alerte « tige répétée > 10 occurrences »** ainsi qu'un signal « double lecture possible » (options individuellement vraies, type d101) renvoyé à l'arbitrage enseignant — le script détecte, l'humain tranche.
**Preuve :** banque à 700 items / 3 niveaux, chaque item n3 tracé à un piège officiel documenté ; **pour les 80 nouveaux items** : aucune tige > 10 occurrences ; d101 corrigé dès P0 (doublon d'options) puis arbitré et tracé.
*16/11 : **dépôt 1 livré — 28 items n3** (`src/data/drills/niveau3.ts`), distribution conforme à la priorité du plan (U4 × 6, U3/U9/U11 × 4, U1/U2/U5/U6/U7 × 2 ; U8/U10 au dépôt 2), chacun tracé à un `piegesAr` officiel ou à une expérience de référence en commentaire ; tiges variées (vérifié : aucune tige n3 répétée, « options proches » 0, `verifier-drills.mjs` 648 items / 0 problème). **Statut : à valider** (registre A-005) — jouables dès maintenant, ils ouvrent la 3ᵉ marche de l'escalier adaptatif sur 20 axes. Reste : 52 items (U8, U10 et complément U4/U3/U9/U11) + relecture enseignante des 28.*

**Périmètre tranché pour l'existant (correctif audit n° 5)** : le critère « aucune tige > 10 » ne s'applique **pas** rétroactivement aux 620 items existants — le satisfaire exigerait de réécrire ~250 items et de les faire relire, ce qui constitue une tâche distincte **P1.5-bis (8 j éditorial + relecture dans le flux P0.5, budgétée au §6)**, à déclencher si le temps enseignant le permet. Une tige répétée n'est pas mauvaise en soi : le critère de qualité reste la question, ses distracteurs et le raisonnement exigé.

### P1.6 🟡 Schémas à légender (8 j)
Composant `SchemaALegender` (tap zone → tap étiquette, compatible petits écrans) ; 6 schémas prioritaires : synapse, chloroplaste/thylakoïde, mitochondrie, subduction/Benioff, profil des enveloppes terrestres, codon/ARNt. Réutilisé en Partie I des sujets.
**Preuve :** 6 schémas jouables + taux de réussite au test utilisateurs.

*16/11 : fait côté code — `src/data/schemas/index.ts` (6 schémas : synapse, chloroplaste/thylakoïde, mitochondrie, subduction/Benioff, enveloppes terrestres avec discontinuités, codon/ARNt/ribosome ; SVG simplifiés dessinés dans le dépôt, 5 à 8 zones chacun) + `SchemaALegender.tsx` (lazy 14 kB) : **tap numéro → tap étiquette**, pas de glisser-déposer (petits écrans), erreur = message doux, aucune note ; fin → lien vers la leçon via la recherche ; `etat.schemas` mémorise les schémas terminés (compte dans la carte « مخطّطات للتسمية » de التدريبات). Test `schemas.test.ts`. **Reste humain :** conformité des dessins au manuel (relecture P0.5) et taux de réussite au test utilisateurs (P3.4). Réutilisation en Partie I des sujets : à faire quand P1.1 livrera les sujets structurés.*

### P1.7 🟡 Priorité par leçon, enfin sourcée (4 j)
**Après** P0.1/P1.1 seulement : analyse de fréquence sur les sujets réellement acquis (2018–2025), tableau déposé dans `plans/analyse-frequence-bac.md`, champ `priorite: 1|2|3` sur les 58 leçons, badges qualitatifs discrets dans مساري et la Mindmap.
**Preuve :** tableau de fréquence reproductible depuis le registre des sujets.
*16/11 : fait en version « corpus texte » — `scripts/frequence-bac.py` (pypdf, lexique par unité, découpage en تمارين, corrigés coupés) → `plans/analyse-frequence-bac.md` + `src/data/priorites.ts` **généré** (16 leçons P1, 30 P2, 12 P3). Corpus : 9 épreuves SE à couche texte 2016–2023 ; les 8 scans (2013–2015, 2024–2026) attendent une lecture humaine → tendance récente sous-représentée, géologie probablement sous-estimée. Badge discret « يتكرّر في البكالوريا » dans مساري (P1 non faites). Les priorités pilotent les phases du mode intensif (J60 = P1, J30/J7 = P1–P2). À faire valider par un enseignant (section 3 de l'analyse).*

**Porte de fin P1 (deux niveaux, pour réconcilier repli et ambition) :** *version utilisable* = 3 sujets officiels + 2 sujets blancs **explicitement étiquetés « sujet blanc »** (jamais présentés comme officiels) + chrono + synthèses pilotes ; *critère de sortie ambitieux* = 6 sujets officiels. Seul le second niveau autorise à viser 9/10 sur l'Axe 5 au re-audit ; le premier plafonne l'axe à ~7/10 et doit être publié comme tel.

---
## 4. Phase P2 — Assimilation complète (S4–S5, sem. 7–10) — Axes 3, 2

### P2.1 🔴 Test de positionnement (8 j)
22 QCM (2/unité, niveaux 1–2 existants), ~12 min, proposé après l'inscription, **rejetable**. Effets : message d'accueil personnalisé, file de cartes `kafaa` ordonnée, forces/faiblesses dans أنا (`etat.diagnostic`). **Ne déverrouille pas le chemin** (le verrouillage anti-lacunes reste la garantie structurelle).
**Preuve :** test unitaire du diagnostic + parcours complet capturé.
*16/11 : fait — `diagnosticQuestions.ts` (22 questions « synthèse », 2/unité, tirage déterministe) + `diagnostic.ts` (bilan par unité en mots : متين / متوسّط / للتثبيت, message d'accueil sans chiffre) ; écran `Diagnostic.tsx` lazy, proposé une fois après le consentement, « لاحقًا » en un geste, rejouable depuis « أنا » ; test `diagnostic.test.ts` prouvant que `prochainItem`/`itemVerrouille` sont identiques avec ou sans diagnostic. Non fait : ordonnancement de la file `kafaa` par le diagnostic (volontairement, pour ne pas croiser avec P1.7).*

### P2.2 🔴 Objectif de note + pacing (4 j)
Choix 10+/14+/18+ modifiable ; règle le quota suggéré (1, 1+bonus, 2–3 leçons/jour) et le plafond de revues `kafaa` (2→3/sem. pour l'objectif 18+).
**Preuve :** table objectif→quota dans le code + tests des transitions de quota.
*16/11 : fait — `QUOTA_PAR_OBJECTIF` (`moteur.ts`), tests `parcours.test.ts`, réglage dans « أنا ».*

### P2.3 🔴 Mode « المراجعة المكثّفة » J-60 / J-30 / J-7 (10 j)
Bascule automatique (date du Bac de l'élève, saisie et modifiable — jamais une constante nationale codée en dur comme l'actuel `dateBac: '2027-06-10'` de `types.ts`) ou manuelle : parcours parallèle limité aux priorités 1 (puis 2 à J-30), SRS compressée J+1/J+3 avec sortie après 2 réussites, quota levé, 1 sujet/semaine. Mode normal toujours accessible.
**Preuve :** scénario rejoué « élève qui installe à J-45 » : aucune leçon prioritaire inaccessible, plan hebdomadaire affiché.
*16/11 : version 1 faite — bascule auto/manuelle, phases J60/J30/J7 sur `poidsBac` (en attendant la priorité par leçon de P1.7), verrous relâchés entre unités prioritaires, quota 3, SRS plafonnée J+3, plan hebdo dans « اليوم », calendrier externalisé dans `src/config/annee.ts`. Test du scénario J-45 vert. Reste : sortie SRS après 2 réussites, suivi « 1 sujet/semaine ».*
*16/11 (soir) : version 2 — phases sur la **priorité par leçon** (P1.7) ; verrou relâché entre items prioritaires (ordre des leçons prioritaires conservé dans l'unité) ; **sortie SRS après 2 réussites consécutives** (`mettreAJourSrsIntensif`, erreur → compteur à 0, J+1) ; **suivi réel « 1 sujet/semaine »** (`etat.examensBlancs`, `sujetCetteSemaine`, ligne cochée dans la carte du plan). Tests verts. Item complet côté code.*

### P2.4 ✅ (code) Révisions croisées, stats par unité, rappels (8 j)
Revue hebdomadaire mixte (1 carte/domaine + 1 `kafaa`, plafonnée) ; `stats.ts` étendu par axe/unité (les drills portent déjà `a: 0..48` (49 axes, `axes.ts`)) ; أنا affiche « الأقوى / الأضعف » avec lien direct vers l'axe faible ; rappels locaux opt-in (1/jour max, heure choisie — plugin Capacitor Local Notifications à intégrer proprement, absent aujourd'hui).
**Preuve :** capture أنا avec faiblesse nommée par unité + notification reçue sur l'appareil de test.
*16/11 : rappels faits — `@capacitor/local-notifications` 8.3.1 intégré (`cap sync` : gradle mis à jour), `src/utils/rappels.ts` (opt-in, 1 notification/jour id 1, heure choisie, 4 textes neutres en rotation sans chiffre, permission demandée seulement à l'activation, jamais re-demandée au lancement, rien sur le web — dit explicitement), réglage dans « أنا » (`ReglageRappel.tsx`), `SCHEDULE_EXACT_ALARM` retiré du manifeste (alarme inexacte suffisante, pas de justification Play à produire). Tests `rappels.test.ts` (6) avec adaptateur factice. **Reste à prouver sur appareil** : notification reçue (capture). **Revue croisée : faite (16/11, 3ᵉ passe)** — `src/utils/revueCroisee.ts` : une fois par semaine (semaine du dimanche, `debutSemaine`), 1 leçon **terminée** par domaine (≤ 3 ; fragiles d'abord, puis la moins récemment vue ; les leçons déjà dues aujourd'hui sont laissées à l'استرجاع quotidien), proposée seulement quand **au moins deux domaines** sont représentés (sinon ce n'est pas « croisé »), composition figée pour la semaine, marquée faite quand le dernier drill est évalué ; jouée par la `SessionRevision` existante (rappel → termes → QCM → auto-évaluation) donc **alimente la SM-2** (une leçon revue avant son échéance est simplement replanifiée depuis aujourd'hui). La carte كفاءة reste séparée et plafonnée par `kafaaSemaine` — pas doublée. Carte dans « اليوم » (masquée quand un استرجاع est dû, pour ne pas concurrencer la tâche unique). `Etat.revueCroisee` local, jamais synchronisé. Tests `revueCroisee.test.ts` (3). **Reste humain :** capture « أنا » avec la faiblesse nommée + notification reçue. **Stats par unité : faites (16/11, 2ᵉ passe)** — `src/utils/statsUnite.ts` (leçons terminées, fragiles SM-2, couverture drills par axes de l'unité, positionnement) → carte « الأقوى والأضعف بين وحداتي » dans « أنا » (`CarteForcesFaiblesses.tsx`) calculée sur les unités **commencées** seulement, en mots, avec un bouton d'action (révision des leçons fragiles, sinon tab تدريبات). Tests `statsUnite.test.ts` (3).*

### P2.5 🟡 Contenu complété — Axe 2 (16 j)
- **12 cours HTML manquants** sur le gabarit existant — liste exacte vérifiée : `d1-u1-l1-expression-genique`, `d1-u3-l1-enzyme`, `immunity_memory_response`, `immunity_hiv_aids`, `prerequis2AS_genetique`, `d2-u6-l1-hill-ruben`, `d2-u6-l2-jagendorf`, `d2-u6-l3-calvin`, `d2-u7-l1-mitchell-racker`, `d3-u11-l1-migmatite`, `enzyme_inhibitors`, `amino_acid_behavior` → `aContenuLecon()` vrai sur 58/58, précache mis à jour.
- **Glossaire bilingue AR↔FR** (~200 termes issus des `vocabulary`, équivalents français validés dans le flux de relecture), cherchable, termes cliquables dans `LecteurLecon`, 100 % hors ligne.
- **Fiche « الأساسي في 3 جمل »** par leçon (depuis `missionAr`/`mechanismAr`/`commonErrorAr`) + objectif d'ouverture « في نهاية هذا الدرس ستكون قادرًا على… ».
**Preuve :** script de comptage 58/58 + fichier glossaire + captures lecteur.

*16/11 : **glossaire fait** — `src/data/glossaire.ts`, 317 termes AR→FR dérivés des `vocabulary` (couverture : tous les termes conceptuels des 58 fiches ; seuls les symboles/valeurs — ATP, Km, −70 mV… — ne sont pas traduits), alias de graphie (التشبّع/التشبع, الموقع النشط/الفعال…), cherchable AR **ou** FR dans l'écran de recherche (section « المسرد » avec lien vers la leçon porteuse), **termes cliquables** dans `LecteurLecon` (équivalent français affiché au tap), 100 % hors ligne, chunk séparé (19 kB). Équivalents FR rédigés par le dev : **à valider** (registre A-006). **Fiche « الأساسي في 3 جمل » + objectif d'ouverture faits** : en tête du lecteur, « في نهاية هذا الدرس ستكون قادرًا على… » avec 3 points dérivés de `mechanismAr` (première et dernière étape) et `commonErrorAr`. Test `glossaire.test.ts` (3). **Reste éditorial :** les 12 cours HTML manquants (gabarit existant, rédaction + relecture — hors de portée sans enseignant).*

**Porte de fin P2 :** diagnostic, objectif, J-60, glossaire et 58/58 contenus démontrés ; relecture ≥ 40/58 ; tests ≥ 80 verts.

---
## 5. Phase P3 — Engagement, finition, validation terrain (S6, sem. 11–14) — Axes 7, 6, 8

### Flashcards (hors numérotation, critère baseline « pas de flashcards générales ») ✅ 16/11
`src/utils/flashcards.ts` + `Flashcards.tsx` (lazy, 6,7 kB) : 3 cartes par leçon **dérivées des fiches existantes** (استرجاع = question de rappel → mécanisme ; دليل = preuve documentaire ; فخّ = erreur fréquente), 58/58 couvertes (test). Ouvertes après le protocole de la leçon ou si favorite — jamais avant. Boîtes de Leitner 1/3/7 jours indépendantes du SM-2 des leçons (test d'indépendance : chemin et révisions inchangés). Session ≤ 12, dues d'abord. Porte « البطاقات » dans تدريبات.

### P3.1 🟡 Quiz adaptatif borné (6 j)
Session de 10 drills : 2 réussites → niveau +1 ; 2 échecs → niveau −1 + invitation cours (P1.4). Bornes [1,3] (dépend de P1.5), présenté comme un escalier à monter, jamais comme une chute.
**Preuve :** tests unitaires des transitions + session enregistrée montrant montée puis descente.

*16/11 : fait côté code — `src/utils/adaptatif.ts` (moteur pur), toute jouerie de drills passe par l'escalier (le sélecteur « niveau max » est retiré). Départ toujours au niveau le plus bas présent dans le pool de l'axe ; 2 réussites consécutives → +1 ; 2 échecs consécutifs → −1 + lien « افتح درس الوحدة » (leçon en cours, sinon première non terminée) ; au plancher : invitation sans descente. Le « juste » compte à la **première** tentative (`ChoixUnique.onPremiereTentative`) ; la re-tentative pédagogique est inchangée et `etat.drills` est toujours alimenté à la réussite finale. Bilan de fin en mots + schéma d'escalier, sans %. **Limite réelle :** la banque n'a aucun item de niveau 3 (n1 120, n2 500) → l'escalier a 2 marches effectives tant que P1.5 n'a pas livré les items n3 ; l'écran le dit (« la marche avancée s'ouvre quand ses questions sourcées arrivent »), les bornes se recalculent automatiquement depuis le pool. Tests `adaptatif.test.ts` (5) dont la session montée 1→2→3 puis descente 3→2→1 sur un pool synthétique à 3 niveaux.*

### P3.2 🟡 Défis de régularité et badges de contenu (7 j)
Défi hebdomadaire **choisi** par l'élève (20 drills / 1 revue croisée / 1 examen) récompensant la régularité, pas le score ; badges de contenu dans أنا (ponts franchis, revues SM-2, sujets terminés). Aucune donnée d'un autre élève n'est lue par le client — vérifié par relecture du code réseau.
**Preuve :** captures + audit réseau (0 requête de comparaison).

*16/11 : fait côté code — `src/utils/defis.ts` : défi hebdomadaire choisi parmi 3 (`20 تدريبًا` / `مراجعة متقاطعة` / `امتحان تجريبي`), un seul par semaine, non modifiable après le choix, jamais compté contre l'élève s'il n'aboutit pas ; progrès calculé localement (drills : différence avec la base figée au choix, car la banque ne porte pas de dates ; croisée : `revueCroisee.faiteLe` de la même semaine ; examen : entrée `examensBlancs` datée après le choix et dans la semaine) ; semaine accomplie consolidée une fois dans `defisAccomplis` (useEffect `App.tsx`). Badges de contenu (`badges()` / `badgesAffiches()`) : 4 familles × 3 paliers — جسور 1/5/11, استرجاعات 10/50/150, امتحانات 1/3/6, تحدّيات 1/4/10 (« non consécutifs » dit explicitement) ; « أنا » montre les obtenus + un seul prochain par famille. Carte `CarteDefi.tsx` dans « اليوم » (masquée quand un استرجاع est dû), `CarteBadges.tsx` dans « أنا ». **Audit réseau** : `plans/preuves/audit-reseau.md` — 0 lecture (seul `upsert` de sa propre ligne + assets du SW). Tests `defis.test.ts` (3). Reste humain : captures + onglet Réseau sur appareil.*

### P3.3 🟡 Recherche, favoris, taille de texte (9 j)
Index local généré au build (titres, `vocabulary`, glossaire) avec filtres par unité et ouverture au bon `#chapitre` ; `etat.favoris` + écran dans أنا, rejouables en `SessionRevision` ; réglage de taille `s/m/l` propagé aux iframes des leçons HTML.
**Preuve :** recherche « كالفن » → leçon ouverte au bon chapitre ; favori rejoué ; capture en taille `l`.
*16/11 : fait — `recherche.ts` (index en mémoire au premier appel : titres, `vocabulary`, إشكالية ; normalisation arabe hamza/ة/ى/تشكيل), écran `Recherche.tsx` lazy depuis « مساري », ouverture en lecture (ne compte pas, ne déverrouille pas) ; `etat.favoris` + ☆ dans `LecteurLecon` + liste dans « أنا » avec « راجع المفضّلة المُنجزة » (SessionRevision limitée aux leçons terminées). Test `recherche.test.ts` (« كالفن » → unité du domaine 2). Reste : glossaire (P2.5), capture taille `l`. **Filtres faits (12ᵉ passe)** : `rechercher(q, limite, filtre)` par domaine et/ou unité ; avec un filtre et sans requête, la liste complète du périmètre s'affiche (parcours par unité) ; chips des 3 domaines + sélecteur d'unité dans `Recherche.tsx`. Test `recherche.test.ts` (+1).*

### P3.4 🔴 Validation terrain — la preuve qui conditionne le « 90 » (6 j)
1. **Appareils bas de gamme** : Redmi 9A / Samsung A1x (RAM ≤ 2 Go) — cold start, leçon HTML, drill, examen chronométré. Cibles : démarrage < 4 s, zéro ANR, précache complet en 3G simulée. Rapport dans `plans/preuves/appareils.md`.
2. **Test utilisateurs** : 12–15 élèves de terminale Sciences Expérimentales (dont ≥ 4 en zone à connectivité faible) — tâches observées : première leçon, reprise après 3 jours, examen blanc, mode J-60 fictif. Critères : ≥ 80 % de tâches réussies sans aide, incompréhensions notées et corrigées.
3. **FAQ + à-propos + confidentialité** dans أنا (*16/11 : écran `Confidentialite.tsx` livré — voir P0.8*) ; **Play Store en track fermée** (AAB signé, fiche Data Safety **établie à partir de l'inventaire vérifié de la version réellement publiée** (P0.8) — aucune liste de données prédéterminée ici, une adresse email n'étant pas pseudonyme par nature).
**Preuve :** les deux rapports déposés ; sans eux, les Axes 3, 6 et 7 plafonnent à 8/10 au re-audit, quoi que dise le code.

### P3.5 🟢 « المُرشد الموسّع » (4 j)
25 questions de méthodologie en arborescence de clics portée par la mascotte — substitut hors ligne et honnête d'un chatbot IA (explicitement hors périmètre).
**Preuve :** arborescence complète navigable hors ligne.

*16/11 : fait — `src/data/mourchid.ts` (5 branches × 5 questions : قبل الامتحان، قراءة الموضوع، الكتابة، الأخطاء الشائعة، أثناء الامتحان وبعده ; chaque réponse 2–3 paragraphes, sans %, avec un lien d'action vers un écran et des « انظر أيضًا »), écran `Mourchid.tsx` (lazy 19 kB, chemin fil d'Ariane, mascotte, texte « ليس روبوت محادثة — ولا يدّعي ذلك »), entrée depuis l'accueil de la méthodologie. Test `mourchid.test.ts` (2 : structure, liens internes valides). Contenu à relire par les enseignants dans le flux P0.5 (méthodologie).*

### P3.6 🟡 Découpage du bundle principal (3 j) — *ajout audit n° 4*
Le build vérifié produit un chunk principal de **≈ 695 Ko minifiés (190 Ko gzip)** au-dessus du seuil d'alerte Vite (500 Ko) — c'est le premier téléchargement de chaque nouvel élève en 3G prépayée. Passer `ProtocoleRunner`, `ExamBlanc`, `Ana` et les ateliers en `React.lazy` (comme `Methodologie` déjà découpée), avec budget de poids suivi à chaque sprint dans `plans/preuves/poids.md`. Cible : chunk principal < 400 Ko.
**Preuve :** sortie de build déposée avant/après ; **le protocole de première ouverture hors ligne de P0.7 est obligatoirement rejoué après chaque changement de découpage** (PWA et Android) — découper sans revérifier réintroduirait le défaut que P0.7 corrige. Le seuil de 400 Ko est un indicateur, pas un substitut aux mesures de démarrage et de téléchargement réel (P3.4).

**Porte de fin P3 :** relecture du périmètre étendu (P0.5) signée ; tests ≥ 100 verts ; rapports appareils et utilisateurs déposés ; track fermée active ; chunk principal < 400 Ko.

---
## 6. Budget et calendrier réalistes

| Phase | Semaines | Effort estimé | Équipe minimale |
|---|---|---|---|
| P0 Fondations | 1–2 | ~23 j dev (14 + P0.7 hors-ligne 4 j + P0.8 confidentialité 5 j) + recrutement | 1 dev + porteur pédagogique |
| P1 Bac réel | 3–6 | **73 j** dev/éditorial (25+7+12+5+12+8+4) + relecture en fond | 1 dev + 1 rédacteur + 2 enseignants (temps partiel) |
| P2 Assimilation | 7–10 | ~46 j | 1–2 dev |
| P3 Finition/terrain | 11–14 | ~35 j + terrain | 1 dev + organisation des tests |
| Relecture périmètre étendu (fond, P0→P3) | 1–12 | ~50 j-homme enseignants (58 résumés + QCM + 620 drills + exercices + corrigés, par lots d'unité) | 2 enseignants à temps partiel |
| **Total** | **14 semaines (scénario conditionnel)** | **237 j-homme + marge** | **3–4 personnes** |

À équipe réduite, le même périmètre représente **20–24 semaines à ~2 personnes, ≈ 11 mois pour une personne seule** (237 j-homme, hors congés — et sans jamais remplacer les enseignants) — l'annoncer ainsi plutôt que de comprimer la qualité éditoriale. Le poste incompressible est humain : relecture et corrigés de sujets ne s'accélèrent pas en ajoutant des développeurs.
*Vérification arithmétique (correctifs audits n° 2, 3 et 4, répartition par tâche contrôlable) : P0 = 23 j (dont P0.7 : 4 j, P0.8 : 5 j — ce dernier incluant explicitement le travail Supabase/SQL : fonction de purge côté serveur, policies de suppression, tests réseau) ; P1 = 83 j (73 + P1.4-bis source drills : 2 j + P1.5-bis réécriture des tiges existantes : 8 j, optionnelle selon capacité enseignante) ; P2 = 46 j ; P3 = 35 j (32 + P3.6 bundle : 3 j) ; sous-total dev/éditorial = **187 j** ; relecture périmètre étendu = **50 j** (estimation **provisoire** : à recalibrer après le lot pilote, voir ci-dessous) ; **total = 237 j-homme + marge d'imprévus (droits, retours terrain) à fixer par le planning par rôle**.*
*Recalibrage obligatoire de la relecture : le rythme « 1 unité / 1,5 semaine » × 11 unités ≈ 16,5 semaines excède la fenêtre semaines 1–12 initialement affichée. Le lot pilote (U4 complète + exception d101) sera chronométré par les enseignants — corrections et seconde validation comprises — et le calendrier de relecture (exercices transversaux de méthodologie, examen blanc, nouveaux contenus HTML, items n3 et corrigés de sujets inclus au fil de leur production) sera recalculé sur ce temps réel avant tout engagement de date.*
**Capacité — condition de réalité du calendrier :** 73 j-homme en 4 semaines (P1) exigent **≈ 3,7 équivalents temps plein** mobilisés en continu sur cette phase ; les « 14 semaines » sont donc un **scénario conditionnel** subordonné à un planning par rôle (développement, rédaction, enseignants, coordination, juridique/droits, terrain) avec disponibilités nommées et marge d'imprévus — pas un engagement. À défaut de cette capacité démontrée, l'hypothèse de travail est **20–24 semaines**. Pour une personne seule, 237 j-homme ≈ **12 mois à temps plein** (hors congés et dépendances externes), les enseignants restant indispensables en parallèle. La dénomination « S6 » pour P3 désigne le 6e bloc de travail (sem. 11–14), pas un sprint d'une semaine.

### Annexe de pilotage — gain pondéré indicatif par phase (outil de suivi, pas une preuve)

En cas de retard sur le chemin critique, ce tableau indique où se perd le score — le gain ne sera compté au re-audit que sur preuve (§9), jamais sur cette estimation.

| Phase | Axes servis | Gain pondéré indicatif |
|---|---|---|
| P0 Fondations (opt-in, splash, tests, relecture lancée) | 8, 6, 1 | +2 à +3 pts /100 |
| P1 Bac réel (sujets, chrono, rédaction, n3, priorités) | 5, 4, 1, 2 | +12 à +14 pts /100 |
| P2 Assimilation (diagnostic, objectif, J-60, glossaire, contenus) | 3, 2 | +6 à +7 pts /100 |
| P3 Finition (adaptatif, défis, recherche, terrain) | 7, 6, 8 | +5 à +6 pts /100 |
| **Total indicatif** | | **60,5 → ≈ 89,5 /100** |

**Chemin critique :** P0.1 (sujets) → P1.1 (sujets structurés) → P1.7 (priorités sourcées) → P2.3 (mode J-60). Tout retard sur l'acquisition des sujets décale la cible 90 d'autant ; la relecture (P0.5) démarre en semaine 1 précisément pour ne jamais devenir le goulot final.

## 7. Ce que ce plan refuse (décisions assumées)

- ❌ **Classement / position sociale** (T7.4 GLM) : impossible techniquement (RLS sans lecture anon), contraire au design anti-stress, sensible pour des mineurs.
- ❌ **Unités « Génétique / Écologie » hors programme** : la conformité se mesure au programme officiel Sciences Expérimentales, pas à une taxonomie générique.
- ❌ **Chatbot IA et forum** : incompatibles avec l'offline-first et la modération qu'exigerait un public mineur ; remplacés par la FAQ méthodologique (P3.5).
- ❌ **200 items niveau 3 en 12 jours** : remplacés par 80 items relus (P1.5). La qualité du niveau 3 *est* le critère de l'Axe 4.
- ❌ **iOS natif** : PWA Safari conservée ; le public cible est majoritairement Android. Réévaluable après la track Play Store.

## 8. Risques majeurs et parades

| Risque | Impact | Parade intégrée au plan |
|---|---|---|
| Sujets officiels introuvables ou droits incertains | Axe 5 bloqué | P0.1 en semaine 1 ; repli : sujets blancs rédigés par le correcteur (P1.1 bis) sans attendre |
| Relecture professorale en retard | Axe 1 plafonné | Démarrage S0, ordre par `poidsBac` : même à 40/58, les unités décisives sont validées ; mention honnête dans l'app tant que `reviewed:false` |
| Casser la progression des élèves installés (clés `localStorage`, IDs de leçons) | Perte de confiance immédiate | Aucun renommage d'ID sans alias + tests de migration (P0.4) ; export JSON déjà présent comme filet |
| Le mode examen trahit l'anti-stress | Rejet par les élèves anxieux | Chrono strictement opt-in (amendement §1), bilan sans %, mode normal inchangé |
| Poids de l'app qui ré-enfle (sujets, glossaire, schémas) | Public 2 Go RAM / 3G pénalisé | Données structurées locales plutôt que PDF lourds ; budget précache suivi à chaque sprint (P0.3) ; mesure appareils en P3.4 |

## 9. Re-audit de sortie — comment le « 90 » sera prononcé (ou non)

Re-audit indépendant sur les mêmes 8 axes, la même pondération et la même grille que la baseline (`plans/preuves/GRILLE-BASELINE.md`, critères positifs **et négatifs**). **Les preuves sont une condition nécessaire, pas suffisante** : elles établissent que les livrables existent ; leur qualité et leur efficacité restent jugées par le ré-auditeur (échantillonnage des corrigés, rejeu des parcours, lecture des rapports terrain). Les seuils ci-dessous ouvrent l'éligibilité à la note cible — ils ne l'attribuent pas mécaniquement :

1. Axe 1 éligible à 9/10 si 58/58 `manuel_officiel_verifie` signés + 0 incohérence de type Hill 1937/1939.
2. Axe 5 éligible à 9/10 si ≥ 6 sujets officiels jouables hors ligne + chrono opt-in testé + corrigés-barèmes signés.
3. Axe 4 éligible à 9/10 si 11 rédactions libres bouclées SM-2 + 80 items n3 relus + 6 schémas à légender en usage réel.
4. Axes 3/6/7 éligibles à 9/10 si rapports appareils (2 Go RAM) et utilisateurs (≥ 12 élèves, ≥ 80 % de tâches réussies) déposés.
5. Axe 8 éligible à 8,5/10 si opt-in démontré par capture réseau + `npm test` ≥ 100 verts + track fermée active.

**Score attendu si toutes les portes passent : ≈ 89,5–90/100.** Si une porte échoue, le score publié sera le score mesuré au ré-audit — **aucune fourchette de repli n'est annoncée à l'avance** : l'impact dépend de la porte manquante et ne se décrète pas. C'est cette discipline — et non le chiffre — qui rendra le 90 crédible le jour où il sera affiché.

> **En une phrase :** ce plan garde l'ossature du plan GLM (Axe 5 d'abord, relecture en fond dès la semaine 1, synthèse libre anti-stress), en corrige le budget (×2,6), supprime ses tâches impossibles ou hors programme, et remplace la promesse « 90/100 » par un contrat : **chaque preuve nommée ici est sur la table au re-audit — et c'est le ré-auditeur, pas ce plan, qui prononcera la note.**
