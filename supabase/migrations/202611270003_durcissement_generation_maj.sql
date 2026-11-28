-- 2026-11-27 0003 — Durcissement P0 (Temps 1) : fermeture du fail-open sur `generation`,
-- horodatage `maj` imposé côté serveur et durcissement de l'entropie du jeton.

begin;

alter table public.eleves
  add column if not exists generation bigint not null default 1;

alter table public.eleves
  drop constraint if exists eleves_generation_positive;
alter table public.eleves
  add constraint eleves_generation_positive check (generation >= 1);

create index if not exists eleves_generation_idx on public.eleves (generation desc);

-- Supprime l'ancienne signature fail-open à un argument.
drop function if exists public.eleves_generation_a_jour(jsonb);

create or replace function public.eleves_generation_a_jour(generation_actuelle bigint, charge_utile jsonb)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select coalesce(
    generation_actuelle is not null
    and generation_actuelle >= 1
    and charge_utile is not null
    and (charge_utile ->> 'temoin_generation') ~ '^[1-9][0-9]*$'
    and (charge_utile ->> 'temoin_generation')::bigint = generation_actuelle,
    false
  );
$$;

create or replace function public.eleves_avant_insertion_fn()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.generation := 1;
  new.maj := now();
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

create or replace function public.eleves_generation_suivante()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' then
    if not public.eleves_generation_a_jour(old.generation, new.charge_utile) then
      raise exception using errcode = '40001', message = 'Génération périmée ou témoin absent';
    end if;
    new.generation := old.generation + 1;
    new.maj := now();
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists eleves_avant_insertion on public.eleves;
create trigger eleves_avant_insertion
  before insert on public.eleves
  for each row execute function public.eleves_avant_insertion_fn();

drop trigger if exists eleves_generation_avant_maj on public.eleves;
create trigger eleves_generation_avant_maj
  before update on public.eleves
  for each row execute function public.eleves_generation_suivante();

create or replace function public.eleves_jeton_autorise(jeton text)
returns boolean language sql stable security invoker set search_path = pg_catalog
as $$
  select coalesce(
    jeton is not null
    and char_length(jeton) >= 32
    and jeton ~ '^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$'
    and replace(jeton, '-', '') !~ '^([0-9a-f])\1+$'
    and (
      select count(distinct ch)
      from regexp_split_to_table(replace(jeton, '-', ''), '') as ch
    ) >= 4
    and jeton = (nullif(current_setting('request.headers', true), '')::json ->> 'x-kunz-jeton'),
    false
  );
$$;

drop policy if exists maj_app on public.eleves;
create policy maj_app on public.eleves
  for update to anon
  using (true)
  with check (
    (charge_utile is null or octet_length(charge_utile::text) <= 262144)
    and public.eleves_generation_a_jour(generation - 1, charge_utile)
  );

commit;
