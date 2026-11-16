# 🎯 Plan d'Amélioration — بوصلة العلوم Lite : de 65/100 à 90/100

> Version : 1.0 — Date : 2026-11-16
> Base : audit pédagogique complet v0.9.3 (score pondéré 65/100)
> Cible : **90/100** sur les 8 axes, pondération inchangée
> (A1 15 % · A2 12 % · A3 18 % · A4 12 % · A5 10 % · A6 10 % · A7 13 % · A8 10 %)

---

## 0. Vue d'ensemble — où se trouve le gain

| Axe | Note actuelle | Cible | Poids | Contribution actuelle | Contribution cible | Gain |
|---|---|---|---|---|---|---|
| 1 — Conformité programme | 7,0 | **9,0** | 15 % | 1,05 | 1,35 | +0,30 |
| 2 — Richesse & hiérarchisation | 6,5 | **9,0** | 12 % | 0,78 | 1,08 | +0,30 |
| 3 — Parcours & assimilation ⭐ | 7,5 | **9,0** | 18 % | 1,35 | 1,62 | +0,27 |
| 4 — Exercices & tests | 6,5 | **9,0** | 12 % | 0,78 | 1,08 | +0,30 |
| 5 — Sujets Bac + simulation | 3,5 | **9,0** | 10 % | 0,35 | 0,90 | **+0,55** |
| 6 — UX/UI & ergonomie | 7,0 | **9,0** | 10 % | 0,70 | 0,90 | +0,20 |
| 7 — Interactivité & engagement | 6,0 | **9,0** | 13 % | 0,78 | 1,17 | +0,39 |
| 8 — Fiabilité & économie | 7,0 | **8,5** | 10 % | 0,70 | 0,85 | +0,15 |
| **TOTAL pondéré** | **6,49** | | 100 % | **6,49** | **8,95 ≈ 9,0** | **+2,46 → 90/100** |

**Lecture stratégique :** l'Axe 5 (sujets Bac) rapporte à lui seul **+0,55 point pondéré** — c'est
le chantier le plus rentable, car le plus creusé. Les Axes 7 et 4 suivent. Aucun axe ne peut être
laissé sous 8,5 sans faire chuter la moyenne.

**Effort total estimé : ~75–90 jours-homme** (dont ~30 j pour l'Axe 1, la relecture professorale
étant un travail humain et non de code). Durée cible : **14 semaines**, 6 sprints.

**Fil rouge non négociable :** toute nouvelle fonctionnalité doit respecter les 5 conventions
maison (jamais révéler la bonne réponse, zéro %, zéro chrono agressif, chiffres latins,
messages non culpabilisants). Chaque tâche ci-dessous est compatible anti-stress.

---

## AXE 1 — Conformité pédagogique (7,0 → 9,0) — gain +0,30

### T1.1 🔴 Relecture professorale des 58 leçons (~30 j-homme, humain)
- **Problème** : `lessonGoldSummaries.ts` → `status: 'adaptation_pedagogique'`, `review.reviewed: false` sur 58/58. Aucune validation experte.
- **Action** :
  1. Recruter 2 professeurs SVT 3AS (un scientifique, un correcteur du Bac).
  2. Créer `plans/CHECKLIST-RELECTURE.md` : exactitude scientifique / vocabulaire manuel / pièges (`piegesAr`) réalistes / QCM sans double interprétation / mécanismes (`mechanismAr`) ordonnés causalement.
  3. Priorité : U4 (poidsBac 5) → U3, U9, U11 (poids 4) → reste.
  4. À chaque validation : `review.reviewed: true`, `reviewedBy`, `reviewedAt`, `status: 'manuel_officiel_verifie'` + note de correction dans `plans/comptes-rendus/`.
- **Livrable** : 58/58 validées en 12 semaines (5/semaine), attestation « Conforme au programme officiel — vérifié par M./Mme X, prof 3AS » affichée dans l'onglet أنا.
- **Critère d'acceptation** : 100 % des leçons `manuel_officiel_verifie` ; zéro correction ouverte.

### T1.2 🟡 Corriger les défauts documentés (2 j)
- Ajouter le `bacSentenceFrameAr` manquant de la leçon 1 (U1) — le cadre P6 s'affiche vide.
- Harmoniser les marques résiduelles (« منصة بنزر العلم » dans les `<title>` des 25 leçons HTML → بوصلة العلوم).
- Uniformiser les IDs de leçons (`phaseN_chapitres_X_Y` vs `dN-uM-lK-*`) via un mapping documenté, sans casser les clés localStorage (garder l'ancien comme alias).

### T1.3 🟡 Déclaration explicite du périmètre filière (3 j)
- **Problème** : l'app couvre la 3AS *Sciences expérimentales* ; la série SVT (génétique, écologie) est absente sans que ce soit dit.
- **Action** : écran d'inscription — sélection « الشعبة » : **علوم تجريبية** (actif) / **علوم الطبيعة والحياة** (affiché « قيد الإنجاز — non disponible » avec date). Evite les mauvaises surprises et le churn.
- **Option B (si budget)** : ajouter U12 Génétique + U13 Écologie (2 unités × 6 leçons, même gabarit) — hors périmètre du 90 % si l'on assume un produit « Sciences expérimentales » assumé.

### T1.4 🟢 Fiche de conformité par unité (1 j)
- Dans `programme.ts`, ajouter `reference: 'المنهاج الرسمي 2024 — كتاب السنة الثالثة ثانوي، ص 10–39'` par unité (les `page:` existent déjà), affiché dans la Mindmap et le جسر.

**Score cible A1 : 9,0** — justification : couverture déjà excellente (8), validée par expert → 9.

---

## AXE 2 — Richesse & hiérarchisation (6,5 → 9,0) — gain +0,30

### T2.1 🔴 Priorité par leçon 🔴/🟡/🟢 (5 j)
- **Action** : ajouter `priorite: 1 | 2 | 3` à chaque leçon dans `programme.ts`, dérivée d'une analyse de fréquence des sujets Bac 2018–2025 (déjà en PDF dans le dépôt → les 4 sujets servent de base de données).
- **UI** : badge discret sur مساري + Mindmap : « يُكرَّر كثيرًا » (🔴), « مهم » (🟡), « مكمّل » (🟢). Pas de couleur agressive — nuance de bord seulement.
- **Critère** : 58/58 leçons étiquetées ; tableau de fréquence documenté dans `plans/analyse-frequence-bac.md`.

### T2.2 🔴 Poids de chaque unité en langage clair (2 j)
- Remplacer l'échelle 1–5 par un affichage double : « ثقل عالٍ » + répartition indicative par domaine sur la Mindmap (« المجال الأول ≈ نصف نقاط الامتحان ») — sans % précis, compatible anti-stress.

### T2.3 🟡 Glossaire bilingue AR↔FR (~150 termes) (6 j)
- Nouveau fichier `src/data/glossaire.ts` : `{ termeAr, termeFr, definitionAr, lessonIds[] }`.
- Intégration : clic sur un terme dans LecteurLecon (les `vocabulary[]` des Résumés d'Or servent de base) + recherche plein glossaire depuis أنا. Offline, ~25 Ko.

### T2.4 🟡 Cours HTML pour les 12 leçons orphelines (10 j)
- **Constat** : 58 leçons − 46 couvertes = 12 leçons sans cours HTML (celles avec `d2-u6-*`, `d1-u3-l1-*`, `immunity_*`, `prerequis*`…).
- **Action** : 12 mini-cours HTML (gabarit existant réutilisé, ~20 Ko chacun, schéma SVG simple + « الأساسي في 3 جمل »).
- **Critère** : `aContenuLecon()` vrai sur 58/58 ; precache SW mis à jour (+240 Ko, acceptable).

### T2.5 🟡 Fiche « الأساسي في 3 جمل » par leçon (3 j)
- Déjà contenu dans le Résumé d'Or (`missionAr` + `mechanismAr[0..2]` + `commonErrorAr`) → composant `CarteEssentiel` : bloc 3 lignes + bouton copie/impression, affiché en fin de protocole et dans SessionRevision.

### T2.6 🟢 Tableaux comparatifs interactifs (4 j)
- 8 tableaux clés (réutilisant le mécanisme des ateliers) : humoral vs cellulaire, phase photo-chimique vs Calvin, glycolyse vs phosphorylation oxydative, subduction vs collision, mitose vs méiose (prérequis), procaryote/eucaryote, neuron/rest message, lithosphère océanique/continentale.
- Chaque tableau : construit à clics (l'élève place l'élément dans la bonne colonne), jamais lisible avant manipulation.

### T2.7 🟢 Objectifs d'apprentissage reformulés (2 j)
- Chaque leçon : ligne d'ouverture « في نهاية هذا الدرس ستكون قادرًا على : … » dérivée de `competence` de l'unité + `missionAr`.

**Score cible A2 : 9,0** — riche (8) + priorisé + glossaire + 58/58 cours → 9.

---

## AXE 3 — Parcours & assimilation ⭐ (7,5 → 9,0) — gain +0,27

### T3.1 🔴 Test de positionnement initial (8 j)
- **Action** : « تشخيص البداية » — 12 QCM (1/unité + 3 méthodo, tirés des drills niveau 1), 15 min, proposé après l'inscription, **rejetable** (jamais forcé).
- **Effet** : ne déverrouille PAS le chemin (le verrouillage anti-lacunes reste) ; il personnalise :
  - le message d'accueil (« مسار واقعي : 3 دروس/أسبوع → جاهز في جانفي »),
  - l'ordre de priorité de révision des cartes كفاءة,
  - une ligne dans أنا : « نقاط قوتك الظاهرة : المناعة. نقاط تتطلب مراجعة : الجيولوجيا. »
- **Stockage** : `etat.diagnostic = { fait, resultats par unite }`.

### T3.2 🔴 Objectif de note + pacing personnalisé (4 j)
- Choix à l'inscription (modifiable) : « أطمح إلى 10+ / 14+ / 18+ ».
- Ajuste : nombre de bonus/jour suggéré, seuil de la revue hebdo (2 revues → 3 pour l'objectif 18), et le contenu du parcours J-60 (T3.3).

### T3.3 🔴 Mode « المراجعة المكثّفة » J-60 (10 j)
- **Problème** : quota 1 leçon/jour = rythme de début d'année ; un élève qui installe l'app en avril est noyé dans la file SM-2.
- **Action** : bascule automatique à J-60 avant le Bac (date saisie à l'inscription ou, à défaut, date nationale 2026) :
  - priorité aux leçons `priorite: 1` non terminées (T2.1),
  - SRS compressée : échelle J+1/J+3 seulement, la carte « sort » après 2 revues réussies,
  - quota levé : 2–3 leçons/jour, restes 100 % drills + examen blanc hebdo (T5.1),
  - désactivable — le mode normal reste la norme.

### T3.4 🟡 Révisions croisées inter-domaines (5 j)
- Nouvelle revue hebdomadaire « استرجاع متقاطع » (dimanche, 10 min) : 1 carte leçon de chaque domaine + 1 carte كفاءة — mixe bio/géo dans une même session (le comportement de l'examen blanc, systématisé).
- Plafonnée à 1/semaine, silencieuse si aucune carte due.

### T3.5 🟡 Statistiques par unité → repérage des lacunes (4 j)
- Étendre `stats.ts` : réussites/fautes par `axe` (les drills portent déjà `a: 1..49`) et par unité.
- Dans أنا : « الأقوى : … · الأضعف : … » + lien direct vers le 1er drill de l'axe faible.

### T3.6 🟢 Rappels locaux opt-in (3 j)
- Capacitor Local Notifications (déjà dans l'écosystème Capacitor) : 1 notification/jour max, heure choisie par l'élève, texte doux (« درسُك مستحقّ التاريخ — 10 دقائق تكفي »). Désactivée par défaut. Pas de push serveur.

**Score cible A3 : 9,0** — moteur déjà excellent (8,5/10 intrinsèque) ; + diagnostic + objectif + J-60 + croisées → 9.

---

## AXE 4 — Exercices & tests (6,5 → 9,0) — gain +0,30

### T4.1 🔴 1 question de synthèse libre par unité (11 exos) (10 j)
- **Problème majeur** : « zéro écriture libre » → la Partie III du Bac n'est jamais entraînée en conditions.
- **Action** : composant `SyntheseLibre` : situation Bac (ex. « فسّر آلية رفض الطعم مستندًا إلى الوثيقتين ») → **champ texte libre** (saisie clavier, non bloquée) → l'élève s'auto-évalue en cochant lui-même la grille سند·تحليل·ربط·استنتاج → affichage du modèle + خطأ شائع → carte كفاءة SM-2.
- **Anti-stress conservé** : pas de note machine, pas de correcteur IA — l'élève compare, il n'est pas noté.
- **Critère** : 11 exercices (1/unité), intégrés dans مساري (après le جسر) et redo à volonté.

### T4.2 🔴 200 drills niveau 3 « difficile » (12 j, éditorial)
- **Constat** : 620 items sur 2 niveaux seulement (`n:1` définitions, `n:2` QCM).
- **Action** : +200 items `n:3` : QCM à pièges composés (2 pièges officiels de l'unité combinés), mini-documents à interpréter (courbe, tableau), extrait de sujet Bac reformulé. Distribution : u4 (30), u3/u9/u11 (20 chacun), reste équilibré.
- **Critère** : 820 items, 3 niveaux ; badge de niveau visible (١/٢/٣).

### T4.3 🟡 Schémas à légender génériques (8 j)
- Composant `SchemaALegender` : SVG + 6–8 étiquettes à glisser-déposer (fallback : tap zone puis tap étiquette pour les petits écrans).
- 10 schémas prioritaires : synapse, neurone + potentiel, chloroplaste + thylakoïde, mitochondrie, séquence orogénique, zone de subduction (Benioff), profil sismique + enveloppes, ABO/CMH, codon/ARNt, structure du globe.
- Réutilisable par l'examen blanc (Partie I « تعبئة المخطط »).

### T4.4 🟡 Renvoi automatique au cours après échec (3 j)
- 2 échecs consécutifs dans un même axe → carte d'invitation « راجع الدرس » (bouton 📖 vers `urlLecon()` — le mapping axe↔unité↔leçon existe déjà via `drills/axes.ts` + `uniteDeLecon()`).
- Ne force pas : simple porte ouverte.

### T4.5 🟢 Vrai/Faux justifié (3 j)
- Convertir 40 définitions `n:1` en vrai/faux avec justification à choisir parmi 3 (le « pourquoi » est le point de notation du Bac).

**Score cible A4 : 9,0** — QCM très riche (8) + production libre + n3 + légende → 9.

---

## AXE 5 — Sujets Bac + simulation (3,5 → 9,0) — gain +0,55 (chantier n°1)

### T5.1 🔴 Intégrer les 4 sujets Bac officiels corrigés (18 j)
- **Constat** : `bac-svt-sujet-2023/2024/2025/2026.pdf` à la racine du dépôt, **non servis** (`public/` ne les contient pas, `dist/` non plus).
- **Action** :
  1. Créer `public/sujets/` + lecteur PDF intégré (or saisie structurée préférable : voir T5.2).
  2. Pour chaque sujet : page interactive « سابق 2025 — العلوم التجريبية » : Partie I (QCM du sujet, réponses officielles), Partie II (démarche, gabarit استقصاء existant réutilisé), Partie III (synthèse, T4.1).
  3. Corrigé détaillé type jury : barème chiffré par point, mots-clés attendus, réponses alternatives signalées (« يُقبل أيضًا : … »).
  4. Precache SW (PDF = ~1 Mo chacun, total acceptable).
- **Critère** : 4 sujets interactifs + corrigés, consultables hors ligne.

### T5.2 🔴 Mode examen chronométré optionnel (8 j)
- Nouveau mode `examenReel` sur chaque sujet intégré :
  - minuteur **opt-in** 3 h 30 (le mode sans chrono reste disponible — l'anti-stress n'est pas abandonné),
  - interface sobre type copie (thème paper, sans mascotte ni sons de célébration),
  - corrigé **verrouillé** jusqu'à « أنهيتُ الامتحان »,
  - à la fin : auto-évaluation grille + temps passé (affiché en jours/mois libres, jamais en %).

### T5.3 🔴 Sujets blancs + rattrapage (6 j)
- 2 sujets blancs rédigés (1 complet, 1 style rattrapage — format 2 exercices) construits sur les gabarits existants (enquête + QCM + synthèse).
- **Critère** : 6 « sujets » au total consultables + 4 officiels.

### T5.4 🟡 Générateur de variantes d'examen blanc (6 j)
- Remplacer l'examen blanc unique fixe par un moteur de tirage : 6 QCM (2/domaine) + 1 enquête tirée du pool (3 existantes + 3 nouvelles) + 1 légende (T4.3) → chaque session produit un sujet différent, re-jouable.
- Grille barème conservée ; réutilise `composerJoueur()` de `utils/drills.ts`.

### T5.5 🟡 Statistiques par type de sujet (3 j)
- Historique des examens passés (`etat.examens[]`) : date, type (officiel/blanc/variante), axes ratés, temps si chrono — tableau dans أنا + lien vers carnet des failles.

**Score cible A5 : 9,0** — de 3,5 : annales ✔ + chrono ✔ + corrigés jury ✔ + variantes + stats. (Reste hors cible : base d'annales 2018–2022 en interactif — acceptable à 9.)

---

## AXE 6 — UX/UI & ergonomie cognitive (7,0 → 9,0) — gain +0,20

### T6.1 🔴 Compression du splash (1 j)
- `ouverture.mp4` : 12,78 Mo → **≤ 3 Mo** (2–3 s, 720p, H.265/H.264 optimisé ou séquence WebP/WebM). Économie ~70 % du precache. Considération data mobile prépayée.

### T6.2 🟡 Recherche plein texte (5 j)
- Index local à la construction (script Vite) sur les 25 HTML + 58 Résumés d'Or + glossaire (~150 Ko) ; recherche depuis l'en-tête (🔍), résultats filtrables par unité, ouverture au chapitre (`#hash` existant).

### T6.3 🟡 Favoris / الإشارات المرجعية (3 j)
- `etat.favoris: string[]` (lessonIds) + bouton ☆ sur chaque leçon + écran « المفضلة » dans أنا ; rejouable via SessionRevision.

### T6.4 🟡 Taille de texte ajustable (3 j)
- Réglage `etat.tailleTexte: 's' | 'm' | 'l'` → `html { font-size }` (respecte `rem`), répercuté dans les iframes de leçons via query param consommé par les 25 HTML (une règle CSS partagée).

### T6.5 🟢 Test réel sur appareil bas de gamme (2 j)
- Protocole : Redmi 9A / Samsung A12 (RAM 2 Go) — cold start, chargement d'une leçon HTML, drill, examen blanc. Mesures : temps de démarrage < 4 s cible, zéro ANR. Documenté dans `plans/tests-appareils.md`.
- (Complète l'audit : ce point était « Non vérifiable ».)

**Score cible A6 : 9,0** — 7 : base déjà très soignée + recherche + favoris + taille texte + poids réduit + test réel → 9.

---

## AXE 7 — Interactivité & engagement (6,0 → 9,0) — gain +0,39

### T7.1 🔴 Quiz adaptatif dans les drills (7 j)
- **Action** : dans une journée de 10 items (`composerJoueur()`), l'item suivant dépend du score courant : 2 réussites de suite → `n+1` ; 2 échecs → `n−1` + rappel de cours (T4.4). Bornes n∈[1,3].
- L'élève voit la montée comme un « escalier » (تصعيد), jamais un échec de niveau.

### T7.2 🟡 Défis hebdomadaires doux (5 j)
- « تحدّي الأسبوع » (lundi → dimanche) : 3 objectifs possibles et choisis (20 drills / 1 revue croisée / 1 examen blanc) → badge d'achèvement (palier contenu, pas de classement). Compte la **régularité**, pas la performance.

### T7.3 🟡 Badges de progression discrets (4 j)
- 8 badges contenus (ex. « فتحت الوحدة 5 », « 30 revue SM-2 », « 100 drill », « جسر كامل ») affichés dans أنا — paliers de contenu, zéro comparaison entre élèves.

### T7.4 🟡 Position douce (via sync existante) (4 j)
- `supabase/schema.sql` + `queries-admin.sql` permettent déjà les agrégats. Ajout : « أنت في المدى المتوسط للطلبة النشطين هذا الأسبوع » (bande, pas rang). Opt-in : affiché seulement si sync activée.

### T7.5 🟢 « المُرشد الموسّع » — FAQ méthodologique interactive (5 j)
- Remplace un chatbot IA (hors périmètre offline) : 25 questions/réponses méthodo structurées (« كيف أتخذ فرضية؟ », « ماذا أفعل إذا نسيت كل شيء في الامتحان؟ ») en arborescence de clics, branchée sur la mascotte.

### Hors périmètre 90 (à garder en backlog) : forum communautaire, chatbot IA en ligne, version iOS.

**Score cible A7 : 9,0** — boucle déjà fermée (8) + adaptatif + défis + badges + position douce → 9.

---

## AXE 8 — Fiabilité & accessibilité économique (7,0 → 8,5) — gain +0,15

### T8.1 🔴 Consentement sync explicite (2 j)
- **Constat** : `consentementSync: true` par défaut à l'inscription — pas un opt-in pour des mineurs.
- **Action** : écran dédié après inscription : « هل تريد مشاركة ملخّص تقدّمك مع المُطوِّر؟ » → نعم / لا، لاحقًا. Les installs existantes gardent leur état (compat `=== false` conservée) mais une invitation à confirmer s'affiche une fois.

### T8.2 🟡 FAQ + page « حول التطبيق » (3 j)
- Onglet أنا : section دعم (email de contact, 8 FAQ : perte de progression → import JSON, sync, mode hors ligne…), version affichée, crédits (professeurs validateurs — lien avec T1.1).

### T8.3 🟡 Externalisation du contenu éditorial (6 j)
- Les Résumés d'Or + drills + glossaire exportés en JSON versionné, servis depuis un CDN léger avec cache SW (stale-while-revalidate) → **correction d'une leçon sans republishing de l'APK** ; fallback local si hors ligne.
- Simplifie directement T1.1 (relecture continue) et T4.2 (nouveaux drills).

### T8.4 🟢 Publication Play Store — track interne puis ouvert (5 j)
- Signature release, AAB, Data Safety form (données : compteurs de progression, pseudonyme email, wilaya — rien de sensible), puis collecte des avis = retour d'itération.
- iOS : backlog (pas bloquant pour 90 ; le public cible est majoritairement Android).

**Score cible A8 : 8,5** — la conformité consentement + support + maintenance du contenu fait le reste. (La pub payante/paywall resteront absents : c'est une force, pas un manque.)

---

## 🗓️ Roadmap — 6 sprints sur 14 semaines

| Sprint | Semaines | Contenu | Gain pondéré cumulé |
|---|---|---|---|
| **S0 — Socle** | 1–2 | T1.2 défauts · T8.1 consentement · T6.1 splash · T2.1 priorité (données) · **démarrage T1.1 relecture (5 leçons/sem dès S0)** · T3.2 objectif de note | 65 → 68 |
| **S1 — Bac réel** | 3–5 | T5.1 sujets officiels · T5.2 chrono · T5.3 sujets blancs · T4.1 synthèse libre (début) | 68 → 74 |
| **S2 — Exercices** | 6–8 | T4.1 fin · T4.2 200 drills n3 · T4.3 légende · T4.4 renvoi cours · T5.4 variantes | 74 → 79 |
| **S3 — Personnalisation** | 9–10 | T3.1 diagnostic · T3.3 J-60 · T3.4 croisées · T3.5 stats/unité · T3.6 rappels | 79 → 83 |
| **S4 — Contenu** | 11–12 | T2.3 glossaire · T2.4 12 cours HTML · T2.5/2.6/2.7 · T7.1 adaptatif | 83 → 87 |
| **S5 — Engagement & finition** | 13–14 | T7.2/7.3/7.4 · T6.2/6.3/6.4 · T8.2/8.3 · T6.5 test appareils · **re-audit complet (8 axes)** | 87 → **90** |

**Parallélisation clé :** la relecture professorale (T1.1, ~30 j-homme) court en tâche de fond sur
toutes les semaines — c'est le chemin critique humain, il doit démarrer en S0.

**Règle de qualité :** chaque sprint se termine par `tsc -b && vite build` vert + banc de tests
étendu (cible : +15 tests par sprint, 40 → ~115) + une re-vérification anti-stress des 5 conventions
sur toute fonctionnalité ajoutée.

---

## 📌 Tableau de bord des tâches

| ID | Axe | Tâche | Effort | Priorité | Gain pondéré |
|---|---|---|---|---|---|
| T5.1 | 5 | 4 sujets Bac corrigés intégrés | 18 j | 🔴 | ~0,20 |
| T1.1 | 1 | Relecture professorale 58 leçons | 30 j | 🔴 | ~0,20 |
| T5.2 | 5 | Mode chronométré opt-in | 8 j | 🔴 | ~0,10 |
| T4.1 | 4 | Synthèse libre par unité | 10 j | 🔴 | ~0,10 |
| T3.1 | 3 | Test de positionnement | 8 j | 🔴 | ~0,06 |
| T7.1 | 7 | Quiz adaptatif | 7 j | 🔴 | ~0,08 |
| T2.1 | 2 | Priorité 🔴/🟡/🟢 par leçon | 5 j | 🔴 | ~0,05 |
| T3.3 | 3 | Mode J-60 | 10 j | 🔴 | ~0,06 |
| T5.3 | 5 | Sujets blancs + rattrapage | 6 j | 🔴 | ~0,08 |
| T8.1 | 8 | Consentement opt-in | 2 j | 🔴 | ~0,02 |
| T6.1 | 6 | Splash ≤ 3 Mo | 1 j | 🔴 | ~0,02 |
| T4.2 | 4 | +200 drills n3 | 12 j | 🔴 | ~0,06 |
| T4.3 | 4 | Schémas à légender | 8 j | 🟡 | ~0,04 |
| T2.3 | 2 | Glossaire AR↔FR | 6 j | 🟡 | ~0,04 |
| T2.4 | 2 | 12 cours HTML manquants | 10 j | 🟡 | ~0,05 |
| T3.4 | 3 | Révisions croisées | 5 j | 🟡 | ~0,03 |
| T3.5 | 3 | Stats par unité | 4 j | 🟡 | ~0,03 |
| T5.4 | 5 | Variantes d'examen blanc | 6 j | 🟡 | ~0,06 |
| T5.5 | 5 | Stats examens | 3 j | 🟡 | ~0,02 |
| T6.2 | 6 | Recherche plein texte | 5 j | 🟡 | ~0,04 |
| T6.3 | 6 | Favoris | 3 j | 🟡 | ~0,02 |
| T6.4 | 6 | Taille de texte | 3 j | 🟡 | ~0,02 |
| T7.2 | 7 | Défis hebdo | 5 j | 🟡 | ~0,06 |
| T7.3 | 7 | Badges contenus | 4 j | 🟡 | ~0,04 |
| T7.4 | 7 | Position douce | 4 j | 🟡 | ~0,03 |
| T8.2 | 8 | FAQ + à propos | 3 j | 🟡 | ~0,02 |
| T8.3 | 8 | Contenu externalisé | 6 j | 🟡 | ~0,02 |
| T1.2 | 1 | Défauts documentés | 2 j | 🟡 | ~0,02 |
| T1.3 | 1 | Périmètre filière explicite | 3 j | 🟡 | ~0,02 |
| T2.2 | 2 | Poids en langage clair | 2 j | 🔴 | ~0,02 |
| T2.5 | 2 | Fiche « 3 phrases » | 3 j | 🟡 | ~0,02 |
| T3.2 | 3 | Objectif de note | 4 j | 🔴 | ~0,03 |
| T3.6 | 3 | Rappels locaux opt-in | 3 j | 🟢 | ~0,02 |
| T4.4 | 4 | Renvoi cours après échec | 3 j | 🟡 | ~0,03 |
| T4.5 | 4 | Vrai/Faux justifié | 3 j | 🟢 | ~0,02 |
| T6.5 | 6 | Test appareils bas de gamme | 2 j | 🟢 | ~0,01 |
| T7.5 | 7 | Mُرشد FAQ interactive | 5 j | 🟢 | ~0,03 |
| T8.4 | 8 | Play Store (interne → ouvert) | 5 j | 🟢 | ~0,01 |
| T1.4 | 1 | Références par unité | 1 j | 🟢 | ~0,01 |
| T2.6 | 2 | 8 tableaux comparatifs | 4 j | 🟢 | ~0,02 |
| T2.7 | 2 | Objectifs d'apprentissage | 2 j | 🟢 | ~0,01 |

---

## ✅ Critères de succès du plan (re-audit à 90)

1. 58/58 leçons `manuel_officiel_verifie` avec professeur nommé (A1).
2. 4 sujets officiels + 2 blancs, chronométrage opt-in, corrigés barémés (A5).
3. ≥ 1 exercice de rédaction libre par unité, bouclé en SM-2 (A4).
4. Diagnostic initial + objectif de note + mode J-60 fonctionnels (A3).
5. 820 drills / 3 niveaux / 11 unités (A4).
6. Splash ≤ 3 Mo, recherche, favoris, taille de texte (A6).
7. Quiz adaptatif + défis + badges (A7).
8. Consentement opt-in + FAQ + contenu externalisé (A8).
9. Banc de tests ≥ 115 verts, build vert, zéro régression des 40 tests actuels.
10. Re-audit indépendant sur les 8 axes : **≥ 89,5/100 pondéré**.
