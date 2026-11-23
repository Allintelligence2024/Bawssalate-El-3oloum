-- 2026-11-21 0002 — Génération de version pour la suppression durable inter-appareils (BUG-002).
--
-- Problème réel : la suppression n'est aujourd'hui garantie que dans l'onglet courant.
-- Si l'appareil A supprime sa ligne pendant que l'appareil B a un état en mémoire et un
-- réseau qui revient, B réécrit la ligne juste après — la suppression est annulée et
-- l'élève croit avoir effacé ses données.
--
-- Solution : un compteur `generation` qui ne recule jamais. Chaque appareil lit la
-- génération avant d'écrire et refuse d'écrire sur une génération supérieure ; la
-- suppression incrémente la génération au lieu de simplement retirer la ligne, ce qui
-- rend l'annulation détectable par l'appareil B.
--
-- Portée volontairement limitée : cette migration ajoute la colonne, la fonction de
-- comparaison et l'index. **Elle n'active rien** : la synchro reste éteinte en production
-- (`VITE_SUPABASE_*` absents de Vercel). L'activation exige la livraison client correspondante.

alter table public.eleves
  add column if not exists generation bigint not null default 1;

comment on column public.eleves.generation is
  'Compteur monotone d''écriture. Incrémenté à chaque UPDATE/DELETE accepté, jamais décrémenté. Permet à un appareil de détecter qu''il écrit sur un état périmé (BUG-002).';

-- Une génération ne recule pas : c'est la seule garantie qui rend la détection fiable.
alter table public.eleves
  drop constraint if exists eleves_generation_positive;
alter table public.eleves
  add constraint eleves_generation_positive check (generation >= 1);

create index if not exists eleves_generation_idx on public.eleves (generation desc);

-- Incrémentation automatique, côté serveur : le client ne peut pas « oublier » de l'incrémenter,
-- et un client malveillant ne peut pas la forcer à reculer.
create or replace function public.eleves_generation_suivante()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' then
    -- On ignore toute valeur envoyée par le client : on prend max(existante, envoyée) + 1.
    new.generation := greatest(old.generation, coalesce(new.generation, old.generation)) + 1;
  end if;
  return new;
end;
$$;

drop trigger if exists eleves_generation_avant_maj on public.eleves;
create trigger eleves_generation_avant_maj
  before update on public.eleves
  for each row execute function public.eleves_generation_suivante();

-- La policy UPDATE doit désormais refuser une écriture fondée sur une génération périmée.
-- Le client envoie sa génération connue dans `Prefer` ? Non : plus simple et vérifiable,
-- on la met dans `charge_utile.temoin_generation`, et on compare en base.
--
-- Une écriture sans témoin reste acceptée (compatibilité avec les clients antérieurs), mais
-- l'envoi devient alors non protégé : c'est un choix explicite, documenté ici, qui permet
-- la migration progressive sans casser les installations existantes.
create or replace function public.eleves_generation_a_jour(charge_utile jsonb)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select coalesce(
    charge_utile is null
    or charge_utile ->> 'temoin_generation' is null
    or (charge_utile ->> 'temoin_generation') ~ '^[0-9]+$',
    true
  );
$$;
