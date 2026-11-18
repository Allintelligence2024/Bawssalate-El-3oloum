# Preuve P-1.6 — le consentement prouvé appel réseau par appel réseau

> **Date :** 17/11/2026 · **Fichier :** `src/utils/__tests__/sync.test.ts`, bloc
> « sync — preuve réseau (P-1.6 : client simulé, appel par appel) » — 7 tests nouveaux.
> **Principe :** jusqu'ici la garantie « aucun envoi sans consentement explicite » était
> codée (`sync.ts:131` : porte sur `consentementExplicite`) mais **jamais prouvée par un
> client réseau simulé**. Désormais le client Supabase est **mocké** (`vi.mock('@supabase/supabase-js')`)
> et chaque scénario compte les appels `upsert` / `createClient` — 0 appel est un résultat mesuré,
> pas une déduction.

## Les 7 scénarios mesurés

| # | Scénario | Requêtes mesurées |
|---|---|---|
| a | `consentementSync: false` + date de décision | **0 upsert** |
| b | `consentementSync: undefined` (état migré, aucun choix) | **0 upsert** |
| c | `true` **sans** `consentementSyncDecideLe` (installation v0.9.3) | **0 upsert** — un « true » hérité sans date ne vaut pas consentement |
| d | `true` + date | **exactement 1 upsert** ; payload porte `email` + `jeton`, `onConflict: 'email'` ; **aucune trace de `motDePasse` ni du hachage** dans le JSON ; client créé 1× avec `x-kunz-jeton` et les clés d'environnement |
| e | ré-envoi d'un état **identique** | **0 nouvelle requête** (déduplication `dernierEnvoye`) ; état modifié → **exactement 1** nouvelle |
| f | **révocation** (`true` → `false`) | plus aucun envoi ensuite (0 requête de plus) |
| g | `supprimerSnapshotServeur` avec compte + jeton | DELETE → **`'supprime'`** ; le cache d'envoi est vidé (re-consentement possible ensuite) |

## Conditions d'exécution reproduites localement

```bash
npm test   # 129 tests / 22 fichiers, tous verts (17/11/2026)
```

## Observations honnêtes déposées en même temps

1. **La déduplication `dernierEnvoye` est fragile en production** : le snapshot contient `maj`
   (horodatage ISO à chaque construction), donc deux états strictement identiques donnent deux
   JSON différents — le cache ne frappe que dans la même milliseconde. Le test (e) a dû **figer
   l'horloge** (`vi.setSystemTime`) pour prouver le comportement voulu. Le vrai garde-fou de
   production reste l'anti-rebond de 6 s dans `App.tsx`. **À corriger plus tard** : hasher le
   payload sans le champ `maj`, ou arrondir `maj` à la minute.
2. `navigator.onLine` était `false` dans l'environnement de test — les tests simulent
   `navigator: { onLine: true }` ; en production réel, l'envoi hors-ligne est bien court-circuité
   (comportement voulu, non testé ici pour rester honnête sur ce qui est prouvé).

## Reste due (P-1.7)

La **policy DELETE sur l'instance Supabase déployée** n'est pas vérifiable depuis le dépôt :
elle exige l'accès au projet (console/CLI). Résultats attendus dans
`plans/preuves/confidentialite-serveur.md` dès l'exécution possible.
