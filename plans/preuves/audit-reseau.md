# Audit réseau — aucune donnée d'un autre élève n'est lue par le client (P3.2)

Date : 16/11/2026 · Commit audité : voir `git log` (passe « P3.2 »).

## Méthode

Relecture exhaustive du code source client (`src/`, hors tests) et du service worker (`public/sw.js`) à la recherche de toute primitive réseau :

```
grep -rn "supabase\|\.from(\|\.select(\|\.rpc(\|fetch(\|XMLHttpRequest\|WebSocket" src --include=*.ts --include=*.tsx | grep -v "__tests__\|Array.from"
```

## Résultat

| Fichier | Ligne | Nature | Lit des données d'autrui ? |
|---|---|---|---|
| `src/utils/sync.ts` | 118 | `import('@supabase/supabase-js')` — chargement paresseux du client | non (import) |
| `src/utils/sync.ts` | 142 | `sb.from('eleves').upsert(...)` — **écriture** du snapshot de l'élève lui-même, après consentement daté | **non** — aucune lecture |
| `src/utils/sync.ts` | `supprimerSnapshotServeur` | `sb.from('eleves').delete().eq('email', …)` — **suppression** de sa propre ligne, à la demande explicite (écran « الخصوصية »), jeton exigé par la policy `suppression_app` | **non** — aucune lecture |
| `src/types.ts` | 109 | commentaire | — |
| `public/sw.js` | 50, 74, 122, 149, 165 | `fetch` des **assets statiques** de l'application (manifeste hors-ligne, cache) | non — pas d'API de données |

- **0** appel `.select()`, `.rpc()`, `fetch` vers une API de données (les deux seules opérations sont `upsert` et `delete` sur sa propre ligne), WebSocket ou `XMLHttpRequest` dans le client.
- Les défis hebdomadaires (`utils/defis.ts`), les badges, la revue croisée, les stats par unité et l'escalier adaptatif sont calculés **exclusivement** depuis `Etat` local. Aucun classement, aucune moyenne de groupe, aucune comparaison n'existe dans le code.
- Côté serveur, la politique RLS (`supabase/schema.sql`) n'autorise que l'upsert de sa propre ligne via le `jeton` ; aucune route de lecture n'est consommée par l'application.

## Comment refaire l'audit

1. Relancer la commande `grep` ci-dessus ; toute nouvelle occurrence hors `sync.ts`/`sw.js` doit être justifiée ici.
2. Sur appareil : onglet Réseau des DevTools (web) ou `chrome://inspect` (Android) — pendant une session complète (اليوم → تدريبات → أنا), les seules requêtes attendues sont les assets et, si le consentement est donné, un `POST/PATCH` vers `.../rest/v1/eleves`. Capture à joindre dans `plans/preuves/appareils.md`.
