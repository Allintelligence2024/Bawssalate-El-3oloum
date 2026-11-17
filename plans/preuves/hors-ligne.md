# Hors-ligne — P0.7

> Deux niveaux de preuve. **Niveau 1 (automatisé, fait)** : tout ce que le service worker promet de
> mettre en cache existe réellement dans le build et est servi correctement. **Niveau 2 (appareil, à faire)** :
> protocole « mode avion » rejoué sur PWA Android et sur l'APK, avec captures. Tant que le niveau 2 n'est pas
> déposé, P0.7 n'est pas considéré comme acquis.

## 1. Vérification automatisée (16/11/2026, build du commit courant)

Script : démarrage de `vite preview`, lecture de `PRECACHE_STATIC` dans `public/sw.js` et de
`dist/precache-manifest.json`, requête HTTP sur chaque entrée.

| Mesure | Résultat |
|---|---|
| Entrées statiques (`PRECACHE_STATIC`) | 32 — toutes HTTP 200 |
| Chunks JS/CSS du manifeste | 27 — tous HTTP 200, `Content-Type` JavaScript (plus jamais un `index.html` servi à la place d'un chunk) |
| Taille totale à précacher | **6,6 Mo** (dont `ouverture.mp4` 1,65 Mo, 30 leçons HTML, 27 chunks) |
| Échecs | **0** — donc `cache.addAll()` ne peut pas échouer à l'installation pour cause de 404 |

Pourquoi c'est important : `cache.addAll` est atomique ; un seul 404 dans la liste et le SW ne s'installe pas
du tout (c'était un risque réel avec les anciens chemins de PDF). Le build vérifie désormais la liste à chaque
`npm run build` via le manifeste généré.

### Stratégies codées dans `public/sw.js` (v4)

| Type de requête | Stratégie | Comportement hors ligne |
|---|---|---|
| Navigation (`mode: navigate`) | network-first, repli cache `index.html` | App shell servi depuis le cache |
| Chunks `/assets/*.js|css` | cache-first ; en ligne, complément du précache depuis le manifeste à chaque navigation | 503 explicite si un chunk n'a jamais été téléchargé (jamais de faux HTML) |
| Autres statiques (`/lecons/*.html`, images, mp4) | cache-first | Servis depuis le cache |
| Supabase (sync) | pas intercepté | Échec silencieux, `console.warn` ; aucune fonctionnalité élève ne dépend du réseau |

### Matrice fonctionnalité × réseau (lecture du code, à confirmer au niveau 2)

| Fonctionnalité | En ligne | Hors ligne après 1re visite complète | Dépendance |
|---|---|---|---|
| Écran d'ouverture (vidéo) | ✅ | ✅ (mp4 précaché) | `/ouverture.mp4` |
| Inscription / session locale | ✅ | ✅ (compte local, hachage local) | `localStorage` |
| مساري, اليوم, Mindmap | ✅ | ✅ | chunk principal + `Mindmap-*` |
| Lecteur de leçon (HTML) | ✅ | ✅ | `/lecons/*.html` précachés |
| Drills (3 domaines) | ✅ | ✅ | `domaine1/2/3-*` précachés depuis le manifeste |
| Méthodologie, Synthèse libre, Examen blanc | ✅ | ✅ | chunks lazy précachés |
| Protocole / révision SRS / jalon d'unité | ✅ | ✅ | `lessonGoldSummaries-*`, `qcm-*` précachés |
| Sauvegarde locale | ✅ | ✅ | `localStorage` |
| Sync Supabase (opt-in) | ✅ si consentement daté | ❌ (attendu) — reprise au prochain envoi en ligne | réseau |
| Mise à jour de l'app | ✅ (nouveau SW, purge `murajih-svt-v3`) | — | réseau |

## 2. Protocole appareil (NIVEAU 2 — À FAIRE, non remplaçable par le niveau 1)

Appareils cibles : Redmi 9A (2 Go) et Samsung A1x. Pour chaque appareil, PWA Chrome **et** APK.

1. Installation (PWA : « Ajouter à l'écran d'accueil » ; APK : build Capacitor) ; ouvrir l'app, attendre 30 s
   en ligne (temps du précache en tâche de fond).
2. Activer le **mode avion**. Fermer complètement l'app (balayer depuis les récents).
3. Rouvrir et parcourir : ouverture → inscription (nouveau compte) → مساري → ouvrir une leçon → 10 drills
   du domaine 1 → une session de révision → l'examen blanc → أنا.
4. Noter pour chaque étape : OK / écran blanc / message d'erreur ; capturer l'écran en cas d'échec.
5. Désactiver le mode avion, vérifier que la sync n'a envoyé quelque chose **que si** l'écran de consentement
   a reçu « نعم » (console réseau Chrome `chrome://inspect`).
6. Déposer ici : date, appareil, version Android, Chrome, résultats ligne par ligne, captures dans
   `plans/preuves/captures/`.

| Date | Appareil | Mode | Résultat | Par |
|---|---|---|---|---|
| — | — | — | **non rejoué** | — |

*16/11 (14e passe) : `precache-manifest.json` généré au build liste désormais **42 assets** ; les nouveaux chunks à la demande (`niveau3`, `Mourchid`, `glossaire`, `SchemaALegender`, `ChoixSynthese`) y figurent automatiquement — vérifié par lecture du manifeste après `npm run build`. Les schémas P1.6 sont du SVG inline (aucune image réseau). Le rejeu appareil reste à faire.*
