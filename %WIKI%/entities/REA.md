---
title: "REA — Reverse Engineer Anything"
description: "Moteur MCP pour la rétro-ingénierie logicielle (455k étoiles, TypeScript)"
status: "active"
tags: [tool, reverse-engineering, mcp, windows]
confidence: high
---

# REA

## Vue d'ensemble
- **Nom** : REA (Reverse Engineer Anything)
- **Propriétaire** : morluto
- **Stars** : 455 000
- **Forks** : 111 000
- **Stack** : TypeScript
- **Licence** : MIT
- **Site** : https://rea.tools
- **Dépôt** : https://github.com/morluto/rea

## Fonctionnement
REA est un toolkit MCP qui connecte les agents IA aux moteurs de rétro-ingénierie :
- Mémoire : `[[tools/Ghidra]]`, `[[tools/Hopper]]`, `[[tools/IDA]]`, `[[tools/JADX]]`
- Analyse JS/Electron : AST, imports, exports, IPC
- Binaires natifs : désassemblage, décompilation (PE, ELF, Mach-O)
- Accès web : exploration de pages, traces réseau

## Cibles d'analyse
- Applications JavaScript / Electron
- Binaires natifs (PE, ELF, Mach-O)
- Assemblies .NET
- Applications Android (via JADX)

## Version installée
- **Version** : 6.7.0
- **Installation** : `npm install --global rea-agents`
- **Plateforme** : Windows (win32 x64), Node.js 22.23.2

## État de validation
- `rea doctor` : ✅ sain (Node, host, Ghidra)
- Analyse Electron : ✅ 632 fichiers analysés
- Moteurs indisponibles : Hopper, IDA, JADX (connexion optionnelle)

## Références
- [[entities/Craft_Anything]]
- [[concepts/Clean_Room_Mode]]
- [[queries/How_to_Use_REA_on_Windows]]

---

*Version : 1.0 | Date : 2026-11-13 | Décideur : @design-reviewer*
