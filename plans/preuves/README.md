# plans/preuves/ — artefacts de preuve

Un gain de note n'existe que s'il est démontrable ici (plan §1, « Principe de preuve »).

| Fichier | Tâche du plan | Contenu attendu |
|---|---|---|
| `ANALYSE-PR1.md` | — | Contre-audit du PR #1 (`feature/sujets-bac-et-ameliorations`) tâche par tâche |
| `GRILLE-BASELINE.md` | §0 / §9 | Grille 8 axes × critères (+/−) ayant produit **60,5/100** — **déposée** 16/11 (audit v0.9.3 `cab5100`) ; lecture critère par critère de l'état courant dans `ETAT-VS-BASELINE.md` |
| `ETAT-VS-BASELINE.md` | §9 | Chaque [Constat] de la baseline relu sur l'état courant : corrigé / partiel / inchangé, avec la commande de preuve — **sans nouvelle note** |
| `poids.md` | P0.3 / P3.6 | Taille du splash, du précache, du chunk principal, avant/après chaque sprint — **déposé** (16/11) |
| `hors-ligne.md` | P0.7 / P1-1 | Matrice fonctionnalité × réseau — **niveau 1 rejoué** 18/11 (`scripts/verifier-hors-ligne.mjs`, 75 fichiers, 0 échec) et **volet web du niveau 2 exécuté** sur Chrome 157 (coupure CDP + reload + leçon cache) ; **rejeu appareil (Redmi 9A / A1x, APK) à faire** |
| `appareils.md` | P3.4 | Mesures Redmi 9A / Samsung A1x — **protocole déposé 16/11, adapté au bouton « تنزيل / استكمال الملفات » et au worker v5 le 18/11 ; mesures à faire** (aucune valeur émulateur) |
| `confidentialite-serveur.md` | P-1.7 | Schéma RLS déployé sur le projet réel + DELETE prouvé (matrice S1-S10 dans l'audit P0.1) — **déposé** 18/11 |
| `suppression-durable.md` | P0.2 | Chaîne UI → réseau → serveur de la suppression : 6 tests + textes UI conformes, conservation vérifiée **non confirmée** — **déposé** 18/11 ; coordination serveur = humain |
| `sauvegarde-restauration.md` | P0.3 | Matrice de compatibilité (plats/enveloppés v1-v3), tests de panne (quota, JSON corrompu, écriture partielle), parcours d'assistance — **déposé** 18/11 ; **§5 : restauration atomique état+stats (journal d'engagement) prouvée le 20/11** (9 tests, 191/191) ; essais réels quota = humain |

Les registres éditoriaux (arbitrages, relecture signée) vivent dans `plans/relecture/` ; le registre
des sujets officiels (année, session, source, droits, intégrité) dans `plans/sources/REGISTRE.md`.
- `audit-reseau.md` — relecture des primitives réseau du client : 0 lecture de données d'autrui (P3.2).
