-- Uniquement pour une base PostgreSQL/PGlite jetable et vide.
create role anon;
create role authenticated;
create schema auth;
create table auth.users (id uuid primary key, email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
insert into auth.users values
  ('00000000-0000-4000-8000-000000000001', now()),
  ('00000000-0000-4000-8000-000000000002', now()),
  ('00000000-0000-4000-8000-000000000003', null);
