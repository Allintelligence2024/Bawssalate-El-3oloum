# Hors-ligne — P0.7

> Deux niveaux de preuve. **Niveau 1 (automatisé, fait, rejoué le 18/11)** : tout ce que le
> service worker promet de mettre en cache existe réellement dans le build et est servi
> correctement. **Niveau 2 (appareil, à faire)** : protocole « mode avion » rejoué sur PWA
> Android et sur l'APK, avec captures. Tant que le niveau 2 n'est pas déposé, P0.7 n'est pas
> considéré comme acquis.

## 1. Vérification automatisée (18/11/2026, build `53d1377cc45ff7e56f82`)

Script répétable : `node scripts/verifier-hors-ligne.mjs` (après `npm run build`) —
démarrage de `vite preview`, contrôle statique HTML ↔ manifeste ↔ worker (mêmes règles que
`valideManifeste` et l'install de `sw.js`), puis **requête HTTP réelle sur chaque entrée**
avec contrôle du `Content-Type`. L'ancien script 16/11 lisait une constante `PRECACHE_STATIC`
qui n'existe plus : le worker a été réécrit (v5), le précache est maintenant décrit par
`dist/precache-manifest.json` (`{version, assets, statiques, octets}`).

| Mesure | Résultat (18/11) |
|---|---|
| Assets JS/CSS (`manifeste.assets`) | **43** — dont **4 au démarrage**, tous dans le manifeste — tous HTTP 200, `Content-Type` JavaScript/CSS |
| Entrées statiques (`manifeste.statiques`) | **29** (25 leçons HTML + icon.svg/manifest.webmanifest/mascotte/personnage) — toutes HTTP 200 |
| Fichiers interrogés (index + manifeste compris) | **75 — 0 échec HTTP/type** |
| Volume vu par HTTP | **6 197 401 octets** non compressés (manifeste déclaré : 6 190 520 + index + manifeste JSON) |
| Cohérence du build | **0 problème** : identifiant remplacé partout, meta `kunz-build-id` = version du worker, aucun `__KUNZ_BUILD_ID__` résiduel |
| Échecs | **0** — `cache.addAll`-equivalent (install du worker) ne peut pas échouer sur un 404 |

Sortie brute :

```
── vérification hors-ligne (niveau 1) ──
version du build      : 53d1377cc45ff7e56f82
assets JS/CSS         : 43 — 4 au démarrage, tous dans le manifeste
entrées statiques     : 29 (leçons HTML + icônes/manifeste)
fichiers interrogés   : 75 — 6197401 octets non compressés vus par HTTP
manifeste (déclaré)   : 6190520 octets non compressés
problèmes de cohérence: 0
échecs HTTP/type      : 0
RÉSULTAT : OK — tout le contenu annoncé par le worker est servi réellement par le build.
```

Pourquoi c'est important : l'install du worker est atomique (`sw.js:42-65`) — un seul 404,
un asset de démarrage hors manifeste ou un HTML de version incompatible, et le worker ne
s'installe pas du tout (le cache de version est alors supprimé). Le script rejoue ces mêmes
règles à chaque build.

### Stratégies codées dans `public/sw.js` (v5, 18/11)

| Type de requête | Stratégie | Comportement hors ligne |
|---|---|---|
| Navigation (`mode: navigate`, `/` et `/index.html`) | repli cache `index.html` de **la version courante**, sinon réseau | App shell servi depuis le cache |
| Chunks `/assets/*.js|css` | cache-first ; en ligne, mise en cache à la volée | **503 explicite** si jamais téléchargé (jamais de faux HTML) |
| Autres statiques (`/lecons/*.html`, images) | cache-first ; hors périmètre sinon | 503 explicite hors cache ; **jamais** de substitut index.html |
| Supabase (sync) | **pas intercepté** | échec silencieux (`console.warn`) ; aucune fonctionnalité élève ne dépend du réseau |
| Vidéo `/ouverture.mp4` | **hors précache** (trop lourd) | hors ligne : écran de repli (voir matrice) |

Détails de version : cache `kunz-hors-ligne-<identifiant>` (identifiant = hash des assets +
worker + HTML + statiques, `vite.config.ts:23-26`) ; **pas de `skipWaiting`** (les onglets de
l'ancienne version survivent jusqu'à leur fermeture) ; `activate` purge uniquement les
anciens caches `kunz-hors-ligne-*`/`murajih-svt-*` ; le téléchargement complet est **demandé
explicitement** (message `TELECHARGER_HORS_LIGNE`), **reprisable** (3 ouvriers, chaque
fichier vérifié avant mise en cache) et son état est **par version exacte**.

### Matrice fonctionnalité × réseau (niveau 1 : lecture du code ; niveau 2 : à confirmer)

| Fonctionnalité | En ligne | Hors ligne après téléchargement complet | Dépendance |
|---|---|---|---|
| Écran d'ouverture (vidéo) | ✅ | ⚠️ hors précache — repli | `/ouverture.mp4` non inclus (dit dans l'UI) |
| Inscription / session locale | ✅ | ✅ (compte local, hachage local) | `localStorage` |
| مساري, اليوم, Mindmap | ✅ | ✅ | chunk principal + `Mindmap-*` |
| Lecteur de leçon (HTML) | ✅ | ✅ | `/lecons/*.html` précachés |
| Drills (3 domaines) | ✅ | ✅ | `domaine1/2/3-*` dans le manifeste |
| Méthodologie, Synthèse libre, Examen blanc | ✅ | ✅ | chunks lazy dans le manifeste |
| Protocole / révision SRS / jalon d'unité | ✅ | ✅ | `lessonGoldSummaries-*`, `qcm-*` |
| Sauvegarde locale | ✅ | ✅ | `localStorage` |
| Sync Supabase (opt-in) | ✅ si consentement daté | ❌ (attendu) — reprise au prochain envoi en ligne | réseau |
| Contenu **non** téléchargé | ✅ | ❌ **échec explicite** (503 / « غير مكتمل : X من Y ») | — |
| Mise à jour de l'app | ✅ (nouveau SW après fermeture des anciens onglets ; purge des anciens caches) | — | réseau |

## 2. Protocole appareil (NIVEAU 2 — À FAIRE, non remplaçable par le niveau 1)

**Adapter au nouveau bouton (18/11) :** l'état et le téléchargement se pilotent depuis
« **أنا › العمل دون إنترنت** » — deux boutons : « **تنزيل / استكمال الملفات** » (action)
et « **تحقّق** » (relecture de l'état), avec une ligne d'état chiffrée
(« التنزيل غير مكتمل : N ملف من M غير موجود » / «الملفات المطلوبة لهذا الإصدار موجودة على الجهاز»).
L'état est **par version** : une nouvelle version = nouveaux manquants jusqu'à « تحقّق »
après téléchargement. Anciens protocoles : `plans/preuves/appareils.md`.

Appareils cibles : Redmi 9A (2 Go) et Samsung A1x. Pour chaque appareil, PWA Chrome **et** APK.

1. Installation (PWA : « Ajouter à l'écran d'accueil » ; APK : build Capacitor) ; ouvrir
   l'app **en ligne**, puis « أنا › العمل دون إنترنت » → « تنزيل / استكمال الملفات »
   jusqu'à l'état « **الملفات المطلوبة لهذا الإصدار موجودة على الجهاز** » (noter la durée
   et la taille annoncée en Mio).
2. Activer le **mode avion**. Fermer complètement l'app (balayer depuis les récents).
3. Rouvrir et parcourir : ouverture → inscription (nouveau compte) → مساري → ouvrir une
   leçon → 10 drills du domaine 1 → une session de révision → l'examen blanc → أنا.
4. Noter pour chaque étape : OK / écran blanc / message d'erreur ; capturer l'écran en cas
   d'échec. **Une leçon non téléchargée doit échouer explicitement**, pas afficher l'accueil.
5. Revenir sur « أنا › العمل دون إنترنت » en mode avion : « تحقّق » doit répondre sans
   réseau avec le décompte à 0 manquant.
6. Désactiver le mode avion, vérifier que la sync n'a envoyé quelque chose **que si**
   l'écran de consentement a reçu « نعم » (console réseau Chrome `chrome://inspect`).
7. Déposer ici : date, appareil, version Android, Chrome, résultats ligne par ligne,
   captures dans `plans/preuves/captures/`.

| Date | Appareil | Mode | Résultat | Par |
|---|---|---|---|---|
| — | — | — | **non rejoué** | — |

*18/11 : niveau 1 rejoué par `scripts/verifier-hors-ligne.mjs` sur le build `53d1377cc45ff7e56f82`
(75 fichiers, 0 échec). Le rejeu appareil (niveau 2) reste à faire.*
