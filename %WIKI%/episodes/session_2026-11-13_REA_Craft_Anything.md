---
title: "Session 2026-11-13 — REA + Craft Anything Windows"
description: "Session d'analyse des outils REA/Craft Anything, test CLI et desktop, plan d'implémentation"
status: "active"
tags: [session, reverse-engineering, windows, plan]
confidence: high
---

# Session 2026-11-13

## Contexte
Analyse de 5 publications X et 5 dépôts GitHub sur la rétro-ingénierie logicielle (REA, Craft Anything, ERA, REA Electron, index IA). Plan d'implémentation pour Windows + tests mesurés.

## Ce qui a été fait

### 1. Analyse des sources
- 5 publications X récupérées et analysées
- 5 dépôts GitHub évalués
- Tableau comparatif établi

### 2. Environnement Windows
- Node.js v22.23.2, npm 12.0.2, Git 2.53.0
- Ghidra 12.1.4 installé

### 3. Test REA
- Installation `rea-agents` global : v6.7.0
- `rea doctor` : ✅ sain (Node, host win32 x64, Ghidra)
- Analyse Electron : 632 fichiers, 2 523 observations

### 4. Installation Craft Anything
- Portable ZIP extrait et fonctionnel
- CLI `craft-anything-cli 0.6.1` : `healthy: true`
- Desktop app lance et ouvre la fenêtre

### 5. Tests mesurés
| Test | Résultat |
|---|---|
| `js_app_map --deep` Electron | 4 fichiers, 2 IPC, 1 fenêtre, 7 fonctions |
| `rea analyze-javascript-application` | 632 fichiers analysés |
| `craft-anything-cli doctor` | healthy:true |

## Résultats clés
- ✅ Craft Anything et REA fonctionnent sur Windows (portable + CLI)
- ✅ MSI Windows refuse (nécessite admin) → portable recommandé
- ✅ GUI interactive non testable depuis terminal

## Prochaines actions
1. Testez l'interface GUI manuellement (navigation site web, étapes Study→Build→Check→Ready)
2. Analyse de fichiers natifs (.exe/.dll) avec Ghidra
3. Enregistrer les résultats dans le vault

## Décisions
- **Outil principal** : REA + Craft Anything
- **Installation** : portable ZIP (pas d'admin requis)
- **Validation** : CLI + desktop launch

## Références
- [[entities/REA]] — moteur de base
- [[entities/Craft_Anything]] — interface desktop complète
- [[comparisons/REA_vs_CRAFT_ANYTHING]] — comparaison
- [[rules/REA_Installation_Windows]] — procédure d'installation

---

*Session : 2026-11-13 | Décideur : @design-reviewer | confidence: high*
