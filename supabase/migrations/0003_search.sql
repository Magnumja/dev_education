-- =============================================================
-- DevEducation — busca e ranking
--
-- Espelha os pesos de src/lib/ranking/score.ts. Se um peso mudar lá,
-- mude aqui também: esta é a única outra implementação do ranking.
-- =============================================================

create table if not exists authoritative_domains (
  domain text primary key
);

insert into authoritative_domains (domain) values
  ('developer.mozilla.org'), ('docs.python.org'), ('react.dev'),
  ('nextjs.org'), ('nodejs.org'), ('typescriptlang.org'),
  ('docs.docker.com'), ('git-scm.com'), ('docs.github.com'),
  ('postgresql.org'), ('kubernetes.io'), ('scikit-learn.org')
on conflict (domain) do nothing;

alter table authoritative_domains enable row level security;

create policy "domínios de referência são públicos"
  on authoritative_domains for select using (true);

-- Resultado canônico da busca: o mesmo shape consumido pelo SearchResult
-- do TypeScript, com total_count para paginação em uma única query.
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
  total_count   bigint
)
language sql
stable
as $$
  with normalized as (
    select
      nullif(btrim(coalesce(p_query, '')), '') as q,
      case
        when nullif(btrim(coalesce(p_query, '')), '') is null then null
        else websearch_to_tsquery('pt_unaccent', p_query)
      end as tsq
  ),
  candidates as (
    select
      r.*,
      coalesce(
        array_agg(distinct t.slug) filter (where t.slug is not null),
        '{}'
      ) as topic_slugs,
      coalesce(
        array_agg(distinct tg.name) filter (where tg.name is not null),
        '{}'
      ) as tag_names,
      (select avg(rating)::real from resource_ratings rr where rr.resource_id = r.id) as avg_rating
    from resources r
    left join resource_topics rt on rt.resource_id = r.id
    left join topics t on t.id = rt.topic_id
    left join resource_tags rtg on rtg.resource_id = r.id
    left join tags tg on tg.id = rtg.tag_id
    where r.is_active
      and (p_types  is null or array_length(p_types, 1)  is null or r.resource_type = any (p_types))
      and (p_levels is null or array_length(p_levels, 1) is null or r.difficulty = any (p_levels))
      and (p_langs  is null or array_length(p_langs, 1)  is null or r.language = any (p_langs))
    group by r.id
  ),
  filtered as (
    select c.*
    from candidates c, normalized n
    where (p_topics is null or array_length(p_topics, 1) is null or c.topic_slugs && p_topics)
      and (
        n.tsq is null
        or c.search_vector @@ n.tsq
        or lower(unaccent(c.title)) like '%' || lower(unaccent(n.q)) || '%'
        or exists (
          select 1 from unnest(c.topic_slugs) s
          where s like '%' || lower(unaccent(n.q)) || '%'
        )
        or exists (
          select 1 from unnest(c.tag_names) tg
          where lower(unaccent(tg)) like '%' || lower(unaccent(n.q)) || '%'
        )
      )
  ),
  ranked as (
    select
      f.*,
      (
        -- correspondência textual (título tem peso A no search_vector)
        case
          when n.tsq is null then 0
          else ts_rank_cd('{0.1, 0.3, 0.6, 1.0}'::float4[], f.search_vector, n.tsq) * 40
        end
        -- bônus explícitos de título, na mesma ordem do ranking em TS
        + case
            when n.q is null then 0
            when lower(unaccent(f.title)) = lower(unaccent(n.q)) then 60
            when lower(unaccent(f.title)) like lower(unaccent(n.q)) || '%' then 30
            when lower(unaccent(f.title)) like '%' || lower(unaccent(n.q)) || '%' then 22
            else 0
          end
        + case
            when n.q is not null and exists (
              select 1 from unnest(f.topic_slugs) s
              where s like '%' || lower(unaccent(n.q)) || '%'
            ) then 18
            else 0
          end
        + case
            when n.q is not null and exists (
              select 1 from unnest(f.tag_names) tg
              where lower(unaccent(tg)) like '%' || lower(unaccent(n.q)) || '%'
            ) then 10
            else 0
          end
        + case when f.is_verified then 12 else 0 end
        + coalesce(f.avg_rating, 0) * 3
        + case
            when exists (
              select 1 from authoritative_domains d
              where f.source_domain like '%' || d.domain
            ) then 8
            else 0
          end
        -- recência: decai linearmente ao longo de ~3 anos
        + case
            when f.published_at is null then 0
            else greatest(
              0,
              6 * (1 - extract(epoch from (now() - f.published_at)) / (3 * 365 * 86400))
            )
          end
      )::real as computed_score
    from filtered f, normalized n
  )
  select
    r.id, r.slug, r.title, r.description, r.url, r.source, r.source_domain,
    r.resource_type, r.difficulty, r.language, r.thumbnail_url, r.author,
    r.published_at, r.is_verified, r.topic_slugs, r.tag_names,
    r.computed_score,
    count(*) over () as total_count
  from ranked r
  order by
    case when p_sort = 'recent' then r.published_at end desc nulls last,
    case when p_sort = 'rating' then coalesce(r.avg_rating, 0) end desc,
    r.computed_score desc,
    r.title asc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

grant execute on function search_resources to anon, authenticated;
