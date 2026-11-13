---
title: "Clean Room Mode — Mode corps propre"
description: "Mode de rétro-ingénierie sans lire le code source — uniquement l'observation externe"
status: "active"
tags: [concept, methodology, security]
confidence: medium
---

# Clean Room Mode

## Principe
Le mode Clean Room est la contrainte de Craft Anything qui **interdit la lecture du code source** (fichiers, binaires, page source) et **limite l'analyse aux éléments observables** : screenshots, texte visible, layout mesuré, menus, interfaces.

## Règles
- ✅ **Autorisé** : screenshots, DOM, CSS mesuré, menus interactifs, API réseau, comportement
- ❌ **Interdit** : lecture de code source, fichier binaire, page source HTML
- ❌ **Interdit** : l'exécution du binaire pour extraire des données (sauf avec `runtime` mode)

## Limites
- **Pas un sandbox OS** : ne sépare pas le disque ou les processus
- **Dépend de l'agent** : un agent mal configuré peut contourner la contrainte
- **Utile pour la propriété** : idéal pour les projets où vous ne possédez pas le code source

## Références
- [[entities/Craft_Anything]] — l'interface desktop avec mode Clean Room
- [[entities/REA]] — moteur de base (REA)
- [[queries/How_to_Use_REA_and_CRA_on_Windows]] — guide d'installation Windows

## Activation
- Interface : **Settings → Deep Mode** (toggle)
- CLI : `craft-anything-cli settings_set deep_mode true`
- Exécution : `craft-anything-cli --deep` ou `--clean-room`

## Comparaison
| Critère | Clean Room | Deep |
|---|---|---|
| Lecture code | ❌ | ✅ |
| Binaire | ❌ | ✅ (avec Ghidra) |
| Screenshots | ✅ | ✅ |
| Comportement | ✅ | ✅ |
| Reports | 📖 Policy publique | 🔍 Interne |

---

*Concept : 2026-11-13 | Décideur : @design-reviewer | confidence: medium*
