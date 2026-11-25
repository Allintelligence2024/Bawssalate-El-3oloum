# Phase 1 — « Guide-First » : rapport d'exécution (2026-11-21)

Branche : `arena/a897fbff-bawssalate-el-3oloum` (PR #13), base `54e034d`.

> **Suite (même journée)** : la phase 2 a depuis **supprimé** l'écran de démarrage décrit au §3
> et ajouté la carte « المرشد يفتح الحصة », les humeurs du guide et l'invitation au compte après
> la première victoire. Voir `plans/PHASE-2-GUIDE-FIRST-2026-11-21.md` ; ce rapport-ci reste le
> compte rendu de la phase 1 telle qu'elle a été livrée.
Périmètre exécuté : **phase 1 seule** (P0). Les phases 2 à 4 ne sont pas commencées.

---

## 1. Sauvegarde : les 10 champs qui disparaissaient

**Constat.** `src/utils/backup.ts` déclarait 34 des 47 champs d'`Etat` dans `etatSchema`. Un
export puis un import effaçait donc silencieusement : `modeInvite`, `fakh`, `fakhSeries`,
`bacEtapes`, `bacExercices`, `cartesLecons`, `briques`, `derogationsSujets`, `trophees`,
`defis60`. `compte`, `consentementSync` et `consentementSyncDecideLe` restent volontairement
hors du schéma (règle de sécurité inchangée).

**Correctif.** Les 10 champs sont typés explicitement :

| Champ | Type vérifié à l'import |
|---|---|
| `modeInvite` | booléen |
| `fakh`, `fakhSeries`, `bacExercices` | dictionnaire de `true` |
| `bacEtapes` | dictionnaire de `0 \| 2 \| 3` (refus d'une autre valeur, jamais « ramenée à 0 ») |
| `cartesLecons` | `{ gagneeLe: date, points: [3 textes], version: 1 }` |
| `briques` | `{ jeuId, rolesChoisis, manquants (5 rôles connus), complete, le, avant?, apres? }` |
| `derogationsSujets` | dictionnaire date |
| `trophees` | `{ le: date, n: entier }` |
| `defis60` | liste de dates |

**Tests. `src/utils/__tests__/sauvegarde-champs.test.ts` (4 cas).**

1. aller-retour réel `paquetExportComplet()` → `JSON.stringify` → `etatDepuisFichier()` :
   les 10 champs reviennent identiques ;
2. le paquet exporté ne contient ni `compte` ni consentement, et l'import remet
   `consentementSync: false` ;
3. une valeur hors domaine (`bacEtapes: 7`) fait refuser tout le fichier (`null`) ;
4. garde structurelle : chaque champ d'`interface Etat` (hors les 3 exclus volontaires) doit
   apparaître dans `etatSchema` — un champ futur oublié fera échouer la CI.

## 2. Statut éditorial : `jeuActif()` était mort

**Constat.** `jeuActif()` (`src/utils/briques.ts:131`) était testé mais **jamais appelé** :
`EcranBriques` servait `JEUX_SUJET_2025_1` (`a_valider_enseignant`) comme un corrigé.

**Correctif.**

- `jeuxJouables(jeux, apercu = false)` : renvoie les jeux `actif` ; si aucun n'est actif et que
  l'aperçu n'est pas demandé → liste vide ; l'aperçu explicite rend tout le catalogue.
- `apercuRequis(jeux)` : vrai quand du contenu existe sans jeu validé.
- `EcranBriques` : filtre le catalogue et, dans ce cas, affiche une **porte** — titre
  « هذا التدريب قيد مراجعة الأستاذ », explication, bouton réel « افتح المعاينة », retour, choix
  d'unité. Après ouverture, une mention permanente s'affiche :
  « معاينة: محتوى قيد المراجعة — ليس جوابًا نموذجيًا معتمدًا ».
- `SujetsOfficiels` : le bouton « briques » reste conditionné à l'existence d'un gabarit ; il
  passe désormais par cette porte (commentaire mis à jour).

**Tests.** `briques.test.ts` (+1 cas) : contenu actif servi seul, contenu non relu invisible sans
aperçu, visible avec aperçu, mélange filtré, catalogue vide sans porte.
`briques-apreciation-ui.test.tsx` (2 cas) : la porte s'affiche pour `2025-1` et aucun bloc de
brique n'est rendu avant l'aperçu ; l'unité 1 (active) s'ouvre directement.

## 3. Médias : plus de vidéo, artwork officiel, coquille allégée

| Fichier | Avant | Après |
|---|---|---|
| `public/ouverture.mp4` | 2 050 998 o | **supprimé** |
| `public/personnage-pirate.webp` | 61 950 o | **supprimé** |
| `public/mascotte.webp` | 14 592 o | **17 634 o** (portrait détouré de l'artwork) |
| `public/guide-clair.webp` | — | **35 510 o** (nouveau, précaché) |
| `public/guide-sombre.webp` | — | **50 574 o** (nouveau, précaché) |
| `public/icons/icon-192.png` | 8 916 o | **10 320 o** en WebP |
| `public/icons/icon-512.png` | 44 107 o | **39 380 o** en WebP |
| `public/icons/maskable-512.png` | 30 312 o | **29 132 o** en WebP |
| `public/icons/apple-touch-180.png` | 7 103 o | 58 505 o (PNG opaque, **non précaché**, iOS) |

- `manifest.webmanifest` : trois icônes WebP (`type: "image/webp"`), maskable sur fond
  `#08434b`, plus `icon.svg`.
- `index.html` : favicon 192 en WebP, `apple-touch-icon` inchangé.
- `public/sw.js` + `vite.config.ts` : même liste `COQUILLE` (7 entrées), vérifiée par test.
- `App.tsx` : l'icône officielle remplace le pictogramme SVG de l'en-tête (même visuel que sur
  l'écran d'accueil du téléphone).
- `EcranDemarrage.tsx` : réécrit **sans `<video>`** (affiche WebP clair/sombre + bouton
  « ابدأ », 350 ms de fondu, `prefers-reduced-motion` respecté). `EcranBriques`, la vidéo et son
  bouton de son disparaissent. 3 tests dédiés (`ecran-demarrage-ui.test.tsx`).
- `scripts/generer-icones.mjs` : encode désormais les icônes web en WebP via ImageMagick ;
  les fichiers livrés proviennent de l'artwork officiel, recettes archivées dans
  `plans/sources/medias/README.md` (+ trois originaux JPEG).

## 4. Budget hors ligne — la cible de 2,2 Mio est atteinte

Mesure réelle (`dist/precache-manifest.json`) après `npm run build` :

```
coquille : 2 271 954 o  = 2,17 Mio   (7 entrées statiques + 63 assets)
contenu  : 4 391 506 o  = 4,19 Mio   (28 entrées, sur demande)
total    : 6 663 460 o
```

Avant la phase : 2 616 047 o (2,49 Mio). Écart : **−344 093 o**.

D'où vient le gain :

| Décision | Effet |
|---|---|
| `supabase-*` hors précache (nommé par `manualChunks`) | −214 093 o. La synchronisation exige le réseau : la précacher ne protégeait rien. |
| `Methodologie-*` hors précache | −138 858 o. Écran de consultation hors boucle quotidienne. |
| `ExamBlanc-*` hors précache | −12 771 o. Simulation chronométrée, ouverte ponctuellement. |
| médias (vidéo et pirate supprimés, WebP ajoutés) | −17 800 o nets, dont 86 ko de visuels du guide désormais précachés |

**Ce qui n'a pas été exclu, et pourquoi.** `sujetsCorriges` (370 050 o) a d'abord été sorti du
précache — la cible tombait alors à 1,83 Mio. `verifier-hors-ligne` a immédiatement révélé
l'erreur : `asset de démarrage hors manifeste : /assets/sujetsCorriges-…js`. Ce chunk est tiré
par `entrainement` et figure donc dans le HTML de démarrage ; l'exclure **cassait
l'installation du service worker**. Il est revenu dans la coquille.

Conséquence assumée : `Methodologie` et `ExamBlanc` ne s'ouvrent hors ligne qu'après une
première visite en ligne (le worker met en cache `assets/*` à la première requête — mécanisme
déjà documenté dans `vite.config.ts`).

## 5. Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npm test` | **639 tests / 76 fichiers verts** (3 fichiers de tests nouveaux, 3 retouchés) |
| `npm run lint` | 0 erreur, 0 avertissement |
| `npm run build` | OK (`tsc -b` + `vite build`), 63 assets |
| `node scripts/verifier-hors-ligne.mjs` | **OK** — 0 incohérence, 0 échec HTTP, 101 fichiers interrogés |
| `node scripts/sync-metrics.mjs --check` | « README à jour : aucune dérive de métriques » |

## 6. Voir le résultat à l'écran

```bash
npm run dev        # http://localhost:3000
```

1. **Splash** : l'affiche du guide (pas de vidéo) + « ابدأ ». Passer le téléphone en mode sombre
   recharge l'autre visuel.
2. **En-tête** : l'icône officielle à gauche du titre « بوصلة العلوم ».
3. **Sauvegarde** : أنا → « النسخة الاحتياطية » → exporter, puis importer le fichier. Avant ce
   correctif, un élève qui jouait une carte de leçon ou un défi 60 s les perdait ; désormais
   tout revient, et un état exporté reste en mode invité (le compte n'est jamais importé).
4. **Statut éditorial** : الباك → un sujet → « ابنِ الجواب بالبنى » (ou البوصلة 1-2-3).
   L'écran affiche maintenant « هذا التدريب قيد مراجعة الأستاذ » et le bouton
   « افتح المعاينة » ; l'unité 1 s'ouvre normalement, sans porte.
5. **Hors ligne** : DevTools → Application → Service Workers, cocher « Offline », recharger :
   l'affiche, les icônes et les écrans précachés restent disponibles.

## 7. Ce qui reste ouvert (phases suivantes, non commencées)

- **Phase 2** : suppression complète du splash, `modeInvite: true` par défaut, carte
  « المرشد يفتح الحصة », check-in d'énergie, humeurs de `MascotteKunz`, ligne `reportees > 0`.
- **Phase 3** : `MicroNoeuds` par défaut, carte de leçon, `Ana.tsx` en 3 sous-onglets,
  `prefers-reduced-motion` global, `vibrerDoux()`.
- **Phase 4** : gabarit de jeu + 1 exemple par unité prioritaire (u3, u4) en
  `a_valider_enseignant` — donc visibles seulement via la porte d'aperçu mise en place ici.
- `plans/RADIOGRAPHIE-TECHNIQUE-2026-11-21.md` décrit encore l'état d'avant correctif (§ les 13
  champs hors zod) : c'est un instantané daté, laissé tel quel, ce rapport fait foi pour l'après.
