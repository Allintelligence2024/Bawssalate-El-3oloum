---
title: "Reverse Engineering — Concept"
description: "Grossissement inversé de logiciels fermés pour produire des spécifications ou reconstituer des fonctionnalités"
status: "active"
tags: [concept, architecture, methodology]
confidence: high
---

# Reverse Engineering (REA)

## Définition
La rétro-ingénierie est le processus d'analyse d'un logiciel fermé pour en comprendre le fonctionnement interne, en extrayant des spécifications, des structures de données, des algorithmes et des flux de contrôle, **sans copier le code source**.

## Principes clés
- **Interopérabilité** : comprendre des logiciels fermés pour créer des alternatives open-source ou des ponts de compatibilité
- **Clean room** : reconstruire à partir de l'observation externe (screenshots, comportement, API) sans lire le code source
- **Deep mode** : analyse approfondie avec lecture de binaire, décompilation, etc.
- **Evidence-based** : chaque conclusion doit être soutenue par des preuves vérifiables

## Niveaux d'analyse
| Niveau | Méthode | Usage |
|---|---|---|
| Statique | Analyse de bytecode, ASAR, binaire | Lecture sans exécution |
| Dynamique | Capture d'exécution, instrumentation | Trace du comportement |
| Sémantique | Décompilation, reconstruction de Flux | Compréhension du comportement |

## Applications récents (2026)
- Reconstruire des sites web, applications natives, jeux vidéo
- Décortiquer les applications IA payantes (51 000+ index)
- Recréer des suites bureautiques par nettoyage (WordCraft)
- Analyser les jeux par modding

## Références
- [[entities/REA]] — le moteur REA (morluto/rea)
- [[entities/Craft_Anything]] — le moteur desktop (storytold/craft-anything)
- [[comparisons/REA_vs_CRAFT_ANYTHING]] — comparaison des outils
- [[queries/How_to_Use_REA_and_CRA_on_Windows]] — guide d'installation Windows

## Composants d'analyse concrets
| Composant | Outil | Résultat |
|---|---|---|
| JS/Electron | `js_app_map`, `rea-agents` | graphe de modules, IPC, exports |
| Binaire PE/ELF | Ghidra, Hopper, Rizin | pseudocode, symboles |
| .NET | JADX, ILSpy | code C# décompilé |
| Web | CDP, Playwright | scripts, API, réseau |

---

*Concept : 2026-11-13 | Décideur : @design-reviewer | confidence: high*
