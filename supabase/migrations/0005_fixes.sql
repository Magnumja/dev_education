-- =============================================================
-- DevEducation — correções de auditoria
-- =============================================================

-- 1. trending_resources lia resource_clicks com os direitos de quem chama.
--    Como a RLS só libera SELECT em resource_clicks para a curadoria, a
--    função devolvia zero linhas para todo mundo e o painel caía em silêncio
--    no fallback de curadoria. Passa a rodar com security definer e expõe
--    apenas a contagem agregada, nunca quem clicou.
create or replace function trending_resources(
  p_days  int default 7,
  p_limit int default 5
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
  click_count   bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id, r.slug, r.title, r.description, r.url, r.source, r.source_domain,
    r.resource_type, r.difficulty, r.language, r.thumbnail_url, r.author,
    r.published_at, r.is_verified,
    coalesce(array_agg(distinct t.slug) filter (where t.slug is not null), '{}'),
    coalesce(array_agg(distinct tg.name) filter (where tg.name is not null), '{}'),
    0::real,
    count(*) over ()::bigint,
    count(distinct c.id)::bigint as click_count
  from resources r
  join resource_clicks c
    on c.resource_id = r.id
   and c.created_at >= now() - make_interval(days => greatest(p_days, 1))
  left join resource_topics rt on rt.resource_id = r.id
  left join topics t on t.id = rt.topic_id
  left join resource_tags rtg on rtg.resource_id = r.id
  left join tags tg on tg.id = rtg.tag_id
  where r.is_active
  group by r.id
  order by click_count desc, r.title asc
  limit greatest(p_limit, 1);
$$;

-- 2. O índice de título usava text_pattern_ops, que não atende `like '%x%'`
--    (curinga à esquerda). Trocado por trigramas, que atendem.
drop index if exists resources_title_trgm_idx;
create extension if not exists "pg_trgm";
create index resources_title_trgm_idx
  on resources using gin (lower(title) gin_trgm_ops);

-- 3. Contagem por tipo sem trafegar uma linha por recurso.
create or replace function resource_type_counts()
returns table (resource_type resource_type, total bigint)
language sql
stable
as $$
  select r.resource_type, count(*)::bigint
  from resources r
  where r.is_active
  group by r.resource_type;
$$;

grant execute on function resource_type_counts to anon, authenticated;
