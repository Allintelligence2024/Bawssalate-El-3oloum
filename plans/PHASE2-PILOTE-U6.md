# Phase 2 — Pilote `u6` : pipeline Drive → WebP → intégration

Date : 26/11/2026 · Branche `arena/7502c82b-bawssalate-el-3oloum`.

> **Note Phase 3 (même date)** : ce bilan décrit le pilote historique à **9 images `u6`**.
> Le pipeline final couvre **21 images `OK`** (`u6,u7,u8,u9,u11`), ajoute le zoom plein
> écran, l'affichage en Phase 5 du `ProtocoleRunner` et le test
> `src/data/__tests__/illustrationsLecons.test.ts`. Voir l'arbitrage **A-068** dans
> `plans/relecture/REGISTRE-ARBITRAGES.md` pour la traçabilité éditoriale à jour.

## 1. Périmètre

Le pipeline a été validé sur les **9 illustrations `OK`** de `06_U6_Photosynthese`, référencées dans `plans/inventaire-images-livre.json`. Le script refuse toute entrée `FIX_TEXT` ou `REJECT` : pour `--unites=u6`, **23 `FIX_TEXT` ont été ignorées**, aucun `REJECT` n’appartient à `u6`.

Commande exécutée :

```bash
node scripts/importer-images-lecons.mjs --unites=u6
```

## 2. Fichiers livrés

| Rôle | Fichier |
|---|---|
| Import réutilisable | `scripts/importer-images-lecons.mjs` |
| Registre typé | `src/data/illustrationsLecons.ts` |
| Helper d’URL + légende sûre | `src/utils/illustrations.ts` |
| Typage env | `src/vite-env.d.ts`, `.env.example` |
| Composant d’affichage | `src/components/IllustrationsLecon.tsx` |
| Intégration lecteur | `src/components/LecteurLecon.tsx` |
| Cache à la volée | `public/sw.js` |
| Exclusion précache + versionnage | `vite.config.ts` |
| Garde-fous de build | `scripts/verifier-hors-ligne.mjs`, `scripts/verifier-deploiement.mjs` |
| Tests ajoutés dans des fichiers existants | `src/utils/__tests__/service-worker.test.ts`, `src/utils/__tests__/pwa.test.ts`, `src/__tests__/metriques.test.ts`, `src/__tests__/accessibilite.test.tsx` |
| 9 WebP | `public/lecons/img/*.webp` |

Aucun nouveau fichier de test n’a été créé : le compteur README « Fichiers de tests » reste **84**.

## 3. Les 9 WebP

Largeur max **1200 px**, qualité **80**, `-auto-orient -strip` (EXIF supprimé), cible **≤ 100 Ko**. Quand 1200 px dépassait la cible, la largeur a été réduite par pas de 50 px sans jamais descendre la qualité.

| `lessonId` | `docNum` | Dimensions | Poids | Fichier |
|---|---:|---:|---:|---|
| `d2-u6-l1-hill-ruben` | 02 | 1150×912 | 47,2 Ko | `…img061.webp` |
| `d2-u6-l1-hill-ruben` | 04 | 1200×771 | 89,6 Ko | `…img059.webp` |
| `d2-u6-l2-jagendorf` | 12 | 1200×316 | 41,2 Ko | `…img052.webp` |
| `phase10_chapitres_19_20_2` | 02 | 779×1200 | 61,3 Ko | `…img042.webp` |
| `phase10_chapitres_19_20_2` | 02 | 1050×618 | 94,7 Ko | `…img067.webp` |
| `phase11_chapitres_21_22_2` | — | 950×711 | 93,3 Ko | `…img064.webp` |
| `phase11_chapitres_21_22_2` | 09 | 1200×854 | 66,0 Ko | `…img054.webp` |
| `phase12_chapitres_23_24_2` | 03 | 1200×476 | 60,4 Ko | `…img063.webp` |
| `phase12_chapitres_23_24_2` | 03 | 1084×992 | 59,1 Ko | `…img066.webp` |

Totaux : **9 fichiers**, **627 418 octets** (≈ 612,7 Ko), maximum **96 994 octets** (94,7 Ko).  
Aucun `.jpg` / `.jpeg` / `.png` dans `public/lecons/img/` ; uniquement des `.webp`.

L’image 42 (`أشنة خضراء`, repassée `OK` à l’Étape 2) fait bien partie du pilote.

## 4. Traçabilité éditoriale

Chaque entrée du registre porte :

```ts
statut: 'a_valider_enseignant',
reviewed: false,
```

Vérifié : **9 `reviewed: false`**, **0 `reviewed: true`**, **0 promotion `actif`**. Le composant affiche un bandeau « في انتظار مراجعة أستاذ · لم يُعتمد بعد ». Les `titreAr`, `altAr` et `legendeAr` (HTML net, RTL, balises `<span>/<strong>/<em>/<br>` uniquement, attributs supprimés par `legendeArSecurisee`) viennent du manifeste.

## 5. Budget hors-ligne sacré

- `public/lecons/img/*.webp` n’apparaît dans **aucune** des listes `assets`, `statiques` ou `contenu` du `precache-manifest.json`.
- `loading="lazy"` + `decoding="async"` sur chaque `<img>`, avec `width`/`height` pour éviter le décalage de mise en page.
- Le Service Worker (`public/sw.js`) autorise explicitement `/lecons/img/*.webp` et met la réponse en cache **à la première ouverture** ; un test simule l’installation puis le passage hors ligne.
- `vite.config.ts` inclut désormais l’empreinte des WebP dans le hash de version (sans les précacher) : remplacer une image invalide l’ancien cache au build suivant.
- `BUDGET_COQUILLE` aligné à **2,25 Mio** dans `verifier-hors-ligne.mjs` et `verifier-deploiement.mjs`.

Mesure du build : **2,19 Mio** de coquille (`2 293 186 octets`), sous le plafond. Contenu sur demande : **4,19 Mio**. Le README n’a été mis à jour que sur cette ligne métrique (`2.18 → 2.19 Mio`) ; `relus : 0` et les autres compteurs restent inchangés.

## 6. Architecture Cloudflare R2

`urlIllustration(fichier)` centralise la résolution :

- défaut : `${import.meta.env.BASE_URL}lecons/img/<fichier>` ;
- option : `VITE_ILLUSTRATIONS_BASE_URL` (avec ou sans `/` final) + `<fichier>` ;
- validation stricte du nom de fichier (`^[a-zA-Z0-9._-]+\.webp$`) ;
- origine externe R2 non interceptée par le SW : le cache HTTP navigateur prend le relais, comme attendu pour un CDN.

`.env.example` documente la variable. Aucun composant ne connaît le chemin physique.

## 7. Validation

| Contrôle | Résultat |
|---|---|
| `node scripts/importer-images-lecons.mjs --unites=u6` | 9 OK, 23 FIX_TEXT refusés, 0 JPEG |
| `tsc -b` | OK |
| `npm run build` | OK, 351 modules, version `c081d0d1e595338e2400` |
| `npm run lint` | OK (`eslint .`) |
| `npm test` | **84 fichiers / 708 tests** + 5 tests Node, tous verts |
| `node scripts/verifier-hors-ligne.mjs` | OK, 0 problème, 0 échec HTTP, 9 WebP servis à la volée |
| `npm run verifier:deploiement` | OK, coquille 2,19 Mio / plafond 2,25 Mio |
| `npm run verifier:metriques` | OK, README à jour |
| `node scripts/sync-metrics.mjs --check` | OK |

Tests ajoutés sans créer de nouveau fichier : cache SW d’un WebP, `urlIllustration` (local + R2 + noms invalides), `legendeArSecurisee`, registre U6 (9 entrées, `reviewed: false`), accessibilité `axe` du composant.

## 8. Limites assumées

- Pilote limité à `u6` ; relancer avec `--unites=u6,u7,u8,u9,u11` étendra le registre.
- Le script sait télécharger depuis Drive avec `--download` + `GOOGLE_DRIVE_ACCESS_TOKEN`; le pilote a utilisé les copies locales vérifiées de `.cache/drive-images/` via `plans/_travail-images/index.tsv`.
- **Aucune suppression Drive**, **aucun commit**, **aucun push**. Les fichiers pré-existants modifiés avant cette mission ont été laissés tels quels ; seuls les fichiers listés ci-dessus ont été ajoutés ou édités pour la Phase 2.
- Phase 0 interdisait `src/` : la présente mission demandait explicitement `src/data/illustrationsLecons.ts`, le helper et l’affichage ; cette directive est donc remplacée pour ce périmètre uniquement. Les garde-fous `reviewed: false` et `a_valider_enseignant` restent, eux, intacts.
