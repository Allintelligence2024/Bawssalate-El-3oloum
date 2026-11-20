# مسار « مساري » (Mon Parcours SVT Bac Algérie)
*بوصلة العلوم · Bawssalate-El-3oloum*

Ce dossier regroupe l'intégralité du domaine et des modules de **cours, assimilation et progression séquentielle** de Sciences de la Nature et de la Vie (SVT) pour le Baccalauréat algérien.

---

## 📁 Structure des fichiers

### 1. `components/` (Composants React / Interface utilisateur)
- **`Masari.tsx`** : L'écran principal du chemin d'apprentissage.
  - Affichage séquentiel des 3 domaines, 11 unités et 56 leçons.
  - Verrouillage automatique : aucune leçon avancée n'est accessible avant la validation de la précédente.
  - Indicateurs de priorité selon le poids officiel au Bac.
- **`ProtocoleRunner.tsx`** : Le moteur d'assimilation active en 6 étapes (séance de 46 minutes) :
  1. *سؤال الدرس والقراءة الكاملة* : Question directrice + lecture intégrale (8 min).
  2. *التقاط الأنماط* : Mots-clés et vocabulaire (3 min).
  3. *أول استرجاع بعد القراءة* : Premier rappel actif immédiat (5 min).
  4. *هيكل الدرس* : Enchaînement des étapes causales (5 min).
  5. *قراءة الأدلة* : Confrontation aux preuves documentaires (15 min).
  6. *الترسية وإنتاج الجواب* : Phrase-type Bac et identification de l'erreur nucléaire (10 min).
  - Passerelle immédiate vers la méthodologie à la fin de chaque leçon.
- **`LecteurLecon.tsx`** : Lecteur plein écran pour la consultation interactive des cours complets en HTML.
- **`JalonUnite.tsx`** : Le « pont » de fin d'unité (*جسر الوحدة*) qui valide l'ensemble des leçons d'une unité avant d'ouvrir la suivante (QCM de synthèse + confrontation aux deux pièges officiels).
- **`Mindmap.tsx`** : Carte conceptuelle interactive des 3 domaines et 11 unités.
- **`SessionRevision.tsx`** : Moteur de révision quotidienne personnalisée (SM-2 / Leitner).
- **`Atelier*.tsx`** : Ateliers interactifs spécifiques (Immunité, Structure de la Terre, Orogenèse, etc.).

### 2. `data/` (Contenus scientifiques officiels)
- **`programme.ts`** : Architecture officielle du programme :
  - **Domaine 1** : *التخصص الوظيفي للبروتينات* (Unités 1 à 5).
  - **Domaine 2** : *التحولات الطاقوية* (Unités 6 à 8).
  - **Domaine 3** : *التكتونية العامة والجيولوجيا* (Unités 9 à 11).
  - Constante `CHEMIN` reliant les 58 items ordonnés.
- **`protocole.ts`** : Définition formelle des 6 phases, objectifs, instructions et consignes de déverrouillage.
- **`lessonGoldSummaries.ts`** : Les 58 Résumés d'Or complets (questions directrices, missions, vocabulaire bilingue, chaînes causales, phrases-types et pièges fréquents).
- **`priorites.ts`** : Coefficient et pondération de chaque leçon par rapport aux annales de Bac.
- **`qcmLecons.ts`** : Banques de QCM diagnostiques par chapitre.
- **`lecons/`** : L'ensemble des 23 cours complets au format HTML moderne, enrichis de diagrammes et d'exemples.

### 3. `utils/` & `tests/`
- **`moteur.ts`** : Moteur décisionnel de l'application (*Next Best Action*, calcul de `itemFait`, `itemVerrouille`, `prochainItem`, détection de la leçon la plus fragile).
- **`srs.ts`** : Algorithme de répétition espacée SM-2 pour l'ancrage mémoriel à long terme.
- **`qcm.ts`** : Moteur d'évaluation des questions à choix multiples.
- **`dates.ts`** : Calculs de calendrier scolaire algérien et délais de révision.
- **`accents.ts`** : Charte chromatique officielle (Forest, Gold, Clay).
- **`types.ts`** : Schémas de données TypeScript de l'application.
- **`tests/`** : Tests unitaires Vitest couvrant le moteur, le protocole, le calcul des dates et le verrouillage séquentiel.
