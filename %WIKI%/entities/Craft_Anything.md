---
title: "Craft Anything — Moteur de reconstruction"
description: "Moteur Rust pur pour la rétro-ingénierie et la reconstruction de logiciels fermés (30.3k étoiles)"
status: "active"
tags: [tool, reverse-engineering, rust, windows, desktop]
confidence: high
---

# Craft Anything

## Vue d'ensemble
- **Nom** : Craft Anything
- **Propriétaire** : ArtCraft Team (storytold)
- **Stars** : 30 300
- **Forks** : 6 200
- **Stack** : Rust pur (98.9%)
- **Licence** : MIT ou Apache-2.0
- **Site** : https://getartcraft.com/
- **Dépôt** : https://github.com/storytold/craft-anything

## Architecture
Craft Anything est un moteur unique propulsant trois sorties :
- **Desktop app** (egui) — interface graphique simple et avancée
- **CLI** (`craft-anything-cli`) — ligne de commande
- **MCP server** — serveur pour les agents IA

## Moteur
- **320 outils** (300 moteur + 20 couches AI/setup)
- Support : programs natifs, .NET, Java, Android, Apple, Electron/JavaScript, sites web, firmware, captures réseau, bases de données, fichiers de jeu

## Workflow
1. **Study** : inspecter l'original (pages, code, fichiers, exécution)
2. **Build** : agent de codage recrée le projet
3. **Check** : comparer le résultat avec l'original
4. **Ready** : ouvrir, jouer, prévisualiser, ou modifier

## Modes
- **Clean room** (défaut) : ne lit que ce qui est visible (screenshots, texte, layout, menus). Refuse les lectures de code/intérieurs.
- **Deep** : utilise tous les outils, lecture complète (code, fichiers), avec Ghidra si installé.

## Plateformes
- Windows (x64, ARM64, x86) — MSI et portable ZIP
- macOS (universal)
- Linux (AppImage, Deb, RPM, Tarball)
- FreeBSD
- Web (WebAssembly)

## Versions
- **v0.6.1** (12 nov 2026) — earliest alpha
- **Statut** : early alpha
- **CLI** : `craft-anything-cli 0.6.1`

## Installation sur Windows
```powershell
# Portable (sans admin) — recommandé pour le test
curl -LO "https://github.com/storytold/craft-anything/releases/download/v0.6.1/craft-anything-0.6.1-windows-x64-portable.zip"
Expand-Archive -Path craft-anything-0.6.1-windows-x64-portable.zip -DestinationPath craft-anything-portable

# MSI (exige admin)
msiexec /i craft-anything-0.6.1-windows-x64.msi /quiet /norestart
```

## Tests effectués
- **CLI** : `doctor` = `healthy: true` ✅
- **Analysis Electron** : `js_app_map --deep` = 4 fichiers, 2 IPC channels, 1 fenêtre, 7 fonctions ✅
- **Desktop app** : l'interface s'ouvre, moteur + AI prêts ✅

## Références
- [[entities/REA]]
- [[concepts/Reverse_Engineering]]
- [[concepts/Clean_Room_Mode]]

---

*Version : 1.0 | Date : 2026-11-13 | Décideur : @design-reviewer*
