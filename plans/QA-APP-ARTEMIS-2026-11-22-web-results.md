# Artemis Extended — Web (http://localhost:3000) — 2026-11-23

## Résumé
- ✅ Web : page chargée sur http://localhost:3000 — http://localhost:3000/
- ✅ Web : aucune erreur console pendant le chargement
- ❌ Web : aucune erreur réseau — http://localhost:3000/src/components/CarteDefi.tsx (net::ERR_ABORTED) | http://localhost:3000/node_modules/.vite/deps/react-dom-BrnCUvp0.js?v=d478abe2 (net::ERR_ABORTED) | http://localhost:3000/node_modules/.vite/deps/@noble_hashes_sha256.js?v=d478abe2 (net::ERR_ABORTED)
- ✅ Web : écran de démarrage visible (splash) — اضغط للمتابعة
- ✅ Web : bouton ابدأ cliqué (si présent) — cliqué
- ❌ Web : écran consultatif sync visible — aucun consultatif détecté
- ✅ Inscription : bouton principal trouvé — أنشئ الحساب ←
- ❌ Onglet اليوم : bouton visible — 4 boutons dans le DOM
- ❌ Onglet مساري : bouton visible — 4 boutons dans le DOM
- ❌ Onglet البوصلة : bouton visible — 4 boutons dans le DOM
- ❌ Onglet تدريبات : bouton visible — 4 boutons dans le DOM
- ❌ Onglet أنا : bouton visible — 4 boutons dans le DOM
- ❌ Web : TOTAL boutons cliqués (5 onglets) — 0 clics
- ✅ QCM : clics sur options effectués — 4 clics (feedback après: oui)
- ✅ QCM : aucune erreur console
- ❌ Exam blanc : bouton trouvé — (introuvable)
- ❌ Hors-ligne : page chargée sans réseau (cache/SW) — échec — PWA ouvert ?

## Erreurs console
- (aucune)

## Erreurs réseau
- http://localhost:3000/src/components/CarteDefi.tsx (net::ERR_ABORTED)
- http://localhost:3000/node_modules/.vite/deps/react-dom-BrnCUvp0.js?v=d478abe2 (net::ERR_ABORTED)
- http://localhost:3000/node_modules/.vite/deps/@noble_hashes_sha256.js?v=d478abe2 (net::ERR_ABORTED)
- http://localhost:3000/src/data/drills/axes.ts (net::ERR_ABORTED)
- http://localhost:3000/src/utils/drills.ts (net::ERR_ABORTED)
- http://localhost:3000/src/utils/adaptatif.ts (net::ERR_ABORTED)
- http://localhost:3000/src/components/Communs.tsx (net::ERR_ABORTED)
- http://localhost:3000/src/utils/son.ts (net::ERR_ABORTED)
- http://localhost:3000/src/data/wilayas.ts (net::ERR_ABORTED)
- http://localhost:3000/ (net::ERR_INTERNET_DISCONNECTED)

## Captures d’écran (web)
(voir le dossier plans/screenshots/)

## Session Playwright

```
chromium headless (electron-free playwright), viewport 1440x900, bases: http://localhost:3000/
```