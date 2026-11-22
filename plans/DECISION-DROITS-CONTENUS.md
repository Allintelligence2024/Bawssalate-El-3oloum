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
| **Documents du sujet `2023-1`** (`src/data/figuresSujets.ts`, `src/components/FigureSujet.tsx`) | **Résolu — option « redessiner » appliquée (J2)** | **Faible** | **Aucune image ONEC reprise** : 7 figures recréées en SVG dans l'application, à partir des valeurs numériques citées par le corrigé modèle lui-même (7 % → 77 %, 100 % constant, 2000 vs 700 mm³, etc.). Pas de scan, pas de recadrage, pas de conversion depuis le PDF. Chaque figure affiche à l'écran qu'elle est une recréation. Les valeurs de mesure sont celles du corrigé ; la forme graphique est la nôtre. |
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

### Décision de méthode prise en J2 (figures des annales)

Plutôt que d'attendre un avis juridique sur la reproduction d'extraits, la voie « redessiner » de ce
document a été **exécutée** pour le sujet `2023-1` :

- 7 figures SVG originales, sans aucune ressource bitmap, dans `src/data/figuresSujets.ts` ;
- rendu par `src/components/FigureSujet.tsx` (aucune bibliothèque de graphiques ajoutée) ;
- chaque figure porte la mention « رسم أصلي أُعيد إنشاؤه لهذا التطبيق… ليس صورة مأخوذة من ورقة الامتحان » ;
- un test verrouille la cohérence : valeurs du dessin = valeurs du corrigé, et chaque consigne
  `surDocument` doit avoir une figure (voir `figuresSujets.test.ts`).

Cette voie reste à étendre aux autres sujets ; elle ne demande aucune autorisation puisqu'elle ne
reproduit rien.

### Registre de signature (à compléter humainement)

| Lot / Unité | Relecteur (Nom / Fonction) | Date | Décision | Remarques |
|---|---|---|---|---|
| Labo Boussole (4 cas) | *À renseigner* | — | Non relu | — |
| Enquêtes ExamBlanc (5 cas) | *À renseigner* | — | Non relu | — |
| Vague 1 (U1–U3) | *À renseigner* | — | Non relu | — |
| Vague 2 (U4–U5) | *À renseigner* | — | Non relu | — |
| Vague 3 (U6–U11) | *À renseigner* | — | Non relu | — |
| Décision droits ONEC / PDF | *Responsable éditorial / juridique* | — | Non tranché | — |
