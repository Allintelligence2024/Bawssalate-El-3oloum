# بوصلة العلوم Lite (ex-« كنز العلوم Lite ») — تطبيق مراجعة البكالوريا (الجزائر)

تطبيق ويب تقدّمي (**PWA**) 100% عربي (RTL)، يعمل دون اتصال، لتعليم التلميذ **كيف يراجع** مادة
علوم الطبيعة والحياة لشهادة البكالوريا — علوم تجريبية — وفق **بروتوكول المراجعة في 6 مراحل**،
مطبّقًا على البرنامج الرسمي كاملًا (3 مجالات → 11 وحدة → 58 درسًا).

> اللغة: التطبيق عربي بالكامل. الكلمات اللاتينية مخصصة للمصطلحات العلمية فقط (ADN، ATP، LTc،
> pH، CMH، HbS…). هذه الوثيقة موجّهة للمطوّر، لذلك هي بالفرنسية.

---

## 🏴‍☠️ Écran de démarrage (splash)

Au premier chargement de l'app (une fois par session d'onglet, via `sessionStorage['kunz_demarrage']`),
un écran plein écran noir joue la **vidéo d'ouverture officielle** (`public/ouverture.mp4`,
1080×1920, 5 s, muette) :

- la vidéo se lance en auto-play **muet** (aucun téléchargement supplémentaire, fichier local),
- à la fin de la vidéo (ou au clic n'importe où sur l'écran) apparaissent le titre
  « بوصلة العلوم Lite » et le bouton « ابدأ ← » (fondu échelonné),
- le clic sur le bouton ferme l'écran (fondu 600 ms) et révèle l'application.

> Pas de son : la vidéo est volontairement muette (choix de l'auteur).

---

## 🧭 Architecture « OPUS » (v0.3)

L'application n'est **pas** un sommaire de cours : c'est un **chemin**. **Quatre onglets**, un moteur
qui décide de la prochaine action, et des **portes verrouillées** qui empêchent l'élève de courir
avant de marcher.

### Les 4 onglets (décision du 2026-11-24 : architecture « peau neuve »)

| Onglet | Rôle |
|---|---|
| **مساري** | Le chemin complet : 11 unités verrouillées séquentiellement, chacune se terminant par un **جسر** (pont-jalon). Une carte = une action, jauge d'avancement (jamais de pourcentage affiché). |
| **كويست** | L'écran d'accueil et la *quête du jour* : la prochaine action (Next Best Action), le rythme de la semaine, la position par rapport à la classe, les statistiques du مُرشد. Les **تدريبات** (620 items, 500 QCM + 120 définitions, 49 axes) s'ouvrent depuis ici, en sous-écran avec un bouton retour. |
| **الباك** | Tout ce qui concerne l'épreuve : les **30 sujets** 2013→2026, l'**امتحان تجريبي**, la **منهجية** (laboratoire de lecture des documents, 4 ateliers) et les **6 schémas à légender**. Les fréquences de verbes et d'unités y sont calculées sur les sujets réels. |
| **أنا** | Le journal, les notes, les statistiques, la sauvegarde et la réinitialisation. |

Les anciens onglets **البوصلة** et **تدريبات** ne sont plus des portes : ce sont des sous-écrans de
**الباك** et de **كويست**, avec une barre de retour. La barre du bas n'allume que quatre entrées
(`.onglets` / `.onglet`, cible ≥ 54 px) ; un sous-écran allume son parent.

### 🧭 La rubrique البوصلة (`Boussole.tsx`, `Methodologie.tsx`)

Ouverte depuis **الباك** (sous-écran, retour → الباك), elle affiche directement **مختبر الفضول** dans l’application. Les anciens écrans Miftah sont remplacés ; le repère **فعل ← دليل ← جواب ← فحص** reste explicité dans le laboratoire. Des listes de relecture facultatives précèdent les modèles, sans score ni blocage du travail sur papier. Dans les exercices de l'unité 1, l'aide ouvre un exemple de protéines en rappelant qu'il ne résout pas l'exercice ; la réponse et le focus sont conservés au retour. Le laboratoire autonome `/boussole/index.html` reste accessible sans compte. Voir [le module](modules/boussole/README.md).

**Données et limites.** Les brouillons du laboratoire courant sont inclus dans la sauvegarde JSON et dans la réinitialisation locales ; une ancienne sauvegarde sans ce champ ne les remplace pas. Ils ne sont pas liés au compte, restent lisibles sur un navigateur partagé et ne sont pas effacés par la déconnexion. Un export complet est refusé si la progression, le carnet ou les statistiques nécessaires sont illisibles. La sauvegarde et la réinitialisation n'incluent ni les carnets des anciens laboratoires autonomes, ni les fichiers téléchargés ou données serveur. Fermer les autres onglets avant d'importer ou d'effacer : les contrôles optimistes signalent certains conflits et préservent les brouillons temporaires, mais ne garantissent pas l'atomicité ni la fusion des modifications concurrentes. Le laboratoire ne produit ni score ni mise à jour de `kafaa`/SM-2. Une publication des extraits et PDF intégrés exige une **décision sur les droits** et une **relecture scientifique** ; elles ne sont pas établies par les tests. Voir l'[inventaire des ressources](plans/sources/INVENTAIRE-BOUSSOLE-2026-11-21.md) et le [protocole QA](plans/QA-BOUSSOLE-2026-11-21.md).

**Compte local : limite de sécurité.** Le compte ne chiffre pas les données du navigateur, ne protège pas les notes ou brouillons d'un autre utilisateur du même appareil et ne prouve pas la possession de l'adresse e-mail. Le hachage historique utilise SHA-256 avec un préfixe fixe, sans sel individuel ni dérivation lente : il n'offre pas une protection robuste contre les tentatives hors ligne. Ne pas réutiliser un mot de passe important. La compatibilité des anciens comptes est maintenue avec ou sans WebCrypto ; les anciens hachages de repli sont convertis après connexion réussie. Une évolution du stockage des mots de passe exige un modèle de menace et une migration étudiés, sans présenter ce compte comme une authentification serveur.

**Ateliers conservés** derrière «تمارين المنهجية الأخرى» :
- **العمليات الثلاث** : أصف / أفسّر / أحكم (question + لغة مفيدة + مثال combiné), sélection active.
- **تشخيص (3 QCM)** : erreur → rouge + `sonFaux()` + message doux (« خذ وقتك، لا عجلة ») et
  **on réessaie sans afficher la réponse** ; succès → `sonJuste()`, score compté **au premier
  essai**, résultat « حصلت على X / 3 » — rejouable à volonté → puis **مستويات التدريب**.
- **دليل أفعال التعليمة** : les 11 verbes officiels des commandes du Bac (حدّد, استخرج, صف, قارن,
  حلّل, فسّر, علّل, استنتج, أثبت, اقترح فرضية, مثّل) — définition + exemple.
- **6 مسارات المنهجية** : chaînes de résolution (ملاحظة → معلومة → تفسير → استنتاج, …) puis un
  **تمرين تطبيقي** QCM avec feedback vert/rouge après le choix.
- **4 مستويات التدريب** : القدوة المشروحة → التمرين الموجه → التمرين المستقل → تشخيص الخطأ,
  chacun ouvre les مسارات ; rappel non culpabilisant « لا تنتقل إلى المستوى التالي لمجرد أنك قرأت
  الطريقة ».
- **3ᵉ porte depuis تدريبات** : la carte « تمارين المنهجية » (`IcoTamrin`) ouvre le composant en
  `modeInitial="niveaux"` (par défaut : `'boussole'`) via le mode
  `methodoExos` d'`App.tsx` ; la fermeture (`setMode(null)`) **retourne à تدريبات** — l'onglet
  البوصلة, lui, ouvre le laboratoire.
- **الوحدة 1 · تركيب البروتين** : écran dédié (bouton « الوحدة 1 · تركيب البروتين · 10 تمارين » au
  bas des مستويات) avec **10 exercices interactifs** (مثّل, قارن, فسّر, حلّل, استنتج, استخرج,
  علّل, ركّب…) construits sur la clé فعل ← دليل ← جواب ← فحص, chacun avec **un schéma SVG** aux
  couleurs de l'app (port du commit arena `48afe8b`). Corrections du port : état `sourceExo`
  (collision d'index entre `methodes` et `exercicesUnite1` — les 6 مسارات ouvrent de nouveau le
  tamrin classique), feedback **rouge au faux** (`bg-clay-soft`, `sonFaux()`) au lieu du vert
  systématique d'arena, **retry sans révélation** (le « خطأ شائع » n'apparaît qu'après le bon
  choix), bonne réponse en **position variable** (rotation déterministe), schémas n°8
  (« graphique » → مسار الإفراز, il était vide) et n°6 (« استخراج ARNm » réutilisait le schéma de
  mutation) corrigés. **Variété des formats** (port `a79905c`) : un `format` d'exercice style Bac
  (مخطط تركيبي, تحليل وثيقة, منحنى تجريبي…) et un « السند » numéroté par exercice, affichés sur la
  carte et dans l'en-tête du tamrin. **وثيقة تفاعلية — preuve visuelle** (port `fa88370`) : chaque
  exercice propose une question et des **zones cliquables du schéma** (A/B/C/D) — il faut choisir la
  zone qui fait office de preuve **et** une proposition pour débloquer « افحص جوابي », la zone
  retenue s'affichant en encart (« الدليل المحدد: المنطقة … »). La **formulation de la preuve**
  (`preuve`) n'est plus donnée d'emblée : elle reste masquée tant que l'élève n'a pas cliqué une zone
  (avant : simple consigne « استخرج الدليل بنفسك »), puis s'affiche en encart « قارن اختيارك بالمرجع »
  — la preuve n'est donc plus offerte avant le geste d'extraction ; les schémas viennent de la version
  clarifiée arena (port `7ac24a4` : flux à 4 étapes, `sequence` dédié avec les règles A↔U, `graphique`
  « مسار إفراز البروتين », `expression` avec axes étiquetés) avec corrections maison : le schéma
  `mutation` reste en ADN (T, pas U) et chaque flèche a un marker dédié (sur arena, `sequence` et
  `graphique` pointaient un marker defined dans un autre SVG → flèche invisible en écran solo).
- **القبطان مفتاح — la mascotte guide** (nouveau composant `MascotteKunz.tsx`, ports `e73a484` +
  `41b5695`) : `personnage-pirate.webp` (la mascotte de la maison, pas le logo d'arena) avec un mot
  de méthode dans 7 endroits — l'accueil de منهجية, la liste de الوحدة 1, l'en-tête de chaque
  tamrin (« ما هو الفعل؟ أين الدليل؟ »), مساري, أنا, et l'en-tête de اليوم ; l'écran de démarrage
  gagne le pirate au-dessus du **titre texte « كنز العلوم Lite »** (conservé — convention « le nom
  partout », là où arena remplaçait le titre par une image).

### 🔮 Le moteur Next Best Action (`src/utils/moteur.ts`)

`prochaineAction(etat)` décide **toujours** la même chose, dans cet ordre de priorité :

1. **استئناف** — une leçon démarrée mais non terminée → on reprend à la phase exacte où l'élève s'est
   arrêté. Une séance interrompue n'est jamais perdue.
2. **الاسترجاع** — une leçon dont la date de révision SM-2 est arrivée → **priorité absolue**, elle
   bloque tout nouveau contenu (`retard bloquant`).
3. **حصّة جديدة** — une nouvelle leçon, **une seule par jour** (quota `seancesComptees`).
4. **حصّة إضافية** — un bonus par jour (`bonusJour`), pour l'élève qui veut aller plus loin.
5. **يكفي اليوم** — quota atteint → message de repos. Le repos fait partie de la méthode.
6. **النهاية** — les 58 leçons sont terminées.

### 🔒 Le chemin verrouillé (`CHEMIN` dans `programme.ts`)

Chaque unité est une liste ordonnée `[...prerequis, ...lecons, 'jalon:uX']`. **Un item n'est
accessible que si tout ce qui le précède est terminé.** Pas d'écran « liste des leçons », pas de
possibilité de sauter une unité. C'est la garantie anti-accumulation des lacunes.

### 🌉 Les jalons unités (`JalonUnite.tsx`)

À la fin de chaque unité, un **pont** à 3 étapes :
1. **بوّابة الجسر** — un QCM à choix unique sur la question de synthèse de l'unité, à répon­dir de
   mémoire (leçon fermée).
2. **مواجهة الفخّين** — l'élève confronte les pièges officiels de l'unité (`piegésAr`).
3. **آخر تفتيش** — synthèse finale avant l'ouverture de l'unité suivante.

Le pont validé → l'unité suivante se déverrouille.

### 🧩 Les 4 ateliers de synthèse (`AtelierDomaine1.tsx`, `AtelierImmunite.tsx`, `AtelierOrogenese.tsx`, `AtelierStructureTerre.tsx`)

Après le pont, une **ورشة** (atelier) se débloque dans l'onglet تدريبات. L'écran d'entrée de تدريبات
propose **trois portes (icônes)** : **أسئلة QCM** (les 620 items sur 49 axes), **ورشات الخرائط
الذهنية** (les 4 ateliers, chacun affiché avec sa condition de déblocage et un cadenas explicite tant
qu'il n'est pas atteint) et **تمارين المنهجية** ; à chaque retour sur l'onglet, le choix se
re-présente. مساري reste réservé aux leçons.
L'atelier transforme le cours lu en
manipulation : **ordonner des cartes, relier des notions, comparer** — puis **استرجاع نشط** (rappel
actif) et une « جملة من نوع البكالوريا » avant de valider.

| Atelier | Déblocage | Contenu |
|---|---|---|
| **ورشة تركيب المجال الأول** | les 5 unités du domaine 1 terminées | ordonner transcription puis traduction, comparer procaryotes/eucaryotes, 4 liens scientifiques, rappel actif |
| **ورشة المناعة** | جسر de l'unité « الدفاع عن الذات » | 3 lignes LB / LT4 / LT8, de la reconnaissance au résultat immunitaire |
| **ورشة الأوروجينيز** | جسر de l'unité « البنيات الجيولوجية… » | les 5 étapes du cycle orogénique, de l'extension à la collision |
| **ورشة بنية الأرض** | جسر de l'unité « بنية الكرة الأرضية » (u10) | ordonner les 5 enveloppes par profondeur (الليثوسفير → النواة الداخلية), lier état physique et preuve sismique, puis 3 questions de استرجاع نشط |

**Règles appliquées (identiques au protocole) :**

- **zéro écriture libre** : l'élève ne fait que cliquer ; aucune saisie nulle part ;
- **jamais de correction avant le bon choix** : en cas d'erreur → *message doux* (« ليست هذه
  البطاقة… ») + **remélange des cartes** (`utils/melange.ts`), sans afficher la réponse ;
- **anti-stress** : pas de %, pas de compteur de fautes, pas de chronomètre ; tous les nombres
  s'affichent en **chiffres latins** (`nb()` → `2 درس`, `58 درسًا`, `3295 XP`) ;
- **le contenu de consolidation vient après** : la « المعنى البيولوجي » et le rappel actif ne
  s'affichent qu'**après** la reconstruction complète, jamais avant ;
- le bouton **📖 (افتح الدرس)** ouvre la leçon liée **au-dessus** de l'atelier (état conservé) :
  `lecon_transcription`, `phase7_chapitres_13_14_2`, `phase21_chapitres_41_42_2` ;
- la clé `etat.ateliers[d1|immunite|orogenese|structure]` mémorise la fin de l'atelier → le bouton affiche
  « إعادة الفتح ✓ ». L'atelier reste rejouable à volonté.

Toutes les coques sont factorisées dans `AtelierCadre.tsx` (en-tête + rangs + bouton leçon).

### 🚪 Les portes dures des 6 phases (`ProtocoleRunner.tsx`)

**Aucun bouton « passer ».** Chaque phase a une porte qui active le bouton suivant :

| Phase | Durée | Porte |
|---|---|---|
| 1 — سؤال الدرس والقراءة الكاملة | 8 min | **lecture obligatoire** : le lecteur de leçon doit être **ouvert puis fermé** (voir ci-dessous) + QCM « combien d'étapes causales ? » |
| 2 — التقاط الأنماط | 3 min | classer les mots-clés par catégorie (avant/nouveau) |
| 3 — أول استرجاع بعد القراءة | 5 min | **QCM de rappel** (choix unique, 4 propositions) |
| 4 — الهيكل العظمي | 5 min | construire le squelette, puis le révéler |
| 5 — القراءة الموجهة | 15 min | QCM « quelle étape vient après la étape N ? » |
| 6 — الترسية | 10 min | **QCM de synthèse** + auto-évaluation contre l'erreur nucléaire |

**2 échecs à une porte QCM** → révélation de la réponse + la phase est marquée **هشّة** (fragile) et
reprogrammée à **J+1** au lieu de J+3. L'échec n'est pas puni, il est *utilisé*.

### 🔊 Couleurs et sons des réponses

- **Réponse correcte** → l'option prend le **vert** (`border-forest bg-sage`) + bloc « إجابة صحيحة »
  + petit carillon ascendant (`sonJuste()`).
- **Réponse fausse** → **l'option choisie passe en rouge** (`border-clay bg-clay-soft`) + message doux
  (« أعد المحاولة. خذ وقتك ») + un **son différent** et plus grave (`sonFaux()`), puis remélange des
  options. **La bonne réponse n'est jamais révélée avant le bon choix.**
- Les sons sont **synthétisés en Web Audio** dans `src/utils/son.ts` : aucun fichier audio, aucun poids
  ajouté, tout fonctionne hors ligne. Les 4 ateliers, le diagnostic de منهجية et les 2 portes QCM du
  protocole suivent la même règle vert/rouge.

### 🎉 La célébration de fin de phase (`Fetes.tsx`)

À la fin de **chaque** phase (bouton « انتهيت من هذه المرحلة »), l'écran de célébration s'ouvre :

- **la personnification كنز العلوم (mascotte pirate)** sort et salue : image PNG de la mascotte
  (`public/personnage-pirate.webp`, détourée, 58 ko au lieu de 1 001 ko, dans le précache de la
  coquille pour fonctionner hors ligne) avec rebond/sourire animés et bulle de encouragement sans culpabilisation ;
- **un son d'applaudissements** (`sonApplaudissement()`) : faux-bruit filtré + lardon vainqueur,
  générés en Web Audio — toujours offline, toujours doux ;
- **des feux d'artifice** sur canvas léger (~5 s puis s'arrêtent, `prefers-reduced-motion` respecté,
  aucune bibliothèque) ;
- **le résumé d'or imprimable** (`#zone-impression`) : إشكالية، السلسلة السببية، الدليل الوثائقي،
  بنية الإجابة في البكالوريا، الخطأ الشائع، سؤال الاسترجاع، الكلمات المفتاح — le bouton
  « 🖨️ اطبع الملخّص الذهبي » appelle `window.print()` avec une CSS `@media print` qui n'imprime
  **que** ce bloc (l'élève l'imprime pour le mémoriser) ;
- le bouton « متابعة ← المرحلة N » enchaîne sur la phase suivante ; après la phase 6, il mène à
  l'écran de clôture. L'ancien écran « مكافأة المرحلة 1 » est absorbé par cette célébration.

### 🔁 Retour libre aux phases (bouton ←)

L'en-tête de **chaque phase (1 → 6)** porte une flèche **←** qui n'**éjecte pas** du protocole :
elle ouvre le **fهرس مراحل المراجعة** (la liste des 6 phases avec leur titre, leur objectif et leur
durée). L'élève peut revenir à n'importe quelle phase **déjà atteinte**, et reprendre la phase en
cours en un clic. Les phases non encore ouvertes restent désactivées (« تُفتح بعد إنهاء المرحلة
السابقة »). Une phase déjà terminée reste franchissable sans devoir revalider sa porte.

La sortie totale du protocole (→ onglet اليوم) se fait uniquement depuis ce fهرس (bouton خروج من
الدرس).

### 🌿 Le Mُرشد (Morchid)

Le Mُرشد parle **uniquement** aux phases 1, 3, 5, 6 + l'écran de clôture (`PHASES_PARLANTES`).
Partout ailleurs, l'élève est seul avec le contenu — la méthode se tait pour ne pas devenir du bruit.

La valve **« أنا عالق »** (je suis bloqué) donne **2 indices par phase**, pas plus. Demander de l'aide
est un droit, en abuser est impossible.

Le Mُرشد **compte aussi les réponses** (`src/utils/stats.ts`, clé `kunz_stats_v1`) : bonnes réponses et
fautes, par source (`phase | revision | jalon | atelier | exercice`) et sur les 45 derniers jours.
Présenté en **comptes bruts, jamais en pourcentage**, avec un message neutre et non culpabilisant
(« الخطوات السببية قبل اليقين : أعِد قراءة الدرس ثم أعد المحاولة »). Les statistiques sont effacées
avec le reste par `viderStockage()`.

### 🧊 L'anti-stress

- **Aucun pourcentage** affiché nulle part.
- **Aucune série de jours** qui risque de se casser (le rythme est présenté en jours comptés, pas en
  série `🔥 12 jours`).
- **Aucun compte à rebours angoissant** : le minuteur par phase est soft, désactivable.
- **Aux entraînements تدريبات** : mauvaise réponse → message doux + remélange des options, la bonne
  réponse n'est **jamais** révélée avant le bon choix ; aucun score chiffré en fin de journée, juste
  le compte « أجبت n من m ».
- **Les nombres en chiffres latins, partout** (`nb`, `nbMin`, `nbGrand`, `joursNb`, `minutesNb`,
  `compteLecons`, `compteLeconsAdj`) — choix explicite du produit : `1 يوم`, `5 أيام`, `2 درس من 5
  دروس`, `58 درسًا`, `3295 XP`. Seul l'accord arabe du nom est conservé
  (`1 درس مستحقّ` / `2 درس مستحقّان` / `4 دروس مستحقّة`).

### 📅 Le calendrier scolaire (`src/utils/dates.ts`)

Les 11 unités ont chacune une **fenêtre** (`fenetre`) alignée sur l'année scolaire algérienne (début
2026-09-14) et un **poids au Bac** (`poidsBac`). L'écran اليوم indique si l'élève est dans la fenêtre
de son unité — l'objectif est de rester synchronisé avec la classe, un cours à la fois.

---

## ☁️ Synchronisation (`src/utils/sync.ts`)

L'application reste **offline-first** : elle fonctionne intégralement sans compte, sans réseau, sans
serveur. Une couche *additive* et **silencieuse** permet en plus à l'éditeur de récupérer un résumé de
progression de chaque élève, **activée dès l'inscription** (choix produit — voir ci-dessous).

### Côté élève — activée à l'inscription, désactivable

- Si les variables `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sont absentes du `.env`, **rien ne
  s'affiche** et rien n'est envoyé (vérifié au navigateur).
- La synchronisation est **active dès la création du compte** (`consentementSync: true` par défaut
  dans `etatVierge()` et forcé dans `onCompteValide`) — aucun dialogue, aucun frein dans le parcours.
- Un réglage discret reste dans l'onglet أنا (« المزامنة مع المطوّر ») : l'élève peut l'arrêter à tout
  moment (texte décrivant l'état courant). C'est la seule interface visible de la fonction.
- L'envoi est **best-effort** : debounce 6 s après chaque changement de l'état, envoi immédiat à la
  perte de visibilité et au retour du réseau. Tout échec est silencieux — l'app n'en dépend jamais.
- **Vie privée par construction** : ne sont envoyés que des compteurs et des listes d'IDs (leçons
  terminées, jalons, ateliers, drills, XP, wilaya/daïra). **Jamais** le mot de passe (même haché), jamais
  le texte des notes du carnet, jamais les réponses écrites.
- **Migration des installs existantes** : `consentementSync` absent vaut `true` (la condition d'envoi
  est `=== false`), donc les élèves déjà inscrits se mettent à synchroniser dès la prochaine visite.

### Côté éditeur — mise en route (5 minutes)

1. Créer un projet gratuit sur [supabase.com](https://supabase.com) (connexion GitHub).
2. Copier `supabase/schema.sql` dans **Studio → SQL Editor → Run** (table `eleves` + RLS).
3. Copier `.env.example` en `.env`, y coller **Project URL** et **anon public key**
   (Project Settings → API).
4. Reconstruire. Les élèves voient désormais la carte d'invitation.
5. Lire les données dans **Studio → Table Editor** ou avec les **10 requêtes prêtes** de
   `scripts/queries-admin.sql` (liste des élèves, top XP, répartition par wilaya, niveau d'activité,
   leçons fragiles agrégées, taux de réussite…).

### Sécurité

La politique RLS accorde au rôle `anon` **l'écriture seulement** (insert/update), jamais la lecture :
quiconque extrairait la clé publique publique ne pourrait pas lire les données des autres élèves.
Depuis v0.9.1, la policy UPDATE exige un **jeton d'écriture** (`jeton`, aléatoire, généré à la
création du compte, envoyé en en-tête `x-kunz-jeton`) : il n'est donc plus possible d'écraser la
fiche d'un élève connu sans connaître son jeton — les lignes anciennes sans jeton restent
modifiables (compatibilité). Le risque résiduel est l'insertion de lignes parasitées sous un email
nouveau — acceptable pour une app scolaire gratuite.

---

## 📖 Correspondance champ du résumé ↔ phase

La source de vérité est `src/data/lessonGoldSummaries.ts` (**58 Résumés d'Or**). Chaque champ alimente
une phase précise :

| Champ `LessonGoldSummary` | Phase | Utilisation |
|---|---|---|
| `questionLecon` (leconsPassives) | 1 | **la question de la leçon, affichée en premier** |
| `missionAr` | 1 | l'énigme affichée comme boussole de lecture |
| `vocabulary` | 2 | jetons à classer (avant/nouveau) |
| `missionAr` + `recallQuestionAr` | 3 | le premier rappel actif après lecture |
| `mechanismAr` | 4 | squelette : cases vides → révélation |
| `mechanismAr` + `evidenceAr` | 5 | étapes causales + preuve documentaire |
| `bacSentenceFrameAr` + `commonErrorAr` | 6 | production écrite + correction atomique |
| `recallQuestionAr` + `vocabulary` | File SM-2 | carte de rappel actif (`SessionRevision`) |

### Les 25 cours interactifs

25 fichiers HTML autonomes (schémas SVG, activités, quiz) dans `public/lecons/` couvrent 46 leçons.
Le **lien du cours s'ouvre dès la phase 1** (`questionLecon` affichée juste au-dessus).

**La lecture est matériellement obligatoire** : le bouton « أنهيتُ قراءة الدرس ✓ » reste **grisé**
tant que le lecteur n'a pas été ouvert **puis fermé**. La condition est portée par `App.tsx`
(`leconLue`), pas par une simple case à cocher — il n'y a donc **aucun moyen d'éviter la lecture**.
Un message de porte (« بوّابة القراءة… ») rappelle la règle tant qu'elle n'est pas remplie.

- Leçons **avec** cours HTML → le lecteur affiche le fichier (`iframe`, avec `onError` de repli).
- Leçons **sans** cours HTML → le même bouton ouvre le lecteur, qui affiche alors le **Résumé d'Or**.

### ✍️ Zéro écriture libre

Aucune vérification n'exige de taper du texte : **chaque contrôle est un QCM à choix unique à 4
propositions** (`ChoixUnique` / `OptionsMcq`). Réponse fausse → message doux (« ليست الإجابة ») +
remélange des propositions ; **jamais de correction avant le bon choix**. C'est le cas :

- en phase 3 et phase 6 du protocole,
- à la بوّابة du جسر (fin d'unité),
- à l'étape 3 de la révision SM-2 (`SessionRevision`).

Aucun champ de saisie n'existe dans l'application (seules les préférences de `Ana.tsx` sont
éditables).

### ⬛ Texte noir des leçons

Règle impérative : **le texte des 25 leçons est noir**. Un bloc `/* RÈGLE : texte noir */` est
injecté dans chaque fichier HTML ; 635 triplets `rgb(31,92,69)` et 17 hexadécimaux tronqués, laissés
par un ancien script (`unifier-theme.mjs`, supprimé depuis), ont été réparés en `rgb(...)` pour que
rien ne devienne illisible.

---

## 🔁 La boucle mémoire (SM-2, `src/utils/srs.ts`)

1. **Fin de leçon** → `premiereRevision()` programme J+1 (fragile) ou J+3 (normal).
2. **Le jour venu**, le moteur NBA **bloque les nouvelles leçons** et impose l'`استرجاع`.
3. **`SessionRevision`** en 3 étapes : révélation du rappel → auto-check des termes (mots-clés) →
   **QCM de synthèse** (choix unique) + auto-évaluation.
4. **Auto-évaluation** : سهل / متوسط / صعب → qualité 5 / 4 / 3 / 1 → `mettreAJourSrs` recalcule
   l'intervalle (J+1 → J+3 → J+7 → J+14 → J+28).
5. **Aucune date n'est affichée à l'élève** — c'est la machine qui gère. Il voit seulement « حان موعد
   استرجاع هذا الدرس ».

---

## 📊 Chiffres (générés depuis le code)

<!-- METRICS:START -->

<!-- Bloc généré par `node scripts/sync-metrics.mjs`. Ne pas modifier à la main. -->

| Métrique | Valeur |
| --- | --- |
| Unités du programme | **11** |
| Leçons référencées | **56** |
| Résumés dorés | **58** (relus : 0) |
| Sujets officiels structurés | **28** |
| Sujets avec éléments de réponse | **28** |
| Axes de drills | **49** |
| Items de drills | **700** (4 fichiers) |
| Fichiers de tests | **60** |
| Coquille hors ligne (téléchargée d'office) | **2.47 Mio** (6 entrées) |
| Contenu hors ligne (sur demande) | **4.19 Mio** (28 entrées) |

<!-- METRICS:END -->

## 📱 Canal de diffusion : PWA installable (et non Play Store)

Le canal officiel est la **PWA installable** : `manifest.webmanifest` + service worker, ajout à
l'écran d'accueil depuis le navigateur. C'est le seul canal supporté, pour trois raisons
concrètes :

- **mise à jour immédiate** — un correctif de contenu est en ligne dès le déploiement, sans
  validation de store (crucial quand un corrigé doit être rectifié en pleine période de révision) ;
- **poids** — l'APK embarque un WebView et pèse plusieurs fois la coquille de 1,91 Mio ;
- **aucun compte développeur** — pas de frais ni de politique de contenu à tenir.

Le dossier `android/` (coque Capacitor `com.bousala.ouloum`) existe à titre **expérimental** :
il sert à tester sur émulateur. **Il n'est pas publiable en l'état** — signature, icônes de
store, politique de confidentialité Play et mise à jour différentielle ne sont pas traités.
Ne pas le présenter comme un canal de diffusion.

## 🏗️ Stack

- **React 19 + TypeScript 7 + Vite 8** — SPA léger
- **Tailwind CSS 4** (plugin `@tailwindcss/vite`) — design RTL mobile-first, palette olive claire
- **PWA manuelle** : `public/manifest.webmanifest` + `public/sw.js`. Le précache est **en deux
  niveaux** : la *coquille* (interface + images, **1,91 Mio**) est toujours téléchargée ; le
  *contenu lourd* (25 leçons HTML, laboratoire Boussole, 2 PDF, **4,19 Mio**) ne l'est que sur
  demande explicite, avec son poids annoncé. Le chunk des sujets de bac (≈ 490 ko) reste en ligne
  et n'entre pas dans le cache.
- **localStorage** (`src/utils/storage.ts`, clé `murajih_svt_v1`, version 2) — offline-first, aucun
  serveur
- **Zéro dépendance lourde** : pas de d3, jspdf, framer-motion…

## 📁 Structure

```
app-svt-bac/
├── index.html                    # lang="ar" dir="rtl"
├── public/
│   ├── manifest.webmanifest      # PWA (nom عربي، rtl، standalone)
│   ├── sw.js                     # service worker (coquille + contenu, en 2 niveaux)
│   ├── icon.svg
│   └── lecons/                   # 25 fichiers HTML de cours interactifs (46 leçons)
├── src/
│   ├── main.tsx                  # racine + enregistrement du SW
│   ├── index.css                 # Tailwind + base RTL
│   ├── App.tsx                   # 4 onglets : مساري / كويست / الباك / أنا (+ sous-écrans)
│   ├── types.ts                  # État (jalons, notes, journal, séances, bonus, drills)
│   ├── data/
│   │   ├── lessonGoldSummaries.ts # 58 résumés d'or (source de vérité du contenu)
│   │   ├── programme.ts           # 11 unités + CHEMIN + fenêtres + poidsBac + piegésAr
│   │   ├── protocole.ts           # 6 phases (durées 8/3/5/5/15/10 = 46 min)
│   │   ├── qcmLecons.ts           # ⭐ 58 QCM écrits à la main (58/58 × 2 questions, 4 options)
│   │   ├── leconsPassives.ts      # mapping lessonId → cours HTML + question
│   │   └── drills/                # ⭐ 620 items en 3 chunks lazy (domaine1-3.ts) + axes.ts (49 axes)
│   ├── utils/
│   │   ├── moteur.ts              # ⭐ Next Best Action, verrous, quota, rythme, fragilité
│   │   ├── srs.ts                 # SM-2 (premiereRevision / mettreAJourSrs / aReviserAujourdhui)
│   │   ├── dates.ts               # calendrier, nombres en chiffres latins, grammaire (compteLeconsAdj…)
│   │   ├── qcm.ts                 # qcmPourLecon() — aucun généré de secours (retourne null)
│   │   ├── drills.ts              # chargement lazy des 3 chunks + composition des journées de 10
│   │   ├── stats.ts               # ⭐ statistiques du Mُرشد (clé kunz_stats_v1, bloat-free)
│   │   ├── sync.ts                # ⭐ synchronisation optionnelle vers Supabase (opt-in, best-effort)
│   │   ├── storage.ts             # localStorage (charger/sauvegarder/vider)
│   │   └── accents.ts             # couleurs des 3 domaines
│   └── components/
│       ├── Aujourdhui.tsx         # ⭐ اليوم : NBA + rythme + position classe + stats + invitation sync
│       ├── Masari.tsx             # ⭐ مساري : chemin verrouillé
│       ├── Exercices.tsx          # ⭐ تدريبات : choix QCM/ورشات الخرائط الذهنية/تمارين المنهجية (3 icônes) + 49 axes verrouillés + journées de 10
│       ├── Boussole.tsx           # 🧭 المختبر embarqué + aide contextuelle
│       ├── Methodologie.tsx       # ateliers de méthodologie et accès au laboratoire
│       ├── MascotteKunz.tsx       # القبطان مفتاح — la mascotte guide (mascotte.webp, 7 emplacements)
│       ├── Ana.tsx                # ⭐ أنا : journal + notes + stats complètes + réglage sync
│       ├── CarteStats.tsx         # compteurs du Mُرشد (versions compacte Aujourdhui / complète Ana)
│       ├── CarteSync.tsx          # invitation une fois (اليوم) + réglage permanent (أنا)
│       ├── JalonUnite.tsx         # pont à 3 étapes en fin d'unité (étape 1 = QCM)
│       ├── ProtocoleRunner.tsx    # ⭐ 6 phases + portes + fهرس des phases + Mُرشد + clôture
│       ├── SessionRevision.tsx    # rappel SM-2 en 3 étapes (étape 3 = QCM)
│       ├── LecteurLecon.tsx       # lecteur de leçon (HTML + résumé d'or) — porteur de `leconLue`
│       ├── Communs.tsx            # composants partagés (Carte, ChoixUnique, OptionsMcq…)
│       └── Icones.tsx             # icônes SVG inline
├── scripts/
│   ├── importer-drills.mjs        # ⭐ parse le banque MD → src/data/drills/*.ts (620 items)
│   ├── verifier-drills.mjs        # validateur des chunks générés (0 problème bloquant)
│   ├── analyser-drills.mjs        # stats brutes du fichier source (avant import)
│   ├── queries-admin.sql          # ⭐ 10 requêtes Supabase prêtes pour l'éditeur
│   └── recolorer-svg.mjs          # recolorisation des SVG de leçons (outillage)
├── supabase/
│   └── schema.sql                 # ⭐ table eleves + RLS (écriture seule pour l'app)
├── .env.example                   # modèle des clés Supabase (VITE_SUPABASE_URL / _ANON_KEY)
├── .gitignore                     # .env ignoré — les clés réelles ne remontent jamais
└── README.md
```

## 🚀 Installation

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # tsc -b && vite build  → dist/
npm run preview  # tester la version de production
```

> PWA : le service worker **n'est pas** enregistré en mode `dev` (HMR). Faites `npm run build` +
> `npm run preview` pour tester l'installation et le mode hors-ligne.

> Synchronisation : sans fichier `.env`, l'app est 100 % locale. Pour activer l'envoi des résumés de
> progression (Supabase), voir la section ☁️ ci-dessus.

## 🧠 Parcours élève (journée type)

1. Il ouvre l'app → **اليوم**. Une seule carte : la prochaine action décidée par le moteur.
2. Soit **استئناف** (reprendre là où il s'est arrêté), soit **الاسترجاع** (une révision due, prioritaire),
   soit **حصّة جديدة** (une nouvelle leçon — une seule/jour).
3. La nouvelle leçon ouvre le protocole : **question + lecture du cours obligatoire** → classification
   des mots-clés → **premier rappel après lecture (QCM)** → squelette → lecture guidée → QCM du Bac.
   L'élève peut revenir au fهرس des phases à tout moment (bouton ←), sans perdre sa progression.
4. À la fin : message de clôture du Mُرشد + programmation de la prochaine révision (J+1 si fragile,
   J+3 sinon).
5. Quand le moteur dit **يكفي اليوم**, l'élève s'arrête. Le repos fait partie de la méthode.
6. En fin d'unité : le **جسر** (jalon à 3 étapes) débloque l'unité suivante.

## 🧹 Nettoyage déjà effectué sur `lessonGoldSummaries.ts`

Le fichier fourni (71 entrées) a été traité avant intégration :

- ✅ **13 doublons fusionnés** → 58 leçons uniques (ex. `synapse` ≡ `phase9_chapitres_17_18`,
  `subduction` ≡ `d3-u9-l2-benioff` ≡ `phase17_chapitres_33_34`).
- ✅ Mot anglais `presenting` effacé d'une phrase arabe.
- ✅ `D-غالاکتوز` : « ک » farsi remplacé par « ك » arabe.
- ✅ `البرنس` (×21) uniformisé en `الوشاح` (manteau).
- ✅ Homonyme `البذرة` désambiguïsé : Granum (U6) conservé, noyau interne (U10) → `النواة الداخلية`.
- ✅ `enzyme_inhibitors` et `amino_acid_behavior` rattachés à U3 comme **متطلبات سابقة**.

### ⚠️ Ce qu'il reste à faire (statut éditorial)

- **0/58 leçon relue** (`review.reviewed: false`). Toutes sont en `adaptation_pedagogique`.
  → Prévoir une relecture professeur et passer `status` à `manuel_officiel_verifie`.
- ✅ **Ordre des étapes U1-L1 corrigé (v0.6)** : le `mechanismAr` de la leçon 1 de l'unité 1 suit
  maintenant l'ordre pédagogique transcription → ARN → traduction (تُنسخ المعلومة الوراثية … داخل
  النواة avant يتم تركيب البروتين … الريبوزومات). Le QCM de séquence en **P5 est généré
  dynamiquement depuis ce tableau** (`ProtocoleRunner.tsx` : `juste = mechanismAr[i+1]`) : il suit
  automatiquement l'ordre corrigé — aucune incohérence introduite.
- **`bacSentenceFrameAr` manquant** sur la première leçon (le cadre P6 s'affiche vide).
- Convention d'IDs non uniforme (`phaseN_chapitres_X_Y` vs `dN-uM-lK-*`) — fonctionnel, mais à
  normaliser si vous éditez le fichier à la main.

## 🧪 Entraîneur et simulation d'épreuve (Phases 10–12 du plan V2)

- **Entraîneur** (`EntraineurSujet.tsx`) : sur les 28 sujets corrigés, l'élève lit le verbe,
  rédige dans un champ local, puis s'auto-évalue **0 / 1 / 2**. Le résultat est qualitatif
  (هشّ / في الطريق / متين) — **aucune note sur 20 n'est jamais calculée ni affichée**.
- **Simulation 270 min** (`SimulationEpreuve.tsx`, `src/utils/simulation.ts`) : temps réparti
  au prorata des **barèmes réels** (5/7/8, pas trois tiers égaux), 15 min de relecture
  réservées, chrono qui **ne se bloque pas** à zéro. La synthèse parle de minutes et
  d'exercices terminés, jamais de niveau en SVT.
- **Moteur `bridge.ts`** : 8 compétences C1–C8, confiance pondérée par le nombre de preuves
  (1 preuve → ×0,75), tri qui met devant les compétences **mesurées** les plus faibles (une
  compétence jamais travaillée ne passe plus avant une faiblesse réelle). Un accès au Bac
  reste toujours possible : la couverture est une **recommandation**, jamais un verrou.
- **Mesure d'impact** (`src/utils/telemetrie.ts`, `plans/MESURE-IMPACT-PILOTE.md`) : compteurs
  100 % locaux, aucun réseau, export JSON anonyme à la seule initiative de l'élève.

## 🗺️ Roadmap historique

Les entrées ci-dessous décrivent les versions au moment de leur création, pas nécessairement le comportement actuel. En particulier, la synchronisation n'est plus activée par défaut : elle requiert une configuration et un consentement explicite.

- **v0.1** — protocole 6 phases + file SM-2 + suivi offline.
- **v0.2** — rubrique الدروس : 46 cours interactifs reliés à la méthode.
- **v0.3 (actuelle)** — **architecture OPUS** : 4 onglets (اليوم / مساري / البكالوريا / أنا), moteur
  Next Best Action, chemin linéaire verrouillé, portes dures, jalons unités (جسر), Mُرشد, anti-stress,
  lecture du cours obligatoire en phase 1, calendrier scolaire aligné.
- **v0.3.1** — renommage **كنز العلوم Lite** + écran de démarrage : vidéo muette `ouverture.mp4`
  puis bouton « ابدأ ← ».
- **v0.3.2 (actuelle)** — **58/58 QCM écrits à la main** (générateur de secours supprimé : il
  produisait 3 options et deux bonnes réponses) ; **réparation des 25 leçons** (635 `rgb()` cassés,
  17 hex tronqués, règle « texte noir » injectée) ; **correction de l'ancrage RTL des SVG** (58
  textes déportés hors de leur cadre, mesurés au `getBBox` puis `text-anchor` corrigé) ;
  **lecture réellement obligatoire en phase 1** (le lecteur doit être ouvert puis fermé) ;
  **bouton ← vers le fهرس des phases** dans chaque phase ; **suppression des encadrés
  مفتاح المنهجية / تذكير منهجي**.
- **v0.3.3** — **branche arena fusionnée : les 3 ateliers de synthèse** (المجال الأول /
  المناعة / الأوروجينيز), remaniés : plus de divulgation de la réponse avant le bon choix,
  **remélange des cartes après erreur**, état sorti du DOM dans
  l'atelier immunite, factored coque `AtelierCadre`, clé `d1`/`domaine1` réconciliée,
  `onTerminer` branché sur les 3 ateliers, **bouton 📖 vers la leçon qui préserve l'état de
  l'atelier**.
- **v0.4.0** — **compte local de l'élève** : écran obligatoire après la vidéo
  (email + mot de passe haché SHA-256 + wilaya + daïra, 58 wilayas / 548 dairas), session par
  onglet, déconnexion et suppression du compte dans أنا et dans la shara ; **badge XP + jours
  d'activité en haut à gauche** (niveau, ventilation des points, flash « + … XP » à chaque gain) ;
  **tous les nombres passés en chiffres latins** (`nb()` remplace `enArabe()` partout dans
  l'application).
- **v0.5.0 (actuelle)** — **onglet تدريبات** (remplace البكالوريا) : 620 items du programme officiel
  (500 QCM + 120 définitions converties en QCM 4 options, 49 axes, 3 chunks lazy-loaded par
  domaine, bon réponse toujours `o[0]`, l'UI remélange l'affichage) ; **même verrouillage linéaire
  que مساري** (les axes d'une unité ne s'ouvrent qu'après le جسر de la précédente) ;
  **statistiques du Mُرشد** (fautes/bonnes
  réponses par source, 45 derniers jours, clé séparée `kunz_stats_v1`, message neutre sans
  pourcentage) ; **XP des drills** (3 points par item réussi, dérivé de `etat.drills`).
- **v0.5.1** — **synchronisation** : couche additive offline-first (Supabase) permettant à l'éditeur
  de récupérer un résumé de progression par élève — **activée dès l'inscription**, désactivable dans
  أنا (voir section ☁️).
- **v0.5.2** — **retour sensoriel des QCM + célébration de fin de phase** : vert/rouge sur les
  réponses (sans jamais révéler la bonne avant le bon choix), sons distincts juste/faux + applaudissements
  synthétisés (Web Audio, zéro fichier), écran de célébration à chaque phase de fin : personnification
  كنز العلوم qui salue, feux d'artifice canvas, et résumé d'or imprimable seul via `@media print`.
- **v0.5.3** — **ateliers déplacés de مساري vers تدريبات** : l'écran d'entrée de تدريبات présente
  deux choix (icônes) — **أسئلة QCM** ou **الورشات التطبيقية** — et se re-présente à chaque retour sur
  l'onglet ; les 3 ateliers y sont listés avec leurs conditions de déblocage (جسور du domaine 1, u4,
  u11) et un cadenas explicite s'ils ne sont pas encore atteints. مساري ne contient plus que le chemin
  des leçons.
- **v0.5.4** — **restauration de la rubrique البكالوريا (5e onglet)** : récupérée depuis la branche
  `arena/7a3f2e84-kunz-el-ouloum-lite` (supprimée dans `12db8ff`) et modernisée — date du Bac +
  jours restants en messages doux, الامتحان التجريبي à J-56, compteur de نسخ (`etat.copies`
  réintroduit), aperçu du poids des 11 unités (`poidsBac` + progrès), archive datée des جسور
  écrites ; chiffres latins `nb()`, icône `IcoDiplome` recréée, barre du bas à 5 onglets.
- **v0.5.5** — **rubrique منهجية (5e onglet) remplace البكالوريا** : port de `Methodologie.tsx`
  depuis la branche arena (état final `db7a65c`) — accueil « لا تحفظ الإجابة » + تشخيص de 3 QCM
  (vert/rouge + `sonJuste`/`sonFaux`, on réessaie sans révéler la bonne réponse, score au 1er
  essai), guide des 11 verbes des commandes, 6 مسارات المنهجية et un تمرين تطبيقي ; `Bac.tsx` et
  `etat.copies` retirés. **4e atelier « بنية الأرض »** (`AtelierStructureTerre.tsx`) : porté,
  intégralement traduit en arabe (il était en français), sons ajoutés, marqué dans
  `etat.ateliers.structure`, listé dans تدريبات avec cadenas جسر u10.
- **v0.5.6** — **la méthode-clé dans منهجية** (port du commit arena `4bc29e2`) : accueil 🔑 « فعل ←
  دليل ← جواب ← فحص », écran **المفتاح** (4 mouvements + علامات الأمان), écran **العمليات الثلاث**
  (أصف · أفسّر · أحكم avec مثال combiné), écran **4 مستويات التدريب** (القدوة المشروحة → تشخيص
  الخطأ), badge « المفتاح » en en-tête ; les 11 verbes et les 6 مسارات passés en version condensée
  (définition + exemple / chaîne seule). Conventions maison conservées : sons, vert/rouge, retry sans
  révélation, score au 1er essai, « العودة إلى البداية ».
- **v0.5.7** — **3ᵉ porte « تمارين المنهجية » dans تدريبات** (port du commit arena `baa2f60`,
  adapté) : prop `modeInitial` de `Methodologie` (`'accueil' | 'niveaux'`), icône `IcoTamrin`
  (feuille cochée), nouveau mode `methodoExos` ouvert par la 3ᵉ carte de تدريبات — ouverture
  directe sur les 4 مستويات, fermeture → retour à تدريبات (et non اليوم comme sur arena) ;
  **aucun 6ᵉ onglet** : la barre du bas reste à 5 onglets pour ne pas opposer تمارين à تدريبات.
  Ordre de la barre : **اليوم / مساري / منهجية / تدريبات / أنا** (تدريبات déplacé après منهجية,
  avant أنا).
- **v0.5.8** — **10 exercices interactifs sur la synthèse protéique** dans منهجية (port du commit
  arena `48afe8b`, corrigé) : écran « الوحدة 1 · تركيب البروتين » accessible depuis les مستويات
  (bouton au bas de la 3ᵉ porte), 10 exercices verbes+objectif structurés فعل ← دليل ← جواب ← فحص
  (bonne réponse en position variable), 10 schémas SVG inline ; conventions maison : sons
  `sonJuste`/`sonFaux`, vert au juste / rouge au faux, retry sans révélation (« خطأ شائع » révélé
  après le bon choix seulement) ; bug de collision d'index corrigé par l'état `sourceExo` (les 6
  مسارات mènent de nouveau au tamrin classique) ; schémas n°8 et n°6 réécrits. **Variété des
  formats** (port du commit arena `a79905c`) : chaque exercice porte un `format` d'exercice style
  Bac (مخطط تركيبي, تحليل وثيقة, منحنى تجريبي, مقالة تركيبية…) et un `document` « السند 1 … 10 » —
  affichés sur la carte de la liste (`format · verbe` + السند, l'objectif restant dans l'écran
  exercice) et dans l'en-tête de l'exercice.
- **v0.5.9** — **preuve visuelle, schémas clarifiés et la mascotte guide** (ports des commits arena
  `7ac24a4`, `231b770`, `e73a484`, `41b5695`, `fa88370`, tous corrigés) : chaque tamrin de الوحدة 1
  devient une **وثيقة تفاعلية** — question + zones cliquables A/B/C/D sur le schéma, zone de preuve
  obligatoire avant la validation ; la formulation de la preuve n'est plus affichée d'emblée (masquée
  jusqu'au clic d'une zone, puis « قارن اختيارك بالمرجع ») ; les 10 schémas proviennent de la version clarifiée arena avec
  fix maison (schéma `mutation` en ADN — T, pas U — et markers fléchés dédiés par schéma, invisibles
  sur arena en écran solo) ; nouveau composant **`MascotteKunz.tsx`** (القبطان مفتاح) diffusé dans
  l'accueil منهجية, الوحدة 1, les tamrins, مساري, أنا et l'en-tête de اليوم — sur arena il utilise
  une seule image (la mascotte, `mascotte.webp` / `personnage-pirate.webp`) ; l'écran démarrage affiche le
  pirate au-dessus du titre texte conservé (arena remplaçait le titre par une image, ce qui faisait
  disparaître le nom « كنز العلوم Lite » du premier écran) ; `Bac.tsx` (existant encore sur arena)
  ignoré ; retry sans révélation, sons et feedbackTon maison préservés partout.
- **v0.5.10** — **la preuve n'est plus offerte + محرّر الجواب (audit pédagogique)** : (1) dans chaque
  exercice, la formulation de la preuve reste masquée tant qu'aucune zone du schéma n'est cliquée
  (consigne « استخرج الدليل بنفسك », puis encart « قارن اختيارك بالمرجع ») — l'extraction n'est plus
  faite à la place de l'élève ; (2) nouveau mode **« ابنِ جوابك · بطاقات »** ouvert depuis un exercice
  réussi : la réponse modèle est découpée en segments et l'élève reconstruit le paragraphe en
  choisissant la bonne tuile à chaque emplacement (3 candidats, rotation déterministe, retry sans
  révélation, `sonJuste`/`sonFaux`), zéro champ de saisie, puis جواب assemblé + grille de barème
  (سند · تحليل · ربط · استنتاج) et خطأ شائع — sans pourcentage ni compte à rebours.
- **v0.5.11** — **cartes « كفاءة » SM-2 (audit pédagogique)** : chaque réussite d'un exercice من
  الوحدة 1 crée une **بطاقة كفاءة** (`etat.kafaa`, clé `methodo{index}`) programmée par la **même
  `mettreAJourSrs`** que les leçons — réussite directe → J+3 (qualité 5), réussite après erreurs →
  J+1 (qualité 3), puis l'échelle 3→7→14→28 jours ; la carte retient verbe, titre et « fiche »
  (خطأ شائع) à réécarter. Sur اليوم, une **revue courte** (2 minutes, mascotte, zéro pourcentage)
  s'affiche quand une carte est due : « أتقنتها » ou « كافحت قليلًا » re-programme la SM-2,
  « أتدرّب على التمرين ← » ouvre منهجية — au plus **2 revues par semaine** (`kafaaHebdo`), sans
  bloquer la tâche unique du jour.
- **v0.5.12** — **سلّم المساعدة (audit pédagogique)** : chaque exercice الوحدة 1 porte un
  escalier d'indices à **3 barreaux** demandés par l'élève (bouton « 💡 التلميح · n/3 ») ou
  proposés doucement après la **2ᵉ erreur** : 1 · relance « أين تنظر ؟ » (السند), 2 · procédure
  « أي عملية ؟ » (أصف/أفسّر/أحكم selon le verbe), 3 · micro-leçon « القاعدة العامة » (jamais la
  réponse), avec **المفتاح en surimpression** au 3ᵉ barreau sans perdre l'état de l'exercice.
  Chaque distracteur porte un **code d'erreur** (`erreurCible`) → message ciblé au moment de
  l'échec (ex. confusion d'échelle, inversion de règle) au lieu du message générique. La réussite
  avec aide affiche la trace factuelle « نجحت بدرجة/تين/ثلاث درجات من المساعدة » (zéro
  pourcentage, zéro malus) et programme la carte كفاءة en **J+1** (au lieu de J+3) — conformément
  à l'audit « réussi avec indices → J+1 ».
- **v0.5.13** — **6 parcours = 6 exercices réels (audit : tuer le QCM unique)** : le تمرين
  التطبيقي ne renvoie plus TOUJOURS la même courbe enzymatique à 3 options. Chaque مسار (استغلال
  وثيقة، تحليل منحنى، استغلال جدول، تحليل تجربة، المقارنة، نص علمي تركيبي) a maintenant son
  **propre سند et sa propre question** sur l'ordre de la démarche, avec un **diagnostic typé** par
  distracteur (jamais la réponse) et la **rotation déterministe** de la bonne proposition (elle
  n'est plus figée en 1ʳᵉ position) — conforme au plan audit « un exercice réel par parcours ».
- **v0.5.14** — **وثيقتان · استقصاء (audit : exos 2 et 3 du Bac, gain +1,0)** : nouveau gabarit
  couvrant enfin le « raisonnement sur deux documents » et la mise en relation — le bien le plus
  noté de l'exercice 2 — avec 3 enquêtes réelles (رفض الطعم، معالجة ARNm، السلسلة المستنسخة).
  Démarche guidée en **4 خطوات** (استخراج doc1 → doc2 → العلاقة → استنتاج مبرّر), documents
  **toujours affichés** pendant la résolution (zéro charge de mémorisation), **rotation
  déterministe** des propositions, **diagnostic typé** par distracteur, **سلّم المساعدة** à
  3 barreaux par étape (jamais la réponse), et à la fin le **جواب نموذجي** (الخلاصة المبرّرة +
  خطأ شائع) — jamais la bonne réponse avant le bon choix. Réussite complète → carte كفاءة SM-2
  **J+3** (directe) ou **J+1** (avec erreurs ou aide). Portes d'entrée : carte « استقصاء · وثيقتان »
  sur l'accueil منهجية + bouton dans مستويات التدريب.
- **v0.5.15** — **محرّر الجواب aligné sur le gabarit 5 tuiles (audit : le barème était
  décoratif, +1,1)** : le محرّر de l'enquête (exercices 2-3 du Bac) construit la réponse par
  **5 emplacements nominatifs** — المقدمة (problématique) → الوثيقة 1 (سند) → الوثيقة 2 (تحليل) →
  العلاقة (ربط) → الخلاصة (استنتاج) — chacun avec **3 tuiles calibrées** (1 bonne + 2 leurres
  typés : affirmation de cours non documentée / interprétation prématurée), diagnostics **typés**
  par leurre et **remélange** après erreur (jamais la bonne), **porte dure** (un emplacement actif
  à la fois, les suivants grisés). La **grille de barème « سند · تحليل · ربط · استنتاج » se coche
  à la pose** de chaque tuile (fini les badges décoratifs) et le jواب recomposé est **imprimable**
  (🖨️ via la zone d'impression existante). La **production entre enfin dans la boucle SM-2**
  (vérification 11 de l'audit) : carte `redactionEnquête` **J+3 directe / J+1 avec erreurs** — tout
  comme le محرّر الوحدة 1 (carte `redaction`). Les documents restent affichés en bande supérieure
  pendant toute l'assemblée (mémoire de travail préservée).
- **v0.5.16** — **kafaaHebdo ne compte que les REVUES, plus les réussites (audit : la file
  kafaa était en écriture seule, +0,3)** : avant, chaque réussite d'exercice de منهجية
  (parcours, enquête, محرّر) incrémentait le compteur hebdomadaire — plus l'élève s'entraînait,
  plus vite le planificateur se désactivait (2 revues « consommées » sans même en faire). Depuis,
  `onResultatKafaa` reçoit un drapeau `estRevue`, réservé à la **revue réelle de l'écran اليوم**
  (« أتقنتها » / « كافحت قليلًا ») : seule elle épuise le quota hebdomadaire (≤ 2). Les
  réussites d'exercice continuent de **programmer la carte** dans la file SM-2 (J+3 directe /
  J+1 avec erreurs) sans jamais réduire le nombre de revues disponibles cette semaine — le
  « دقيقتان، لا أكثر » reste garanti 2 fois par semaine même après grosse session de travail.
- **v0.5.17** — **tri contrasté des 11 verbes + diagnostic typé (audit F6/F12 : verbes non
  discriminés, distracteurs caricaturaux, position figée, message binaire)** : l'écran « أفعال
  التعليمة » affiche désormais les **paires d'opposition** (« لا تخلط بين الأفعال المتقاربة » :
  حلّل ≠ فسّر، استخرج ≠ حدّد، قارن ≠ استنتج، علّل ≠ فسّر، صف ≠ مثّل، استنتج ≠ أثبت، اقترح
  فرضية ≠ أثبت) avant la liste de référence. Le « اختبر نفسك » n'est plus un QCM de 3 questions
  caricaturales (« نسخ عنوان الوثيقة ») : c'est un **tri contrasté de 10 consignes réelles de
  Bac** où chaque distracteur est un **verbe proche** (jamais de caricature), la **bonne réponse
  est rotée** (rotation déterministe, jamais de « position 0 » systématique), et chaque erreur
  affiche un **diagnostic typé expliquant pourquoi ce verbe ne convient pas à la consigne**
  (jamais la réponse) — fini le message générique « ليس الجواب الصحيح ».
- **v0.6 (ré-audit)** — **ordre U1-L1 corrigé + les 12 vérifications de l'audit-5
  rejouées à la hausse : 18/18 tests verts** : (1) le `mechanismAr` de la leçon 1 de l'unité 1 suit
  enfin l'ordre pédagogique transcription → ARN → traduction — unique changement de code, build vert
  (`tsc -b && vite build`, ~730 ms), QCM P5 cohérent (généré dynamiquement depuis le tableau) ;
  (2) le banc autonome `audit-5` (vitest 5 + jsdom, sans Next) **rejoue les 12 vérifications de
  `kunz-manhadjia-v059` (5,9/10 sur la v0.5.9) contre la v0.5.17 réelle** et affirme les corrections
  par des tests réécrits : **V4** (les 6 parcours = 6 exercices réels, données + questions
  distinctes), **V6** (tri contrasté de 10 consignes réelles : distracteurs = verbes proches,
  diagnostic typé par erreur, bonne position variable), **V10-enquête** (grille `GRILLE_BAREME`
  réelle : aucun ✓ au départ, les 4 ✓ se posent à la pose des tuiles), **V11** (la production entre
  enfin dans SM-2 : cartes `methodo*`, `redaction*`, `redactionEnquête` — J+3 directe / J+1 avec
  erreurs — et `kafaaHebdo` ne compte que les revues réelles) ; V7-9 (محرّر الجواب) conservés
  verts. Réserves **documentées en tests-constats** : V1-3 (la zone du schéma reste une porte, non
  une évaluation), V5 (les 4 niveaux restent décoratifs), V10-unite1 (badges décoratifs du محرّر
  الوحدة 1, seul le flow enquête coche réellement), V12 (pas de persistance locale de l'exercice en
  cours).
- **v0.7 (actuelle = Cloze + Autopsie)** — **le محرّر d'enquête brise le plafond « clic-only »
  (audit7, mesures n°1 et n°2, +1,9 pt)** :
  1. **Cloze (mesure n°1, +1,1 pt)** : l'enquête 1 (rejet de greffe, le cas documenté) passe en
  **canevas à blancs** — chaque tuile du barème devient un gabarit où l'élève **produit une lexie
  par blank** (12 lexies : mots-clés biologiques, valeurs chiffrées, connecteurs « ما يفسّر »…)
  choisies dans un **lexique contraint** (3 candidats rotés : 1 correcte + 2 leurres typés, jamais la
  bonne aux mêmes positions, erreur → rouge + son doux + **diagnostic typé** du leurre + rotation
  sans révélation). La pose complète restitue mot pour mot les 5 tuiles du modèle, la **grille de
  barème est toujours cochée à la pose** (slot complet = tuile posée) et la **carte kafaa
  `redactionEnquete0`** (J+3 directe / J+1 avec erreurs) est conservée. Enquêtes 2-3 et محرّر
  الوحدة 1 : mode tuiles inchangé (champ `modele.cloze` optionnel).
  2. **Autopsie de copie (mesure n°2, +0,8 pt)** : nouvelle entrée « تشريح نسخة · عين المصحّح » —
  l'élève joue le **correcteur** d'une copie fictive (exercice 2, refus de greffe) contenant les
  **4 fautes-types du jury** (حشو بلا معطى / درس منقوص / لغة عاطفية / خلاصة خارجة) + 2 phrases
  **saines**. Un tic sur une faute la marque et révèle le **critère violé** (الوجاهة، الاستعمال
  السليم لأدوات المادة، الانسجام) + **diagnostic typé** ; un tic sur une clause saine = **faux
  positif** compté et expliqué (l'œil du correcteur se forme) ; le **modèle n'est révélé qu'à la
  découverte complète** (anti-stress) avec la **carte `autopsie0`** (J+3 zéro faux positif / J+1 dès
  le premier). Build vert ; banc étendu à **26/26 tests** (5 dédiés à l'autopsie : affichage,
  faute → critère sans révélation, faux positif sans avance, achèvement J+3, J+1 rétrogradé).
- **v0.8 (actuelle = Carnet des failles)** — **traçabilité des erreurs (sans culpabiliser)** :
  « سجلّ الأخطاء » dans l'onglet « أنا » — chaque erreur d'un exercice de منهجية (choix, محرّر,
  فراغات, استقصاء, تشريح, مسار, diagnostic) est **capturée atomiquement** (contexte, énoncé,
  choix fautif de l'élève, diagnostic typé déjà affiché) et **persistée** dans `Etat.carnet`
  (localStorage, offline, cap 400) — **jamais la bonne réponse** (anti-stress : pas de révélation
  hors exercice). L'écran liste les 15 plus récentes (jeton fautif en nuance argile + diagnostic)
  et propose **« تصدير السجلّ »** (téléchargement JSON local) et un **« مسح السجلّ »** avec
  confirmation. Réserve V12 (aucune persistance) partiellement refermée : les erreurs survivent au
  rechargement. 8 points de capture instrumentés (les 8 sites `sonFaux`). Build vert ; banc étendu à
  **31/31 tests** (5 dédiés : diagnostic, autopsie faux positif, cloze mauvaise lexie sans la bonne,
  unité 1, aucune capture en réussite directe).
- **v0.9 (actuelle = الامتحان التجريبي)** — **mode examen blanc** (`src/components/ExamBlanc.tsx`,
  4ᵉ carte « الامتحان التجريبي » de l'onglet تدريبات, mode plein écran `examenBlanc`) : une
  **feuille d'examen complète sur le modèle du Bac** — **التمرين الأول · استرجاع المعارف** :
  6 QCM tirés de la banque drills (2 par domaine, niveau ≤ 2 privilégié, succès crédité dans
  `etat.drills`) ; **التمرين الثاني · استغلال وثيقتين** : enquête inédite sur l'**origine de
  l'O₂ photosynthétique** (Hill 1939 + Ruben & Kamen 1941) en **4 étapes guidées** (استخراج 1 →
  استخراج 2 → علاقة → استنتاج) avec **diagnostics typés par distracteur**. La **grille de barème
  (سند · تحليل · ربط · استنتاج) se coche à chaque étape réussie** devant l'élève. Conventions
  maison respectées : **jamais la bonne réponse avant le bon choix**, erreur → `sonFaux` +
  remélange déterministe des options + capture atomique dans le carnet des failles (contexte
  « الامتحان التجريبي · … »), **réussite directe → carte كفاءة `examenBlanc` J+3 (qualité 5),
  la moindre erreur → J+1 (qualité 3)**, écran de fin **sans note ni %** (dénombrement en lettres
  + grille cochée + rappel que les erreurs sont dans سجلّ الأخطاء). Détail UX : le bouton de
  sortie s'appelle « مغادرة الامتحان » pour ne pas le confondre avec le « إنهاء الامتحان ← » de
  fin d'étape. Build vert ; banc étendu à **40/40 tests** (9 dédiés : consignes sans %, 6 QCM sur
  3 domaines + explication après réussite, erreur sans révélation, validation désactivée sans
  choix, grille qui se coche étape par étape, diagnostic typé au lieu du message générique,
  كفاءة 5 vs 3, écran de fin sans %).
- **v0.10.5** — **GO 6 : la peau partout, l'icône installable, l'Android à jour.**
  **Peau unifiée** : `.card` (212 usages dans les écrans profonds) prend le dessin de la
  maquette — papier plein, filet 1,5 px, rayon 14 px — et le survol ne soulève plus la carte
  (le glissement de 2 px faisait sauter toute la page). `.eyebrow` s'aligne sur `.oeil`. Les
  écrans hérités (الباك, الرسوم, أتيلية, قويسات…) s'accordent donc sans qu'on touche à 212
  endroits. **Icônes** : `public/icons/{icon-192,icon-512,maskable-512,apple-touch-180}.png`
  sont désormais de vrais PNG (Android n'installe pas proprement un SVG seul), déclarés dans le
  manifeste (`purpose: any` + `maskable`), acceptés par la liste blanche du `sw.js` et embarqués
  dans le pré-cache ; `scripts/generer-icones.mjs` les régénère depuis `icon.svg` (PWA + mipmaps
  et écrans de démarrage Android). Thème du manifeste passé au papier (`#fffef8` / `#225342`) :
  plus d'écran noir au lancement. **Symboles** : les ⚡ 🔥 ▲ ▼ du compteur d'XP et des pastilles
  d'أنا étaient des carrés vides avec la police arabe → remplacés par des SVG partagés
  (`Icones.tsx`), et les `chip` sans style d'أنا deviennent des `mention`. **Android** :
  `versionName 0.10.5`, `versionCode 3`. QA : `tsc` 0 erreur · **48 fichiers / 291 tests**
  (4 dédiés aux icônes) · captures clair/sombre `plans/captures/etape-6-*.png`.
- **v0.10.4** — **صيّاد الفخاخ : le chasseur de pièges** (`src/components/Fakh.tsx`,
  `src/utils/fakh.ts`). Depuis **الباك**, une carte lance une **série de 8 jugements** : une
  phrase s'affiche, deux boutons — **فخّ** ou **صحيح** —, jamais de note sur 20, jamais de Game
  Over. Les énoncés ne sont **jamais inventés** : ils sortent des QCM écrits à la main
  (`options[0]` = affirmation vraie, options 1..3 = pièges de l'auteur), les fragments de liste
  (« 3 قواعد / AUG ») étant écartés parce qu'hors contexte ils ne se jugent pas. Les **4 XP par
  série** et les **2 XP par bon jugement** sont écrits une seule fois (clés stables
  `fakh:<leçon>:<rappel|synthese>:<i>`, séries dans `etat.fakhSeries`). Une erreur ne retire rien :
  l'explication de la leçon s'affiche, puis « الجملة التالية ». Fin de série : **bilan
  sans note** (« 4 من 8 حكم صحيح »), mention **« سلسلة كاملة بلا غلطة »** seulement si c'est vrai,
  message doux sinon, et le rappel que les pièges ratés restent consultables. La fiche de
  référence du programme (les **21 pièges officiels** de `UNITES[].piegesAr`) est servie dans le
  même écran. QA : `tsc` 0 erreur · **47 fichiers / 287 tests** (7 dédiés), captures
  `plans/captures/etape-5-*.png`.
- **v0.10.3** — **« ملفّي » : la fiche A4 imprimable** (`src/components/FicheEleve.tsx`). Depuis
  **أنا**, une carte ouvre une feuille A4 qui rassemble ce que l'app sait déjà : identité (nom,
  wilaya), niveau et XP, série de jours, compte à rebours du Bac, progression (leçons / جسور /
  تدريبات), cartes kafaa (dont les fragiles), révisions dues, étapes et exercices du Bac, activité
  des 7 derniers jours, puis une ligne de signature. **Aucune note, aucun pourcentage** : le pied
  de page le dit (« لا علامة على 20 »). Impression propre (`@media print` : barre d'action et
  navigation masquées, `@page A4`, cartes non coupées). L'en-tête d'**أنا** passe à la langue
  visuelle de la maquette (`.oeil` + `.titre-1`).
- **v0.10.2** — **كويست اليوم : la porte d'entrée** (`src/components/Kouest.tsx`,
  `src/utils/kouest.ts`). Sur l'onglet **كويست**, une carte propose une quête de **3 minutes**
  (3 étapes : `rappel` → `synthese` → `piege`) tirée du QCM réel de la leçon que le moteur
  propose (`prochaineAction`). Options mélangées de façon déterministe ; une erreur ne rougit
  pas, ne retire rien, et laisse réessayer. Chaque étape réussie vaut **3 XP** (clé stable
  `kouest:<leçon>:<étape>` dans `etat.drills`, aucun nouveau champ). À la fin, deux portes :
  **« كمّل الجلسة كاملة · 46 دقيقة »**, qui ouvre le protocole intact sur la même leçon, ou
  « يكفي اليوم ». Une leçon sans QCM saute la quête au lieu d'inventer des questions.
- **v0.10.1** — **الباك خطوة بخطوة** (`src/components/BacPasAPas.tsx`, `src/utils/bacPasAPas.ts`) :
  une consigne officielle = une étape. L'élève écrit d'abord (bouton bloqué tant que le champ est
  vide), découvre ensuite les **عناصر الإجابة** du corrigé, puis s'auto-évalue **3 / 2 / 0** — la
  qualité vaut exactement l'XP gagné, et l'exercice fini donne **+6**. « ما عرفتش » n'ajoute aucune
  punition : elle crée une carte dans le carnet d'erreurs. Aucune note sur 20, aucun chrono, aucun
  rouge. Les étapes vivent dans `etat.bacEtapes` (clé `sujet:exercice:partie:consigne`) et les
  exercices finis dans `etat.bacExercices` ; `xpDe` les compte, la sauvegarde et la sync suivent
  sans changement de schéma. Entrée : **الباك → موضوع كامل → « خطوة بخطوة · N خطوات »**.
- **v0.10.0** — **peau neuve : quatre portes** (intégration de la maquette `maquettes/super-bawssala`,
  architecture A). (1) **Palette** alignée sur la maquette (encre `#183d31`, primaire `#225342`, fond
  `#f6f6ee`, miel `#b07d22` ; texte miel `#79531f` pour rester à 6,8:1) + thème sombre.
  (2) **Briques de composants** `.carte` `.mention` `.rangee` `.puce` `.btn--primaire` `.btn-mini`
  `.jauge` `.onglets` `.onglet`, portées depuis `css/components.css` sans toucher aux styles existants.
  (3) **Quatre onglets** : مساري · كويست · الباك · أنا ; تدريبات et المنهجية deviennent des
  sous-écrans avec barre de retour. (4) **Nouvel écran الباك** (`src/components/Bac.tsx`) :
  sujets, examen blanc, méthodologie, schémas + fréquences de verbes et d'unités calculées sur les
  30 sujets. (5) **مساري re-skinnée** : une carte = une action, jauge, badges, pont pleine largeur —
  logique de verrouillage inchangée. (6) **Atelier de design** `?design=1` (dev) et son test
  `onglets-ui.test.tsx` qui verrouille la règle des quatre portes. `tsc` 0 erreur, **267 tests**.
- **v0.9.3** — **polish UI + audit de contraste WCAG** : (1) **bouton de retour RTL** — `IcoRetour`
  corrigé (chevron pointant à **droite** `M9 5l7 7-7 7`, vérifié au pixel x=744/800 sur émulateur),
  présent sur chaque page plein écran (Methodologie, LecteurLecon, ExamBlanc, ateliers, mindmap) ;
  toutes les zones tactiles passées à **≥ 40 px** (nav, bouton thème, mindmap, badges) et l'audit
  navigateur des 5 onglets ne relève **aucune cible < 40 px ni overflowX**. (2) **bouton de thème** :
  le mode clair affiche désormais un **soleil** (l'ancien path « lune pleine » tracé en stroke
  donnait un glyphe déformé type « ٦ »), la lune stroke en mode sombre — les deux états vérifiés.
  (3) **audit de contraste automatisé** (ratio WCAG sur texte réel, dégradés ignorés) × 5 onglets ×
  2 thèmes : **zéro échec** après correction du badge « المفتاح » — combinaison systémique
  `bg-sage text-forest-deep` (~40 usages : états sélectionné/validé) qui en sombre donnait 2.4:1
  (fond sage `#5e8f6f` + texte clair `#b0d9c2`) ; règles scopées `[data-theme='dark'] .bg-sage…`
  hors-layer imposant un texte foncé `#0a1a12` (4.82 sombre / 6.26 clair). (4) **BaguetteXp**
  remontée dans l'en-tête (popup z-50), `GamifiedOverlay` réduit à une barre fine `top-16` +
  confetti, XP en `text-[#9a7a2c]` + `.tnum`, `text-wrap: balance` sur les titres. (5) tests
  **Artemis PASS** : منهجية (retour RTL ✓), الخريطة الذهنية (3 domaines/11 unités, leçons
  verrouillées), compte, lecteur. APK `app-debug.apk` reconstruit et réinstallé sur émulateur.
  (6) **export Android réparé** : vérification empirique — `a.download` + Blob échoue **en
  silence** dans le WebView Capacitor 8 (aucun DownloadListener, `/sdcard/Download/` reste vide,
  aucun message) ; nouvel helper `exporterJson` : `Capacitor.isNativePlatform()` → écriture via
  `@capacitor/filesystem` (cache) + **feuille de partage** `@capacitor/share` (l'élève choisit
  où garder le fichier), web garde Blob + lien ; message de confirmation inline dans les deux
  sections (تصدير السجلّ / تصدير نسختي) — vérifié sur émulateur : sheet « Sharing 1 file:
  bousala-sauvegarde.json », JSON complet dans le cache, message « حُفِظ ملف… » affiché.
- **v0.9.2** — **APK Capacitor + خريطة ذهنية + boutons de retour** : (1) la cause racine de la
  **transparence** est trouvée et corrigée : le @theme Tailwind 4 ne définissait que `--color-line`,
  les 8 couleurs personnalisées (`cream`, `paper`, `sage`, `sage-soft`, `clay`, `clay-soft`,
  `forest`, `forest-deep` — 600+ usages) génèrent du CSS vide → panneaux et pages plein écran
  100 % transparents ; toutes ajoutées avec valeurs clair + sombre harmonisées, header/nav/baguette
  XP opaques (plus de `backdrop-blur`), `.eyebrow` sans `letter-spacing` (ligatures arabes). (2)
  **الخريطة الذهنية** : l'ancien `al_miftah_v7_mindmap.html` est reconstruit comme **page intégrée**
  (`Mindmap.tsx`) — 3 domaines → 11 unités → 58 leçons + جسور, générée depuis `programme.ts`,
  arbre coloré par domaine, unités dépliables (questionAr, fenêtre, ثقل بكالوريا, فخاخ), leçons
  verrouillées visibles mais non cliquables (même philosophie que مساري) ; ouverte depuis le bouton
  🗺️ de l'en-tête مساري, fermer une session lancée depuis la carte y ramène (retour contextuel).
  (3) **bouton de retour vérifié sur chaque page plein écran** : LecteurLecon (رجوع ✓),
  ExamBlanc (consignes/partie1/partie2/bilan ✓), AtelierCadre + les 4 ateliers (رجوع ✓),
  Methodologie (رجوع ✓), et l'écran de célébration reçoit enfin « خروج من الدرس ». (4) **APK** :
  wrapper Capacitor (`android/`, `com.bousala.ouloum`), `app-debug.apk` testé sur émulateur Pixel 6
  (API 36) — splash, mascotte transparente, inscription opaque, mindmap vérifiés par captures ;
  le cache WebView exige `pm clear com.bousala.ouloum` après chaque réinstallation.
- **v0.9.1** — **renommage بوصلة العلوم + sauvegarde complète + durcissement de la sync** :
  (1) l'application s'appelle désormais **بوصلة العلوم Lite** (ex-« كنز العلوم Lite ») — harmonisé
  dans `manifest.webmanifest` (short_name), l'en-tête, `Fetes.tsx`, la mascotte, les niveaux XP
  (`بطل بوصلة العلوم`) et `package.json` ; les clés de stockage `kunz_*` restent inchangées pour ne
  pas perdre les données existantes. (2) **نسخة احتياطية كاملة** dans l'onglet أنا : export JSON de
  tout l'état (progression, SM-2, جسور, كفاءة, carnet, journal…) et **import** avec normalisation
  (même voie que `chargerEtat`) — la progression survit au changement de navigateur. (3)
  **`Methodologie` passe en `React.lazy`** (écran lourd de ~190 kB source, chargé à la demande).
  (4) **la policy UPDATE de Supabase n'est plus `using (true)`** : un **jeton d'écriture** aléatoire
  (`jeton`, généré à la création du compte, envoyé en en-tête `x-kunz-jeton`) est exigé pour modifier
  une ligne qui en possède un — n'importe qui avec l'URL publique ne peut plus écraser la fiche d'un
  élève connu ; les lignes anciennes sans jeton restent modifiables (compatibilité), le documenté
  recommande de les laisser vieillir. (5) **réparation de l'affichage** : deux fichiers corrompus en
  mojibake (`CarteStats.tsx`, `EcranDemarrage.tsx`) décodés et restaurés en arabe ; la mascotte
  officielle a été **détourée** en deux images transparents, converties en WebP —
  `personnage-pirate.webp` (poster avec titre doré, splash) et `mascotte.webp` (personnage seul,
  avatars de l'app) — toutes deux dans le précache de la coquille. `favicon.jpg`, `logo.png` et
  `personnage-pirate.jpg` ont été supprimés : 1,5 Mo de fichiers jamais servis ou en double.
  La couche XP est réorganisée (BaguetteXp intégrée à l'en-tête, barre fine sous
  l'en-tête, plus aucun panneau flottant qui chevauche le contenu).
- **v0.9+** — conversion des 25 leçons au format manuel scolaire (suppression du scaffolding) ;
  exercices « نمط بكالوريا » et « تحليل وثيقة » (reportés).

---

## 📄 Licence & droits des contenus

- **Code source** : sous licence **MIT** (voir [`LICENSE`](LICENSE)).
- **Contenus pédagogiques originaux** (leçons, QCM, drills, synthèses, ateliers méthodologiques) : sous licence **CC BY-NC-SA 4.0** sauf mention contraire.
- **Extraits d’annales et supports tiers** (Baccalauréat algérien / ONEC, figures adaptées de `public/boussole/`) : soumis aux droits de leurs titulaires respectifs — voir [`plans/DECISION-DROITS-CONTENUS.md`](plans/DECISION-DROITS-CONTENUS.md) et [`plans/sources/REGISTRE.md`](plans/sources/REGISTRE.md). Les 81 Mo de PDF d’annales `dzexams` ont été retirés du dépôt public.

---

بوصلة العلوم Lite — مراجعة موفّقة. التكرار يبني الذاكرة، لا الحفظ المتكرّر. 🧬
