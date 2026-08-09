-- =============================================================
-- DevEducation — integridade das métricas de acesso
--
-- `resource_clicks` aceita inserção anônima, porque medir acessos de visitante
-- é o objetivo. Sem nenhum limite, porém, um laço de repetição elege o
-- conteúdo que quiser em "Em alta esta semana", e a curadoria passa a decidir
-- com base em número inventado.
-- =============================================================

-- Identifica a origem sem guardar IP: o hash não permite voltar ao endereço,
-- mas serve para reconhecer repetição vinda do mesmo lugar.
alter table resource_clicks
  add column if not exists source_hash text;

create index if not exists resource_clicks_dedupe_idx
  on resource_clicks (resource_id, source_hash, created_at desc);

/**
 * Registra um acesso, ignorando repetições do mesmo visitante no mesmo
 * conteúdo dentro de uma hora.
 *
 * security definer porque a contagem precisa enxergar cliques que a RLS
 * esconde do visitante — ele pode inserir, mas não ler.
 */
create or replace function record_resource_click(
  p_slug text,
  p_source_hash text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource_id uuid;
  v_recent int;
begin
  select id into v_resource_id
  from resources
  where slug = p_slug and is_active
  limit 1;

  if v_resource_id is null then
    return;
  end if;

  if p_source_hash is not null then
    select count(*) into v_recent
    from resource_clicks
    where resource_id = v_resource_id
      and source_hash = p_source_hash
      and created_at > now() - interval '1 hour';

    if v_recent > 0 then
      return;
    end if;
  end if;

  insert into resource_clicks (resource_id, user_id, source_hash)
  values (v_resource_id, auth.uid(), p_source_hash);
end;
$$;

grant execute on function record_resource_click to anon, authenticated;

-- A inserção passa a ser exclusiva da função acima, que aplica o limite.
drop policy if exists "qualquer pessoa registra clique" on resource_clicks;
