# Décision et suivi des droits de contenus (ONEC / PDF / figures)

**Date d'ouverture :** 21 novembre 2026  
**Statut global :** ⏳ **En attente de validation juridique et éditoriale humaine** (ce document recense l'état factuel et les actions techniques réalisées ; il ne vaut pas autorisation juridique).

---

## 1. Inventaire et statut par catégorie de ressource

| Ressource | État dans le dépôt | Risque juridique | Décision / Action |
|---|---|---|---|
| `plans/sources/sujets/` (`dzexams-bac-sciences-*.pdf`, 81 Mo) | **Retiré du suivi Git** (Phase 1) et ignoré dans `.gitignore` | Élevé (PDF tiers compilés/watermarkés) | Ne jamais redistribuer dans le dépôt public ni dans l'APK. |
| `public/boussole/cahier-bac-2022.pdf` (703 Ko) et `memo.pdf` (288 Ko) | Présents dans `public/boussole/` (inventaire matériel SHA-256 vérifié) | Moyen à élevé tant que la provenance/droits ne sont pas signés | **Action humaine requise :** confirmer la paternité originale ou remplacer par des fiches HTML/Markdown originales et mettre à jour l'inventaire. |
| Figures extraites / adaptées du Bac 2022 (`modules/boussole/assets/bac-2022-*.png`, `trace-*.png`) | Présentes et inventoriées dans `plans/sources/INVENTAIRE-BOUSSOLE-2026-11-21.md` | À arbitrer | Obtenir un avis écrit sur les droits de reproduction d'extraits d'annales ONEC ou redessiner intégralement en SVG vectoriel original. |
| Annales texte & éléments de réponse 2013–2026 (`src/data/sujetsOfficiels.ts`, `src/data/corriges/`) | Reformulations/transcriptions avec citation officielle | Modéré (arbitrage antérieur A-009, non certifié juridiquement) | Citer systématiquement : « بكالوريا علوم تجريبية — الديوان الوطني للامتحانات والمسابقات، دورة YYYY ». Maintenir la traçabilité dans `plans/sources/REGISTRE.md`. |
| Contenus pédagogiques originaux (leçons synthétiques, drills, ateliers, enquêtes d'entraînement) | Créations originales du projet | Faible | Licence **CC BY-NC-SA 4.0** (code applicatif sous licence **MIT**, voir `LICENSE`). |

---

## 2. Protocole de relecture scientifique SVT (3AS)

Génération des dossiers lisibles en arabe RTL pour les enseignants (sans lire de TypeScript) :

```bash
node scripts/exporter-relecture-svt.mjs
```

### Priorisation par vagues

- **Vague 1 (prioritaire)** : 4 cas du laboratoire Boussole + 5 enquêtes `ExamBlanc` (`src/data/enquetesBac.ts`) + Unités U1 (Synthèse protéique), U2 (Structure-fonction), U3 (Activité enzymatique).
- **Vague 2** : Unités U4 (Immunologie) et U5 (Communication nerveuse).
- **Vague 3** : Unités U6 (Photosynthèse) et U7–U11 (Respiration/Fermentation & Géologie).

### Registre de signature (à compléter humainement)

| Lot / Unité | Relecteur (Nom / Fonction) | Date | Décision | Remarques |
|---|---|---|---|---|
| Labo Boussole (4 cas) | *À renseigner* | — | Non relu | — |
| Enquêtes ExamBlanc (5 cas) | *À renseigner* | — | Non relu | — |
| Vague 1 (U1–U3) | *À renseigner* | — | Non relu | — |
| Vague 2 (U4–U5) | *À renseigner* | — | Non relu | — |
| Vague 3 (U6–U11) | *À renseigner* | — | Non relu | — |
| Décision droits ONEC / PDF | *Responsable éditorial / juridique* | — | Non tranché | — |
