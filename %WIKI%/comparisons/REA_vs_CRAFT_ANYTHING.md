---
title: "CRA vs REA vs ERA"
description: "Comparaison des outils de rétro-ingénierie pour Windows"
status: "active"
tags: [comparison, tool, windows]
confidence: high
---

# Comparaison REA vs CRA vs ERA

## Vue d'ensemble

| Critère | **REA** (morluto/rea) | **CRA** (storytold/craft-anything) | **ERA** (dav1dngy/era-agent) |
|---|---|---|---|
| **Stars** | 455k | 30,3k | 50 |
| **Stack** | TypeScript | Rust (98.9%) | JavaScript (95%) |
| **Sorties** | CLI + MCP | CLI + SDK + MCP | CLI + Studio web |
| **Desktop app** | ❌ | ✅ (egui) | ✅ (v0.2.0) |
| **MCP server** | ✅ (207 tools) | ✅ (320 tools) | ✅ (170 tools) |
| **Plateforme** | Windows, macOS, Linux | Windows, macOS, Linux, FreeBSD | macOS arm64 (validé) |
| **Support Windows** | ✅ (npm global) | ✅ (MSI, portable) | ❌ non validé |
| **Analyse JS/Electron** | ✅ | ✅ | ❌ (via REA) |
| **Analyse binaire** | ✅ + Ghidra | ✅ + Ghidra | ✅ + Ghidra |
| **Statut** | Production-ready | Early alpha v0.6.1 | v0.2.0 (beta) |

## Références
- [[entities/REA]] — moteur de base (TypeScript, 455k étoiles)
- [[entities/Craft_Anything]] — interface desktop complète (Rust, 30.3k étoiles)
- [[raw/REA_Analysis_Sources_2026-11-13]] — sources et publications

## Notes spécifiques
- **REA** est le choix par défaut pour l'analyse JS/Electron (CLI lightweight)
- **CRA** est le choix pour l'interface desktop et la reconstruction
- **ERA** n'est pas validé sur Windows (macOS arm64 uniquement)
| **Licence** | MIT | MIT + Apache-2.0 | MIT |

## Forces et faiblesses

### REA
- ✅ **Force** : 455k étoiles, MCPstandardisé, analyse JS/Electron natifs
- ✅ **Force** : CLI lightweight, installation rapide (`npm install --global rea-agents`)
- ❌ **Faiblesse** : pas d'interface graphique complète
- ❌ **Faiblesse** : dépend des moteurs tiers (Ghidra, Hopper, JADX)

### CRA
- ✅ **Force** : interface desktop complet, workflow Study→Build→Check→Ready
- ✅ **Force** : reconstruction multiplateforme, clean room/implicite
- ❌ **Faiblesse** : early alpha (v0.6.1), certaines analyses partielles
- ❌ **Faiblesse** : dépend d'agents de codage (Claude Code validé, Codex non)

### ERA
- ✅ **Force** : studio complet, lab d'amélioration auto, multi-agent
- ✅ **Force** : benchs mesurés, validation documentée
- ❌ **Faiblesse** : **non validé sur Windows** (macOS arm64 seulement)
- ❌ **Faiblesse** : 50 étoiles, projet niche

## Recommandation

- **Pour Windows** : REA + CRA est le chemin recommandé
- **Pour analyse JS/Electron** : REA `js_app_map` est le plus rapide
- **Pour desktop complet** : CRA app
- **Pour ERA** : attendre la validation Windows (ou l'utiliser sur macOS)

---

*Comparaison : 2026-11-13 | Décideur : @design-reviewer | confidence: high*
