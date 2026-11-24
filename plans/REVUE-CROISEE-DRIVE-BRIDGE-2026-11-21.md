# Revue croisée — dossier Drive « Boussole Bridge » × dépôt `Bawssalate-El-3oloum`

**Date** : 2026-11-21 · **Périmètre** : dossier Drive partagé (2 projets Next.js) + dépôt GitHub `Allintelligence2024/Bawssalate-El-3oloum` (branche `main`, commit `d09e082`, v0.9.3)
**Méthode** : lecture intégrale de l'arborescence Drive, lecture ciblée des moteurs `lib/`, exécution réelle du dépôt (`npm ci`, `npm test`, `npm run build`), lecture de l'historique Git/PR/CI.

---

## 1. Verdict en une page

| Objet évalué | Note | Commentaire |
|---|---|---|
| **L'application GitHub** (بوصلة العلوم Lite) | **17/20** en ingénierie, **9/20** en maturité produit | 31 257 lignes TS/TSX, 266 tests verts, CI verte, PWA hors-ligne + APK. Le contenu n'est pas relu scientifiquement (0/58 leçons) et le « compte » n'est pas une authentification. |
| **L'analyse contenue dans le Drive** (`data/audit.ts`, 37 Ko) | **15/20** | Diagnostic juste, preuves vérifiables, forces reconnues. Deux affirmations sont devenues obsolètes (voir §4). |
| **Le code du Bridge** (`engine.ts`, `passerelle.ts`, `srs.ts`, `store.ts`) | **12/20** | Bonnes idées d'architecture, fonctions pures et explicables, mais **aucun test**, **aucune intégration réelle** au dépôt, et une **note prédite non validée** qui contredit l'éthique affichée du produit. |
| **Intégrabilité en l'état (PR mergeable)** | **5/20** | Le code ne compile pas contre `src/data/` du dépôt (noms/types divergents) et viole la barre qualité existante (0 test). |

**En une phrase** : le Drive est un **excellent dossier d'audit et un prototype crédible**, pas un module prêt à fusionner ; la valeur est dans les **décisions** qu'il propose (mesurer la performance à l'examen, tracer les compétences, sortir du « retard bloquant »), pas dans le code tel quel.

---

## 2. Inventaire du dossier Drive

Deux variantes complètes du **même produit** : une plateforme Next.js + PostgreSQL qui « branche » la Boussole sur le programme officiel.

| | **GEMINI** | **GEMINI NEON** |
|---|---|---|
| Objectif apparent | Audit + démonstration du système (pages de restitution) | Portage serveur du système (base réelle) |
| Pages Next | 7 routes : `/`, `/audit`, `/masari`, `/bawssala`, `/bridge`, `/bac`, `/integration` | Une seule page (299 octets, coquille) |
| API | `/api/students`, `/api/students/[slug]`, `/api/attempts`, `/api/health` | `/api/action`, `/api/state`, `/api/health` |
| Base | Drizzle + `pg` (schéma 3,1 Ko) | Drizzle + `pg` (schéma **7,5 Ko, 14 tables**) + `seed.ts` |
| Moteur | `lib/engine.ts` (24,5 Ko, 605 lignes) + `lib/store.ts` (13,9 Ko) | `lib/store.ts` (32,3 Ko, ~800 lignes) + `lib/srs.ts` + `lib/passerelle.ts` |
| Données embarquées | `curriculum.ts` (16,7 Ko), `competencies.ts` (13,2 Ko), `subjects.ts` (25,7 Ko), `bridge.ts` (13,6 Ko), `audit.ts` (37,5 Ko) | `programme.ts` (23 Ko), `boussole.ts` (31,4 Ko), `analyse.ts` (18,4 Ko) |
| Tests | **aucun** | **aucun** |
| Seed | implicite (3 élèves de démo) | `ensureSeeded()` à la première requête |

Stack commune : Next **16.4.2**, React **19.2.6**, Drizzle ORM **0.45.2**, `pg` **8.20**, Tailwind **4.1.17**, polices Naskh/Tajawal, TypeScript 5.9.3. `next.config.ts` de 104 octets (aucun réglage de sécurité : ni CSP, ni en-têtes, ni `images.remotePatterns`).

---

## 3. L'application GitHub — ce qu'elle vaut réellement

Mesures que j'ai faites moi-même, pas des citations du README :

```
git ls-files                      496 fichiers
src/                              161 fichiers, 31 257 lignes TS/TSX, 46 composants
npm ci                            OK (~6 s, cache chaud)
npm test                          42 fichiers Vitest / 266 tests PASS + 5 tests node:test PASS
npm run build                     825 ms, 49 chunks JS, dist/ = 12 Mo
CI GitHub Actions                 5 derniers runs : succès (1 en cours sur une autre branche)
```

Contenu pédagogique effectivement présent : 3 domaines → 11 unités → 58 leçons, **620 items d'entraînement** (500 QCM + 120 définitions) répartis sur **49 axes**, **+ 80 items** dans la banque niveau 3 (`src/data/drills/niveau3.ts`) = 700 au total, **30 sujets officiels** (14 sessions 2013–2026, dont 2 sessions spéciales 2017 — le README et l'audit du Drive parlent encore de « 24 »), **13 fichiers de corrigés** (`src/data/corriges/c2013…c2026.ts`) avec barème détaillé, couvrant **28 des 30 sujets** : la session **2023 n'a aucun corrigé**.

Points forts que l'audit du Drive a raison de protéger :

- **Chemin verrouillé** (`CHEMIN` dans `programme.ts`) : le programme est un ordre, pas un sommaire. Rare et pédagogiquement défendable.
- **Protocole 6 phases** (`ProtocoleRunner.tsx`, 956 lignes) avec portes dures, jalons d'unité à 3 étapes, QCM de séquence généré depuis la source unique.
- **Moteur Next Best Action** (`src/utils/moteur.ts`) : reprise &gt; révision due &gt; séance nouvelle &gt; bonus &gt; repos. Une décision, pas un menu.
- **SM-2** (`src/utils/srs.ts`) + mode intensif + file plafonnée ; **hors-ligne réel** (service worker versionné, manifeste de precache validé).
- **Hygiène d'ingénierie inhabituelle** pour un projet solo : séparation `etat/stockage/coherenceStockage`, journal de restauration, tests de conflits inter-onglets, `__tests__/confidentialite-accessibilite.test.ts`, workflow CI qui rejoue un build du laboratoire et compare un SHA-256.

Faiblesses réelles (celles que le README assume lui-même) :

- **0/58 leçons relues** par un professeur → contenu en `adaptation_pedagogique`, pas `manuel_officiel_verifie`.
- **La Boussole n'écrit aucun événement** : ni score, ni mise à jour de `kafaa`/SM-2. C'est le trou central, correctement identifié par l'audit.
- **Compte local non authentifiant** : SHA-256 + préfixe fixe, sans sel ni dérivation lente ; le README le dit explicitement.
- **Pas de tableau de bord enseignant** : tout vit dans le `localStorage` d'un navigateur, la synchronisation Supabase est best-effort et opt-in (avec jeton d'écriture + RLS, correctement durcie en v0.9.1).
- **Taille** : chunk principal 487 Ko (147 Ko gzip), `SujetsOfficiels` 498 Ko, `public/` 8,9 Mo dont 1,6 Mo de vidéo de splash.

---

## 4. L'analyse du Drive — ce qu'elle voit juste, et ses deux erratums

### Ce qui est juste (et vérifié)

| Constat du Drive | Vérification |
|---|---|
| « Aucun indicateur de “prêt pour le Bac” » | Exact : `moteur.ts` décide *quoi faire*, jamais *où on en est* par rapport à la note. |
| « البوصلة لا تكتب أي أثر » | Exact et reconnu dans le README : « ni score ni mise à jour de `kafaa`/SM-2 ». |
| « مساري mesure l'accès, pas la maîtrise » | Exact : la progression est un compteur de phases terminées, pas un niveau de performance. |
| « 0/58 leçon relue » | Exact, cité depuis le README lignes 471-482. |
| « Le compte local n'est pas une authentification » | Exact, le README le documente noir sur blanc. |
| « Hors-ligne d'abord ⇒ pas de mesure agrégée ni de vue professeur » | Exact : `sync.ts` envoie un résumé best-effort, aucune lecture côté enseignant. |

L'audit n'est pas « à charge » : il liste 7 forces (`FORCES`) avant les `FINDINGS` classés P0/P1/P2. Il cite ses preuves (fichiers, lignes, README) et reconnaît la « rareté » de la transparence du dépôt. **C'est un travail d'analyse de bonne facture.**

### Deux affirmations à corriger

1. **« 24 sujets officiels sans barème / non évaluables »** — périmé sur deux plans. D'une part le corpus compte **30 sujets** (28 sessions + 2 sessions spéciales), pas 24 : le Drive recopie un chiffre du README qui n'a pas suivi les ajouts. D'autre part `src/data/corriges/` existe désormais (13 fichiers, points explicites : `c2026.ts` → `points: 1.5`, `points: 3.5`), avec toutefois un trou réel : **2023 n'a pas de corrigé** (et `c2017x` couvre une session spéciale). Ce qui manque n'est donc pas le barème mais **le lien entre ce barème et une saisie de copie par l'élève** — nuance qui change le remède.
2. **« L'élève ne peut pas savoir où il en est » vs la note affichée** — le Drive remplace l'absence d'indicateur par une **estimation de note** (`noteMin`/`noteMax`, `engine.ts:407-408`) elle-même non validée. On passe d'un manque honnête à une **fausse précision** (voir §6.1).

---

## 5. Le code du Bridge — ce qui est bon, et pourquoi il faut le garder

Malgré les réserves, plusieurs pièces méritent d'être reprises :

- **`lib/engine.ts` : fonctions pures, sans React ni base.** `analyze`, `analyzeUnit`, `missionStatus`, `planSemaines`, `nextBestAction`, `writeBack`. C'est exactement la forme qu'il faut pour tester et porter.
- **Explicabilité en arabe.** Chaque refus de mission produit ses raisons chiffrées (« التغطية 62% فقط، المطلوب 70% »). Pour un élève de 18 ans, c'est infiniment plus utile qu'un score opaque.
- **Correction de confiance sur les compétences** : `level × min(1, 0.7 + 0.05 × evidenceCount)`. Un niveau 3 obtenu sur un seul indice ne vaut pas un niveau 3 sur cinq indices. C'est fin, et rare dans ce type d'app.
- **`writeBack`** : mise à jour par lissage (`α = 0.3` / `0.4` en chronométré), effondrement si `observed ≤ 1`, émission de cartes et de notes de remédiation. La bonne mécanique pour ne pas surréagir à une mauvaise copie.
- **`lib/passerelle.ts`** : génération automatique des « règles de lentille » (mots-clés du titre + verbe + type de document + poids `priorite × poidsBac`), mesure de couverture, et surtout **`planDeJour`** qui plafonne la dette de révision à 5 au lieu du « retard bloquant » qui gèle l'app après trois semaines d'absence. **C'est la meilleure idée du dossier.**
- **`GEMINI NEON`** : schéma Drizzle à 14 tables (`eleves`, `domaines`, `unites`, `lecons`, `progressions`, `jalons`, `passerelle_regles`, `cartes`, `fautes`, `tentatives`, `rattrapages`, `drills`, `exercices`), seed qui **reproduit l'état réel** de l'app (règles uniquement pour l'unité 1 + 2 règles immunité, pas un jeu de démo fantaisiste), API à **une seule action** (`/api/action`) qui renvoie l'état recalculé. Architecturalement, c'est la bonne direction : événement → état dérivé.

---

## 6. Ce qui m'inquiète, par ordre de gravité

### 6.1. P0 — La note prédite est une pseudo-science, et elle contredit le produit

```ts
// GEMINI/lib/engine.ts:407
const noteMin = Math.round((4 + 13 * (readiness / 100) - (confidence === 'faible' ? 3 : 1.5)) * 10) / 10;
const noteMax = Math.round((4 + 13 * (readiness / 100) + (confidence === 'faible' ? 3 : 1.5)) * 10) / 10;
```

La formule suppose une relation **linéaire** entre un indice composite (0,22·C + 0,18·P + 0,22·S + 0,26·K + 0,12·E) et une note sur 20, sans **aucune calibration** sur des copies réelles. Le README du dépôt interdit pourtant explicitement cette promesse : « الجاهزية مؤشّر قرار، ليست تنبؤًا بعلامة البكالوريا ». Afficher « 11,4/20 ± 1,5 » à un candidat, c'est le genre de détail qui **détruit la confiance** au premier bac blanc contraire, et qui peut orienter à tort ses trois dernières semaines.

**Correctif** : garder `readiness` (utile, interne), supprimer `noteMin`/`noteMax`, ou les afficher comme « indice non validé » avec un protocole de calibration (30–50 élèves, comparaison au bac blanc, régression) avant toute publication.

### 6.2. P0 — Sécurité : le Bridge annule les garde-fous de la PR #5

- `GEMINI NEON` : `export const ELEVE_ID = 1;` (`lib/store.ts:15`) — **mono-élève codé en dur**, aucune authentification, aucune notion de session. Sur Vercel + Neon, l'URL publique donne **écriture sur la fiche de l'élève 1** à quiconque.
- `GEMINI` : `POST /api/attempts` accepte `studentSlug` **depuis le client**, ne valide que la présence des champs (pas de `zod`, pas de plafond de score), et renvoie `error.message` brut au client.

Or la PR #5 du dépôt a précisément durci ce point (jeton d'écriture + policy RLS restrictive). Le Bridge, publié tel quel, **régresse** une correction chèrement acquise — et il traite des données de mineurs, ce qui en fait un sujet RGPD/confidentialité, pas un détail d'implémentation.

### 6.3. P1 — Troisième copie du contenu : divergence garantie

Le dépôt est bâti sur une **source unique** (`programme.ts`, `lessonGoldSummaries.ts`, `priorites.ts`). Le Drive re-déclare les 58 leçons (`programme.ts` 23 Ko / `curriculum.ts` 17 Ko), les 24 sujets (`subjects.ts` 26 Ko), 620 drills et les 8 compétences. À la première correction dans le dépôt (renommage d'ID, réordonnancement d'unité), les deux jeux divergent silencieusement, et les scores calculés par le Bridge porteront sur un programme qui n'existe plus.

**Correctif** : un script de génération depuis `src/data/` + un test de non-divergence, exactement comme `scripts/verifier-inventaire-boussole.mjs` le fait déjà pour la Boussole.

### 6.4. P1 — Zéro test dans les deux variantes

Le moteur est **pur**, donc testable en une heure : bornes 0–100, monotonie de `coverage`, non-régression de `nextBestAction`, `writeBack` idempotent sur entrée vide, `planDeJour` qui plafonne. Rien n'est testé. Le dépôt exige 266 tests + CI + `npm audit --audit-level=high` : **une PR avec ce code serait refusée par la barre qualité déjà en place**, et c'est légitime.

### 6.5. P1 — Ce n'est pas « plug-and-play », contrairement à ce que suggère le commentaire d'en-tête

`engine.ts` annonce pouvoir devenir `src/utils/bridge.ts` « en un fichier ». En réalité :

| Ce que le Bridge attend | Ce que le dépôt expose |
|---|---|
| `unit.freqBac` | **inexistant** (`Unite` n'a que `poidsBac`) |
| `unit.lessons` | `unit.lessonIds` |
| `UNITES_PAR_ID`, `UNITES[].lessons` | `UNITE_PAR_ID`, `lessonIds` |
| `@/data/curriculum`, `competencies`, `subjects` | absents (le dépôt a `programme`, `priorites`, `sujets*`) |
| `COMPETENCES_PAR_UNITE`, `VERBE_VERS_COMPETENCE` | absents |
| `LeconData`, `UniteData`, `DRILLS` (`passerelle.ts`) | `Unite`, `TITRES_LECONS`, `drills/*` |

Il faut un **adaptateur de types** et une table de correspondance des compétences. C'est faisable (1–2 jours), mais ce n'est pas livré.

### 6.6. P1 — Seuils magiques, jamais éprouvés

`0.22 / 0.18 / 0.22 / 0.26 / 0.12`, `70 % prêt`, `55 % compétences`, `45 % couverture`, `45 jours = intensif`, `40 % de couverture = on saute l'ordre du programme`. Aucune justification, aucune analyse de sensibilité. Un moteur **déterministe** donne une impression de scientificité ; sans calibration, il produit surtout de la **stabilité apparente**.

### 6.7. P2 — Priorisation Bac vs verrou linéaire : le Bridge sape sa propre thèse

`nextBestAction` trie les unités par `bacWeight` dès que la couverture globale dépasse 40 %, sans vérifier les prérequis (`u3` avant `u4`, etc.). C'est exactement la faille anti-lacunes que le chemin verrouillé corrigeait. Il faut une règle **explicite** (prérequis durs + dérogation visible et réversible), pas un seuil.

### 6.8. P2 — Droits et publication

Les sujets officiels et les « الإجابة النموذجية » sont reproduits « بتصرّف ». Le dépôt lui-même pose la condition : **décision sur les droits + relecture scientifique avant publication**. Un site Next public (Vercel) aggrave l'exposition par rapport à un dépôt de code.

### 6.9. P2 — Deux produits à maintenir pour un auteur solo

PWA statique + Capacitor d'un côté, Next + Postgres + Drizzle + migrations + cold starts de l'autre. Sans équipe, le second sera abandonné en trois mois — et avec lui les scores qu'il produit.

### 6.10. Petits points

`playwright` en `dependencies` racine alors qu'il n'est utilisé que par `modules/boussole` (poids d'installation) ; `next.config.ts` sans en-têtes de sécurité ni CSP ; erreurs serveur renvoyées brutes ; aucun `loading.tsx`/`error.tsx` visible ; pas de pagination sur `attempts` (`GET /api/attempts` renvoie toute la banque).

---

## 7. GEMINI vs GEMINI NEON — lequel garder ?

| Critère | GEMINI | GEMINI NEON |
|---|---|---|
| Valeur immédiate | **Élevée** : dossier de décision lisible (audit + 6 pages) | Faible : une seule page vide |
| Valeur technique | Moyenne : API de démo, mono-usage | **Élevée** : 14 tables, seed réaliste, SRS, actions serveur |
| Risque si déployé | Moyen (API ouverte, mais peu de données) | **Élevé** (mono-élève, écriture publique) |
| Rôle recommandé | **Document de décision** (à archiver dans `plans/`) | **Socle du futur backend**, pas avant auth + tests |

Conclusion : **ne pas déployer les deux**. Archiver GEMINI comme dossier d'audit, reprendre NEON comme brouillon de backend quand (et seulement quand) un vrai besoin serveur existera (classe, professeur, plusieurs appareils).

---

## 8. Ce que je ferais concrètement (≈ 3 semaines)

| Lot | Contenu | Effort | Critère d'acceptation |
|---|---|---|---|
| **0** | Supprimer la duplication : générer `curriculum`/`subjects` depuis `src/data/` + test de non-divergence | 2 j | `npm test` échoue si un ID de leçon/sujet diverge |
| **1** | Porter `engine.ts` → `src/utils/bridge.ts` avec adaptateur de types | 2 j | `tsc -b` vert, aucun `any` ajouté |
| **2** | **30 tests minimum** sur le moteur (bornes, monotonie, `planDeJour`, `writeBack`) | 1 j | Couverture des branches du moteur &gt; 90 % |
| **3** | Événement d'essai **dans l'app existante** (`localStorage` + sync), écran « جاهزية » dans *أنا* — **pas de 6ᵉ onglet** | 4 j | Un élève peut saisir une note d'exercice et voir sa jauge bouger |
| **4** | Retirer `noteMin`/`noteMax` ; les remplacer par 3 indicateurs + mention « غير مُعايَر » | 1 j | Aucune note sur 20 affichée sans validation |
| **5** | Si backend : **Supabase Auth + RLS par `auth.uid()`**, jamais `ELEVE_ID = 1` ; suppression de Neon | 5 j | Test d'écriture croisée entre deux comptes refusé |
| **6** | Décision droits avant toute mise en ligne publique ; sinon démo privée | 1 j | Document signé dans `plans/` |

---

## 9. Vérifications exécutées

```bash
npm ci                      # OK
npm test                    # 42 fichiers / 266 tests PASS + 5 tests node:test PASS
npm run build               # OK, 825 ms, 49 chunks, dist 12 Mo
git ls-files | wc -l        # 496
gh pr list --state all      # 6 PR, toutes fusionnées ; CI verte sur les 5 derniers runs
grep -rn "freqBac" src/     # aucune occurrence → incompatibilité confirmée avec engine.ts
ls src/data/{curriculum,competencies,subjects,boussole}.ts   # absents
# contenu : 500 q + 120 d + 80 n = 700 items ; 49 axes ; 30 sujets ; corrigés = 28 (2023 absent)
```

---

## 10. Réponse courte

Le dossier Drive contient **deux prototypes d'un même « pont »** entre la Boussole et le programme officiel : un **dossier d'audit très bien argumenté** (GEMINI) et un **brouillon de backend sérieux** (NEON). L'analyse est juste sur l'essentiel — la Boussole ne mesure rien, مساري mesure l'accès et non la maîtrise, aucun indicateur de proximité au Bac — et elle a l'honnêteté de reconnaître les forces du dépôt. Mais le code n'est **ni testé, ni intégré, ni sûr** : il duplique le contenu pour la troisième fois, il ne compile pas contre `src/data/`, ses seuils ne sont pas calibrés, il rouvre en écriture ce que la PR #5 avait verrouillé, et sa note prédite sur 20 contredit la ligne éthique du produit.

**Ma recommandation** : garder l'analyse comme document de pilotage, reprendre **trois idées** dans l'application existante (événement d'essai + score par exercice, colonne de compétences dérivée des verbes, jauge de préparation **sans note prédite**), et laisser le backend Next/Postgres en réserve jusqu'à ce qu'un vrai besoin multi-utilisateurs existe — avec une authentification réelle le jour où il arrive.
