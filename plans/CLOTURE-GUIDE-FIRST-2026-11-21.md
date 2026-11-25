# Clôture du plan « Guide-First » (2026-11-21)

Branche `arena/a897fbff-bawssalate-el-3oloum` (PR #13), base `54e034d`.

Ce document ferme le plan en quatre phases ouvert par
`plans/RADIOGRAPHIE-TECHNIQUE-2026-11-21.md` : ce qui est livré, ce qui le prouve, et ce qui
reste **strictement humain**. Un plan n'est pas « fini » parce qu'un agent le dit : il l'est
quand la liste des preuves tient debout et que le reste est nommé.

---

## 1. Les quatre phases, en une ligne chacune

| Phase | Promesse | Livré |
|---|---|---|
| **1 · Fiabilité** | « la sauvegarde n'efface plus » | `backup.ts` déclare les 48 champs d'`Etat` (10 étaient perdus à l'import), `etatSchema` les valide champ par champ, `jeuActif()` est enfin branché sur le rendu, la vidéo d'ouverture (2 050 998 o) et les PNG morts disparaissent, les médias du Drive sont recompressés (mascotte 17,6 ko, guides 35,5 / 50,6 ko). |
| **2 · Guide-First** | « zéro barrage, le guide ouvre la séance » | `EcranDemarrage` supprimé ; une installation neuve entre en mode invité ; carte « المرشد يفتح الحصة » (عيان / لاباس / في الفورمة) ; humeurs du guide ; « تلميح المرشد » dans `Ecran123`, `Fakh`, `MicroNoeuds` ; invitation au compte après la première micro-victoire seulement (`invitationCompteVue`). |
| **3 · Fierté** | « on ne referme plus une leçon finie, on l'annonce » | `EcranFierte` (trois preuves, un seul geste, zéro pourcentage) ; « أنا » en trois volets ; `prefers-reduced-motion` global ; `vibrerDoux()` sur une réussite, jamais sur une erreur ; **séance comptée à la clôture** (`cloturerSeance`). |
| **4 · Gabarit** | « un jeu de briques se découpe, il ne s'écrit pas » | `gabarit.ts` (`jeuBriques`, `rolesDepuisModele`, `jeuDepuisSituation`) ; **16 jeux** (4 actifs en u1, 12 en revue) couvrant les 11 unités + le sujet pilote ; porte d'aperçu vérifiée ; coque Android alignée (`0.13.0` / code 4). |

Rapports détaillés : `PHASE-1-GUIDE-FIRST-2026-11-21.md`, `PHASE-2-…`, `PHASE-3-…`,
`PHASE-4-GABARIT-2026-11-21.md`.

---

## 2. Ce qui prouve quoi (pas de promesse sans test)

| Preuve | Où |
|---|---|
| Aucun champ d'`Etat` ne peut plus être perdu à l'import | `sauvegarde-champs.test.ts` (aller-retour + comparaison champ par champ `interface` ↔ `etatSchema`) |
| Un jeu non relu n'est jamais servi comme corrigé | `briques-apreciation-ui.test.tsx` (3 cas), `briques-gabarit.test.ts` (9 cas : catalogue, statut, verbatim) |
| Les briques ne réécrivent aucune phrase scientifique | `briques-gabarit.test.ts` : `document`/`question` égaux aux textes de la synthèse, corps = `modele` dans l'ordre, pièges ∈ `piegesAr` |
| Ouvrir une leçon ne fabrique plus une séance | `seance-comptage.test.ts` (4 cas) **et** `fierte-parcours-ui.test.tsx` (App entière : 0 séance à l'ouverture, 1 à la clôture, pas de double comptage) |
| Le parcours nœuds → protocole → fierté tient debout | `fierte-parcours-ui.test.tsx` (mocks des trois écrans lourds, test du câblage réel des modes) |
| Les volets d'« أنا » ne perdent rien | `ana-volets-ui.test.tsx` (le nom saisi survit au changement de volet) |
| Le mouvement réduit et la vibration sont branchés | `index.css` (`@media (prefers-reduced-motion)`), `son-vibrations.test.ts` (3 cas) |
| Le hors-ligne reste sous budget | `scripts/verifier-hors-ligne.mjs` : 103 fichiers, 0 incohérence, coquille **2,18 Mio** |
| Rien ne vieillit en silence (métriques) | `scripts/sync-metrics.mjs --check` : 16 jeux de briques, 670 tests, poids mesurés |
| L'app réelle fonctionne dans un navigateur | CI GitHub Actions : `integration.cjs`, `recovery.cjs`, `account.cjs` (Playwright/Chromium) — **verte** |

QA finale (dans cet ordre) : `npm test` → **670 tests / 82 fichiers** · `npm run lint` → 0 erreur ·
`npm run build` → OK · `verifier-hors-ligne` → OK · `sync-metrics --check` → aucune dérive.

---

## 3. Écarts assumés (écrits, pas cachés)

1. **Douze jeux ne sont pas relus.** Ils vivent derrière « هذا التدريب قيد مراجعة الأستاذ ».
   Les passer en `actif` est un geste éditorial, pas technique.
2. **Une seule situation par unité** est découpée (`u2`…`u11`) ; le programme en contient deux
   pour `u1`, `u3`, `u4`, `u5` (les secondes sont dans les rapports mais pas encore en jeu).
3. **Le guide ne décide de rien** : il met en scène `prochaineAction()` / `missionDuJour()`.
   C'était la contrainte R1 de la radiographie ; elle est respectée et aucun second moteur n'a
   été créé.
4. **La synchronisation reste un miroir de compteurs**, pas une restauration d'état. Rien dans
   ce plan ne l'a changé, et aucune copie ne le prétend.

---

## 4. Reste strictement humain

- **Relecture enseignante** des 12 jeux `a_valider_enseignant` (sujet 2025-1 + unités `u2`…`u11`).
- **APK signé** : coque alignée (`versionName 0.13.0`, `versionCode 4`), mais signature, icônes
  adaptatives définitives et essai sur appareil réel restent à faire.
- **Sécurité et données** : revue RLS indépendante, politique de conservation, essais réels
  web/Android — voir `plans/PASSATION-RESTE-A-FAIRE.md` (P0.1–P0.3).
- **Droits des contenus** : extraits, figures et PDF de `public/boussole/` — voir
  `plans/DECISION-DROITS-CONTENUS.md`.

Aucun de ces quatre points n'a été remplacé par une affirmation dans ce dépôt : ils sont
chacun adossés à un document ou à un test qui dit ce qui est prouvé et ce qui ne l'est pas.
