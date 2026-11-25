---
title: "KUNZ-EL-OULOUM-LITE — Analyse GLM 5.3"
description: "Analyse du projet Bousala al-Ouloum Lite (Android + Web) avec GLM 5.3 via APINEX"
status: "active"
tags: [analyse, projet, glm-5.3, apinex]
confidence: high
date: "2026-11-13"
---

# Analyse GLM 5.3 du projet KUNZ-EL-OULOUM-LITE

## Vue d'ensemble du projet

| Élément | Détail |
|---|---|
| **Nom du projet** | Bousala al-Ouloum Lite (بوصلة العلوم Lite) |
| **Version** | 0.9.2 |
| **Type** | React 19 + TypeScript + Vite |
| **Cible** | Android (Capacitor) + Web |
| **Description** | Application de révision de Science de la Vie et de la Terre — Baccalauréat Sciences Expérimentales (Algérie) |
| **Boutique** | Thuwar al-Karak |
| **Architecture** | OPUS 5.5 MAX — tous les états en localStorage (pas de serveur) |

---

## Architecture du projet

```
📦 KUNZ-EL-OULOUM-LITE-main/
├── 📂 android/                      # Application Android (Capacitor)
├── 📂 dist/                         # Build distribué
├── 📂 graphify-out/                 # Données graphifiées
├── 📂 node_modules/                 # Dependencies npm
├── 📂 public/
│   ├── 📂 lecons/                   # Résumés de leçons
│   ├── favicon.jpg / icon.svg / logo.png
│   ├── manifest.webmanifest / sw.js
│   └── index.html
├── 📂 scripts/                      # Scripts d'import/analyse
│   ├── analyser-drills.mjs
│   ├── importer-drills.mjs
│   ├── recolorer-svg.mjs
│   └── verifier-drills.mjs
├── 📂 src/
│   ├── 📂 components/               # Composants React
│   ├── 📂 data/
│   │   └── lessons.ts               # Données des leçons
│   ├── 📂 utils/                    # Utils métier
│   │   ├── dates.ts
│   │   ├── drills.ts
│   │   ├── melange.ts
│   │   ├── moteur.ts
│   │   ├── srs.ts
│   │   ├── stats.ts
│   │   ├── storage.ts
│   │   ├── sync.ts
│   │   ├── xp.ts
│   │   └── son.ts
│   ├── 📂 supabase/                 # Config Supabase
│   │   ├── schema.sql
│   │   ├── queries-admin.sql
│   │   └── APINEX_Bond_Config.md
│   ├── App.tsx                      # Point d'entrée
│   ├── types.ts                     # Types TypeScript
│   └── index.css                    # Styles
├── 📂 %WIKI%/                       # Documentation (vault KUNZ-EL-OULOUM)
│   ├── entities/                    # Entités: REA, Craft Anything
│   ├── concepts/                    # Concepts: reverse engineering
│   ├── comparisons/                 # Comparaisons
│   ├── queries/                     # Réponses substantielles
│   ├── episodes/                    # Résumés de sessions
│   ├── hand-loci/                   # Mapping spatial
│   ├── rules/                       # Règles apprises
│   ├── raw/                         # Sources
│   └── memory/                      # Journal de nuit
├── 📄 package.json                  # Dépendances
├── 📄 package-lock.json             # Lock
├── 📄 tsconfig*.json                # Config TypeScript
├── 📄 vite.config.ts                # Config Vite
├── 📄 README.md (4 lines)
└── README.md (764 lines)            # README détaillé
```

---

## Architecture technique

### Stack technique
| Élément | Technologie |
|---|---|
| Framework web | React 19.3 + TypeScript 7 |
| Build | Vite 8.3 + Tailwind CSS 4 |
| Mobile | Capacitor 8.6 |
| Base de données | localStorage (tous états en navigateur) |
| Backend | Supabase (configuré, usage optionnel) |
| Traduction | i18n (French/Arabic/English) |

### Gestion d'état
```typescript
// state.kafaa — cartes méthode
// state.progression — progression par leçon
// state.stats — statistiques
// state.xp —XP et niveaux
// state.revisionQueue — révision programmée
```

### Algorithme SM-2 (répetition espacée)
- **Échelle de qualité** : 0-5
- **Intervalle** : J+1 → J+3 → J+7 → J+14 → J+28
- **Rescan** : fragile → J+1, sinon J+3 après première réussite

---

## Contenu éducatif

### Structure du programme
| Domaine | ID | Unités | Poids BAC |
|---|---|---|---|
| Domaine 1 | d1 | 5 (u1-u5) | Forest |
| Domaine 2 | d2 | 3 (u6-u8) | Gold |
| Domaine 3 | d3 | 3 (u9-u11) | Clay |

**Total** : 3 domaines → 11 unités → 56 leçons + 2 prerequis = **58 leçons**

### Données par leçon
- `questionAr` : Question de la leçon
- `fenetre` : Période de l'année scolaire
- `poidsBac` : 1-5 (importance du BAC)
- `piegesAr` : 2 pièges types anti-erreur

---

## Caractéristiques techniques

### ✅ Points forts
1. **Architecture propre** : séparation claire entre composants, données et utils
2. **TypeScript** : typage fort, fichiers `.d.ts` generés pour les bibliothèques
3. **Mobile-ready** : Capacitor 8.6 pour Android, PWAs
4. **Logique métier centralisée** : utils/moteur.ts, srs.ts, xp.ts
5. **Archivage des tests** : tests_unitaries dans `test_decode.py`

### 🔧 Points d'amélioration identifiés
1. **package.json** : version 0.9.2 (pre-version early)
2. **Dependencies** : React 19.3 (très récent, vérifier compatibilité)
3. **Docs** : README uniquement 4 lignes (manquant un README détaillé)
4. **Assets** : fichier 13MB (ouverture.mp4) — vérifier tailles
5. **Supabase** : config présente mais non utilisée (all local)

---

## Recommandations

1. **Tester** l'application Android (`npx cap run android`)
2. **Vérifier** la compatibilité React 19.3
3. **Ajouter** un README détaillé
4. **Vérifier** les assets (13MB video)
5. **Tester** les deux interfaces (Web + Android)

---

*Défini par : GLM 5.3 via APINEX (2026-11-13) | Décideur : @design-reviewer*
