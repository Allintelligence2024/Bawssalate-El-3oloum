# Phase 2 — « Guide-First » : rapport d'exécution (2026-11-21)

Branche `arena/a897fbff-bawssalate-el-3oloum` (PR #13), base `54e034d`.
Ce rapport couvre **la revue de la phase 1** (défauts trouvés et corrigés) puis **la phase 2**.

---

## 1. Revue de la phase 1 — ce qui n'allait pas, et ce qui est corrigé

| Défaut trouvé | Correction |
|---|---|
| **Bouton mort** dans la porte d'aperçu des briques : sur un sujet (`sujetId`), « اختر وحدة أخرى » appelait `setCible(undefined)`, qui ne change rien (les jeux viennent du sujet). Le même bouton existait dans l'état vide. | Les deux boutons sont conditionnés à `!sujetId`. Test d'écran ajouté : la porte d'un sujet n'affiche pas ce bouton. |
| Le titre « المرشد يفتح الحصة » n'existait que dans `aria-label` (invisible). | Titre visible (`oeil`) en tête de carte ; le test d'entrée le vérifie. |
| `Ecran123` : classe `btn--secondary` (inexistante) au lieu de `btn--secondaire` — bouton sans style. | Corrigé (le style du bouton « تحقّق من الدليل » revient). |
| Commentaire de `EcranDemarrage` citant `ouverture.mp4` : la garde anti-régression du test PWA échouait. | Commentaire reformulé ; l'écran lui-même disparaît en phase 2. |
| `scripts/generer-icones.mjs` : encodage WebP ajouté mais non testable ici. | Vérifié par `node --check` ; recettes ImageMagick documentées en parallèle (`plans/sources/medias/`). |

Rien d'autre n'a été trouvé : `npm test`, `lint`, `build` et `verifier-hors-ligne` étaient déjà
verts avant la phase 2 (646 → 646 tests après corrections).

## 2. Zéro barrage

- `src/components/EcranDemarrage.tsx` **supprimé** (ainsi que son test) : plus de vidéo, plus
  d'affiche intermédiaire. `App.tsx` ne lit plus `kunz_demarrage` ni `kunz_intro_vue`.
- L'écran de compte n'est plus un péage : `inscrit = !demandeCompte`. `demandeCompte` ne passe à
  `true` que sur trois gestes explicites — « أنشئ حسابي » (carte d'accueil après une victoire),
  la fiche XP de l'en-tête, et « خروج » (qui rouvre l'écran en mode **connexion**).
- Conséquence : installation neuve, invité, compte local dont l'onglet a été fermé → **entrée
  directe dans كويست**. Le premier bouton de mission est visible dès le premier rendu (pas de
  minuteur, pas d'attente `canplay`) : time-to-first-tap sous la seconde, pas sous 5 s.
- Consentement et diagnostic restent **après** la création de compte, inchangés.

## 3. La carte « المرشد يفتح الحصة »

Nouveau composant `src/components/GuideAccueil.tsx`, rendu **en tête de كويست**
(`Aujourdhui.tsx`), avant la carte de mission.

| Énergie | Ce que propose le guide |
|---|---|
| **عيان** (à plat) | « صيّاد الفخاخ · دقيقتين » et « تحدّي 60 ثانية » — aucun temps imposé, aucune mission |
| **لاباس** (ça va) | la mission du jour **telle quelle** (`missionDuJour`, moteur unique) |
| **في الفورمة** (en forme) | « موضوع كامل · خطوة بخطوة » (sujet guidé) et « البوصلة 1-2-3 » |

- Trois icônes SVG du dépôt (lune, soleil, éclair) ; **aucun emoji** (test dédié).
- Le choix d'énergie n'est **pas persisté** : c'est une humeur du jour, pas une donnée d'élève.
- **Ligne rassurante** quand des revues attendent leur tour :
  « بقيت N مراجعة في القائمة — تنتظر دورها، بلا عجلة وبلا دين », N plafonné à **5** (test :
  9 reportées → affiche 5).
- **Invitation au compte après la première micro-victoire** seulement (première leçon terminée),
  avec « أنشئ حسابي » et « نكمّل بلا حساب ». Le refus écrit `invitationCompteVue` (nouveau champ
  d'`Etat`, ajouté au schéma zod et au test aller-retour) : l'invitation ne revient plus.
- Le guide de l'en-tête de كويست a été retiré : un seul visuel de guide par écran, celui de la
  carte.

## 4. Le guide a des humeurs, et il souffle

- `MascotteKunz` accepte `humeur` : `accueil`, `reflexion`, `encouragement`, `piege`,
  `victoire`. Chaque humeur change l'étiquette arabe (« يفتح الحصة », « يفكّر معك », « يشجّعك »,
  « ينبّهك إلى فخّ », « يفرح معك ») et le ton de la carte. Aucune émotion par emoji.
- `GuideIndice.tsx` : bouton « تلميح المرشد » (`aria-expanded`), une seule ligne, jamais la
  réponse. Branché dans :
  - **`Ecran123`** (étape 2) : distinguer observation et comparaison au témoin ;
  - **`Fakh`** : la marque d'un piège (mot absolu : دائمًا، أبدًا، وحده…) ;
  - **`MicroNoeuds`** : la porte du nœud courant, avec le rappel qu'il ne faut pas tout retenir.
- **Réaction d'une ligne sur erreur** : dans `Ecran123`, un manque est nommé par le guide
  (« يشجّعك », message du critère) au lieu d'un encart d'échec ; dans `Fakh`, une erreur affiche
  « هذا فخّ — والغلط ما ينقصش ». Aucun point perdu, aucun rouge.

## 5. Fichiers

**Ajoutés** : `src/components/GuideAccueil.tsx`, `src/components/GuideIndice.tsx`,
`src/__tests__/guide-accueil-ui.test.tsx` (10 cas).

**Modifiés** : `src/App.tsx` (entrée, `demandeCompte`, câblage), `src/components/Aujourdhui.tsx`
(carte guide, props, un seul visuel), `MascotteKunz.tsx` (humeurs), `Ecran123.tsx` (indice +
réaction), `Fakh.tsx` (indice + réaction), `MicroNoeuds.tsx` (indice), `EcranBriques.tsx`
(boutons morts), `src/types.ts` + `src/utils/backup.ts` (`invitationCompteVue`), tests
(`stockage-ui`, `sync-etat-illisible`, `rapport-utilisabilite-ui`, `briques-apreciation-ui`,
`pwa-icones`), `README.md`.

**Supprimés** : `src/components/EcranDemarrage.tsx`, `src/__tests__/ecran-demarrage-ui.test.tsx`,
et les lectures de `kunz_demarrage` / `kunz_intro_vue`.

## 6. Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npm test` | **646 tests / 76 fichiers verts** |
| `npm run lint` | 0 erreur |
| `npm run build` | OK |
| `node scripts/verifier-hors-ligne.mjs` | **OK** — 0 incohérence, 0 échec HTTP (102 fichiers interrogés) |
| `node scripts/sync-metrics.mjs --check` | aucune dérive |

Coquille hors ligne : **2 277 352 o = 2,172 Mio** (7 entrées statiques, 64 assets) — sous la
cible de 2,2 Mio. La carte du guide est statique dans le chunk de كويست : +1,5 ko seulement.

## 7. Voir la phase 2 à l'écran

```bash
npm run dev        # http://localhost:3000
```

1. **Entrée** : vider le stockage du site, recharger → كويست s'affiche directement, avec la carte
   « المرشد يفتح الحصة ». Aucun écran de compte, aucune vidéo.
2. **Énergie** : toucher « عيان » → deux formats courts ; « لاباس » → « نبدأ من هنا » ouvre la
   mission du jour ; « في الفورمة » → sujet guidé ou briques 1-2-3.
3. **Humeurs** : ouvrir un exercice 1-2-3, rater une preuve → le guide encourage en une ligne ;
   « تلميح المرشد » ouvre un indice d'une ligne (et le referme).
4. **Compte** : terminer une première leçon, revenir à كويست → carte « أوّل انتصار » ; accepter
   ouvre l'écran de compte, puis le consentement et le diagnostic. « نكمّل بلا حساب » la masque
   définitivement.
5. **Reportées** : avec des révisions en retard, la ligne « بقيت N مراجعة… » apparaît, plafonnée
   à 5, sans vocabulaire de dette.

## 8. Reste ouvert (phases 3 et 4)

- **Phase 3** : livrée le même jour → `plans/PHASE-3-GUIDE-FIRST-2026-11-21.md` (écran de
  fierté, `Ana` en trois volets, mouvement réduit, vibration, comptage des séances corrigé).
- **Phase 4** : gabarit de jeu + un exemple par unité prioritaire (u3, u4) en
  `a_valider_enseignant` (visibles seulement via la porte d'aperçu), `sync-metrics` du README,
  validation finale complète.
