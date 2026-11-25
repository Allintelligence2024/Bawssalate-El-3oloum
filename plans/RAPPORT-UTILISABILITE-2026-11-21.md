# Rapport d'utilisabilité — vue « première page »

**Date** : 21 novembre 2026 · **Branche** : `arena/a897fbff-bawssalate-el-3oloum` · **Version** : v0.12 + correctifs du jour
**Méthode** : parcours réel de l'app en DOM (jsdom), écran par écran, en partant de la première page, avec un compte local fictif et un état vierge. Aucune impression laissée au hasard : chaque constat est adossé à un texte réellement rendu.

---

## 1. La personne dont je prends la place

**Yasmine, 18 ans, Oran, terminale sciences expérimentales.**
Elle révise sur son téléphone, entre deux cours, souvent 10 minutes, parfois 40 quand elle tient. Elle n'ouvre pas une appli « pour lire de la documentation » : elle ouvre une appli pour **savoir quoi faire maintenant en moins de 3 minutes**. Elle a déjà TikTok, YouTube et un groupe WhatsApp de classe. Elle n'a aucune patience pour un formulaire, et elle abandonne silencieusement — pas de feedback, pas d'email, elle ferme l'onglet.

Ce qu'elle attend, dans l'ordre :
1. « Ça commence tout de suite. »
2. « Je sais quoi faire là, maintenant. »
3. « Quand j'ai fini, je sens que j'ai avancé. »

---

## 2. Le parcours réel, chronométré en écrans

| # | Écran | Ce que Yasmine voit | Temps / friction |
|---|-------|---------------------|------------------|
| 1 | `EcranDemarrage` | vidéo plein écran (6,5 s max), `فعّل الصوت`, `تخطي ←` après 2,5 s | ⚠️ 1 écran avant tout contenu |
| 2 | `Inscription` | email + mot de passe + wilaya + daira — **obligatoire** | 🔴 4 champs, aucun « essayer d'abord » |
| 3 | Accueil `Aujourdhui` | `كويست اليوم`, `تحدّي 60 ثانية`, `مهمّة اليوم`, `يكفي اليوم`, 3 défis hebdo | 🟡 6 blocs, **3 boutons de départ concurrents** |
| 4 | Micro-nœuds | `مسار الدرس · الوحدة 1`, 6 étapes | 🟡 dense mais lisible |
| 5 | Onglet `الباك` → `افتح` | sujets officiels 2013–2026 | 🟢 clair |
| 6 | Sujet 2022 → `الموضوع كاملًا · خطوة بخطوة` | guide : `التمرين 1 · التعليمة 1 من 9`, 4 onglets `افهم / تحقّق / اكتب / قارن` | 🟢 **le cœur de valeur est là** |

**Coût du premier contenu utile : 2 écrans de friction (vidéo + compte).**
Aucun bouton mort rencontré sur ce chemin : les 6 écrans s'enchaînent, le guide s'ouvre, les 9 consignes se parcourent, la fin de sujet s'affiche.

---

## 3. Ce qui marche vraiment (à ne pas casser)

- **Le guide « sujet complet » est la meilleure chose de l'app.** Quatre temps nommés en arabe simple, aucun chrono anxiogène, aucune note /20, la réponse officielle révélée **après** l'écriture. C'est exactement ce que Yasmine ne trouve ni dans un cours PDF ni sur YouTube.
- **Aucun « Game Over », aucune note prédite.** Le ton tient : « بلا لوم », « اختيارية », « لا شيء يُخصم ».
- **Le retour à la première consigne non travaillée** : elle ferme, elle revient, elle reprend où elle s'est arrêtée.
- **La copie arabe est propre** (pas de lettre latine, pas de tatweel), RTL correct, et les écrans tiennent sur un téléphone.

---

## 4. Ce qui bloque (du plus grave au plus fin)

### 🔴 B1 — Le compte obligatoire avant la première minute de contenu
C'est **le** point de décrochage. Une lycéenne qui teste depuis un lien n'écrit pas son email + un mot de passe + sa daira pour voir si l'appli vaut le coup. Le message « ملفّ محلي على هذا الجهاز فقط » est rassurant, mais il arrive **après** la demande, pas avant.

> Ce qu'elle pense : « صبرني، علاش نسجّل؟ ما زال ما شفتش والو. »

### 🔴 B1 bis — « أفتح البوصلة وأعود إلى تمريني » ouvrait un écran vide de l'exemple promis
Le bouton d'aide d'un exercice promet « le laboratoire explique avec un exemple de synthèse des protéines ». Depuis la v0.11 le tiroir s'ouvrait sur l'onglet « تحقّق » : l'élève cliquait, ne voyait ni exemple ni schéma, refermait. C'était aussi la cause du rouge de la CI (le test navigateur attendait `.case-protein`, timeout 8 s). Corrigé : l'aide ouvre directement l'onglet laboratoire.

### 🟠 B2 — Trois départs concurrents sur l'accueil
`ابدأ الكويست` · `ابدأ` (défi 60 s) · `ابدأ 3 دقائق` (mission). Trois verbes identiques, trois promesses différentes, zéro hiérarchie. Elle choisit au hasard — et le hasard, ici, c'est souvent le défi 60 s, c'est-à-dire **le moins utile pour le bac**.

### 🟠 B3 — La promesse « 3 دقائق » n'était pas tenue
La mission annonçait 3 minutes et l'écran suivant ouvrait sur « بقيت 24 دقيقة ». Décalage classique entre le bouton et l'écran d'arrivée — le genre d'écart qui fait perdre confiance une fois, puis deux.

### 🟡 B4 — La durée de l'épreuve : un doute levé, pas une erreur
J'ai d'abord cru à un bug — des pages web de 2016–2017 annoncent « 3 h 30 » pour les sciences expérimentales, alors que l'app affiche partout « 4 سا 30 د ». Vérification faite sur les sources du dépôt (`plans/sources/REGISTRE.md`) : les **18 en-têtes d'épreuves 2013→2026** archivés impriment bien **4 h 30**. C'est donc la recherche web qui était fausse, pas l'app.

Le vrai défaut, lui, était réel : la durée était recopiée à la main dans trois endroits (données, constante, en-tête). Elle est maintenant dérivée d'une seule constante et un test la verrouille.

### 🟡 B5 — L'écran des sujets se présentait encore comme un « squelette »
Titre : « بنية الموضوع، لا الموضوع نفسه » — c'est-à-dire « ici on ne résout pas ». Faux depuis la v0.12 : le guide résout le sujet entier. Le titre décourageait avant même d'essayer.

### 🟢 B6 — Jargon résiduel et chiffres incohérents
`التعليمة` (terme officiel, acceptable mais opaque en première visite), `أمانة النقل (b): قراءة بالعين…` (méta-info de production affichée à l'élève), et un bouton `ابدأ ٣ دقائق` en chiffres arabo-indiens à côté d'un corps de texte en chiffres latins.

### 🟢 B7 — Le tiroir « البوصلة » et la fin de sujet
Les deux fonctionnent, mais le guide empile `التالي` + `السابق` + `أنهيت الموضوع` + `افتـح البوصلة` sur le même écran. Trop d'issues pour une consigne de 2 points — elle hésite, puis tape `خروج`.

---

## 5. Les cinq corrections prioritaires (ordre d'impact)

| Priorité | Correction | Effet attendu |
|---|---|---|
| **1** | **Mode invité** : `جرّب بلا حساب` sur l'écran d'inscription, données locales, compte proposé plus tard (à l'export / à la sync seulement) | +1 écran de contenu gagné avant la première seconde de valeur. C'est la correction qui change le taux d'arrivée au guide. |
| **2** | **Un seul CTA principal sur l'accueil** (`ابدأ 3 دقائق`) et rétrograder les deux autres en liens secondaires | fin du choix au hasard, départ toujours vers le contenu le plus utile au bac |
| **3** | **Supprimer l'écran vidéo pour les visites suivantes** (déjà une fois par session : le passer à « une fois par appareil ») | un écran de moins au retour |
| **4** | **Rendre l'écran des sujets auto-explicatif** : `اختار موضوعًا → حلّه كامل → قارن` visible en haut, avant les chips d'années | elle comprend la promesse sans lire trois lignes |
| **5** | **Passer `أمانة النقل` derrière un « i »** et simplifier `التعليمة` par `السؤال` en première visite | moins de métalangage, plus de contenu |

---

## 6. Corrections livrées aujourd'hui (dans ce commit)

1. **Durée de l'épreuve : une seule source de vérité.** L'en-tête des sujets et le libellé du bouton de simulation se dérivent désormais de `DUREE_BAC_MIN` (270 min = 4 h 30, la valeur réellement imprimée sur les épreuves). Un test verrouille l'égalité entre la constante et les 30 sujets — plus de recopie manuelle.
2. **Promesse des micro-nœuds tenue** : l'écran affiche `4 دقائق الآن` (durée du nœud), et la séance complète devient une phrase secondaire optionnelle, plus un « بقيت 24 دقيقة » en gros à l'arrivée.
3. **Libellé du bouton de mission** : `ابدأ ٣ دقائق` → `ابدأ 4 دقائق`, chiffres latins, cohérent avec le corps de texte.
4. **Écran des sujets** : titre `مواضيع البكالوريا · حِلّها كاملة`, en-tête `4 سا 30 د` dérivé de la constante, intro réécrite orientée action (`اختار موضوعًا وسِر فيه تعليمةً بتعليمة`), et `أمانة النقل` réduite à `نقْل: قراءة بالعين` (détail au survol).
5. **Aide « البوصلة داخل التمرين » réparée** : elle s'ouvre sur l'onglet laboratoire (`#explore-protein`), avec son bouton « أعود إلى تمريني » et la restauration du focus. Test de régression ajouté.
6. **Dialogues robustes sur WebView anciens** : `showModal()` / `close()` sans garde faisaient planter l'écran entier sur Android 9–10 (encore fréquents). Un utilitaire `ouvrirDialogue` / `fermerDialogue` remplace les cinq appels directs.
7. **Guide** : `الفعل المطلوب` nommé à côté du verbe, mention que le repère est à valider par l'enseignant et qu'en cas de désaccord **on suit l'enseignant**, plus une ligne d'entrée : `اقرأ التعليمة هنا، اكتب جوابك على ورقتك، ثمّ قارن.`

État : `tsc -b` 0 erreur · **620 tests / 72 fichiers verts** · lint 0 · build OK · coquille hors ligne **2,49 Mio / 2,5**.

---

## 7. Verdict — « l'app est-elle difficile dès la première page ? »

**Oui, mais pas là où on croit.**

- Le **contenu** n'est pas difficile : le guide est plus clair que la plupart des supports de révision, et le premier sujet se résout sans notice.
- La **porte d'entrée** l'est : vidéo + compte obligatoire = deux écrans avant la moindre valeur. C'est le seul endroit du parcours où Yasmine peut abandonner sans avoir rien vu.

**Note par étape (subjectif, du point de vue de la persona) :**

| Étape | Note |
|---|---|
| Écran vidéo | 2/5 — joli, mais je veux passer |
| Inscription obligatoire | 1/5 — je ferme |
| Accueil | 3/5 — trop de boutons qui commencent par « ابدأ » |
| Micro-nœuds | 4/5 — je comprends où j'en suis |
| Liste des sujets | 4/5 |
| Guide sujet complet | 5/5 — **c'est ça, le produit** |

**Une seule correction suffirait à faire passer l'ensemble de « difficile » à « évident » : le mode invité.** Tant qu'il n'existe pas, la première page reste un péage ; une fois qu'il existera, le guide fera le travail de conviction tout seul.

---

## 8. Suite proposée

1. Mode invité (`جرّب بلا حساب`) : état local, pas de compte, sync proposée à la création du compte — le champ `compte` reste la seule source d'authentification côté sync.
2. Accueil : un CTA principal, deux liens secondaires, suppression du doublon sémantique `كويست اليوم` / `مهمّة اليوم`.
3. Écran vidéo : une fois par appareil (`localStorage`), pas une fois par session (`sessionStorage`).
4. Test d'utilisabilité à 5 personnes (terminales, Oran) sur le seul chemin `première page → sujet 2022 → consigne 3`.

---

## 9. Suite du 21/11 — les cinq blocages sont traités (v0.13)

| Blocage | État | Ce qui a changé |
|---|---|---|
| **B1** compte obligatoire | ✅ corrigé | `جرّب بلا حساب · ابدأ الآن ←` en haut de l'écran de compte. Aucun email, aucun mot de passe, rien ne quitte l'appareil. Le compte n'est plus qu'une option (sync, changement de téléphone), proposée depuis la barre XP et depuis « أنا ». |
| **B2** trois départs concurrents | ✅ corrigé | La **mission du jour passe en premier**, juste sous le titre. Le quiz devient `افتح الكويست` (secondaire), le défi minute `العب`. Un seul bouton commence par « ابدأ » sur tout l'accueil. |
| **B3** promesse 3 minutes | ✅ déjà corrigé | l'écran des micro-nœuds affiche la durée du nœud, la séance complète est une ligne optionnelle. |
| **B4** durée de l'épreuve | ✅ clarifié | 4 h 30 confirmé (18 en-têtes archivés) ; la valeur n'est plus recopiée, elle est dérivée de `DUREE_BAC_MIN`. |
| **B5** écran « squelette » | ✅ corrigé | titre `حِلّها كاملة` + bandeau en trois gestes : `اختار موضوعًا · حُلّه كاملًا · قارن`. |
| **B6** jargon | ⚠️ partiel | `أمانة النقل` réduite à `نقْل: …`, `الفعل المطلوب` nommé. `التعليمة` reste : c'est le mot des sujets officiels. |
| **B7** quatre sorties dans le guide | ✅ corrigé | un seul bouton par temps, `البوصلة` remonte dans l'en-tête, et `أنهيت الموضوع` n'apparaît qu'à la dernière consigne. |
| Vidéo à chaque session | ✅ corrigé | l'intro est retenue **par appareil** (`localStorage`), plus par session. |

### Médias livrés (compression sans perte visible)

| Fichier | Avant | Après | Détail |
|---|---|---|---|
| `public/ouverture.mp4` | 1,61 Mo en 720×1280 | **2,05 Mo en 1080×1920** | source 13,4 Mo → **−85 %**, débruitage léger, 1,9 Mb/s deux passes, `+faststart` |
| `public/personnage-pirate.webp` | 59 ko, découpe de l'ancienne mascotte | **62 ko, scène 560×1003** | photo du Drive, WebP q78 ; sert aussi d'affiche (`poster`) pendant le chargement |
| `public/mascotte.webp` | 18,6 ko, 280×360 flou | **14,6 ko, 320 px détouré** | fond blanc retiré, halo corrigé, net sur écran 2× |
| Coquille hors ligne | 2,493 Mio | **2,495 Mio** | budget 2,5 Mio tenu malgré l'ajout du mode invité |

Les icônes PWA restent celles du générateur vectoriel : les remplacer par l'icône photo coûte
~52 ko et ne tient pas dans les 5 ko de marge restants sans sortir `icon-512.png` du pré-cache.
L'original est archivé (`plans/sources/medias/icone-app-1024.jpg`) avec les recettes exactes.
