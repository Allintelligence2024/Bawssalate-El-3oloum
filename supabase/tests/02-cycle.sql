-- Exécuter après 02-fixture.sql et la proposition 02, jamais contre le projet réel.
set role anon;
do $$ begin
  begin
    perform public.kunz_sync_etat();
    raise exception 'anon accepté';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
do $$ begin
  begin
    perform public.kunz_sync_consentir(0);
    raise exception 'adresse non vérifiée acceptée';
  exception when insufficient_privilege then null;
  end;
end $$;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
do $$ begin
  if (select generation from public.kunz_sync_etat()) is distinct from 0 then raise exception 'état initial'; end if;
  if public.kunz_sync_ecrire(0, '{"minutes_totales":1}') is distinct from false then raise exception 'sans consentement'; end if;
  if public.kunz_sync_consentir(0) is distinct from 1 then raise exception 'consentement'; end if;
  if public.kunz_sync_consentir(0) is not null then raise exception 'consentement rejoué'; end if;
  if public.kunz_sync_ecrire(1, '{"minutes_totales":4,"note":"fictive"}') is distinct from false then raise exception 'contrat'; end if;
  if public.kunz_sync_ecrire(1, '{"minutes_totales":4}') is distinct from true then raise exception 'écriture'; end if;
  if public.kunz_sync_effacer(1) is distinct from true then raise exception 'effacement'; end if;
  if public.kunz_sync_effacer(1) is distinct from true then raise exception 'réponse perdue simulée'; end if;
  if public.kunz_sync_ecrire(1, '{"minutes_totales":5}') is distinct from false then raise exception 'écriture obsolète'; end if;
end $$;
reset role;
do $$ begin
  if (select resume is not null or autorise from kunz_sync_prive.profils) is distinct from false then raise exception 'donnée résiduelle'; end if;
end $$;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
do $$ begin
  if (select generation from public.kunz_sync_etat()) is distinct from 0 then raise exception 'autre principal'; end if;
  if public.kunz_sync_effacer(1) is distinct from false then raise exception 'confirmation autre principal'; end if;
end $$;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
do $$ begin
  if public.kunz_sync_consentir(2) is distinct from 3 then raise exception 'reconsentement'; end if;
  if public.kunz_sync_effacer(1) is distinct from false then raise exception 'effacement obsolète'; end if;
  if public.kunz_sync_ecrire(1, '{"minutes_totales":5}') is distinct from false then raise exception 'ancienne génération réactivée'; end if;
  if public.kunz_sync_ecrire(3, '{"minutes_totales":6}') is distinct from true then raise exception 'nouvelle génération'; end if;
end $$;
reset role;
