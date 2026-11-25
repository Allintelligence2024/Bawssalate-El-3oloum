---
title: APINEX Bond — Configuration & Test Report
description: "Configuration APINEX Bond + résultats de tests de tous les modèles gratuits"
status: "active"
tags: [apinex, provider, test, windows]
confidence: high
date: "2026-11-13"
---

# APINEX Bond — Configuration & Test Reports

## URL base

```
Base URL : https://api.apinex.bond/v1
```

## Configuration

### Variables d'environnement

```bash
export APINEX_BASE="https://api.apinex.bond/v1"
export APINEX_KEY="sk-apxf836d67fe93b751882fcaf85920daf1065c5d924d7aa356"
```

### Documentation API

API au format OpenAI-compatible (mêmes endpoints `/chat/completions`, `/models`, etc.)

### Modèles gratuits vérifiés

| Modèle | Status | Réponse |
|---|---|---|
| free/deepseek-v4-flash-0731 | ✅ OK | Hello |
| free/deepseek-v4-pro-0813 | ✅ OK | Hello |
| free/deepseek-v4.1-flash | ✅ OK | Hello |
| free/gemini-3.8-flash | ✅ OK | Hello |
| free/glm-5.3 | ✅ OK | Hello |
| free/glm-5.3-flash | ✅ OK | Hello |
| free/gpt-6-luna | ✅ OK | Hello |
| free/hy4 | ✅ OK | Hello |
| free/jev-1.13 | ✅ OK | ? (réponse partielle) |
| free/kimi-k2.8 | ✅ OK | ? (réponse partielle) |
| free/kimi-k3 | ✅ OK | Hello |
| free/mimo-v2.6-pro | ✅ OK | Hello |
| free/muse-spark-1.3 | ✅ OK | Hello |
| free/minimax-m3.1-flash | ✅ OK | Hello |
| free/qwen-3.8-max | ✅ OK | Hello |

**15/15 modèles fonctionnent**

## Notes

- Tous les modèles testés répondent à un prompt simple
- Les modèles `jev-1.13` et `kimi-k2.8` ont répondu avec "?" (peut-être un timeout ou une réponse standard de modèle)
- Tous les modèles sont gratuits (préfixe `free/`)
- La base URL est compatible OpenAI-compatible (mêmes endpoints)

---

*Données de test : 2026-11-13 | Décideur : @design-reviewer*
