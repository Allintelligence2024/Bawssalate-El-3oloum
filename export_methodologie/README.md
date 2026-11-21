# وحدة « المنهجية » (Méthodologie SVT Bac Algérie)
*بوصلة العلوم · Bawssalate-El-3oloum*

Ce dossier regroupe l'intégralité du domaine et des modules de **méthodologie** de résolution d'exercices de Sciences de la Nature et de la Vie (SVT) pour le Baccalauréat algérien (série Sciences Expérimentales et Mathématiques).

---

## 📁 Structure des fichiers

### 1. `components/` (Composants React / Interface utilisateur)
- **`Methodologie.tsx`** : L'écran principal de la méthodologie.
  - Le laboratoire **البوصلة** (même origine). Inclure `components/Boussole.tsx` et copier `public/boussole/` depuis la racine du dépôt. La porte «تمارين المنهجية الأخرى» conserve les ateliers. L'aide de l'unité 1 mène à un exemple de protéines, sans donner la solution de l'exercice.
  - Les repères فعل ← دليل ← جواب ← فحص et des critères de relecture facultatifs sont dans le laboratoire, sans score automatique. Son carnet local et ses limites de confidentialité sont décrits dans `modules/boussole/README.md` ; l'intégration aux sauvegardes de l'app dépend aussi de `src/utils/carnetBoussole.ts`, `storage.ts` et `backup.ts`, non inclus dans cet export de composants.
  - Les 3 opérations scientifiques fondamentales (*أصف, أفسّر, أحكم*).
  - Le répertoire des verbes opératoires (*حلل, فسر, قارن, استنتج, استدل, صادق, ركب*).
  - 10 exercices interactifs sur l'Unité 1 avec schémas SVG interactifs (`SchemaUnite1`).
  - Module d'investigation documentaire (*استقصاء · وثيقتان* - gabarit des exercices 2 et 3 du Bac).
  - Boucle d'erreur sans divulgation prématurée et diagnostic guidé.
- **`SyntheseLibre.tsx`** : Module de rédaction libre au clavier pour l'Exercice 1 du Bac (texte scientifique argumenté avec problématique, développement et bilan).
- **`ChoixSynthese.tsx`** : Carte d'accès aux 11 situations de synthèse couvrant toutes les unités du programme.
- **`Mourchid.tsx`** : « المرشد الموسّع », arbre interactif de 25 questions/réponses méthodologiques.
- **`SchemaALegender.tsx`** : Entraînement au légendage de schémas fonctionnels clés par tap-to-tap.
- **`SujetsOfficiels.tsx`** : Module d'exploration des 30 sujets officiels du Bac (2013-2026), avec typage de chaque consigne par verbe opératoire et critères d'évaluation attendus.
- **`Communs.tsx`**, **`Icones.tsx`**, **`MascotteKunz.tsx`** : Composants graphiques et utilitaires d'interface partagés.

### 2. `data/` (Données et contenus pédagogiques)
- **`mourchid.ts`** : Les 25 fiches de conseils méthodologiques classées en 5 branches :
  1. *قبل الامتحان* (Organisation, gestion du stress).
  2. *قراءة الموضوع* (Choix du sujet, décodage des consignes).
  3. *الكتابة* (Formulation, justification scientifique).
  4. *الأخطاء الشائعة* (Pièges à éviter absolument).
  5. *أثناء الامتحان* (Gestion du temps sur 4 h 30).
- **`syntheses.ts`** : Énoncés, mots-clés obligatoires, pièges et modèles de correction pour les 11 unités.
- **`sujetsOfficiels.ts`** & **`sujets/`** : Base de données des 30 sujets du Bac SE (2013-2026), 90 exercices et 331 consignes décortiquées.
- **`sujetsCorriges.ts`** & **`corriges/`** : 313 éléments de réponse officiels ONEC reformulés avec grille de barème.
- **`schemas/`** : Schémas officiels à légender (cellule, synapse, chloroplaste, etc.).

### 3. `utils/` & `tests/`
- **`srs.ts`** : Moteur de répétition espacée (SM-2) pour les cartes de compétences méthodologiques (`CarteKafaa`).
- **`dates.ts`** : Utilitaires de dates en arabe sans chiffres indo-arabes et sans pourcentages anxiogènes.
- **`son.ts`** : Synthèse audio locale (sons de validation/erreur).
- **`types.ts`** : Définition des types TypeScript globaux.
- **`tests/`** : Suite de tests unitaires Vitest vérifiant la conformité des données et de l'algorithme.
