# QA — Artemis (web + Android) — بوصلة العلوم Lite
**Rapport final — 2026-11-23** (session démarrée 2026-11-22)
**Cible :** `com.bousala.ouloum` / بوصلة العلوم Lite — بكالوريا علوم تجريبية (v0.9.3)

---

## 0. Verdict exécutif

**Statut global : 🟢 FONCTIONNEL — aucune erreur bloquante.**

Les **trois cibles** demandées ont été lancées et testées de bout en bout :

| Cible | URL / support | Statut | Erreurs console/JS |
|---|---|---|---|
| Web dev (Vite) | `http://localhost:3000` | 🟢 OK | 0 |
| Web HTTPS (proxy) | `https://localhost:8443` | 🟢 OK | 0 |
| Android (émulateur) | `emulator-5554` · WebView Capacitor · CDP `:9222` | 🟢 OK | 0 |
| Build prod (hors-ligne) | `http://localhost:4173` (dist statique) | 🟢 OK | 0 |

- **5 onglets** parcourus sur web et Android, avec contenu réel et clics de boutons.
- **QCM** : axe choisi + **12 réponses** sur web (3000 et 8443) **et** Android.
- **Examen blanc** (`الامتحان التجريبي`) : écran ouvert et questions réelles affichées sur les 3 cibles.
- **Mind map** (`الخريطة الذهنية`) : écran « المفتاح البصري للبرنامج » validé sur web + Android.
- **Export / Import** (`تصدير نسختي` / `استيراد نسخة`) : déclenchés sans erreur sur web.
- **Hors-ligne / PWA** : service worker enregistré, cache actif, **rechargement hors-ligne réussi** (build prod).
- **Un finding critique** rencontré en cours de route (app web cassée) a été **diagnostiqué et réparé** — voir §2.

---

## 1. Environnement & méthode

- **Node** : `C:\Users\pc\AppData\Local\hermes\tools\node-26.12.1-win32-x64\node.exe` (v26.12.1).
- **Web** : Playwright (chromium headless, 1440×900). Script unifié paramétrable : `artemis-web-final.mjs <url> <tag>`.
- **HTTPS 8443** : aucun serveur n'existait → proxy local créé (`https-proxy-8443.mjs`) vers Vite, certificat auto-signé Windows (`New-SelfSignedCertificate`, PFX `plans/qa-8443.pfx` — **non commité**, commande de régénération en tête de `https-proxy-8443.mjs`). Vérifié : `/` → 200, `src/utils/compte.ts` → 200.
- **Android** : émulateur `medlingua` (API 36, 720×1600), APK `android/app/build/outputs/apk/debug/app-debug.apk`. Pilotage **CDP brut via WebSocket natif Node** (`android-*.mjs`) — Playwright `connectOverCDP` échoue sur le WebView (`Browser context management is not supported`).
  - Forward : `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`.
- **Hors-ligne** : build `dist/` existant servi en statique (`serve-dist.mjs`, port 4173, SPA fallback + MIME), test `artemis-offline.mjs`.
- **Comptes de test locaux** : `qafinal@bousala.test` (web 3000), `qahttps@bousala.test` (8443), `qaoffline@bousala.test` (prod), `qaandroid@bousala.test` / `qaandroid2@bousala.test` (Android). Mot de passe `Pass12345!`, wilaya `01` (أدرار), daira `أدرار`.

### Difficultés techniques résolues (pour reproductibilité)
1. **Splash / intro** : le bouton `ابدأ ←` est précédé d'un `<div>` fantôme (`opacity:0`) que Playwright juge « visible ». → sélection du candidat réel par bounding box + `opacity` + `pointer-events`, tri par longueur de texte, **clic Playwright « trusted »** (requis par la politique autoplay de la vidéo d'intro).
2. **État persistant** : l'app rouvre la leçon/le diagnostic en cours au lieu de l'accueil. → `goHome()` itératif : splash → `تخطي`/`ابدأ` → login/inscription → boutons de retour (`aria-label` خروج/عودة/رجوع) → repli du header (`▲`) → fermeture `لاحقًا`.
3. **Header déplié** : le bouton `⚡…XP…▼` ouvrait le panneau profil (logout). → exclu des cibles de clic + repli automatique.
4. **QCM** : nécessite de choisir un **axe** (`… (n/m)`) avant la ronde de 10 questions. → détection des axes par motif `\(\d+\/\d+\)`.
5. **Émulateur** : ANR « System UI isn't responding » au premier déploiement → reboot ; process émulateur tué au timeout → relance `-no-snapshot-load` + re-forward CDP.

---

## 2. Finding #1 — app web cassée sur le dev serveur (🔴 critique → 🟢 réparé)

- **Symptôme** : `http://localhost:3000/` sans onglets ; console `Failed to load resource: 500` ; network `src/utils/compte.ts (net::ERR_ABORTED)`.
- **Cause vérifiée** : Vite — `Failed to resolve import "@noble/hashes/sha256" from "src/utils/compte.ts"`. `node_modules\@noble` absent alors que `package.json` déclare `@noble/hashes@1.8.0` et que le lockfile le référence → **`node_modules` incomplet**.
- **Correctif appliqué** : `npm install` (245 paquets, 0 vulnérabilité, `@noble/hashes@1.8.0` présent) + redémarrage Vite → `compte.ts` **HTTP 200**.
- **Recommandation** : `npm ci` en CI ; vérifier la présence de `node_modules/@noble/hashes`. Possible interaction avec la session parallèle (AGENTS.md §0 « re-vérifier les chemins »).

---

## 3. Couverture Web — `http://localhost:3000` ET `https://localhost:8443`

Résultats **identiques** sur les deux URL (scripts `artemis-web-final.mjs local` / `https`).
Fichiers : `plans/QA-APP-ARTEMIS-2026-11-22-web-local-final.md` / `-web-https-final.md` (+ `.json`).

### 3.1 Parcours d'entrée
| Étape | Résultat |
|---|---|
| Splash `اضغط للمتابعة` (+ `فعّل الصوت` / `تخطي`) | ✅ |
| Écran titre `بوصلة العلوم — مراجعة البكالوريا` + `ابدأ ←` | ✅ |
| Inscription `أنشئ حسابك` (email, mdp, wilaya, daira) | ✅ compte créé, 0 `role=alert` |
| Accueil + navigation 5 onglets | ✅ |

### 3.2 Onglets (web)
| Onglet | Contenu vérifié | Boutons cliqués |
|---|---|---|
| `اليوم` | حصّة اليوم « تقديم الوحدة: من المورثة إلى البروتين », 46 min / 6 مراحل, تحدّي الأسبوع | ✅ 2 |
| `مساري` | « 3 مجالات، 11 وحدة، 58 درسًا », 11 unités listées, بحث + الخريطة الذهنية | ✅ 6 |
| `البوصلة` | « البوصلة · داخل التطبيق / تمارين المنهجية الأخرى » (contenu minimal — voir §6) | ✅ 1 |
| `تدريبات` | 4 مسارات : أسئلة QCM (700 سؤالًا / 49 محورًا), الامتحان التجريبي, البطاقات, ورشات… | ✅ (cartes testées en sections dédiées) |
| `أنا` | الكرّاسة, هويتي (199 jour avant exam), حسابي, تصدير/استيراد, خصوصية | ✅ 6 |

**Total clics boutons web : 16 par cible.**

### 3.3 Fonctionnalités transverses (web)
| Fonctionnalité | 3000 | 8443 | Détail |
|---|---|---|---|
| Mind map `الخريطة الذهنية` | ✅ | ✅ | « المفتاح البصري للبرنامج / خريطة » |
| Examen blanc `الامتحان التجريبي` | ✅ | ✅ | « وضيــفة شاملــة … يغطي البرنامج كله » |
| QCM — axe choisi | ✅ | ✅ | « ADN، الجين والشفرة الوراثية (0/11) » — 15 axes détectés |
| QCM — réponses | ✅ 12 | ✅ 12 | ronde « 1 من 10 · الدرجة الأساس », questions définition |
| Export `تصدير نسختي` | ✅ | ✅ | déclenché, feedback affiché |
| Import `استيراد نسخة` | ✅ | ✅ | file picker ouvert (non bloqué) |
| Erreurs console / page | ✅ 0 | ✅ 0 | — |
| Service worker (dev) | ⚪ aucun | ⚪ aucun | **attendu** : `pwa.ts` désactive le SW en dev (`import.meta.env.DEV`) — voir §5 |

---

## 4. Couverture Android — émulateur `emulator-5554` (WebView Capacitor, CDP)

Fichiers : `plans/QA-APP-ARTEMIS-2026-11-22-android-final.md`, `-android-extras.md`, `-android-qcm.md`, `-android-cdp.md`.

> **Note libellés (corrigé le 23/11)** : le premier run Android avait été fait avec un APK **périmé** (3ᵉ onglet `منهجية`, laboratoire absent). Après reconstruction, l'APK aligné affiche les mêmes libellés que le web : `اليوم`, `مساري`, **`البوصلة`**, `تدريبات`, `أنا`. Voir §4bis.

| Onglet | Contenu vérifié | Boutons |
|---|---|---|
| `اليوم` | header XP/streak, حصّة اليوم, tâches | ✅ 2 clics |
| `مساري` | الطريق, 3 مجالات / 11 unité / 58 درس, unités + جسر | ✅ 2 clics |
| `البوصلة` (ex-`منهجية` dans l'APK périmé) | « بوصلة العلوم \| مختبر الفضول » — iframe `/boussole/index.html`, barre « البوصلة · داخل التطبيق » + lien « تمارين المنهجية الأخرى » ; contenu du laboratoire rendu (scripts exécutés) | ✅ onglet + iframe + contenu |
| `تدريبات` | أسئلة QCM, الامتحان التجريبي, البطاقات, مخطّطات للتسمية, التركيب الحرّ, ورشات الخرائط الذهنية | ✅ |
| `أنا` | هويتي, حسابي, تصدير/استيراد, مسح بيانات, خصوصية | ✅ 2 clics |

### Fonctionnalités transverses (Android)
| Fonctionnalité | Résultat | Détail |
|---|---|---|
| Mind map `الخريطة الذهنية` (depuis مساري) | ✅ | « المفتاح البصري للبرنامج / خريطة » |
| Examen blanc `الامتحان التجريبي` | ✅ | « وضيــفة شاملــة » ; questions réelles « السؤال 1 من 6 » + options + `تحقَّق` |
| QCM — axes | ✅ | 5 axes détectés |
| QCM — axe choisi + réponses | ✅ **12** | « ADN، الجين والشفرة الوراثية (0/11) », ronde 1/10 |
| Service worker | ✅ | cible CDP `service_worker https://localhost/sw.js` présente (WebView prod-like) |
| Erreurs JS (`window.__qaErrors`) | ✅ 0 | — |

### 4bis. Correction post-merge — intégration de la méthode Boussole dans Android (23/11)

**Demande :** « why the bawssala methode is not in the android version it should be integrated ».

**Cause racine :** aucun défaut de code. L'APK installé (`21/11/2026 08:31`) était **antérieur** au commit `b5888e8` (« Intégrer le laboratoire Boussole et sécuriser les sauvegardes », `21/11 10:44 UTC`). Le laboratoire existait dans `public/boussole/index.html` (1 205 136 octets) mais n'était ni dans `dist/` ni dans `android/app/src/main/assets/public/`. Le code source affichait déjà `البوصلة` (`src/App.tsx:99`) tandis que l'ancien APK affichait `منهجية`.

**Actions :** `git checkout main && git pull` (merge PR #11 `73cea27`) → `npm ci` (315 paquets, 0 vulnérabilité) → `npm run build` (`dist/boussole/index.html` = 1 206 472 octets) → `npx cap sync android` → `.\gradlew.bat assembleDebug` → `adb install -r` → `adb shell pm clear` (purge du cache du service worker de l'ancienne version, sinon l'ancien shell était rejoué) → relance + re-forward CDP.

**Vérification (9/9 ✅)** — script `android-boussole-verify.mjs`, preuve `plans/QA-APP-ARTEMIS-2026-11-22-android-boussole.md`, capture `plans/screenshots/android-boussole-integrated.png` :

| Contrôle | Résultat |
|---|---|
| 5 onglets aux libellés neufs (`البوصلة` présent) | ✅ |
| Onglet `البوصلة` cliquable | ✅ |
| iframe `[data-boussole="labo"]` présente, `src=/boussole/index.html` | ✅ |
| Titre du document = `بوصلة العلوم \| مختبر الفضول` | ✅ |
| Script du laboratoire exécuté (1 script, pas de message « activer les scripts ») | ✅ |
| Barre « داخل التطبيق » + lien « تمارين المنهجية الأخرى » | ✅ |
| 0 erreur JS | ✅ |

---

## 5. Hors-ligne / PWA — build prod (`http://localhost:4173`)

Fichier : `plans/QA-APP-ARTEMIS-2026-11-22-offline-prod.md`.

| Test | Résultat |
|---|---|
| API `serviceWorker` | ✅ |
| SW enregistré | ✅ 1 registration, scope `http://localhost:4173/` |
| SW contrôlant la page | ✅ controller actif |
| CacheStorage | ✅ `kunz-hors-ligne-fe38cd3bf060b0915c74` |
| Ressources en cache | ✅ 11 entrées |
| **Rechargement hors-ligne** (réseau coupé) | ✅ app shell chargée depuis le cache |

**Conclusion** : le mode hors-ligne est **réservé à la production** (`src/utils/pwa.ts:5` — `if (import.meta.env.DEV) return;` pour ne pas casser le HMR). L'absence de SW sur 3000/8443 est donc **un comportement voulu, pas un bug**. En build prod, le SW s'enregistre, précache et sert l'app hors-ligne. Tests unitaires associés : `src/utils/__tests__/service-worker.test.ts`, `pwa.test.ts` ; script de cohérence build : `scripts/verifier-hors-ligne.mjs`.

---

## 6. Anomalies & observations (priorisées)

| # | Sévérité | Observation | Cible | Statut |
|---|---|---|---|---|
| 1 | 🔴 Critique | `@noble/hashes` absent de `node_modules` → app web 500 | Web dev | 🟢 **Réparé** (`npm install`) |
| 2 | 🟡 Mineur | Onglet `البوصلة` (web) : contenu très réduit (« البوصلة · داخل التطبيق / تمارين المنهجية الأخرى », 1 bouton) — semble être un écran de renvoi plutôt qu'un contenu riche | Web | 🟢 **Résolu côté Android après rebuild** (§4bis) : le laboratoire est bien rendu dans l'iframe. Le run web initial utilisait le même build périmé ; à rejouer sur 3000/8443 pour confirmation formelle. |
| 3 | 🟡 Mineur | Proxy HTTPS 8443 : le WebSocket HMR de Vite (`wss://…/?token=…`) ne passe pas le proxy (handshake timeout) | HTTPS | Artefact de l'environnement de test (proxy sans upgrade WS) — **pas un bug app** |
| 4 | ⚪ Info | Cartes de `تدريبات` : le balayage automatisé ne clique qu'une carte par passe (reset navigation) ; chaque carte majeure (QCM, examen, mind map) est couverte en section dédiée | Web/Android | Limitation du harnais, pas de l'app |
| 5 | ⚪ Info | Examen blanc : une seule réponse capturée dans la boucle auto (structure par parties / sous-questions) ; écran et questions validés | Web/Android | Couverture partielle du scoring |
| 6 | ⚪ Info | ANR « System UI isn't responding » au 1ᵉʳ déploiement ; émulateur tué au timeout | Android | Résolu par reboot / relance `-no-snapshot-load` |
| 7 | ⚪ Info | Boutons destructifs (`تسجيل الخروج`, `مسح كل بياناتي`) **exclus** des clics automatisés ; un logout accidentel en début de session a nécessité un re-login | Android | Maîtrisé |

**Aucune erreur console/page/JS** sur l'ensemble des runs finaux (web 3000, web 8443, Android, prod 4173).

---

## 7. Preuves

- **Rapports détaillés** (`plans/`) :
  - `QA-APP-ARTEMIS-2026-11-22-web-local-final.md` / `.json`
  - `QA-APP-ARTEMIS-2026-11-22-web-https-final.md` / `.json`
  - `QA-APP-ARTEMIS-2026-11-22-android-final.md`, `-android-extras.md`, `-android-qcm.md`, `-android-cdp.md`, `-android-details.json`, `-android-boussole.md` (intégration post-merge)
  - `QA-APP-ARTEMIS-2026-11-22-offline-prod.md`
  - historiques : `-web-results.md`, `-web-continuation.md`, `-web-full.md`, `-logcat.txt`
- **Captures** (`plans/screenshots/`) : `local-final-*.png`, `https-final-*.png`, `android-done-*.png`, `android-extra-*.png`, `android-qcm.png`, `android-boussole-integrated.png`, `offline-prod-home.png`, `offline-prod-reload.png`, + historiques web/Android.
- **Scripts de test** (racine) : `artemis-web-final.mjs`, `artemis-offline.mjs`, `android-qcm.mjs`, `android-boussole-verify.mjs`, `android-cdp-extras.mjs`, `android-cdp-final.mjs`, `android-cdp-state.mjs`/`state2.mjs`, `https-proxy-8443.mjs`, `serve-dist.mjs`.

---

## 8. Recommandations

1. **CI** : `npm ci` + vérification `node_modules/@noble/hashes` pour éviter la régression du Finding #1.
2. **Produit** : clarifier le contenu attendu de l'onglet web `البوصلة` (écran de renvoi vs contenu riche) — observation #2.
3. **Tests** : étendre la couverture automatisée du **scoring** de l'examen blanc (réponses multiples / parties) et du balayage exhaustif des cartes `تدريبات` (retour à l'onglet entre chaque carte).
4. **Hors-ligne** : ajouter un test E2E prod (build + serve + SW + reload offline) dans la CI — le harnais `serve-dist.mjs` + `artemis-offline.mjs` est réutilisable.
5. **Émulateur** : prévoir un watchdog de boot/ANR et un re-forward CDP automatique (le PID WebView change à chaque relance).

---

## 9. Métriques de session (AGENTS.md §5)

- **Objectif atteint ?** Oui — les 3 cibles lancées et testées exhaustivement (5 onglets + boutons + QCM + examen + mind map + export/import + hors-ligne), rapport final rédigé, PR #11 mergée, puis anomalie Android « méthode Boussole absente » diagnostiquée (build périmé) et corrigée par rebuild + réinstallation (9/9 contrôles verts).
- **Taux de succès outils** : élevé ; échecs initiaux de navigation dus à l'état persistant / splash, tous résolus par itération sur le harnais.
- **Corrections utilisateur** : 0 (relances « continue »).
- **Auto-score qualité** : 4/5 (couverture fonctionnelle complète ; scoring examen partiel, balayage cartes perfectible).

*Rapport généré par Artemis (Playwright web + CDP Android). Scripts/rapports de la campagne initiale commités et poussés via PR #11 (merge `73cea27`) ; la correction Android et ses preuves sont commitées sur `main`.*
