-- Base PostgreSQL/PGlite jetable : rôles et schéma `auth` minimaux pour le cycle 02.
-- Idempotent (jonction possible après `schema.sql` + `01-eleves-generation.sql`
-- dans le job CI, qui crée déjà le rôle `anon`) : jamais de « already exists ».
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email_confirmed_at timestamptz);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
insert into auth.users values
  ('00000000-0000-4000-8000-000000000001', now()),
  ('00000000-0000-4000-8000-000000000002', now()),
  ('00000000-0000-4000-8000-000000000003', null)
on conflict (id) do nothing;
