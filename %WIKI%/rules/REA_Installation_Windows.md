---
title: "Validation REA+Craft Anything sur Windows"
description: "Règle : installation et test des outils REA/Craft Anything sur Windows — procédure standardisée"
status: "active"
tags: [rule, windows, reverse-engineering, tool-setup]
confidence: high
---

# Règle — Validation REA + Craft Anything sur Windows

## Lorsque
- Installation ou mise à jour d'outils REA, CRA, ou ERA pour le travail sur Windows
- Validation de la faisabilité d'un projet reverse engineering

## Procédure

### 1. Check environnement
```powershell
node --version      # 22+ requis
npm --version       # 12+
git --version
$GUIDRA_INSTALL_DIR # optionnel, pour l'analyse binaire
```

### 2. Vérifier REA (si installé)
```powershell
rea doctor       # sain: true (Node, host, Ghidra)
rea --version    # 6.7.0
```

### 3. Vérifier CRA (si installé)
```powershell
craft-anything-cli doctor   # healthy: true
& .\craft-anything.exe     # GUI lance, fenêtre ouverte
```

### 4. Test d'analyse (Electron app ou site)
```powershell
# REA
rea analyze-javascript-application <chemin> --json > result.json

# CRA
js_app_map --deep --input_path <chemin>
```

### 5. Vérifier les sorties attendues
- ✅ JSON structuré avec graph, nodes, observations
- ✅ Autorités d'évidence (artifact-bytes, ast-static-analysis, static-relationship-inference)
- ✅ Niveaux de confiance (exact, inferred, unknown)

## Conditions d'adoption
- Install succède avec code 0
- Commande connue s'exécute sur une cible réaliste
- Sortie structurée et correcte
- Résultats enregistrés dans le vault

## Cas particuliers
- **MSI Windows** : refuse si non-Admin (exit 1619) → utiliser portable ZIP
- **GUI interactive** : terminal ne pilote pas les clics, les tests manuels nécessitent le UI
- **ERA** : non validé Windows (macOS arm64 uniquement) → avoid

---

*Rule : 2026-11-13 | Décideur : @design-reviewer | confidence: high*
