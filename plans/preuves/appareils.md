# plans/preuves/appareils.md — mesures sur appareils bas de gamme (P3.4-1)

> **Statut : protocole déposé, mesures à faire.** Rien ici n'a été mesuré sur un vrai appareil ; les cases
> « mesure » sont vides à dessein. Tant qu'elles le restent, les Axes 3, 6 et 7 plafonnent à 8/10 au re-audit
> (plan §P3.4). Ne pas remplir avec des valeurs émulateur : l'émulateur n'a ni la RAM ni le stockage lent du terrain.

## Appareils cibles

| Appareil | RAM | Android | Stockage libre au test | WebView (version) | Qui / date |
|---|---|---|---|---|---|
| Redmi 9A | 2 Go | — | — | — | — |
| Samsung Galaxy A1x (A10/A12) | 2 Go | — | — | — | — |

Noter la version de WebView (Paramètres → Applications → Android System WebView) : les écarts de rendu arabe
et de performance viennent surtout de là.

## Protocole (par appareil, 2 passes : réseau coupé puis 3G simulée)

Préparation : installer l'AAB de la track fermée ; **premier lancement en ligne** jusqu'au message « جاهز للعمل دون اتصال »
(précache des 46 entrées du manifeste, cf. `hors-ligne.md`) ; puis **mode avion**.

| # | Tâche | Mesure | Cible | Redmi 9A | Galaxy A1x | Remarques |
|---|---|---|---|---|---|---|
| 1 | Cold start (app tuée, cache système vidé) → اليوم affiché | chronomètre, 3 essais, médiane | < 4 s | | | |
| 2 | Ouvrir une leçon HTML longue (ex. الوحدة 6 — التركيب الضوئي) | temps jusqu'au texte, défilement fluide ? | < 2 s, pas de saccade | | | |
| 3 | Drill de 10 items (domaine 2) | aucune latence perçue au tap | < 300 ms par tap | | | |
| 4 | Examen blanc chronométré, 20 min | chrono exact, pas d'ANR, pas de perte d'état après verrouillage écran | 0 ANR | | | |
| 5 | « بنية مواضيع البكالوريا » → 2017 → أظهر عناصر الإجابة | temps d'ouverture du chunk (498 kB) depuis le cache | < 2 s | | | |
| 6 | Mémoire : `adb shell dumpsys meminfo <package>` après 4 et 5 | PSS total | < 250 Mo | | | |
| 7 | Reprise après 3 jours sans ouverture (ou date système avancée) | écran « مراجعة اليوم » cohérent, aucune requête réseau requise | OK hors ligne | | | |
| 8 | Passe 3G simulée (Chrome DevTools remote ou throttling routeur) : premier lancement complet | durée du précache complet | < 90 s | | | |

ANR / crash : relever `adb logcat` sur la durée ; toute trace `ANR in` ou `FATAL EXCEPTION` = échec de la tâche.

## Résultat

- Verdict par appareil : *(à remplir)* ✅ / ❌ avec la tâche en échec.
- Correctifs déclenchés : *(à remplir ; référencer le commit)*.
- Captures : `plans/preuves/captures/appareils/` *(dossier à créer au dépôt des mesures)*.
