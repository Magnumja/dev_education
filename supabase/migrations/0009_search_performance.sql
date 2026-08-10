-- =============================================================
-- DevEducation — desempenho da busca
--
-- A versão anterior montava, para CADA consulta, os arrays de tecnologias e
-- tags de TODOS os recursos ativos, e só depois filtrava. Com 40 recursos isso
-- era imperceptível; com 3.700 passou de 1,2 segundo por busca.
--
-- A ordem correta é a inversa:
--   1. filtrar usando os índices (search_vector, tipo, nível, idioma)
--   2. pontuar sem agregação, com EXISTS que usam índice
--   3. ordenar e cortar a página
--   4. só então buscar tags e tecnologias — das 20 linhas que sobraram
--
-- Os pesos do ranking são idênticos aos de src/lib/ranking/score.ts.
-- =============================================================

create index if not exists resource_topics_resource_idx
  on resource_topics (resource_id);

create index if not exists resource_tags_resource_idx
  on resource_tags (resource_id);

create or replace function search_resources(
  p_query  text                default '',
  p_types  resource_type[]     default null,
  p_levels difficulty_level[]  default null,
  p_langs  resource_language[] default null,
  p_topics text[]              default null,
  p_sort   text                default 'relevance',
  p_limit  int                 default 20,
  p_offset int                 default 0
)
returns table (
  id            uuid,
  slug          text,
  title         text,
  description   text,
  url           text,
  source        text,
  source_domain text,
  resource_type resource_type,
  difficulty    difficulty_level,
  language      resource_language,
  thumbnail_url text,
  author        text,
  published_at  timestamptz,
  is_verified   boolean,
  topics        text[],
  tags          text[],
  score         real,
  total_count   bigint,
  rating_avg    real,
  rating_count  int
)
language sql
stable
as $$
  with n as (
    select
      nullif(btrim(coalesce(p_query, '')), '') as q,
      case
        when nullif(btrim(coalesce(p_query, '')), '') is null then null
        else websearch_to_tsquery('pt_unaccent', p_query)
      end as tsq
  ),
  -- 1. Filtro. Nenhuma agregação aqui: só condições que os índices atendem.
  base as (
    select
      r.*,
      n.q,
      n.tsq,
      -- Aqui, e não em `scored`: uma coluna do mesmo SELECT não pode ser
      -- referenciada por outra, então calcular adiante obrigaria a repetir a
      -- subconsulta no score e na ordenação.
      (select avg(rating)::real from resource_ratings rr where rr.resource_id = r.id) as media,
      (select count(*)::int from resource_ratings rr where rr.resource_id = r.id) as votos
    from resources r, n
    where r.is_active
      and (p_types  is null or array_length(p_types, 1)  is null or r.resource_type = any (p_types))
      and (p_levels is null or array_length(p_levels, 1) is null or r.difficulty = any (p_levels))
      and (p_langs  is null or array_length(p_langs, 1)  is null or r.language = any (p_langs))
      and (
        p_topics is null or array_length(p_topics, 1) is null
        or exists (
          select 1 from resource_topics rt
          join topics t on t.id = rt.topic_id
          where rt.resource_id = r.id and t.slug = any (p_topics)
        )
      )
      and (
        n.tsq is null
        or r.search_vector @@ n.tsq
        or lower(unaccent(r.title)) like '%' || lower(unaccent(n.q)) || '%'
        or exists (
          select 1 from resource_topics rt
          join topics t on t.id = rt.topic_id
          where rt.resource_id = r.id
            and t.slug like '%' || lower(unaccent(n.q)) || '%'
        )
        or exists (
          select 1 from resource_tags rg
          join tags tg on tg.id = rg.tag_id
          where rg.resource_id = r.id
            and lower(unaccent(tg.name)) like '%' || lower(unaccent(n.q)) || '%'
        )
      )
  ),
  -- 2. Pontuação. Os bônus de tecnologia e tag viram EXISTS, que param no
  --    primeiro acerto, em vez de montar arrays completos.
  scored as (
    select
      b.*,
      count(*) over () as total,
      (
        case
          when b.tsq is null then 0
          else ts_rank_cd('{0.1, 0.3, 0.6, 1.0}'::float4[], b.search_vector, b.tsq) * 40
        end
        + case
            when b.q is null then 0
            when lower(unaccent(b.title)) = lower(unaccent(b.q)) then 60
            when lower(unaccent(b.title)) like lower(unaccent(b.q)) || '%' then 30
            when lower(unaccent(b.title)) like '%' || lower(unaccent(b.q)) || '%' then 22
            else 0
          end
        + case
            when b.q is not null and exists (
              select 1 from resource_topics rt
              join topics t on t.id = rt.topic_id
              where rt.resource_id = b.id
                and t.slug like '%' || lower(unaccent(b.q)) || '%'
            ) then 18
            else 0
          end
        + case
            when b.q is not null and exists (
              select 1 from resource_tags rg
              join tags tg on tg.id = rg.tag_id
              where rg.resource_id = b.id
                and lower(unaccent(tg.name)) like '%' || lower(unaccent(b.q)) || '%'
            ) then 10
            else 0
          end
        + case when b.is_verified then 12 else 0 end
        + coalesce(b.media, 0) * 3
        + case
            when exists (
              select 1 from authoritative_domains d
              where b.source_domain like '%' || d.domain
            ) then 8
            else 0
          end
        + case
            when b.published_at is null then 0
            else greatest(
              0,
              6 * (1 - extract(epoch from (now() - b.published_at)) / (3 * 365 * 86400))
            )
          end
      )::real as computed_score
    from base b
  ),
  -- 3. Ordena e corta. Daqui em diante são no máximo p_limit linhas.
  page as (
    select *
    from scored
    order by
      case when p_sort = 'recent' then published_at end desc nulls last,
      case when p_sort = 'rating' then coalesce(media, 0) end desc,
      computed_score desc,
      title asc
    limit greatest(p_limit, 1)
    offset greatest(p_offset, 0)
  )
  -- 4. Enriquece apenas a página.
  select
    p.id, p.slug, p.title, p.description, p.url, p.source, p.source_domain,
    p.resource_type, p.difficulty, p.language, p.thumbnail_url, p.author,
    p.published_at, p.is_verified,
    coalesce(
      (select array_agg(t.slug)
       from resource_topics rt join topics t on t.id = rt.topic_id
       where rt.resource_id = p.id),
      '{}'
    ),
    coalesce(
      (select array_agg(tg.name)
       from resource_tags rg join tags tg on tg.id = rg.tag_id
       where rg.resource_id = p.id),
      '{}'
    ),
    p.computed_score,
    p.total,
    p.media,
    p.votos
  from page p
  -- Espelha exatamente a ordem de `page`. Sem repetir o critério de nota aqui,
  -- as linhas certas eram selecionadas e depois reordenadas por relevância —
  -- "Melhor avaliados" devolvia o conjunto correto na ordem errada.
  order by
    case when p_sort = 'recent' then p.published_at end desc nulls last,
    case when p_sort = 'rating' then coalesce(p.media, 0) end desc,
    p.computed_score desc,
    p.title asc;
$$;

grant execute on function search_resources to anon, authenticated;
