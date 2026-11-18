# Preuve P-1.7 — schéma de confidentialité déployé sur le projet Supabase réel

> **Date :** 18/11/2026 · **Projet :** `kpjcgiwysmqysanqtfkj` (Supabase, free tier)
> **Voie :** MCP Supabase authentifié par OAuth (`opencode mcp auth supabase`), migrations appliquées
> par `apply_migration`, lectures par `execute_sql` — **aucune chaîne de connexion ni jeton
> d'accès n'a été demandé, affiché ni stocké dans le dépôt**.
> Le plan P-1.7 exige : le schéma (`supabase/schema.sql`) appliqué sur un projet réel + la policy
> DELETE prouvée en conditions réelles.

## 1. Ce qui a été appliqué

Deux migrations DDL (noms en snake_case, visibles dans `list_migrations` du projet) :

| Migration | Contenu |
|---|---|
| `init_eleves_et_rls` | `create table if not exists public.eleves` (25 colonnes) · 3 index (`eleves_maj_idx`, `eleves_xp_idx`, `eleves_wilaya_idx`) · `alter table … enable row level security` · `add column if not exists jeton` · policies `ecriture_app` (INSERT), `maj_app` (UPDATE), `suppression_app` (DELETE) |
| `ajouter_lecture_proprietaire` | Policy `lecture_proprietaire` (SELECT) — **correctif découvert par le test lui-même**, voir §3 et A-019 |

**État lu en direct après application** (`pg_policies`, `pg_class`, `pg_indexes`) :

```
ecriture_app          INSERT   {anon}
lecture_proprietaire  SELECT   {anon}
maj_app               UPDATE   {anon}
suppression_app       DELETE   {anon}

relrowsecurity (eleves) = true
index: eleves_maj_idx · eleves_pkey · eleves_wilaya_idx · eleves_xp_idx
```

## 2. Méthode du test comportemental

Exécuté **en direct sur la base réelle** via `execute_sql`, entièrement dans une transaction
`begin; … rollback;` (rolée en arrière) avec une ligne fictive `__p17_test__@exemple.local`
(`jeton = 'jeton-test-p17'`). Aucune donnée réelle n'a jamais été créée, modifiée ou supprimée ;
la table est vide avant et après (`select count(*) → 0`).

Simulation du client : `set role anon` + `set local request.headers = '{…}'` (l'en-tête
`x-kunz-jeton` que l'app envoie via `global: { headers: { 'x-kunz-jeton': jeton } }`, `sync.ts:121`),
suppression comptée par CTE : `with d as (delete … returning 1) select count(*) from d`.

## 3. Ce que le test a révélé — défaut du schéma d'origine (A-019)

Avec le schéma tel qu'écrit (aucune policy SELECT — « القراءة مرفوضة تلقائيًّا ») :

| Tentative (anon) | Lignes supprimées |
|---|---|
| Bon jeton | **0** ← échec silencieux |
| Policy DELETE temporairement `using (true)` | **0** ← preuve que ce n'est pas l'expression du jeton |

**Cause (diagnostiquée sur le projet réel) :** avec RLS activé, `anon` ne voit **aucune** ligne
sans policy SELECT ; la policy DELETE ne peut agir que sur des lignes **visibles**. Le DELETE de
l'application (`sync.ts:195`, « الخصوصية ») aurait donc **toujours échoué en silence** sur le
serveur réel. Ajouter une policy SELECT (même permissive) rend la ligne visible et le DELETE
fonctionne — confirmé par un test en transaction roulée.

**Correctif appliqué** (migration `ajouter_lecture_proprietaire`, répercuté dans
`supabase/schema.sql`, tracé A-019) :

```sql
create policy "lecture_proprietaire" on public.eleves
  for select to anon
  using (
    jeton is not null
    and jeton = coalesce(current_setting('request.headers', true)::json ->> 'x-kunz-jeton', '')
  );
```

La confidentialité est préservée : l'élève ne lit **que sa propre ligne**, et seulement en
envoyant son jeton secret ; une ligne sans jeton reste invisible/inmodifiable/inamovible.

## 4. Matrice finale (policy DELETE réelle, après correctif)

| Cas (rôle `anon`, en-tête `x-kunz-jeton`) | Attendu | Obtenu |
|---|---|---|
| Sans en-tête (`{}`) | 0 | **0** ✅ |
| Mauvais jeton (`autre`) | 0 | **0** ✅ |
| Bon jeton (`jeton-test-p17`) | 1 | **1** ✅ |

Sortie brute du lot final (matrice en dernier statement, transaction roulée en arrière) :

```
[{"cas":"bon_jeton","n":1},{"cas":"mauvais_jeton","n":0},{"cas":"sans_jeton","n":0}]
```

Après le test : `select count(*) from public.eleves` → **0** (aucune ligne résiduelle).

## 5. Garanties

- **Test non destructif :** chaque exécution de test est dans `begin; … rollback;` avec une ligne
  fictive ; les rares lots partiellement commités (erreurs de syntaxe de mon côté) ont été
  nettoyés et revérifiés (`count = 0`).
- **Jetons :** aucun secret d'accès (chaîne de connexion, access token) n'a été demandé ni stocké ;
  l'authentification MCP OAuth a été faite par l'utilisateur dans son navigateur
  (`opencode mcp auth supabase`), les credentials vivent hors du dépôt
  (`~/.local/share/opencode/mcp-auth.json`).
- **Le jeton de test `jeton-test-p17` n'existe plus** : sa ligne a été supprimée (cas « bon
  jeton » + purge finale), transaction roulée en arrière.
- Le schéma du dépôt (`supabase/schema.sql`) est aligné sur l'état réel du serveur (4 policies,
  RLS activé).

## 6. Références

- `plans/relecture/REGISTRE-ARBITRAGES.md` — A-019 (policy SELECT, correctif de déploiement)
- `src/utils/sync.ts:184-195` — la fonction appautrice du client (delete avec jeton)
- `supabase/schema.sql` — schéma source de vérité (mis à jour)
