-- =============================================================
-- DevEducation — consultas do painel inicial
--
-- Devolvem o mesmo shape de search_resources para reaproveitar o
-- mapeamento para SearchResult no TypeScript.
-- =============================================================

-- Mais acessados em uma janela de dias.
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

-- Últimos conteúdos abertos por um usuário (um por recurso).
create or replace function recent_resources(
  p_user  uuid,
  p_limit int default 6
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
  opened_at     timestamptz
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
    max(c.created_at) as opened_at
  from resources r
  join resource_clicks c on c.resource_id = r.id
  left join resource_topics rt on rt.resource_id = r.id
  left join topics t on t.id = rt.topic_id
  left join resource_tags rtg on rtg.resource_id = r.id
  left join tags tg on tg.id = rtg.tag_id
  where r.is_active
    -- security definer: a função só enxerga o histórico de quem a chamou.
    and c.user_id = auth.uid()
    and c.user_id = p_user
  group by r.id
  order by opened_at desc
  limit greatest(p_limit, 1);
$$;

grant execute on function trending_resources to anon, authenticated;
grant execute on function recent_resources to authenticated;
