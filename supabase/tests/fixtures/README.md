# Témoins de parité RLS

`parite-rls-2026-11-22.json` est un **export réel** de la base `kpjcgiwysmqysanqtfkj`,
collecté le 22/11/2026 par :

```sql
select json_build_object(
  'politiques', (select json_agg(json_build_object('nom', policyname, 'permissive', permissive, 'cmd', cmd))
                 from pg_policies where schemaname='public' and tablename='eleves'),
  'fonctions',  (select json_agg(json_build_object('nom', p.proname, 'args', pg_get_function_identity_arguments(p.oid)))
                 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname='public' and p.proname like 'eleves%'));
```

Il sert à rejouer `scripts/verifier-parite-rls.mjs` sans accès réseau, et à dater l'état
constaté. **Il ne remplace pas** une vérification sur la base cible : pour cela, utiliser
`SUPABASE_DB_URL`. Un témoin figé peut mentir sur aujourd'hui ; il ne ment jamais sur hier.
