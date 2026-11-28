-- 2026-11-27 0004 — Temps 2 : synchronisation vérifiée par identité authentifiée (auth.uid()).
-- Promue depuis supabase/propositions/02-synchronisation-verifiee.sql avec horodatage serveur
-- et fonction de purge de rétention bornée.
-- Avant toute révocation définitive du canal anon historique (public.eleves), vérifier la bascule client.

begin;

create schema if not exists kunz_sync_prive;
revoke all on schema kunz_sync_prive from public, anon, authenticated;

create table if not exists kunz_sync_prive.profils (
  principal uuid primary key references auth.users(id) on delete cascade,
  generation bigint not null default 0,
  autorise boolean not null default false,
  resume jsonb,
  maj timestamptz not null default now(),
  check (autorise or resume is null)
);

alter table kunz_sync_prive.profils enable row level security;

create or replace function kunz_sync_prive.principal_verifie() returns uuid
language plpgsql stable security invoker set search_path = '' as $$
declare p uuid := auth.uid();
begin
  if p is null or not exists (select 1 from auth.users where id = p and email_confirmed_at is not null) then
    raise exception using errcode = '42501', message = 'Identité vérifiée requise';
  end if;
  return p;
end;
$$;

-- Ne crée aucune fiche lors de la simple lecture de l'état.
create or replace function public.kunz_sync_etat() returns table(generation bigint, autorise boolean)
language plpgsql stable security definer set search_path = '' as $$
declare p uuid := kunz_sync_prive.principal_verifie();
begin
  return query select coalesce(f.generation, 0), coalesce(f.autorise, false)
    from (select p as principal) comme_courant left join kunz_sync_prive.profils f using (principal);
end;
$$;

-- Appeler depuis une confirmation explicite et fraîche, jamais automatiquement au démarrage.
create or replace function public.kunz_sync_consentir(attendue bigint) returns bigint
language plpgsql security definer set search_path = '' as $$
declare p uuid := kunz_sync_prive.principal_verifie(); g bigint;
begin
  if attendue is null or attendue < 0 then return null; end if;
  if attendue = 0 then
    insert into kunz_sync_prive.profils(principal) values (p) on conflict do nothing;
  end if;
  update kunz_sync_prive.profils f set generation = f.generation + 1, autorise = true, maj = now()
    where f.principal = p and f.generation = attendue and not f.autorise returning f.generation into g;
  return g;
end;
$$;

create or replace function public.kunz_sync_ecrire(attendue bigint, contenu jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare p uuid := kunz_sync_prive.principal_verifie();
begin
  -- Contrat pilote minimal : compteurs uniquement, sans adresse, notes ou jeton.
  if contenu is null or jsonb_typeof(contenu) <> 'object' or octet_length(contenu::text) > 2048 then return false; end if;
  if not (contenu ? 'minutes_totales') or exists (
    select 1 from jsonb_each(contenu) kv
    where kv.key not in ('minutes_totales', 'lecons_terminees', 'revisions')
       or jsonb_typeof(kv.value) <> 'number'
       or kv.value::text !~ '^[0-9]{1,9}$'
  ) then return false; end if;
  update kunz_sync_prive.profils f set resume = contenu, maj = now()
    where f.principal = p and f.generation = attendue and f.autorise;
  return found;
end;
$$;

-- Une répétition de la même génération confirme l'effacement sans toucher un consentement ultérieur.
create or replace function public.kunz_sync_effacer(attendue bigint) returns boolean
language plpgsql security definer set search_path = '' as $$
declare p uuid := kunz_sync_prive.principal_verifie();
begin
  update kunz_sync_prive.profils f set generation = f.generation + 1, autorise = false, resume = null, maj = now()
    where f.principal = p and f.generation = attendue and f.autorise;
  if found then return true; end if;
  return exists (select 1 from kunz_sync_prive.profils f where f.principal = p
    and f.generation - 1 = attendue and not f.autorise);
end;
$$;

-- Rétention bornée (exécution planifiée côté administrateur / service_role uniquement).
create or replace function kunz_sync_prive.purger_profils_inactifs(retention interval default interval '365 days')
returns bigint
language plpgsql security definer set search_path = '' as $$
declare nb bigint;
begin
  delete from kunz_sync_prive.profils
   where maj < now() - retention;
  get diagnostics nb = row_count;
  return nb;
end;
$$;

revoke all on function public.kunz_sync_etat(), public.kunz_sync_consentir(bigint),
  public.kunz_sync_ecrire(bigint,jsonb), public.kunz_sync_effacer(bigint) from public, anon, authenticated;
grant execute on function public.kunz_sync_etat(), public.kunz_sync_consentir(bigint),
  public.kunz_sync_ecrire(bigint,jsonb), public.kunz_sync_effacer(bigint) to authenticated;
revoke all on function kunz_sync_prive.purger_profils_inactifs(interval) from public, anon, authenticated;

commit;
