# Plan directeur — système guidé (leçons, exercices, sujets Bac)

Date : 2026-11-26 · Branche : `arena/a897fbff-bawssalate-el-3oloum` · Base : `main@54e034d`
Version visée : **v0.11.0** · Arbitrages 1–5 tranchés **dans le sens recommandé** (§8 du prompt).

## 0. Audit de départ (mesuré dans le dépôt, pas supposé)

| Élément | État vérifié au 2026-11-26 |
|---|---|
| Programme | 11 unités · 3 domaines · 49 axes · **58 leçons** (56 + 2 prérequis) + 11 jalons |
| Couverture | 58/58 leçons avec fiche dorée (`lessonGoldSummaries.ts`), 58/58 avec QCM (`qcmLecons.ts`), 58/58 avec priorité Bac (`priorites.ts`) |
| Banque de drills | ≈ 700 items (`q*` 620 · `d*` 80), 4 choix, correct en `o[0]`, mélange à l'affichage |
| Sujets Bac | 30 sujets 2013→2026, **28 avec corrigé** (`corriges/c*.ts`), 20 verbes typés |
| Moteur | `prochaineAction`, quotas par objectif, `planIntensif` J60/J30/J7, `competenceDue` |
| SRS | SM-2 + plateau intensif J+1/J+3 + sortie après 2 réussites (`srs.ts`) |
| Déjà branché | `kouest` 3 étapes, `fakh`, `bacPasAPas`, `EntraineurSujet` 0/1/2 + `SimulationEpreuve`, profil C1–C8, pont Boussole v1 (Zod, idempotence) |
| **Testé mais non branché** | `planDeJour` (plafond 5, `PLAFOND_DETTE`), `accesSujetBac`, `creerReglesAuto`, `statutUnite`, `niveaux`/`writeBack` |
| Dettes UX | carte de mission de `اليوم` renvoie à la séance 46 min · `ATTENTE_DU_VERBE` couvre 14/20 verbes · tiroir Boussole présent dans un seul écran, sans ses 3 onglets |
| Tests | 60 fichiers / 450 tests · CI `test` ≈ 1 min 30 · lint propre |
| Budget hors-ligne | coquille **2,47 Mio / 2,5 Mio** → **~27 Kio de marge**. ⚠️ Correctif §12.bis : le préacheminement compte **tous** les chunks du build, y compris ceux chargés à la demande — « paresseux » ne suffit donc pas à tenir le plafond |

Conclusion : le système demandé est **aux deux tiers déjà écrit**. Le travail est du câblage,
une projection UX et un contenu éditorial tracé — pas une réécriture.

## 1. Ce qui est sanctuarisé

- **Identité** : `public/icon.svg`, `public/icons/*.png`, `manifest.webmanifest`, `personnage-pirate.webp`,
  `mascotte.webp`, `MascotteKunz.tsx`, splash `EcranDemarrage.tsx` (+ `ouverture.mp4`). Aucun remplacement.
- **`Ana.tsx`** (dashboard أنا) : ordre et contenu des cartes conservés ; les nouveaux signaux sont des
  **cartes sœurs** (boucliers SM-2, trophées tactiques) + un compteur discret de cartes de leçons.
- **Thème** : jetons de `src/index.css` (`@theme` + `[data-theme='dark']`) réutilisés tels quels.
  Deux vocabulaires de classes coexistent : historique (`.card`, `.btn-primary`, `.badge`) pour `Ana`,
  maquette (`.carte`, `.oeil`, `.mention--or`, `.btn--primaire`, `.filet`, `.jauge`) pour tout le neuf.
- **Moteurs** : `programme.ts` seule source des unités/leçons, `qcmLecons.ts` des QCM,
  `lessonGoldSummaries.ts` des fiches, `sujetsOfficiels.ts` des énoncés. Les nouveaux modules dérivent.
- **Protocole 46 min** : conservé, accessible en lien secondaire « الجلسة الكاملة ».

## 2. Architecture

```
data/ (programme, qcmLecons, lessonGoldSummaries, sujetsOfficiels, corriges, briques/*)
  → utils/ purs (moteur, srs, bridge, planDuJour, microNoeuds, briques, amelioration, evenements, accesSujets)
  → adaptateurs (bridgeAdapter, profil, boussoleAdapter, kouest, fakh, bacPasAPas)
  → hooks (useBoussoleBridge) → composants → App.tsx (4 portes, zéro logique métier)
```

### 2.1 Décision structurante — le micro-nœud EST une phase
Six nœuds de 3–5 min, projetés 1-1 sur `PROTOCOLE`. Les faits s'écrivent dans
`progression[id].phases` (mêmes données qu'aujourd'hui) : reprise, SRS et tests existants
restent valables, aucune divergence possible entre « mode nœud » et « séance complète ».

| Phase | Nœud | Min | Contenu actif | Porte |
|---|---|---|---|---|
| 1 · سؤال والقراءة | `lire` | 3 | question du cours + lecture guidée | QCM déclencheur |
| 2 · التقاط الأنماط | `mots` | 3 | classer 6 termes (connu / nouveau) | classement complet |
| 3 · أول استرجاع | `rappel` | 4 | `QCM_LECONS[id].rappel` | 1 bonne réponse |
| 4 · الهيكل | `mecanisme` | 4 | remettre `mechanismAr` dans l'ordre | ordre correct |
| 5 · القراءة + الدليل | `preuve` | 5 | `evidenceAr` + 1 question de preuve | 1 bonne réponse |
| 6 · الترسية | `ancrage` | 5 | `bacSentenceFrameAr` + `commonErrorAr` | phrase gardée |

Sortie de chaque nœud : « زد خطوة تع 3 دقائق؟ » / « يكفي اليوم ». Porte ratée ⇒ **جولة التصحيح**
(2 items courts + le piège de la fiche dorée) puis nouvelle tentative ; jamais d'écran d'échec.
La réussite d'un nœud est une **complétion** (elle écrit `phases`) ; un atelier Boussole, une brique
ou un sujet ne le sont pas (Evidence ≠ Completion).

### 2.2 Schémas ajoutés (tous optionnels dans `Etat`, rétro-compatibles)

```ts
export interface CarteLecon { gagneeLe: string; points: [string, string, string]; version: 1 }
export interface NoeudMicro { id: string; phase: 1|2|3|4|5|6; type: TypeNoeud; minutes: 3|4|5;
  titre: string; savoirFaire: string; porte: 'qcm'|'classement'|'ordre'|'saisie-libre-gardee' }
export type BriqueRole = 'observation' | 'comparaison' | 'interpretation' | 'conclusion' | 'piege';
export interface BriqueReponse { id: string; role: BriqueRole; texte: string; source: string;
  statut: 'a_valider_enseignant' | 'actif' }
export interface JeuBriques { id: string; verbe: VerbeConsigne; attendu: string;
  structure: BriqueRole[]; briques: BriqueReponse[]; statut: 'a_valider_enseignant' | 'actif' }
export interface TentativeBriques { jeuId: string; rolesChoisis: BriqueRole[]; manquants: BriqueRole[];
  complete: boolean; le: string; avant?: number; apres?: number }
```

Ajouts à `Etat` : `cartesLecons`, `briques`, `derogationsSujets`, `trophees`, `defis60`.
`Etat.version` : **2 → 3**, migration `migrerEtat()` idempotente (v1/v2 → défauts, futur → refus).
`boussoleEventsSeen` sert à l'idempotence de **tous** les événements (plafond 500).

### 2.3 Contrat d'événement (extension, pas rupture)
Le labo émet **v1** ; l'hôte ajoute trois champs optionnels (`origine`, `mode`, `jeuId`, `criteres`).
`parseBoussoleEvent` normalise (`origine ?? 'boussole'`). Aucun texte libre de l'élève n'est émis.

## 3. Parcours

### 3.1 `اليوم` — mission unique, 3–5 min
Carte d'entrée : `oeil` + type, titre = l'action, **« في النهاية تعرف: … »**, un seul bouton
primaire `ابدأ`, sous-ligne `+ N مراجعة في القائمة` (reportées, sans reproche), sortie `يكفي اليوم`.
Ordre : reprise > révisions dues **plafonnées à 5** (tri priorité Bac puis date) > nœud du chemin >
entraînement compétence faible > repos. La séance 46 min devient un lien secondaire.

### 3.2 Leçon : `مساري` → nœuds → (réparation) → fiche
Écran `MicroNoeuds` : 6 cartes (fait / à faire / à venir), minutes, savoir-faire, un bouton par nœud.
Une porte réussie ouvre la suite ; « يكفي اليوم » sort sans pénalité ; le nœud 6 débloque
**بطاقة الدرس** (3 points dérivés de la fiche dorée), réutilisable dans le tiroir et les exercices.

### 3.3 Exercices & Bac : البوصلة 1-2-3
`Ecran123` réutilisable : ① **التقط** (verbe surligné + `ATTENTE_DU_VERBE` 20/20 + `attendu` du corrigé) ·
② **بدّل وقارن** (preuve épinglée : témoin puis expérimental) · ③ **ركّب الجواب** (`ConstructeurReponse`
par briques + 1–2 pièges, validation de rôle et d'ordre, **clics seuls**), avec bascule vers la
rédaction libre. **Tiroir source vivant** à tout moment (3 onglets : vérificateur, checklist du verbe,
pièges + cartes de leçons), sans perdre la saisie. Si la 1re tentative est incomplète : critère nommé,
renvoi vers le bon onglet, **Avant / Après**.

### 3.4 Sujets Bac
`EntraineurSujet` (0/1/2) reçoit les 3 étapes par consigne, `accesSujetBac` (recommandation + bouton
**« متابعة رغم ذلك »** qui écrit `derogationsSujets`), et un **gabarit pilote** (sujet 2025-1).
Aucun verrou : `libre: true` toujours.

### 3.5 `أنا`
Rien de retiré. Ajouts : `CarteBoucliersSM2` (4 jours/7 tenus = 1 bouclier), `CarteTropheesTactiques`
(verbes travaillés en 1-2-3), compteur de cartes de leçons, indicateur qualitatif avec la mention
**« مؤشّر توجيهي غير مُعايَر »**.

## 4. Phases d'implémentation

| Phase | Livrable | Fichiers créés | Fichiers modifiés | Tests |
|---|---|---|---|---|
| 1 | Mission unique 3–5 min, plan du jour plafonné à 5, `Etat v3` | `utils/planDuJour.ts`, `__tests__/plan-du-jour.test.ts`, `__tests__/migration-etat.test.ts` | `types.ts`, `utils/etat.ts`, `components/Aujourdhui.tsx`, `index.css` | invariants durée ∈ {3,4,5} · ≤ 5 révisions · migration idempotente |
| 2 | Micro-nœuds, جولة التصحيح, بطاقة الدرس | `utils/microNoeuds.ts`, `components/MicroNoeuds.tsx`, `components/JourneeReparation.tsx`, `components/CarteLecon.tsx`, `__tests__/micro-noeuds.test.ts` | `ProtocoleRunner.tsx` (lien fiche), `Masari.tsx`, `App.tsx`, `types.ts` | 58/58 × 6 nœuds · équivalence `phases` · aucune porte bloquante |
| 3 | 1-2-3 + constructeur de briques | `data/methodologie/attenduVerbes.ts`, `data/briques/u1.ts`, `utils/briques.ts`, `components/Ecran123.tsx`, `components/ConstructeurReponse.tsx`, `__tests__/briques.test.ts` | `Methodologie.tsx` (entrée), `entrainement.ts` (ré-export) | table 20/20 verbes · ordre/rôles · 0 clavier |
| 4 | Tiroir source vivant + amélioration | `components/TiroirBoussole.tsx`, `utils/amelioration.ts` | `Boussole.tsx` (API conservée), `Ecran123.tsx`, `EntraineurSujet.tsx` | saisie conservée · 3 onglets · Avant/Après |
| 5 | Sujets guidés, aucun verrou, pilote | `utils/accesSujets.ts`, `data/briques/sujet-2025-1.ts` | `EntraineurSujet.tsx`, `types.ts`, `SujetsOfficiels.tsx` | 0 sujet bloqué · dérogation tracée · pilote = corrigé |
| 6 | Mesure, garde-fous, formats courts | `utils/evenements.ts`, `components/CarteBoucliersSM2.tsx`, `components/CarteTropheesTactiques.tsx`, `components/Defi60.tsx`, `__tests__/garde-fous-anti-anxiete.test.ts`, `__tests__/evenements.test.ts` | `types/boussoleBridge.ts`, `boussoleAdapter.ts`, `Ana.tsx`, `Aujourdhui.tsx` | Evidence ≠ Completion (12 cas) · idempotence · grep-guard |

### Critères d'acceptation globaux
1. `tsc -b` 0 erreur · `npm test` vert (450 + nouveaux) · `npm run lint` muet · `npm run build` vert.
2. `node scripts/verifier-hors-ligne.mjs` OK — coquille ≤ 2,5 Mio. Mesuré après la v0.11 : **2,49 Mio**. Le script
   compte tous les chunks précachés, pas seulement ceux du démarrage : tenir le plafond a donc demandé
   d'exclure du préacheminement la couche d'entraînement optionnelle (voir §12.bis).
3. Aucune occurrence de note prédite `/20`, « Game Over », ni pourcentage de chances dans `src/**`.
4. Aucun état existant perdu : 4 fixtures (v1, v2, v2 intensif, v2 + carnet) traversent `migrerEtat`.
5. Un atelier/une brique/un sujet ne termine jamais une leçon ni un jalon.

## 5. Design Blanc/Vert & Sombre/Vert

| Rôle | Clair | Sombre | Contraste mesuré |
|---|---|---|---|
| Texte principal | `ink #183d31` | `#f8fafc` | 11,87 · 16,78 |
| Texte secondaire | `ink-soft #4e6557` | `#cbd5cd` | 6,25 · 11,65 |
| Texte discret | `mute #5c7367` | `#9aa39e` | 5,07 · 6,78 |
| Action | `primary #225342` (texte `paper`) | `#7fb896` (texte `#0a1a12`) | 8,72 · 7,87 |
| Récompense | `gold #b07d22` **icônes/large uniquement** ; texte via `honey-ink #79531f` | `#e3c98f` | 3,58 ⚠ · 6,14 · 10,88 |
| Correction douce | `honey-soft` / `clay` sobre (jamais de rouge saturé sur une erreur d'élève) | idem adapté | ≥ 4,5 |

Règles : mobile-first 360–430 px, cibles ≥ 44 px, `dir="rtl"`, chiffres `tnum`, un seul bouton primaire
par écran, aucun paragraphe > 4 lignes, aucune information portée par le seul `hover`.
Composants neufs (famille maquette) : `.noeud`, `.brique` (3 états), `.panier-preuves`,
`.onglet-tiroir`, `.jauge-criteres`, `.carte-lecon`.

**Micro-dialogues de Miftah** : 1 ligne, ≤ 90 caractères, jamais de reproche ni d'urgence
(« الخطأ هاذ هو الطريق » · « رجعت، هذا يكفي » · « نحلوها بطريقة أخرى؟ » · « زد خطوة تع 3 دقائق؟ »).

## 6. Ce qui n'est pas fait

Refonte d'`Ana`, changement de logo/mascotte/splash, nouveau moteur SRS, duplication de
`programme.ts`, énoncés inventés, note prédite, verrou dur, serveur obligatoire, renommage des jetons CSS.

## 7. État d'implémentation

_Rempli au fil de l'exécution (voir §8)._

## 12.bis Correctif de budget (2026-11-21)

**Ce qui a été mesuré.** `vite.config.ts` précache *tous* les assets du build (filtrés seulement par
`HORS_PRECACHE`). Les imports dynamiques réduisent le **chunk de démarrage** (20 entrées), pas la
coquille. Avec la couche 1-2-3 complète, `verifier-hors-ligne` sortait à **2,53 Mio > 2,5 Mio**.

**Ce qui a été fait, dans cet ordre.**

1. `utils/pointsCarteLecon.ts` extrait de `utils/microNoeuds.ts` : la fiche dorée (≈ 120 Kio) sort du
   démarrage, chargée à la demande au moment du gain d'une carte. `microNoeuds` ne dépend plus que de
   `data/protocole` (léger) — l'écran d'accueil garde sa mission sans embarquer les fiches.
2. `HORS_PRECACHE` étendu à la couche d'entraînement optionnelle de la v0.11 :
   `EcranBriques`, `u1`, `sujet-2025-1`, `Defi60`, `JourneeReparation`, `CarteLecon`,
   `pointsCarteLecon`, `TiroirBoussole`, `attenduVerbes` (≈ 43 Kio).
3. **Aucun écran antérieur à la v0.11 n'est exclu** : la coquille d'origine reste intégralement
   précachée. Les écrans exclus restent utilisables hors ligne **après un premier chargement** (le
   worker met en cache `assets/*` à la volée, `public/sw.js` → `fetch`).

**Résultat.** coquille **2,49 Mio** (65 assets dont 20 au démarrage), contenu 4,19 Mio, 0 problème de
cohérence, 0 échec HTTP. Si une future phase ajoute du contenu, la règle est désormais : *mesurer avec
le script*, pas raisonner sur la taille du chunk de démarrage.

## 13. v0.12 — «الموضوع كاملًا · 1-2-3» : le sujet entier, guidé

**Problème constaté (retour d'usage).** Les écrans existaient, mais le parcours d'un sujet
complet n'était pas praticable : `BacPasAPas` traitait **un exercice** à la fois, `EntraineurSujet`
laissait l'élève choisir ses consignes, et certains boutons ouvraient un panneau rendu plus bas
dans la page (impression de « bouton mort »).

**Ce qui a été ajouté.**

| Élément | Rôle |
|---|---|
| `utils/parcoursSujet.ts` | Assemble un sujet **complet** : exercice → partie → consigne, avec pour chaque consigne le verbe, l'attendu du correcteur (`attenduVerbes`), la checklist en 3 points, les descriptions de documents et les **éléments de réponse officiels** du corrigé. Aucun contenu inventé : 30 sujets, **331 consignes, 331 avec éléments officiels**. |
| `components/SujetGuide.tsx` | Le parcours guidé en **quatre temps** — `افهم` (verbe, attendu, documents) → `تحقّق` (les 3 points du verbe) → `اكتب` (brouillon local, jamais la solution d'emblée) → `قارن` (éléments officiels révélés sur demande, puis auto-évaluation 0/1/2). Rail d'avancement, reprise à la première consigne non travaillée, écran de fin sobre. |
| `SujetsOfficiels` | Bouton principal **«الموضوع كاملًا · خطوة بخطوة (1-2-3)»** sur chaque sujet (aucun verrou, y compris 2013–2022), avec le nombre de consignes déjà travaillées. |
| `App` | Mode `sujetGuide` (chargé à la demande) ; l'auto-évaluation écrit dans `maitriseSujets` — **la même clé** que l'entraîneur, donc la couverture du sujet et l'accès conseillé restent cohérents. |
| `EntraineurSujet` | Le tiroir s'ouvre désormais dans un `<dialog>` (`showModal`) : il s'affiche devant l'élève au lieu d'apparaître en bas d'une page longue. |
| Garde-fous | Le bouton « briques » n'apparaît que si le sujet a réellement un gabarit (pas de bouton menant à un état vide). |

**Tests ajoutés.** `utils/__tests__/parcours-sujet.test.ts` (2022-1 pas à pas, ordre, éléments
officiels, barème 20 du corrigé, 331 consignes couvertes sur les 30 sujets) et
`__tests__/sujet-guide-ui.test.tsx` (jsdom : les quatre temps s'enchaînent vraiment, le brouillon
remonte, les éléments restent cachés avant la demande, l'auto-évaluation avance et l'écran de fin
n'affiche ni note ni pourcentage).

**Budget.** `SujetGuide` (14,4 ko) rejoint la liste `HORS_PRECACHE` de la couche d'entraînement
optionnelle (§12.bis) : coquille **2,49 Mio**, 0 incohérence, 0 échec HTTP.

**Reste ouvert (éditorial).** Les descriptions de documents sont celles du corrigé ; les **images**
des documents ne sont pas dans le dépôt (elles sont redessinées à part dans `figuresSujets`). Le
parcours le dit explicitement quand une consigne s'appuie sur une figure.
