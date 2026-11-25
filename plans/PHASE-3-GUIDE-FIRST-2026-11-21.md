# Phase 3 — « Fierté » : rapport d'exécution (2026-11-21)

Branche `arena/a897fbff-bawssalate-el-3oloum` (PR #13), base `54e034d`.
Ce rapport couvre **la revue de la phase 2** (ce qui n'allait pas, corrigé ici) puis **la phase 3**.
Rapports précédents : `PHASE-1-GUIDE-FIRST-2026-11-21.md`, `PHASE-2-GUIDE-FIRST-2026-11-21.md`.

---

## 1. Revue de la phase 2 — cinq défauts trouvés, cinq corrigés

| Défaut trouvé | Correction |
|---|---|
| **Deux boutons, une seule destination** dans `MicroNoeuds` : « ابدأ · 3 دقائق » et « الجلسة الكاملة · N دقيقة » appelaient tous deux `setMode({ type: 'protocole' })`. Le second promettait une séance de 46 min qui n'existait pas. | Le second bouton **disparaît** (prop `onOuvrirSeanceComplete` supprimée, câblage `App.tsx` et fixture de test compris) et devient une **ligne d'information** : « الجلسة الكاملة: 6 مراحل · N دقيقة — تنجّم توقف بعد كل خطوة ». Test : le libellé n'est plus dans aucun `<button>`. |
| **Séance comptée à l'ouverture** : `ouvrirItem` (et `ouvrirDepuisMindmap`) appelaient `enregistrerSeance` à chaque ouverture d'une leçon non terminée — ouvrir/fermer dix fois = dix séances, et le bonus du jour se débloquait sans travail. | Nouvelle fonction pure `cloturerSeance(etat, lessonId, p)` dans `moteur.ts` : la séance n'est comptée **qu'à la clôture**, **qu'une fois** (idempotente sur double clôture), et le bonus se pose au-delà du quota. `onTerminer` l'utilise ; `ouvrirItem` et `ouvrirDepuisMindmap` ne comptent plus rien. 4 tests (`seance-comptage.test.ts`). |
| **`guide-clair.webp` / `guide-sombre.webp` (86 ko précachés) n'étaient référencés par aucun écran** — le README affirmait qu'ils illustraient « la carte d'accueil », ce qui était faux depuis la phase 2. | Ils illustrent désormais l'**écran de fierté**. Deux `<img>` rendus, un seul visible selon `[data-theme]` (CSS pur, pas de JS, pas de clignotement). Le README est corrigé. |
| **`ouvrirDepuisMindmap` ouvrait encore `protocole`** alors que la phase 2 a fait de `MicroNoeuds` le défaut : une leçon non finie lancée depuis la carte mentale sautait les six micro-nœuds, et sa fermeture ramenait aux onglets au lieu de la carte. | Route vers `{ type: 'noeuds' }`, et `onFermer` du mode `noeuds` respecte `retourMindmap` (retour à la carte mentale). |
| **Le nom de l'app avait disparu** de la carte du guide : `MascotteKunz` affichait « القبطان مفتاح · <humeur> », donc l'identité « بوصلة العلوم » n'apparaissait plus nulle part sur la carte. | Ligne d'identité restaurée (« القبطان مفتاح · بوصلة العلوم ») et l'humeur devient une **pastille** à droite. |

Nettoyage au passage : commentaires du worker `public/sw.js` réorthographiés (`première`,
`régulière`, `déraper`) — le fichier n'est jamais relu par un humain en production, autant qu'il
soit lisible.

---

## 2. Phase 3 — ce qui est livré

### 2.1 L'écran de fierté (`src/components/EcranFierte.tsx`, nouveau)

À la fin des six nœuds, `onTerminer` n'éteint plus l'écran : il ouvre `{ type: 'fierte' }`.
L'écran **constate** un travail, il ne félicite pas un score :

- **trois preuves** : `6 / 6` phases, « بطاقة الدرس في جيبك » (les trois points figés au gain),
  et la **date de la prochaine revision** en arabe clair (« 24 نوفمبر ») ;
- **le guide** en visuel (clair ou sombre selon le thème) ;
- **un seul geste utile** au choix : « شوف بطاقة الدرس » (la carte se déplie sur place, via le
  composant `CarteLecon` déjà utilisé par le tiroir de la Boussole), « الدرس التالي »
  (`prochainItem`, seulement s'il en existe un) ou « يكفي اليوم » ;
- **aucun pourcentage** : le test l'interdit (`expect(texte).not.toMatch(/%/)`).

Le parcours منهجية garde sa destination : `onAllerMethodo` appelle `terminerLecon()` puis écrase
le mode par `methodoExos` — l'écran de fierté ne s'interpose pas sur un choix explicite.

### 2.2 « أنا » en trois volets (`src/components/Ana.tsx`)

| Volet | Contenu |
|---|---|
| `تقدّمي` | fiche A4 (« ملفّي »), « رحلتي بالأرقام », « أيام نشاطي », boucliers SM-2, trophées |
| `كرّاستي` | « دوّن » (notes), « سجلّ الأخطاء » |
| `إعداداتي` | identité (nom, date du bac), compte / mode invité, objectif, intensif, taille du texte, rappels, « النسخة الاحتياطية », « إعادة الضبط », confidentialité |

Choix d'implémentation : **rien n'est démonté**. Les sections restent dans la page et sont
repliées par l'attribut `hidden` (preflight Tailwind : `[hidden] { display: none !important }`).
Conséquence vérifiée par test : un nom à moitié saisi survit au changement de volet, et aucun
état interne (confirmations, focus, compteur d'export) n'est perdu. Le premier volet est
`تقدّمي` ; les trois onglets sont des `role="tab"` avec `aria-selected`.

### 2.3 Mouvement réduit (`src/index.css`)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

0,01 ms et non 0 : les composants qui écoutent `transitionend` / `animationend` (étapes de
protocole, célébrations) continuent de recevoir l'événement. Les confettis de `Fetes.tsx`
testaient déjà la préférence système ; la règle couvre maintenant tout le reste.

### 2.4 Vibration douce (`src/utils/son.ts`)

```ts
export function vibrerDoux(dureeMs = 15): void
```

Appelée par `sonJuste()` — **jamais par `sonFaux()`** : le téléphone ne gronde pas quand un
élève se trompe. Appareil sans vibreur, permission refusée, `navigator` absent : la fonction ne
fait rien et ne lève pas. `son-vibrations.test.ts` (3 tests) vérifie la durée, l'absence
d'exception et la règle « réussite vibre / erreur ne vibre pas ».

### 2.5 `MicroNoeuds` reste le défaut, et la sortie est fière

- كويست, مساري et la carte mentale ouvrent une leçon non terminée sur `{ type: 'noeuds' }` ;
  `protocole` n'est atteint que par le bouton « ابدأ · N دقائق » du nœud courant ;
- la leçon terminée s'annonce (écran de fierté, puis carte du jour) ; le seul chemin qui
  contourne la fierté est le choix explicite « منهجية ».

### 2.6 Version

`package.json` et `package-lock.json` passent de `0.10.5` à **`0.13.0`**, alignés sur les
entrées du journal. Le `versionName` Android (`android/app/build.gradle`) reste `0.10.5` : à
mettre à jour au prochain build APK, ce n'est pas un fichier suivi par cette phase.

---

## 3. Fichiers touchés

| Fichier | Nature |
|---|---|
| `src/components/EcranFierte.tsx` | **nouveau** (écran de fierté) |
| `src/App.tsx` | mode `fierte`, `lazy(EcranFierte)`, `onTerminer` → `cloturerSeance` + fierté, comptage retiré de `ouvrirItem` / `ouvrirDepuisMindmap`, `noeuds` respecte `retourMindmap`, prop `onOuvrirSeanceComplete` retirée |
| `src/utils/moteur.ts` | **`cloturerSeance`** (séance comptée à la clôture, une fois) |
| `src/components/MicroNoeuds.tsx` | second CTA remplacé par une ligne d'information |
| `src/components/Ana.tsx` | trois volets (`role="tab"`), sections repliées par `hidden` |
| `src/components/MascotteKunz.tsx` | identité restaurée + pastille d'humeur |
| `src/index.css` | `prefers-reduced-motion` global, bascule `.theme-clair` / `.theme-sombre` |
| `src/utils/son.ts` | `vibrerDoux()`, appelée par `sonJuste()` |
| `public/sw.js` | commentaires réorthographiés (aucun changement de comportement) |
| `package.json`, `package-lock.json`, `README.md` | version 0.13.0, journal v0.13 Phase 3, § entrée corrigé |
| `src/__tests__/ecran-fierte-ui.test.tsx` | **nouveau** (3 tests) |
| `src/__tests__/ana-volets-ui.test.tsx` | **nouveau** (2 tests) |
| `src/utils/__tests__/seance-comptage.test.ts` | **nouveau** (4 tests) |
| `src/utils/__tests__/son-vibrations.test.ts` | **nouveau** (3 tests) |
| `src/__tests__/premier-ecran-ui.test.tsx` | assertion « الجلسة الكاملة » n'est plus un bouton, fixture sans la prop supprimée |

---

## 4. QA (dernier passage, dans cet ordre)

| Étape | Résultat |
|---|---|
| `npm test` | **658 tests / 80 fichiers verts** (76 → 80, +12 tests) |
| `npm run lint` | 0 erreur |
| `npm run build` | OK (`index-qHNi3h8F.js` ; écran de fierté dans son propre chunk `EcranFierte-CjS5Y15h.js`) |
| `node scripts/verifier-hors-ligne.mjs` | OK — 103 fichiers interrogés, 6 689 258 o servis vs 6 674 461 o déclarés, **0 incohérence**, 0 échec HTTP |
| `node scripts/sync-metrics.mjs --check` | aucune dérive (README régénéré : 80 fichiers de tests, coquille **2,18 Mio**) |
| `vite preview --port 4176` + `curl` | `/`, `/guide-sombre.webp`, `/manifest.webmanifest` → **200** (serveur arrêté ensuite) |

Coquille hors-ligne : **2,18 Mio** (7 entrées) — +0,01 Mio vs phase 2 (CSS du mouvement réduit,
bascule de thème et chunk de fierté).

---

## 5. Voir la phase 3 à l'écran

```bash
npm run dev        # http://localhost:3000
```

1. **Fierté** : ouvrir un nœud, faire les six phases → l'écran « خلّصت الدرس » s'affiche avec
   `6 / 6`, la date de revision ; « شوف بطاقة الدرس » déplie les trois points ; « يكفي اليوم »
   ramène à la carte du jour.
2. **Comptage** : ouvrir puis fermer une même leçon trois fois → la séance du jour ne bouge
   qu'à la clôture, et le bonus n'apparaît qu'après le quota.
3. **Volets** : onglet أنا → taper un nom, passer à « إعداداتي » puis revenir : le nom est
   intact ; « كرّاستي » montre دوّن + سجلّ الأخطاء, « إعداداتي » la sauvegarde.
4. **Mouvement réduit** : activer « Réduire les animations » dans le système, recharger → plus
   aucune transition (les écrans restent identiques).
5. **Vibration** : sur mobile, une bonne réponse vibre 15 ms ; une erreur ne vibre pas.

---

## 6. Reste ouvert

- **Phase 4** : gabarit de jeu + un exemple par unité prioritaire (u3, u4) en
  `a_valider_enseignant` (visibles seulement via la porte d'aperçu), puis validation finale.
- `versionName` Android à aligner sur `0.13.0` au prochain build APK.
- Les matériaux de `plans/sources/medias/` restent la référence des recettes ImageMagick ; aucune
  nouvelle image n'a été produite en phase 3.
