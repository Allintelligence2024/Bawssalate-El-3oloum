# Radiographie technique & produit — بوصلة العلوم Lite

> Document destiné à un architecte produit **externe** qui doit décider s'il faut — et comment —
> greffer un système « Guide-First » (mascotte explorateur, micro-quêtes de 3 minutes, boucle
> Boussole 1-2-3) sur l'application existante **sans casser** le dashboard de progression ni le
> modèle de données.
>
> Méthode : lecture directe du code source du dépôt `Allintelligence2024/Bawssalate-El-3oloum`
> (branche `arena/a897fbff-bawssalate-el-3oloum`, base `54e034d`), le 2026-11-21. Tous les chiffres
> sont mesurés sur les fichiers (`wc -l`, `grep -c`, `dist/precache-manifest.json`) ; les noms de
> types et de fonctions sont ceux réellement exportés. Quand une information n'est pas dans le
> dépôt (état d'un service en ligne, usage réel, droits), la mention
> **`Non vérifiable depuis le dépôt`** est écrite explicitement.
>
> Aucun fichier de code n'a été modifié : ce rapport est le seul livrable.

---

## 1. Identité technique, stack et arborescence réelle

### 1.1 Carte d'identité

| Élément | Valeur lue dans le dépôt | Preuve |
|---|---|---|
| Nom produit (UI) | **بوصلة العلوم** / « بوصلة العلوم Lite » | `src/App.tsx` (en-tête `app-brand`), `public/manifest.webmanifest` (`short_name`) |
| Nom de paquet | `bousala-al-ouloum-lite`, version **0.10.5**, `"type": "module"` | `package.json` |
| Nature | PWA 100 % arabe (RTL), **offline-first**, aucun serveur obligatoire | `index.html` (`lang="ar" dir="rtl"`), `src/types.ts` (commentaire d'en-tête) |
| Domaine | Sciences expérimentales, SVT, Bac algérien : 3 domaines → **11 unités** → **56 leçons** | `src/data/programme.ts` (`DOMAINES`, `UNITES`, `TOTAL_LECONS`) |
| Hôte de production | Vercel, `outputDirectory: dist`, `installCommand: npm ci --no-audit --no-fund` | `vercel.json` |
| État réel du déploiement (URL, domaine, variables d'env) | **`Non vérifiable depuis le dépôt`** | — |

### 1.2 Stack (versions exactes de `package.json`)

**Runtime principal**

| Dépendance | Version | Usage réel dans le code |
|---|---|---|
| `react` / `react-dom` | `^19.3.0` | UI entière, `lazy` + `Suspense` par écran |
| `typescript` | `^7.0.2` | `tsc -b` avant chaque build (`build: "tsc -b && vite build"`) |
| `vite` | `^8.3.8` | bundler + plugin maison de manifeste hors-ligne |
| `tailwindcss` + `@tailwindcss/vite` | `^4.3.3` | `@import "tailwindcss"` + `@theme` dans `src/index.css` |
| `zod` | `^4.6.7` | validation stricte des sauvegardes importées (`src/utils/backup.ts`) |
| `@supabase/supabase-js` | `^2.117.2` | import **paresseux** au premier envoi seulement (`src/utils/sync.ts`) |
| `@noble/hashes` | `1.8.0` | repli SHA-256 quand `crypto.subtle` manque (`src/utils/compte.ts`) |
| `@capacitor/core`, `filesystem`, `local-notifications`, `share` (+ `android`) | `^8.6.0` | export de fichiers, partage natif, rappel quotidien local (`src/components/Ana.tsx`, `src/utils/rappels.ts`) — coque Android **expérimentale** |

**Dev / qualité** : `vitest ^5.1.1`, `jsdom ^24.0.0`, `@testing-library/*`, `axe-core ^4.14.1`,
`playwright ^1.65.1`, `eslint ^9.39.5`.

**Ce qui n'est pas dans le projet** (vérifié par absence de dépendance et commentaire
`vite.config.ts`) : pas de `vite-plugin-pwa`, pas de `framer-motion`, pas de `d3`, pas de `jspdf`,
pas de bibliothèque de graphiques. Conséquence architecturale : **le PWA est fait à la main**
(`public/manifest.webmanifest` + `public/sw.js` + `src/utils/pwa.ts` + plugin
`precacheManifest()` dans `vite.config.ts`).

### 1.3 Scripts et chaîne de vérification

```
package.json
  dev                      animateur local (vite, port 3000)
  build                    tsc -b && vite build
  test                     vitest run && node --test scripts/verifier-inventaire-boussole.test.mjs
  lint                     eslint .
  verifier:metriques       node scripts/sync-metrics.mjs --check   (README vs code)
  verifier:parite-rls      node scripts/verifier-parite-rls.mjs     (schéma SQL vs fixtures)
  verifier:deploiement     node scripts/verifier-deploiement.mjs
  verifier:inventaire-boussole
```

CI unique `.github/workflows/ci.yml` (« Vérifications ») : fichiers > 10 Mo, `tsc --noEmit`, lint
(non bloquant), `npm test`, `npm run build`, `verifier-drills`, `verifier-hors-ligne`,
`verifier:deploiement`, `verifier:metriques`, parité RLS si `SUPABASE_DB_URL` est fourni,
`npm audit`, puis reconstruction du laboratoire `modules/boussole`.

Dernier run CI de la branche (vérifié avec `gh run list`) : run **45607310494**,
`conclusion: success`, commit `dc89089`. Dernier run local complet de cette branche : **626 cas
de test** exécutés, `tsc -b` et lint sans erreur, build OK, coquille hors ligne **2,495 Mio** ≤
plafond 2,5 Mio (chiffre de session ; le plafond est, lui, re-vérifié par
`scripts/verifier-hors-ligne.mjs`).

Nombre de fichiers de tests **comptés dans le dépôt** : `find src -name '*.test.ts*'` → **73**
(21 dans `src/__tests__`, 52 dans `src/utils/__tests__`).

### 1.4 Volumétrie du code (mesurée)

| Mesure | Valeur |
|---|---|
| Fichiers `.ts` / `.tsx` sous `src/` | **247** |
| Lignes sous `src/` | **43 955** |
| Composants `.tsx` (`src/components/`) | **69** fichiers, **16 644** lignes |
| Modules logiques `.ts` (`src/utils/`) | **49** (+ 52 fichiers de tests) |
| Fichiers de tests | **73** |
| Taille de `src/data/` | **1,6 Mo** |
| `public/lecons/` | **25** fichiers HTML pré-rendus |
| `App.tsx` | **1 597** lignes, **31** `lazy(() => import(...))`, **28** variantes de `type Mode` |
| Plus gros fichiers | `components/Methodologie.tsx` 1 928 · `data/qcmLecons.ts` 1 628 · `App.tsx` 1 597 · `data/lessonGoldSummaries.ts` 1 190 · `components/ProtocoleRunner.tsx` 1 003 · `components/Ana.tsx` 788 · `components/Exercices.tsx` 751 |
| `index.css` | **675** lignes, deux thèmes, ~45 jetons de couleur |

### 1.5 Arborescence réelle (niveau utile)

```
Bawssalate-El-3oloum/
├── index.html                     # lang="ar" dir="rtl"
├── package.json                   # 0.10.5, type: module
├── vercel.json                    # build/install, en-têtes de cache
├── vite.config.ts                 # plugin precacheManifest(), __APP_VERSION__
├── eslint.config.mjs              # lint JS uniquement (cf. src/__tests__/lint.test.ts)
├── README.md                      # 915 lignes, bloc METRICS généré
├── plans/                         # plans directeurs, QA, inventaires, ce rapport
│   └── sources/{REGISTRE.md, INVENTAIRE-BOUSSOLE-…, medias/}
├── scripts/                       # 13 scripts .mjs (métriques, hors-ligne, RLS, drills…) + 1 .py + 1 .sql
├── public/
│   ├── manifest.webmanifest       # ar, rtl, standalone, 4 icônes
│   ├── sw.js                      # service worker 2 niveaux (coquille / contenu)
│   ├── mascotte.webp              # 14 592 o — buste du « capitaine »
│   ├── personnage-pirate.webp     # 61 950 o — poster de l'écran de démarrage
│   ├── ouverture.mp4              # 2 050 998 o, 1080×1920, muet
│   ├── boussole/                  # laboratoire autonome + 2 PDF
│   └── lecons/                    # 25 leçons HTML pré-rendues
├── modules/boussole/              # sous-projet autonome (React 18, esbuild, ses tests)
├── supabase/                      # schema.sql + 2 migrations + 2 propositions + tests
└── src/
    ├── App.tsx                    # coquille, 4 onglets, 28 modes, 31 lazy
    ├── main.tsx                   # montage, Capacitor, service worker
    ├── index.css                  # design system (tokens + classes)
    ├── types.ts                   # Etat (47 champs) et tous les modèles
    ├── types/boussoleBridge.ts    # contrat d'événement iframe
    ├── config/annee.ts            # calendrier scolaire (fenêtres des 11 unités)
    ├── hooks/useBoussoleBridge.ts # seule « glue » React du pont iframe
    ├── __tests__/                 # 21 tests UI/intégration
    ├── components/                # 69 composants
    │   ├── methodologie/          # sous-composants du laboratoire (schémas, etc.)
    │   └── Carte*.tsx             # 13 « cartes » du dashboard (Ana, Aujourdhui, Bac)
    ├── data/                      # contenu pédagogique typé (briques, drills, sujets…)
    │   ├── briques/  (4)  corriges/ (14)  drills/ (7)  methodologie/ (6)  schemas/ (1)  sujets/ (3)
    └── utils/                     # moteur, SRS, stockage, sync, ponts, télémétrie
```

### 1.6 Écarts README ↔ code (à connaître avant d'architecture)

Le README est un document de développeur, souvent en retard d'une version. Écarts mesurés :

| Affirmation README | Réalité mesurée dans le code | Impact |
|---|---|---|
| « **30 sujets** 2013→2026 » (README, tableau des onglets) | **28** objets `SujetOfficiel` avec `id: 'AAAA-N'` (6 dans `sujetsOfficiels.ts`, 8 `s2013_2016`, 8 `s2017_2022`, 6 `s2024_2026`) | Le bloc `METRICS` du même README dit bien 28 : incohérence **interne** au README. L'UI affiche `SUJETS_OFFICIELS.length` (`Bac.tsx`), donc 28. |
| « 620 items (500 QCM + 120 définitions) » | **700** items dans 4 fichiers (`domaine1` 267, `domaine2` 162, `domaine3` 191, `niveau3` 80) sur **49** axes | Vieux chiffre de la v0.5 ; le script `sync-metrics` commente explicitement l'écart 620/700. |
| « **58 leçons** » (intro) | `lessonIds` = **56** ; `CHEMIN` = **69** entrées = 56 leçons + 2 prérequis re-déclarés + 11 jalons | L'UI affiche `CHEMIN.length` (69) dans `Masari.tsx` et `Aujourdhui.tsx`. |
| « coquille **1,91 Mio** » | `dist/precache-manifest.json` → `octetsCoquille = 2 616 047` (**2,49 Mio**), `octetsContenu = 4 391 506` | Le bloc `METRICS` est à jour ; le corps du README ne l'est pas. |
| « `murajih_svt_v1`, **version 2** » | `VERSION_ETAT = 3` (`src/utils/etat.ts`) | La migration v1/v2 → v3 est réelle et testée (`migration-etat.test.ts`). |
| « stockage = `murajih_svt_v1` » seul | **10** clés distinctes (voir §2.2) | Un architecte qui ne sauvegarde que la clé principale perd les statistiques, la télémétrie et le carnet Boussole. |

---

## 2. Base de données, stockage local et modèles de données

### 2.1 Vue d'ensemble : trois étages

```
┌──────────────┐   aucune requête obligatoire   ┌───────────────────────┐
│  Navigateur  │───────────────────────────────►│  Contenu pédagogique  │
│ localStorage │                                │  bundlé (src/data)    │
│ (~10 clés)   │◄───────────────────────────────│  + 25 HTML statiques  │
└──────┬───────┘        lecture seule           └───────────────────────┘
       │
       │  opt-in explicite + consentement + jeton
       ▼
┌──────────────────────┐
│  Supabase (Postgres) │  1 table : public.eleves
│  RLS + colonne       │  aucune lecture de progression par l'app
│  charge_utile jsonb  │
└──────────────────────┘
```

**Le produit fonctionne à 100 % sans Supabase.** Le dépôt le déclare deux fois : dans
`src/types.ts` (« الحالة كلها في المتصفح. لا خادم ») et dans les commentaires de
`supabase/migrations/202611210002_generation_suppression.sql` (synchronisation « éteinte en
prod », `VITE_SUPABASE_*` absents de Vercel). **État réel du projet Supabase et des variables
Vercel : `Non vérifiable depuis le dépôt`.**

### 2.2 Stockage local — inventaire exhaustif des clés

| Clé (constante) | Type | Écrit par | Contenu |
|---|---|---|---|
| `murajih_svt_v1` (`CLE_ETAT`, alias interne `CLE`) | `localStorage` | `src/utils/storage.ts` | **Tout l'état** `Etat` (47 champs) : progression, jalons, notes, carnet d'erreurs, XP, réglages, consentement, brouillons de sujets. |
| `kunz_stats_v1` (`CLE_STATS`) | `localStorage` | `src/utils/stats.ts` | `StatsReponses` : `justes`, `fausses`, `parSource` (5 sources), `parJour` (45 jours glissants). Volontairement **hors** de `Etat`. |
| `kunz_telemetrie_v1` (`CLE_TELEMETRIE`) | `localStorage` | `src/utils/telemetrie.ts` | Compteurs locaux de pilote (entrées/abandons/durées par phase, blocages de portes, délais de sync). **N'est jamais envoyée.** |
| `boussole.bac.classe16.carnet.1` (`CLE_CARNET_BOUSSOLE` = `ENTRY_KEY`) | `localStorage` | `modules/boussole/src/entry.ts` (+ lecture/écriture via `src/utils/carnetBoussole.ts`) | Carnet de textes du laboratoire Boussole. **Non lié au compte**, partagé entre documents de la même origine. |
| `murajih_restauration_v1` (`CLE_RESTAURATION` = `RESTORE_KEY`) | `localStorage` | `src/utils/storage.ts` | Journal d'une restauration en cours (état + stats + carnet), rejoué au chargement suivant. |
| `kunz_session_v1` (`CLE_SESSION`) | `sessionStorage` | `src/utils/compte.ts` | E-mail de la session ouverte (reste ouverte tant que l'onglet vit). |
| `kunz_theme` | `localStorage` | `src/App.tsx` | `'light'` \| `'dark'`. |
| `design_theme` | `localStorage` | `src/components/AtelierDesign.tsx` | Thème de l'atelier de design (usage isolé, même attribut `data-theme`). |
| `kunz_intro_vue` | `localStorage` | `src/App.tsx` | Intro vidéo déjà vue **sur cet appareil** (v0.13). |
| `kunz_demarrage` | `sessionStorage` | `src/App.tsx` / `EcranDemarrage.tsx` | Intro déjà vue **dans cette session d'onglet**. |

Toute écriture passe par les garde-fous de `src/utils/echecsStockage.ts`
(`signalerEchecStockage`) : un quota plein n'est jamais silencieux, il déclenche `AlerteStockage`
dans `App.tsx`.

### 2.3 Modèle `Etat` (47 champs) — le vrai « schéma » du produit

`src/types.ts`, `interface Etat`. Groupes fonctionnels :

- **Identité / compte** : `modeInvite?`, `compte?: Compte` (e-mail, `motDePasse` haché SHA-256
  préfixé `kunz::`, `jeton`, wilaya `01..58`, daïra, `creeLe`), `nom`, `dateBac?`.
- **Progression** : `progression: Record<lessonId, ProgressionLecon>` — `statut`
  (`vierge|en_cours|terminee`), `phases: number[]` (1..6), `minutes`, `derniereSession`,
  `repetitions`, `intervalle`, `facilite` (SM-2), `prochaineRevision`, `lue`, `fragile`,
  `reponses: Record<phase, string>`, `diagnostic`, `note`, `reussitesIntensif`, `acquisIntensifLe`.
- **Jalons** : `jalons: Record<uniteId, JalonUnite>` (`fait`, `synthese`, `ts`).
- **Mémoire** : `notes: NoteCarnet[]`, `carnet?: FauteCarnet[]` (erreurs atomiques, sans la bonne
  réponse), `kafaa?: Record<clé, CarteKafaa>` (cartes de compétence, même SM-2), `flashcards?`
  (boîtes de Leitner indépendantes), `drills?`, `ateliers?`, `schemas?`.
- **Rythme / quotas** : `minutesTotales`, `revisions`, `journal: string[]` (jours ISO),
  `seancesJour`, `seancesComptees`, `bonusJour`, `kafaaHebdo`, `objectif?: 10|14|18`,
  `modeIntensif?: 'auto'|'on'|'off'`.
- **Entraînement Bac** : `maitriseSujets?` (auto-évaluation 0/1/2 par consigne),
  `brouillonsSujets?` (**jamais envoyés**), `bacEtapes?`, `bacExercices?`, `examens?`
  (`BilanExamen[]`), `examensBlancs?`, `derogationsSujets?`, `trophees?`, `defis60?`.
- **Briques (1-2-3)** : `briques?` (dernière tentative par clé), `trophees?`.
- **Produit / confort** : `favoris?`, `diagnostic?`, `diagnosticDecideLe?`, `rappel?`
  (`{actif, heure}`), `tailleTexte?` (`s|m|l`), `consentementSync?`,
  `consentementSyncDecideLe?`, `boussoleEventsSeen?` (déduplication, plafond 500),
  `revueCroisee?`, `defi?`, `defisAccomplis?`, `version`.

**Migration** : `src/utils/etat.ts` — `VERSION_ETAT = 3`, `migrerEtat(brut)` complète les états
v1/v2 avec les défauts, est **idempotente**, et **lève** sur une version future plutôt que de
deviner. `etatDepuisBrut()` normalise les dictionnaires (`progression`, `jalons`, `kafaa`,
`drills`, `ateliers`, `cartesLecons`, `briques`) pour que les lecteurs puissent toujours itérer.

### 2.4 Fiabilité du stockage : ce qui est vrai, ce qui n'est pas garanti

Dans `src/utils/storage.ts` (classes `RestaurationEnAttente`, `EtatIllisible`,
`verifierLectureEtat`, `suspendreEcrituresLocalement`, `abandonnerJournalRestauration`) :

- **Atomicité d'une restauration** (import de sauvegarde ou remise à zéro) : les valeurs à écrire
  sont d'abord déposées dans **un seul journal** `murajih_restauration_v1`, puis appliquées ; en
  cas d'échec, les anciennes valeurs sont restaurées ; si le retour arrière échoue, le journal
  **reste** et sera rejoué au prochain chargement. Un journal illisible bloque l'interface
  (`EcranReprise` dans `App.tsx`) au lieu d'afficher une copie partielle.
- **Multi-onglets** : `src/utils/coherenceStockage.ts` mémorise les valeurs lues/écrites
  (`memoriserValeur`) et les compare avant toute opération sensible (`verifierCoherence`). Le
  fichier dit lui-même : « ce n'est **PAS** un verrou ni une transaction ». Les modifications
  concurrentes **ne sont pas fusionnées**.
- **Protection contre l'écrasement** : si la lecture a échoué, `lectureEnEchec` empêche toute
  sauvegarde (`sauvegarderEtat` sort sans écrire) — l'élève peut travailler, mais rien n'est
  présenté comme sauvé.
- Ce qui **n'est pas** garanti : transaction inter-onglets, fusion, écriture entre `getItem` et
  `setItem`, anciennes versions ignorant ces contrôles. C'est écrit dans le code et dans le README.

### 2.5 Sauvegarde / restauration (export JSON)

- `src/utils/backup.ts` : schéma **zod** strict, `TAILLE_MAX_SAUVEGARDE = 5 MiB`, collections
  bornées à 5 000 entrées, textes 10 000 caractères. `lireSauvegarde()` valide **avant** toute
  écriture.
- **Point critique pour tout ajout de champ** : `etatSchema` est un `z.object(...)` explicite.
  Un champ ajouté à `Etat` mais oublié dans `etatSchema` est **silencieusement supprimé** à
  l'import (comportement par défaut de zod : strip). C'est le principal piège du modèle.
- **Défaut mesuré aujourd'hui** (comparaison automatique des 47 champs de `interface Etat` avec le
  schéma) : **13 champs manquent** dans `etatSchema`.
  - *Volontaire* (compte/consentement jamais importés) : `compte`, `consentementSync`,
    `consentementSyncDecideLe`.
  - *Subi* : `modeInvite`, `fakh`, `fakhSeries`, `bacEtapes`, `bacExercices`, `cartesLecons`,
    `briques`, `derogationsSujets`, `trophees`, `defis60`.
  → Un export « complet » puis un import **efface** ces données (cartes de leçon v0.11, jeux de
  briques, trophées, pièges démasqués, étapes du Bac pas à pas, dérogations) et fait réapparaître
  l'écran de compte à un invité. Le commentaire du schéma montre que l'équipe a déjà rencontré ce
  piège pour `maitriseSujets`/`brouillonsSujets` — la correction n'a pas été généralisée.
- Paquet exporté (`paquetExportComplet`) : `{ application, version, exporteLe, etat, stats,
  carnetBoussole }`. Un export est **refusé** si progression, stats ou carnet sont illisibles
  (`verifierLectureEtat`, `CarnetBoussoleIllisible`).
- L'import **ignore toujours** compte, jeton et consentement (normalisation dans `backup.ts`).
- 4 fixtures historiques traversent `migrerEtat` dans les tests (v1, v2, v2 intensif,
  v2 + carnet) — `src/utils/__tests__/migration-etat.test.ts`, `restauration-atomique.test.ts`.

### 2.6 Supabase — un seul tableau, une seule fonction, cinq policies

`supabase/schema.sql` (96 lignes) + `migrations/202611210001_initial_eleves.sql` (97) +
`202611210002_generation_suppression.sql` (73).

Table `public.eleves` : `email` **PK**, `jeton text not null` (≥ 32 caractères, contrainte
`eleves_jeton_len`), `wilaya`, `daira`, `cree_le`, `nom`, `date_bac`, `xp`, `niveau`,
`lecons_terminees`, `lecons_en_cours`, `lecons_fragiles`, `jalons_faits`, `ateliers_faits`,
`drills_faits`, `minutes_totales`, `revisions`, `seances_comptees`, `jours_activite`,
`reponses_justes`, `reponses_fausses`, `notes_nombre`, `app_version`, `maj`,
`charge_utile jsonb` (≤ 262 144 o), `generation bigint` (migration 2). Index sur `maj`, `xp`,
`wilaya`, `generation`.

Sécurité : RLS activée ; fonction `public.eleves_jeton_autorise(text)` (security invoker, stable)
qui exige un jeton de ≥ 32 caractères au format hexadécimal/UUID v4 **et** égal à l'en-tête
`x-kunz-jeton` de la requête ; policy **RESTRICTIVE** `eleves_jeton_obligatoire` (`for all to anon`,
`using` **et** `with check` sur cette fonction) ; policies permissives `ecriture_app` (INSERT,
regex e-mail + `charge_utile` ≤ 262 144 o), `maj_app` (UPDATE), `suppression_app` (DELETE),
`lecture_proprietaire` (SELECT) ; trigger `eleves_generation_avant_maj` →
`eleves_generation_suivante()` (anti-écrasement concurrent).

Deux conséquences à écrire noir sur blanc pour l'architecte :

1. **Le jeton est la seule frontière**, pas une identité : les policies permissives sont écrites
   `using (true)`, mais elles sont **filtrées par la policy restrictive** — un appelant anon ne
   voit et ne modifie que les lignes dont le `jeton` correspond à SON en-tête. Corollaire : qui
   détient le jeton (stocké côté client, dans `Etat.compte.jeton`) accède en lecture et en
   écriture au miroir de cet élève ; le format du jeton ne prouve ni l'entropie ni l'identité
   (commentaire du SQL), et la clé anon est publique par nature. Ne jamais y écrire de texte
   libre — c'est déjà la règle produit.
2. Cette RLS n'a **pas** été vérifiée contre la base live ici : `verifier:parite-rls` compare le
   SQL à une fixture JSON (`tests/fixtures/parite-rls-2026-11-22.json`), ce qui ne prouve pas
   l'état du projet distant. **`Non vérifiable depuis le dépôt`.**

Ce qui est envoyé (source de vérité : `DONNEES_ENVOYEES` dans `src/utils/sync.ts`) : e-mail, nom,
wilaya, daïra, date du Bac, **identifiants** de leçons/jalons/ateliers, **compteurs** (minutes,
révisions, réponses justes/fausses, jours d'activité, nombre de notes), XP, niveau, version, jeton.
Nuance importante : l'upsert envoie `lecons_terminees: snap.lecons_terminees.length` — **des
décomptes, pas des tableaux**. Jamais envoyés : mot de passe, textes de notes et du carnet,
réponses question par question, diagnostic, favoris, cartes, rappel, revue croisée, défis,
examens blancs.

Sync : opt-in (`consentementSync` + `consentementSyncDecideLe`), client Supabase chargé à la
demande, en-tête `x-kunz-jeton`, `abortSignal(signalDelai())` avec `DELAI_ENVOI_MS = 8_000`,
états publiés `envoi|confirme|erreur|hors_ligne`, suppression serveur possible
(`from('eleves').delete()`). Aucune lecture de progression depuis le serveur : **la sync est un
miroir, pas une source de vérité**. État réel d'activation en prod : `Non vérifiable depuis le
dépôt`.

### 2.7 Modèles de contenu pédagogique

| Type | Fichier | Volume mesuré |
|---|---|---|
| `Domaine`, `Unite`, `ItemChemin` | `src/data/programme.ts` | 3 domaines, 11 unités, 56 `lessonIds`, `CHEMIN` 69 |
| `SujetOfficiel` / `ExerciceOfficiel` / `PartieExercice` / `Consigne` | `src/data/sujetsOfficiels.ts` + `src/data/sujets/s20*.ts` | **28 sujets** structurés (2013→2026, session `عادية`/`استثنائية`), 20 valeurs de `VerbeConsigne` |
| Corrigés (éléments de réponse) | `src/data/sujetsCorriges.ts` + `src/data/corriges/*.ts` (14) | **28 sujets** couverts |
| `ItemDrill` (`u`, `a` (axe), `n` niveau, `q`, `o[4]`, `e`) | `src/data/drills/{domaine1..3,niveau3}.ts` | **700 items**, **49 axes**, réponse correcte toujours en `o[0]`, mélange à l'affichage |
| `JeuBriques` / `BriqueReponse` | `src/data/briques/{u1,sujet-2025-1}.ts` | **6 jeux** : 4 `actif` (u1) + 2 `a_valider_enseignant` (sujet 2025-1). Le statut est **affiché** comme mention (`MENTION_STATUT`), et `jeuActif()` existe + est testé — mais **aucun composant ne l'appelle** : les 2 jeux non relus restent techniquement ouvrables (voir §6.2 et §7.1). |
| `QcmDeLecon` | `src/data/qcmLecons.ts` | 134 questions (rappel + synthèse + piège) |
| Fiches dorées | `src/data/lessonGoldSummaries.ts` | 58 entrées, `reviewed: true` = **0** |
| Schémas à légender | `src/data/schemas/index.ts` | 6 schémas |
| Méthodologie | `src/data/methodologie/*` (6 fichiers) | 11 verbes, 8 attendus (`STATUT_ATTENDUS = 'a_valider_enseignant'`), enquêtes, exercices unité 1 |
| Calendrier | `src/config/annee.ts` | 1 calendrier confirmé (2026-09-14 → Bac 2027-06-10), sinon estimation `estime: true` |

---

## 3. Moteur logique et algorithmes

### 3.1 Next Best Action — `prochaineAction()` (`src/utils/moteur.ts`)

Une **seule** fonction décide de ce que l'élève doit faire. Ordre **strict** :

```
1. reprise      → une leçon au statut `en_cours` (la plus récente, via `derniereSession`)
2. rappel       → `revisionsDues(etat)` non vide (SRS échu) — vérifié AVANT `fini`
3. fini         → plus aucun item non fait dans `CHEMIN`
4. nouvelle     → si `seancesAujourdhui(etat) < quotaDe(etat).seances` → `prochainItem(etat)`
5. repos        → sinon, avec `bonusDispoAujourdhui` (une seule séance bonus)
```

`prochainItem()` respecte le verrou séquentiel `itemVerrouille()` : toute la chaîne `CHEMIN` doit
être faite avant l'item courant — **sauf en mode intensif**, où seuls les items prioritaires de la
même unité verrouillent (sinon la leçon importante de mai resterait inatteignable).

Quotas — table unique, sans pourcentage :

| `objectif` | séances/jour | bonus | cartes de compétence / semaine |
|---|---|---|---|
| 10 | 1 | non | 2 |
| 14 (défaut) | 1 | oui | 2 |
| 18 | 2 | oui | 3 |
| intensif (`modeIntensifActif`) | 3 | oui | 3 |

`SEUIL_INTENSIF_JOURS = 60` : `modeIntensif: 'auto'` bascule en phase intensive à ≤ 60 jours du
Bac (phases `J60`, `J30`, `J7`, `seuilPriorite`).

### 3.2 Mission du jour — `missionDuJour()` (`src/utils/planDuJour.ts`)

Traduit `prochaineAction` en **une** mission nommée, avec durée annoncée, « ce que tu sauras
faire », et un bouton unique (`libelleMission`).

- Bornes produits : `MINUTES_MIN_MISSION = 3`, `MINUTES_MAX_MISSION = 5` ; `MINUTES_MISSION =
  { noeud: 4, jalon: 5, revision: 4, entrainement_sujet: 5, repos: 2, fini: 2 }` ; la durée finale
  est re-bornée (`Math.min(mission.minutes, MINUTES_MAX_MISSION)`).
- **Dette de révision plafonnée** : `PLAFOND_DETTE = 5` (`src/utils/bridge.ts`) — au-delà, les
  révisions restent en file et sont **affichées sobrement** (`reportees` +
  `sousTitreMission` : « + n révisions dans la liste — elles attendent leur tour, sans hâte »).
- Types de mission : `noeud | jalon | revision | entrainement_sujet | repos | fini`.
- Le nœud précis vient de `prochainNoeud()` (`src/utils/microNoeuds.ts`) :
  `MINUTES_NOEUD = { lire: 3, mots: 3, rappel: 4, mecanisme: 4, preuve: 5, ancrage: 5 }`,
  `TYPE_PAR_PHASE` mappe les phases 1..6 du protocole sur ces six nœuds.

### 3.3 Répétition espacée — SM-2 maison (`src/utils/srs.ts`)

`mettreAJourSrs<T extends Srs>(p, qualite 0..5, plafondIntervalle?)` :

```
qualité < 3  → repetitions = 0, intervalle = 1 (retour au début, pas de sanction)
qualité ≥ 3  → repetitions += 1
               rep 1 → 1 jour ; rep 2 → 3 jours ; ensuite intervalle × facilité (arrondi)
               facilité = max(1.3, facilité + 0.1 − (5−q) × (0.08 + (5−q) × 0.02))
               prochaineRevision = aujourd'hui + intervalle
plafond optionnel (mode intensif) : intervalle = min(intervalle, 3)
```

Spécificités produit :

- `premiereRevision(p, fragile)` : après le protocole, **J+1 si fragile, J+3 sinon**.
- `mettreAJourSrsIntensif` : plafond `PLAFOND_INTENSIF_JOURS = 3` ; après
  `SORTIE_INTENSIF_REUSSITES = 2` succès consécutifs, la leçon **sort de la file** jusqu'au Bac
  (`prochaineRevision = undefined`, `acquisIntensifLe = aujourd'hui`) ; une erreur remet le
  compteur à zéro.
- Les **cartes de compétence** (`CarteKafaa`) utilisent le **même** noyau, avec un quota hebdomadaire
  (`competenceDue`, semaine dimanche→samedi via `debutSemaine`).
- Les **flashcards** sont un système **séparé** (Leitner) : `INTERVALLES_BOITES = {1: 1, 2: 3, 3: 7}`
  jours, `TAILLE_SESSION = 12` (`src/utils/flashcards.ts`).

### 3.4 Entraînement adaptatif (`src/utils/adaptatif.ts`)

`TAILLE_SESSION_ADAPTATIVE = 10`, `SEUIL_MONTEE = 2`, `SEUIL_DESCENTE = 2` : deux bonnes réponses
consécutives montent de niveau (1→2→3), deux erreurs descendent. `bilanAdaptatif` produit un
bilan sans note. Les items viennent de `src/data/drills` ; l'ordre de réponse est mélangé à
l'affichage (`src/utils/melange.ts`), le stockage garde `o[0]` correct.

### 3.5 Modèle de compétences `bridge` (`src/utils/bridge.ts`)

Quatre briques, écrites comme **garde-fous non négociables** dans l'en-tête du fichier :

1. `niveauConfiance(n) = borner(niveau × min(1, 0.7 + 0.05 × preuves))` — une seule réussite ne
   vaut pas un niveau acquis.
2. `competencesTriees` trie **d'abord les compétences mesurées**, puis par niveau corrigé : sinon
   une compétence jamais travaillée (0) passerait avant une compétence faible réellement mesurée.
3. Lissage `writeBack` : `nouveau = (1−α)×ancien + α×observé`, α = **0,3** (0,4 en chronométré),
   écrasement vers « fragile » si le score observé ≤ 1.
4. `planDeJour(EntreePlan)` : révisions d'abord, plafonnées à `PLAFOND_DETTE` ; puis l'unique
   compétence la plus faible **mesurée** ; puis une leçon nouvelle de l'unité la plus lourde au
   Bac (`poidsBac`) dont les prérequis sont satisfaits ou dérogés. Si tout est bloqué :
   **recommandation**, jamais blocage.

Le commentaire d'en-tête rappelle l'origine : ce moteur **remplace** un ancien moteur qui
produisait « une fausse note /20 » et sautait des prérequis.

### 3.6 Modules « isolés » et contrats

| Module | Fichier(s) | Isolation réelle |
|---|---|---|
| Laboratoire Boussole | `modules/boussole/**` (16 fichiers source) | **Sous-projet autonome** : `package.json` propre, React **18.3.1** (l'app hôte est en 19), build `esbuild` → `public/boussole/index.html`, tests `node --test` + Playwright. Il **ne lit pas** le compte, ne touche ni `kafaa`, ni SM-2, ni stats. |
| Pont iframe → app | `src/hooks/useBoussoleBridge.ts` + `modules/boussole/src/bridge.ts` | `postMessage` avec `type: 'learning.attempt.completed'`, `schemaVersion: 1`, **origin strict** (`window.location.origin`, jamais `*`) et `event.source === iframe.contentWindow`. |
| Contrat d'événement | `src/utils/evenements.ts` | Trois promesses vérifiées par tests : **Preuve ≠ Complétion** (un événement n'écrit jamais `statut`, `phases`, `jalons`), **idempotence** (`attemptId` + `boussoleEventsSeen`, plafond `PLAFOND_EVENEMENTS = 500`), **zéro texte libre**. |
| Palmarès / XP | `src/utils/xp.ts` | `xpDe` est **dérivé** de l'état (phases 15, leçon 60, jalon 200, atelier 150, drill 3, ½ h 10, étape Bac 3/2/0, exercice Bac 6, piège 2, série 4) ; 5 paliers `مبتدئ → متمكّن → متقدّم → خبير → بطل بوصلة العلوم`. Rien à migrer si on ajoute une source de XP… mais rien n'existe pour un XP « guide ». |
| Défis / revue croisée | `src/utils/defis.ts`, `revueCroisee.ts` | `CIBLE_DRILLS = 20`, défi hebdomadaire choisi par l'élève (`drills` / `croisee` / `examen`) ; revue croisée `MAX_LECONS_CROISEES = 3`, une fois par semaine. |
| Télémétrie | `src/utils/telemetrie.ts` | 100 % locale, `CLES_INTERDITES` (e-mail, nom, wilaya, daïra, notes, carnet, journal, brouillons, mot de passe, jeton, stats) interdites dans tout rapport ; un test le vérifie. |

### 3.7 Ce que le moteur ne fait **jamais** (garanti par test)

`src/utils/__tests__/garde-fous-anti-anxiete.test.ts` lit 20 fichiers sensibles (dont
`planDuJour.ts`, `microNoeuds.ts`, `Ecran123.tsx`, `SujetGuide.tsx`, `Defi60.tsx`,
`CarteBoucliersSM2.tsx`) et vérifie, commentaires retirés :

1. aucune note `/20`, aucun pourcentage présenté comme une note ;
2. aucun « Game Over », aucune sanction, aucun échec définitif ;
3. aucun emoji récent (l'appareil cible affiche des tofu).

---

## 4. Parcours utilisateur, écran par écran

### 4.1 Séquence de démarrage (avant tout écran)

```
index.html (ar, rtl)
  └─ EcranDemarrage      si pas `kunz_intro_vue` (localStorage) ET pas `kunz_demarrage` (sessionStorage)
        vidéo muette 1080×1920, poster /personnage-pirate.webp
        filet de sécurité calé sur v.duration (9 000 ms par défaut)
        bouton unique « ابدأ ← »
  └─ Inscription         si ni compte+session, ni `modeInvite`
        deux portes : créer/ouvrir un compte  OU  « جرّب بلا حساب · ابدأ الآن ← »
  └─ EcranConsentementSync  après inscription, une seule fois (`doitDemanderConsentement`)
  └─ Diagnostic          proposition unique, refusable (`diagnosticDecideLe`)
  └─ application (4 onglets)
```

`inscrit = (compte && sessionOuverte(email)) || etat.modeInvite === true` (`App.tsx`). Depuis la
v0.13, **le compte n'est plus un péage** : l'invité voit toute l'app, le compte ne sert qu'à la
sync et au changement d'appareil.

### 4.2 Les quatre portes (barre du bas, cible ≥ 54 px)

`ONGLETS` dans `src/App.tsx` — et **aucune autre** entrée :

| Onglet | Composant | Contenu réel |
|---|---|---|
| **مساري** | `Masari.tsx` (291 l.) | Chemin complet : 3 domaines, 11 unités verrouillées séquentiellement, jauge « n / 69 » **sans pourcentage affiché** (`pourcent` ne sert qu'à la largeur CSS), boutons recherche + carte mentale, mascotte. |
| **كويست** | `Aujourdhui.tsx` (437 l.) | Accueil + mission du jour, quiz du jour, quête 3 min, révisions, revue croisée, carte de compétence, rythme 5/7, position dans le programme annuel, statistiques compactes. |
| **الباك** | `Bac.tsx` (155 l.) | 5 cartes : sujet complet guidé, examen blanc, méthodologie, chasse aux pièges, schémas ; fréquence réelle des verbes ; 3 gestes. |
| **أنا** | `Ana.tsx` (788 l.) | Dashboard de progression + réglages + sauvegarde + réinitialisation. **24 props**, toutes des callbacks. |

Les sous-écrans **allument leur parent** (`ongletParent`) : `exercices → aujourdhui`,
`methodo → bac`.

### 4.3 Dashboard « أنا » — inventaire des cartes (ordre réel)

1. Bandeau profil / « ملفّي — ورقة A4 » (ouvre `FicheEleve`).
2. `MascotteKunz` (message fixe « هذه كراستك يا مستكشف… »).
3. **هويتي** : nom, date du Bac.
4. **حسابي** : e-mail, wilaya/daïra, déconnexion, création de compte si invité.
5. `CarteForcesFaiblesses` — forces / faiblesses **mesurées**, avec relance de révision.
6. `CarteBadges` — badges de contenu.
7. `CarteBoucliersSM2` — « boucliers de régularité » (4 jours sur 7 ; le bouclier ne se perd pas).
8. `CarteExamens` — historique des examens blancs (`BilanExamen[]`).
9. `CarteDiagnosticFavoris` — test de positionnement + favoris.
10. `ReglagesParcours` — objectif 10/14/18, mode intensif, taille de texte.
11. `ReglageRappel` — rappel quotidien local (Capacitor).
12. `ReglageSync` — consentement de synchronisation (révocable).
13. Bouton « الخصوصية · الأسئلة الشائعة · عن التطبيق ».
14. **رحلتي بالأرقام** : temps de concentration, « n / 69 structures », sessions de récupération,
    ponts écrits, XP + nom du palier, jours d'activité — avec la phrase « aucune comparaison sauf
    avec toi-même hier ».
15. `CarteStats complet` — détail par source (5 sources).
16. Jours d'activité (12 derniers).
17. **دوّن** — notes libres + questions.
18. **سجلّ الأخطاء** — carnet d'erreurs atomiques, exportable, effaçable.
19. `CarteHorsLigne` — téléchargement du contenu lourd (poids annoncé avant).
20. `CarteProfilCompetences` — 8 compétences mesurées (renvoie vers l'entraîneur).
21. `CarteTropheesTactiques` — verbes travaillés en 1-2-3.
22. `CarteMesurePilote` — export télémétrie locale.
23. **النسخة الاحتياطية** — export complet JSON, import avec confirmation.
24. **إعادة الضبط** — effacement avec double confirmation et bouton de retour.

### 4.4 Écran par écran — les 28 modes de `App.tsx`

| Mode | Composant | Ce que l'élève fait | Écrit dans `Etat` |
|---|---|---|---|
| `protocole` | `ProtocoleRunner` (1 003 l.) | 6 phases du protocole (8+3+5+5+15+10 = **46 min**), portes par phase, indices, verrous | `progression[].phases`, `minutes`, `diagnostic`, puis SM-2 (`premiereRevision`) |
| `noeuds` | `MicroNoeuds` | 6 micro-nœuds de 3–5 min (lire, mots, rappel, mécanisme, preuve, ancrage) | `phases` |
| `jalon` | `JalonUnite` | synthèse écrite de l'unité (« جسر ») | `jalons[uniteId]` |
| `revision` | `SessionRevision` | rappel actif des leçons dues (ou revue croisée) | `progression[].repetitions/intervalle`, `revisions` |
| `lecture` | `LecteurLecon` | lecture d'une leçon HTML (iframe, 25 fichiers) | `lue` |
| `kouest` | `Kouest` (200 l.) | quiz 3 min en 3 étapes (rappel → synthèse → piège) | `drills[cle]` — **ne clôt pas la leçon** |
| `briques` | `EcranBriques` → `Ecran123` | boucle **1-2-3** sur un jeu de briques | `briques[cle]`, puis `evenements` → `kafaa`, `trophees`, `carnet` |
| `sujets` | `SujetsOfficiels` (360 l.) | liste des 28 sujets, dérogation tracée, entrée « sujet complet » ou « pas à pas » | `derogationsSujets` |
| `sujetGuide` | `SujetGuide` (444 l.) | sujet **entier**, consigne par consigne, 4 temps : **افهم / تحقّق / اكتب / قارن**, auto-évaluation 0/1/2 | `maitriseSujets`, `brouillonsSujets` |
| `bacPasAPas` | `BacPasAPas` | exercice par exercice, étapes évaluées 3/2/0 | `bacEtapes`, `bacExercices` |
| `examenBlanc` | `ExamBlanc` (545 l.) | examen complet, **chronomètre optionnel qui compte le temps écoulé** (jamais de compte à rebours) | `examens` (`BilanExamen`), `examensBlancs` |
| `methodo` / `methodoExos` | `Methodologie` (1 928 l., 14 sous-écrans) | laboratoire de lecture des documents, 11 verbes, 4 ateliers, enquêtes, autopsie de copie | `kafaa` (SM-2), `carnet` |
| `schemas` | `SchemaALegender` | 6 schémas à légender | `schemas` |
| `flashcards` | `Flashcards` | 12 cartes Leitner par session | `flashcards` |
| `fakh` | `Fakh` | « chasse aux pièges » : 1 phrase à démasquer, séries de 8 | `fakh`, `fakhSeries` |
| `defi60` | `Defi60` | défi 60 secondes | `defis60` |
| `reparation` | `JourneeReparation` | journée de réparation ciblée ; l'écran **n'écrit rien** : il renvoie vers `protocole` | — (écriture par la porte du protocole) |
| `atelier` / `immunite` / `orogenese` / `structureTerre` | `Atelier*` | 4 ateliers de domaine, déblocage conditionnel | `ateliers` |
| `mindmap` | `Mindmap` | carte mentale | — |
| `recherche` | `Recherche` | recherche dans le contenu | — |
| `synthese` / `choixSynthese` | `SyntheseLibre` / `ChoixSynthese` | rédaction libre, choix d'unité | — |
| `diagnostic` (écran) | `Diagnostic` | test de positionnement, refusable | `diagnostic` |
| `fiche` | `FicheEleve` | fiche A4 imprimable | — |
| `confidentialite` | `Confidentialite` | ce qui est stocké / envoyé, droits | — |
| `mourchid` | `Mourchid` | guide méthodologique étendu | — |
| `exercices` (sous-écran, allume كويست) | `Exercices` (751 l.) | hub : QCM, examens, flashcards, schémas, synthèses, ateliers, méthodologie | `drills` (via `onItemReussi`) |

Tous les écrans lourds sont `lazy` (31 imports dynamiques) : le premier rendu ne charge que la
coquille et l'onglet courant.

### 4.5 La boucle réelle d'une journée d'élève

```
كويست  →  carte « مهمّة اليوم · N دقائق »  →  un bouton (libelleMission)
              ├─ noeud  → ProtocoleRunner/MicroNoeuds (3–5 min)
              ├─ jalon   → JalonUnite
              ├─ revision→ SessionRevision
              ├─ entrainement_sujet → Methodologie
              └─ repos   → « يكفي اليوم » (aucune punition, la mission reste demain)
       →  quiz du jour (3 min, secondaire)  →  carte de compétence (si due)
       →  revue croisée (1×/semaine)        →  statistiques compactes
```

Le bouton secondaire « يكفي اليوم » est **un vrai bouton** : il écrit un `role="status"`
(« on a noté ta pause »). Aucun écran ne piège l'élève.

---

## 5. Système visuel, thèmes, mascotte, audio / haptique / animations

### 5.1 Identité visuelle

- **Palette « maquette »** (`@theme` dans `src/index.css`) : encre `#183d31`, pin `#225342` (couleur
  principale), miel `#b07d22` (accent), papier `#fffef8`, sol `#f6f6ee`, filet `#dfe5d7`.
  Sémantique stricte : `clay` et `error` = **rouge** (faute, destructif), jamais le vert.
- **Typographie** : `--font-sans: "Segoe UI", "Noto Naskh Arabic", "Geeza Pro", "IBM Plex Sans
  Arabic", Tahoma, sans-serif` ; `--font-display: "Noto Naskh Arabic", "Amiri", …`. **Aucun
  webfont téléchargé** (aucun `@font-face`, aucune requête Google Fonts) : cohérent avec la
  promesse hors ligne et le budget de coquille.
- **RTL natif** : `dir="rtl"` sur les écrans, propriétés logiques (`inset-inline`, `ps/pe`),
  `letter-spacing: 0` dans `.eyebrow` (commentaire explicite : l'interlettrage casse les ligatures
  arabes).
- **Deux générations de classes coexistent** et c'est mesurable : `.card` (114 usages) /
  `.carte` (39), `.eyebrow` (111) / `.oeil` (59). Le commentaire de `index.css` l'assume : `.card`
  a reçu « la peau de la maquette » pour éviter de toucher « 212 endroits ».

### 5.2 Thèmes

- Deux thèmes, un seul attribut : `document.documentElement.setAttribute('data-theme', 'light'|'dark')`
  (`App.tsx`), persisté sous `kunz_theme` ; `AtelierDesign.tsx` utilise une clé séparée
  `design_theme` pour son propre aperçu.
- Le bloc `[data-theme='dark']` redéfinit ~30 jetons, plus des correctifs ciblés de contraste
  (`[data-theme='dark'] .text-forest-deep { color: #b0d9c2 }`) et des règles sur `bg-sage` pour
  garder un texte foncé sur fond vert moyen.
- **Taille de texte** : `html[data-taille='s'|'m'|'l']` → 15 / 16 / 18,5 px ; la valeur est
  recopiée dans les iframes des leçons et du laboratoire (`data-taille`, observée par
  `MutationObserver` dans `Boussole.tsx`).

### 5.3 Mascotte — « القبطان مفتاح »

| Fait | Mesure |
|---|---|
| Composant | `src/components/MascotteKunz.tsx` (46 l.) — props `message`, `compact`, `tone ('forest'|'gold'|'paper')` |
| Images | `/mascotte.webp` (14 592 o, buste détouré 320 px) ; `/personnage-pirate.webp` (61 950 o) en poster de démarrage |
| Présence | **13 fichiers**, **29 occurrences** (`Ana`, `Masari`, `Methodologie` ×5, `Mindmap`, `Mourchid`, `Exercices`, `Fetes`, `Aujourdhui` ×2, `EcranDemarrage` ×2…) |
| Comportement | **Statique** : un texte passé en prop, une rotation/scale au survol, un halo doré. Aucun état, aucune mémoire, aucune voix, aucune décision. |
| Nom affiché | « القبطان مفتاح · بوصلة العلوم » |

C'est une **mascotte de décor et d'encouragement**, pas un guide : elle ne sait pas où en est
l'élève, ne propose pas d'action, ne commente pas une erreur, ne déclenche aucun écran.

### 5.4 Audio

`src/utils/son.ts` — **aucun fichier audio** : tout est synthétisé en Web Audio API (donc hors
ligne, poids nul).

- `sonJuste()` : deux notes triangle 660 → 990 Hz, 0,18 / 0,22 s, gain 0,07 / 0,06 (« ding »
  montant).
- `sonFaux()` : 349,23 → 261,63 Hz, 0,14 / 0,20 s, gain 0,06 / 0,05 (descente douce, « sans
  reproche »).
- `sonApplaudissement()` : petit motif 523/659/784 Hz puis ~80 claps synthétisés à partir d'un
  buffer de bruit blanc filtré (bandpass 1 900 Hz, Q 0,7), énergie en cloche sur 2,1 s.
- Repli silencieux si `AudioContext` absent ou suspendu (`ctx.resume()`).

### 5.5 Haptique

**Aucune API haptique dans le dépôt.** `grep -rn "Haptics\|vibrate"` sur les sources, les
manifestes et `package.json` → **0 résultat**. Le seul canal « natif » est le rappel local
`@capacitor/local-notifications` (`src/utils/rappels.ts` : permission, `schedule`, `cancel`,
`ID_RAPPEL` fixe, adaptateur injectable pour les tests).

### 5.6 Animations

- 5 `@keyframes` maison : `shimmer` (squelette de chargement), `fadeIn`, `slideUp`, `pulseSoft`,
  `confettiFall`.
- Transitions courtes (150–420 ms) sur `.btn--primaire`, `.onglet`, `.jauge__r`.
- **Pas de bibliothèque d'animation**, pas de `prefers-reduced-motion` détecté
  (`grep` → 0) : point d'accessibilité à traiter si un « guide animé » est ajouté.
- `GamifiedOverlay` affiche la barre d'XP et l'applaudissement **sans flotter au-dessus du
  contenu** (choix documenté dans `App.tsx`).

### 5.7 Accessibilité (acquis à ne pas casser)

- `aria-current="page"` sur l'onglet actif, `role="progressbar"` avec `aria-valuenow` sur la jauge,
  `role="alert"` sur l'alerte de stockage, `aria-hidden`/`inert` sur l'arrière-plan quand un
  dialogue est ouvert.
- Dialogues natifs `<dialog>` + helpers `ouvrirDialogue`/`fermerDialogue` (`src/utils/dialogue.ts`)
  car jsdom ne les implémente pas.
- Tests dédiés : `accessibilite.test.tsx`, `confidentialite-accessibilite.test.ts`,
  `onglets-ui.test.tsx`, `premier-ecran-ui.test.tsx`, `rapport-utilisabilite-ui.test.tsx`,
  plus `axe-core`.

---

## 6. Différences avec le concept Guide-First + Boussole 1-2-3

### 6.1 Ce qui existe déjà (et ressemble au concept)

| Brique du concept Guide-First | Équivalent réel dans le dépôt | Écart |
|---|---|---|
| Mascotte explorateur | `MascotteKunz` + « القبطان مفتاح » (13 fichiers) | **Statique** : pas d'état, pas de dialogue, aucune boucle de guidage. |
| Micro-quêtes de 3 min | `missionDuJour` (3–5 min), `Kouest` (3 min), `Defi60` (60 s), `MicroNoeuds` (3/4/5 min) | **Déjà central** : la contrainte de durée est un invariant testé (`MINUTES_MAX_MISSION = 5`). |
| Boucle Boussole **1-2-3** | `Ecran123.tsx` : ① التقط ② بدّل وقارن ③ ركّب الجواب, plus `TiroirBoussole` (vérificateur / verbe / pièges / labo) | **Existe**, mais atteignable uniquement par `mode.briques` (`EcranBriques`), lui-même ouvert depuis `Methodologie` (u1) et `SujetsOfficiels` (gabarit 2025-1). Ce n'est **pas** une boucle universelle. |
| Guide qui décide de la prochaine action | `prochaineAction()` + `missionDuJour()` | Le « guide » actuel est **algorithmique**, pas narratif. |
| Objectif / progression visible | Dashboard `Ana` (≈24 blocs, dont 13 composants `Carte*`) + jauge `Masari` | **Déjà riche et déjà couplé** : c'est la surface à ne pas casser. |

### 6.2 Les écarts structurants

1. **Deux propriétaires de la décision, un seul possible.** Aujourd'hui `prochaineAction()` est la
   source unique de vérité (commentaire explicite dans `planDuJour.ts` : « prochaineAction reste la
   source de vérité du quoi faire »). Un guide qui décide « quoi faire ensuite » créerait un
   **second moteur**. La seule intégration saine : le guide **met en scène** la mission déjà
   calculée, il ne la choisit pas.
2. **La mascotte n'a pas de mémoire.** Aucun champ d'état ne stocke un parcours de guide, une étape
   de dialogue, un « vu / pas vu », une file de quêtes. Pour un Guide-First, il faudra de
   nouveaux champs **optionnels** dans `Etat` + mise à jour **obligatoire** du schéma zod
   d'import (sinon perte silencieuse, cf. §2.5), et une migration `VERSION_ETAT = 4` si le
   comportement par défaut change.
3. **La boucle 1-2-3 est une boucle de *contenu*, pas de *navigation*.** `Ecran123` exige un
   `JeuBriques`, et il n'existe que **6** jeux : **4** `actif` (u1) et **2** `a_valider_enseignant`
   (sujet 2025-1). `jeuActif()` (`src/utils/briques.ts`) est censé bloquer ces derniers, et
   `briques.test.ts` le vérifie — mais **aucun composant n'appelle `jeuActif`** : `SujetsOfficiels`
   n'affiche le bouton « briques » que si le sujet figure dans `SUJETS_AVEC_BRIQUES` (donc oui pour
   2025-1), et `EcranBriques` → `Ecran123` ne filtrent pas. La règle éditoriale est donc
   **affichée** (mention sous l'exercice) mais pas **appliquée** dans le chemin de rendu : c'est un
   écart code ↔ intention documenté ici, pas une garantie. Étendre la boucle « partout » exige de
   produire du contenu relu **et** de brancher ce filtre.
4. **Aucun onboarding guidé.** Le premier contact est : vidéo → inscription **ou** invité →
   consentement → diagnostic → onglet. Il n'existe pas de visite guidée, pas de tutoriel, pas de
   « première quête imposée ». Un Guide-First devrait s'insérer **après** `pret` (voir §8), sans
   réintroduire de péage (B1 du rapport d'utilisabilité : « le compte n'est plus un péage »).
5. **La récompense n'a pas de canal « guide ».** `xpDe` ne connaît que phases, leçons, jalons,
   ateliers, drills, demi-heures, étapes Bac, pièges. Un XP de micro-quête exigerait un nouveau
   terme dans `xpDe` (dérivé, donc rétro-compatible) **et** une décision sur les paliers
   (`PALIERS` jusqu'à 8 000).
6. **Le ton est verrouillé par des tests.** Toute copie du guide devra passer
   `garde-fous-anti-anxiete` (pas de note /20, pas de Game Over, pas d'emoji récent) et la règle
   « pas de lettre latine dans la copie arabe » (hors termes scientifiques).
7. **L'isolation du laboratoire est un actif.** `modules/boussole` a son propre `package.json`,
   son propre React (18), son propre stockage, et ne touche jamais `kafaa`/SM-2. Toute greffe
   Guide-First doit respecter ce contrat : **Preuve ≠ Complétion** (`evenements.ts`).

### 6.3 Où le Guide-First pourrait s'accrocher sans casser (proposition factuelle, pas une décision)

| Point d'accroche | Fichier | Nature du geste | Risque |
|---|---|---|---|
| Rendu de la mission | `src/components/Aujourdhui.tsx` (section `aria-label="مهمّة اليوم"`) | habiller la mission existante avec la mascotte (elle reçoit déjà `message`) | faible : surface locale |
| Copie des cartes | `src/components/MascotteKunz.tsx` (props `message`) | rendre le texte dynamique à partir de `planMission.mission` | faible |
| Boucle 1-2-3 | `src/components/Ecran123.tsx` + `src/data/briques/` | ouvrir la boucle depuis d'autres écrans (`Mode` + un `setMode`) | moyen : contenu manquant + `jeuActif` |
| Dashboard | `src/components/Ana.tsx` (24 props) / `Carte*.tsx` | ajouter une carte « parcours du guide » | **élevé** : toute nouvelle prop traverse `App.tsx` |
| État | `src/types.ts` + `src/utils/etat.ts` + `src/utils/backup.ts` | champs optionnels + schéma zod + fixtures | **élevé** : perte silencieuse si oubli |

---

## 7. Contraintes, couplages forts et risques de modification

### 7.1 Contraintes dures (vérifiées par l'outillage, pas par la bonne volonté)

| # | Contrainte | Preuve dans le dépôt | Conséquence pour un ajout |
|---|---|---|---|
| C1 | **Coquille hors ligne ≤ 2,5 Mio** | `scripts/verifier-hors-ligne.mjs`, `README` METRICS (2,49 Mio), commentaire de `HORS_PRECACHE` dans `vite.config.ts` | Tout nouvel écran lourd doit être `lazy` **et** exclu du pré-cache (`HORS_PRECACHE`), sinon CI rouge. |
| C2 | **Aucune note /20, aucun Game Over, aucun pourcentage de chances** | `src/utils/__tests__/garde-fous-anti-anxiete.test.ts` sur 20 fichiers | Interdit de « scorer » un guide. |
| C3 | **UI 100 % arabe, RTL, pas de lettre latine dans la copie** | `lint` + tests UI + `public/manifest.webmanifest` (`lang: ar`, `dir: rtl`) | Toute nouvelle copie doit être arabe, sans emoji récent. |
| C4 | **Aucun état perdu** | 4 fixtures v1/v2/v2-intensif/v2+carnet dans `migration-etat.test.ts` + `sauvegarde-compat.test.ts` | Un nouveau champ sans défaut casse la lecture des anciens états. |
| C5 | **Un atelier / une brique / un sujet ne termine jamais une leçon ni un jalon** | commentaire d'en-tête `evenements.ts`, tests `bridge`, `bonus` | Le guide ne doit pas écrire `statut`, `phases`, `jalons`. |
| C6 | **Un bouton visible fait toujours quelque chose** | `src/__tests__/rapport-utilisabilite-ui.test.tsx` (6 cas), tests `sujet-guide-*` | Une mascotte cliquable doit avoir une action réelle (ou ne pas être un bouton). |
| C7 | **Durée du Bac = 4 h 30 (270 min)** | `plans/sources/REGISTRE.md` (18 en-têtes officiels), `sujetsOfficiels.ts` (`dureeMin: 270`) | Ne pas « corriger » vers 3 h 30. |
| C8 | **Éditorial : `u1` jeux `actif` ; `sujet-2025-1` `a_valider_enseignant`** | `src/data/briques/*.ts`, `MENTION_STATUT`, `jeuActif()` (testé mais **non branché au rendu**) | Le statut est affiché ; il n'est pas bloquant dans l'UI actuelle. Un ajout de contenu doit respecter le statut, et si l'on veut l'appliquer, brancher `jeuActif` dans `EcranBriques`/`Ecran123`. |

### 7.2 Couplages forts (fichiers « nœuds »)

| Fichier | Lignes | Ce qui casse si on y touche |
|---|---|---|
| `src/App.tsx` | 1 **597** | Porte 28 modes, 31 lazy, 4 onglets, `inscrit`, consentement, diagnostic, thème, rappel, défi, taille de texte. **Monolithe** : toute nouvelle surface passe par lui. |
| `src/types.ts` + `src/utils/etat.ts` + `src/utils/backup.ts` | 285 + 67 + 124 | Le trio « modèle / migration / validation ». Un champ ajouté dans un seul des trois = perte silencieuse ou refus d'import. |
| `src/utils/storage.ts` | 363 | Toute la sûreté (journal, cohérence, échecs). Ne pas y ajouter d'écriture directe. |
| `src/components/Ana.tsx` | 788 | 24 callbacks → `App.tsx`. Ajouter une carte = ajouter une prop + un `useState` + un test. |
| `src/components/Methodologie.tsx` | 1 **928** | 14 sous-écrans dans un seul fichier, lazy : le plus gros risque de régression UI. |
| `src/utils/moteur.ts` + `planDuJour.ts` + `bridge.ts` | 426 + 239 + 250 | La décision pédagogique. Toute seconde source de vérité la rend contradictoire. |
| `vite.config.ts` (plugin `precacheManifest`) | 124 | Le budget hors ligne et l'invalidation du service worker (`__KUNZ_BUILD_ID__`). |
| `public/sw.js` | — | Deux niveaux de cache, reprise de téléchargement, validation stricte du manifeste (`valideManifeste`). |
| `supabase/schema.sql` | 96 | RLS, policies, trigger `generation`. La parité est testée par fixture, pas contre la base live. |
| `src/index.css` | 675 | Deux systèmes de classes + deux thèmes ; les jetons sont utilisés par tous les écrans. |

### 7.3 Risques classés (pour l'architecte)

| Risque | Probabilité | Impact | Mitigation lisible dans le dépôt |
|---|---|---|---|
| **R1 — Deux moteurs de décision** (guide vs `prochaineAction`) | élevée si le guide « propose » | produit contradictoire | faire du guide un **présentateur** de `missionDuJour` |
| **R2 — Champ d'état non déclaré dans zod** | **avérée** (13 champs, dont 10 perdus à l'import) | perte de données silencieuse | ajouter champ + `etatSchema` + fixture + test de restauration aller-retour |
| **R3 — Dépassement du budget hors ligne** | moyenne | CI rouge, régression mobile | `lazy` + `HORS_PRECACHE` + mesure `verifier-hors-ligne` |
| **R4 — Copie non conforme** (latin, emoji, note, « Game Over ») | moyenne | tests rouges | réutiliser les libellés existants (`libelleMission`, `sousTitreMission`) |
| **R5 — Bouton décoratif** | moyenne | défaut produit (déjà rencontré) | test « rapport-utilisabilite-ui » : tout bouton agit |
| **R6 — Explosion de `App.tsx`** | élevée | maintenabilité | passer par un composant `Guide` autonome + un seul mode |
| **R7 — Contenu 1-2-3 insuffisant** | certaine | boucle non généralisable | produire des `JeuBriques` relus ; 4 jeux `actif` seulement, et le filtre `jeuActif` n'est pas branché |
| **R8 — Le jeton est le seul secret** (pas d'identité serveur, clé anon publique) | existante | accès au miroir d'un élève si le jeton fuite | ne rien envoyer de sensible (déjà la règle) ; le miroir ne contient que des compteurs |
| **R9 — Sync multi-appareils mal comprise** | moyenne | attente produit déçue | la sync est un **miroir de compteurs**, pas une restauration ; l'état live est `Non vérifiable depuis le dépôt` |
| **R10 — Statut éditorial ignoré** | moyenne | contenu non relu montré | respecter `StatutEditorial` / `jeuActif` |

### 7.4 Ce qui n'est pas vérifiable depuis le dépôt

- Le projet Supabase réel (`kpjcgiwysmqysanqtfkj` cité dans `supabase/schema.sql`) : tables,
  policies et données effectives. La fixture `tests/fixtures/parite-rls-2026-11-22.json` compare
  du SQL, pas le serveur.
- Les variables d'environnement Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Le trafic, la rétention, les taux de complétion réels.
- Les droits de reproduction des extraits, figures et PDF de `public/boussole/` (le module
  l'écrit lui-même : « droits non établis, relecture scientifique non réalisée »).
- L'état de la coque Android (`android/` expérimental, non publiable : signature, icônes).

---

## 8. Schéma ASCII des flux

### 8.1 Démarrage et entrée dans l'app

```
                        ┌───────────────────────────────┐
                        │  index.html  (ar · rtl)       │
                        └───────────────┬───────────────┘
                                        │
                ┌───────────────────────▼────────────────────────┐
                │ App.tsx · état `demarrage`                     │
                │ !localStorage['kunz_intro_vue']                │
                │ && !sessionStorage['kunz_demarrage']           │
                └───────┬───────────────────────────┬────────────┘
                        │ oui                       │ non
              ┌─────────▼─────────┐                 │
              │ EcranDemarrage    │                 │
              │ vidéo + poster    │                 │
              │ bouton « ابدأ ← » │                 │
              └─────────┬─────────┘                 │
                        └──────────────┬────────────┘
                                       ▼
                     ┌──────────────────────────────────┐
                     │ inscrit ?                        │
                     │ =(compte && sessionOuverte)      │
                     │  || etat.modeInvite === true     │
                     └──────┬────────────────────┬──────┘
                        non │                    │ oui
                ┌───────────▼──────────┐         │
                │ Inscription.tsx      │         │
                │ ┌──────────────────┐ │         │
                │ │ compte (e-mail,  │ │         │
                │ │ mdp, wilaya)     │ │         │
                │ └────────┬─────────┘ │         │
                │ ┌──────────────────┐ │         │
                │ │ « جرّب بلا حساب »│ │         │
                │ └────────┬─────────┘ │         │
                └──────────┼───────────┘         │
                           └──────────┬──────────┘
                                      ▼
                 ┌─────────────────────────────────────┐
                 │ EcranConsentementSync (1×, opt-in)  │
                 │ → puis Diagnostic (1×, refusable)    │
                 └──────────────────┬──────────────────┘
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ pret = inscrit && !demarrage        │
                 │ 4 onglets : مساري · كويست · الباك · أنا │
                 └─────────────────────────────────────┘
```

### 8.2 Boucle « une mission par jour »

```
        ┌──────────────────────────────────────────────┐
        │ Etat (localStorage murajih_svt_v1)          │
        │ progression · jalons · journal · quotas     │
        └───────────────────────┬──────────────────────┘
                                ▼
                  prochaineAction(etat)          moteur.ts
                  1 reprise → 2 rappel → 3 fini
                  → 4 nouvelle (si quota) → 5 repos
                                │
                                ▼
               missionDuJour(etat)               planDuJour.ts
               + revisionsDuesPlafonnees (max 5)
               + bornage dur : 3..5 minutes
                                │
                                ▼
        ┌──────────────────────────────────────────────┐
        │ Aujourdhui.tsx · carte « مهمّة اليوم »        │
        │ titre · savoirFaire · pourquoi · UN bouton    │
        └───────────────────────┬──────────────────────┘
                                │ libelleMission()
       ┌───────────────┬────────┴────────┬──────────────┬──────────────┐
       ▼               ▼                 ▼              ▼              ▼
  noeud/jalon     revision         entrainement      repos          fini
  MicroNoeuds     SessionRevision   Methodologie   « يكفي اليوم »   bilan
       │               │                 │              │
       └───────────────┴────────┬────────┴──────────────┘
                                ▼
                         enregistrerSeance / SRS
                                ▼
                    sauvegarderEtat(etat) → localStorage
```

### 8.3 Lecture / écriture de l'état (le chemin critique)

```
  Composant React
      │ setEtat(prev => …)              (jamais d'écriture directe)
      ▼
  App.tsx  ── useEffect ──► sauvegarderEtat(etat)     utils/storage.ts
                                   │
                    ┌──────────────┴───────────────┐
                    │ garde-fous                   │
                    │ · lectureEnEchec ?           │
                    │ · restaurationEnAttente() ?  │
                    │ · verifierCoherence() ?      │
                    └──────────────┬───────────────┘
                                   ▼
                        JSON.stringify → localStorage[CLE_ETAT]
                                   │
                          memoriserValeur(CLE, brut)   coherenceStockage.ts
                                   │
                    ┌──────────────┴───────────────┐
                    │ autre onglet a changé ?      │
                    │ → marquerEtatPerime()        │
                    │ → EcranReprise (App.tsx)     │
                    └──────────────────────────────┘
```

### 8.4 Restauration atomique (import / remise à zéro)

```
  Fichier JSON ──► lireSauvegarde()  (zod, ≤ 5 Mio)
                          │ valide ?
                          ▼
              restaurerEtatEtStats(nouveau, stats, carnet)
                          │
        1. écrire  localStorage['murajih_restauration_v1'] = journal
        2. appliquer les modifications (etat / stats / carnet)
        3. supprimer le journal
                          │
        ┌─────────────────┴──────────────────┐
        │ succès                             │ échec
        ▼                                    ▼
  memoriserValeur(...)            retour arrière des anciennes valeurs
  appliquerStats(...)                       │
                                   ┌────────┴────────┐
                                   │ retour OK       │ retour KO
                                   ▼                 ▼
                          journal supprimé    journal CONSERVÉ
                                              → rejeu au prochain
                                                chargement, écritures
                                                gelées, EcranReprise
```

### 8.5 Pont iframe Boussole → application

```
 modules/boussole (React 18, build esbuild)
 public/boussole/index.html
        │  window.parent.postMessage(
        │    { type:'learning.attempt.completed', schemaVersion:1,
        │      source:'boussole', attemptId, exerciceId, uniteId,
        │      verbe, titre, reussi, erreurTag?, timestamp }, origin)
        ▼
 ┌───────────────────────────────────────────────┐
 │ useBoussoleBridge.ts                          │
 │  · event.origin === window.location.origin    │ ← jamais '*'
 │  · event.source === iframe.contentWindow      │
 │  · schéma validé (src/types/boussoleBridge)   │
 └───────────────────────┬───────────────────────┘
                         ▼
              evenements.ts · Applique un événement
              · idempotence (attemptId, plafond 500)
              · n'écrit JAMAIS statut / phases / jalons
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
     kafaa (SM-2)     trophees        carnet d'erreurs
```

### 8.6 Synchronisation (optionnelle, jamais bloquante)

```
  Etat + consentementSync=true
        │
        ▼
 construireSnapshot(etat)            sync.ts
 → compteurs + identifiants + xp + version
 → refus si pas de compte / pas de consentement
        │
        ▼
 import('@supabase/supabase-js')   (paresseux)
        │
        ├── navigator.onLine ? faux → état « hors_ligne »
        ▼
  from('eleves').upsert({ … compteurs, charge_utile })
    headers: { 'x-kunz-jeton': jeton }
    abortSignal(8 000 ms)
        │
        ├── ok        → « confirme »
        ├── erreur    → « erreur »  (visible, jamais silencieux)
        └── timeout   → « erreur » + compteur local (télémétrie)
```

### 8.7 Budget hors ligne à deux niveaux

```
  vite build ──► plugin precacheManifest()
                        │
        ┌───────────────┴────────────────┐
        ▼                                ▼
  statiques (COQUILLE)            contenu (SUR DEMANDE)
  6 entrées · 2 616 047 o         28 entrées · 4 391 506 o
  index + assets + icônes        25 leçons HTML + 3 fichiers Boussole
  + mascotte + poster             (jamais précachés d'office)
        │                                │
        ▼                                ▼
  public/sw.js (VERSION = build id)  bouton « télécharger » avec poids annoncé
  cache-first + mise en cache au 1er fetch
  assets/* hors HORS_PRECACHE
```

---

### Épilogue — trois phrases pour l'architecte

1. Le produit possède déjà **un** moteur de décision (`prochaineAction` → `missionDuJour`) et **une**
   contrainte de durée (3–5 min) : un Guide-First doit s'y **brancher en présentation**, pas créer
   une seconde autorité.
2. La surface sensible n'est pas le code UI mais le **trio `types.ts` / `etat.ts` / `backup.ts`** :
   tout champ nouveau doit y être déclaré trois fois (type, normalisation, schéma zod) sous peine
   de disparaître à l'import.
3. La boucle 1-2-3 existe réellement (`Ecran123`), mais elle est **plafonnée par le contenu** :
   4 jeux `actif` seulement (plus 2 jeux non relus dont le blocage éditorial n'est pas branché au
   rendu). Généraliser la boucle est un chantier éditorial autant que technique.
