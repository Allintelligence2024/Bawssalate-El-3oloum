---
title: "Hand Loci — Mapping spatial des événements"
description: "Cartographie spatiale des outils et événements clés de la rétro-ingénierie (REA, Craft Anything) sur Windows"
status: "active"
tags: [hand-loci, reverse-engineering, windows]
confidence: medium
---

# Hand Loci — REA + Craft Anything

## Localisation des outils et concepts

| Loci | Élément | Description |
|---|---|---|
| **réarmature-souche** | REA (morluto/rea) | Moteur de base, 455k étoiles, CLI + MCP, TypeScript |
| **navire-cra** | Craft Anything | Interface desktop, CLI, MCP, 320 outils, Rust 98.9% |
| **test-tube** | `rea-agents` (npm) | Package CLI pour l'analyse Electron, `analyze-javascript-application` |
| **fenêtre-invertible** | `js_app_map` (CRA CLI) | Analyse statique JS/Electron, mode Deep |
| **livre-mental** | `craft-anything-cli` | CLI portatif Windows, `doctor` = healthy:true |

## Références
- [[entities/REA]] — moteur de base (morluto/rea)
- [[entities/Craft_Anything]] — interface desktop complète (storytold)
- [[comparisons/REA_vs_CRAFT_ANYTHING]] — comparaison
- [[queries/How_to_Use_REA_and_CRA_on_Windows]] — guide d'installation Windows

---

*Hand Loci : 2026-11-13 | Décideur : @design-reviewer | confidence: medium*

## Déroulement de la session

### 1. Installation (ciel du bureau)
- Téléchargement MSI → refusé (non-admin)
- Téléchargement portable ZIP → extrait et lancé

### 2. Test CLI (bureau gauche)
- `craft-anything-cli doctor` → healthy:true
- `js_app_map --deep` → 4 fichiers, 2 IPC, 7 fonctions

### 3. Test REA (bureau droit)
- `rea doctor` → sain
- `rea analyze-javascript-application` → 632 fichiers

### 4. Desktop (fenêtre principale)
- `craft-anything.exe` lance, moteur + AI prêts

## Schéma de workflow

```
[Terminal] → rea-agents (bureau-gauche)
       ↓
[CRA CLI]   → js_app_map --deep (bureau-central)
       ↓
[Desktop]   → craft-anything.exe (fenêtre-mère)
       ↓
[Vault]     → /%WIKI%/entities, concepts, queries
```

---

*Hand Loci : 2026-11-13 | Décideur : @design-reviewer | confidence: medium*
