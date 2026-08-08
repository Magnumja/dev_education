-- =============================================================
-- DevEducation — schema base
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- Configuração de busca sem acentos: "javascript" acha "JavaScript",
-- "exercicio" acha "exercício".
do $$
begin
  if not exists (select 1 from pg_ts_config where cfgname = 'pt_unaccent') then
    create text search configuration pt_unaccent (copy = portuguese);
    alter text search configuration pt_unaccent
      alter mapping for hword, hword_part, word with unaccent, portuguese_stem;
  end if;
end
$$;

-- ── Enums ────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'resource_type') then
    create type resource_type as enum (
      'video', 'documentation', 'article', 'pdf',
      'exercise', 'repository', 'course', 'tool'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'difficulty_level') then
    create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'resource_language') then
    create type resource_language as enum ('pt', 'en', 'es', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('user', 'curator', 'admin');
  end if;
end
$$;

-- ── profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── topics ───────────────────────────────────────────────────
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- ── tags ─────────────────────────────────────────────────────
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ── resources ────────────────────────────────────────────────
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  url text not null unique,
  source text not null,
  source_domain text not null,
  resource_type resource_type not null,
  difficulty difficulty_level,
  language resource_language not null default 'en',
  thumbnail_url text,
  author text,
  published_at timestamptz,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('pt_unaccent', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('pt_unaccent', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('pt_unaccent', coalesce(source, '')), 'C') ||
    setweight(to_tsvector('pt_unaccent', coalesce(author, '')), 'D')
  ) stored
);

create index if not exists resources_search_idx on resources using gin (search_vector);
create index if not exists resources_active_idx on resources (is_active) where is_active;
create index if not exists resources_type_idx on resources (resource_type);
create index if not exists resources_difficulty_idx on resources (difficulty);
create index if not exists resources_language_idx on resources (language);
create index if not exists resources_published_idx on resources (published_at desc nulls last);
create index if not exists resources_title_trgm_idx on resources (lower(title) text_pattern_ops);

-- ── relacionamentos N:N ──────────────────────────────────────
create table if not exists resource_topics (
  resource_id uuid not null references resources (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  primary key (resource_id, topic_id)
);

create index if not exists resource_topics_topic_idx on resource_topics (topic_id);

create table if not exists resource_tags (
  resource_id uuid not null references resources (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (resource_id, tag_id)
);

create index if not exists resource_tags_tag_idx on resource_tags (tag_id);

-- ── favorites ────────────────────────────────────────────────
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  resource_id uuid not null references resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

create index if not exists favorites_user_idx on favorites (user_id, created_at desc);

-- ── collections ──────────────────────────────────────────────
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_user_idx on collections (user_id, created_at desc);

create table if not exists collection_resources (
  collection_id uuid not null references collections (id) on delete cascade,
  resource_id uuid not null references resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, resource_id)
);

-- ── métricas e avaliações ────────────────────────────────────
create table if not exists resource_clicks (
  id bigserial primary key,
  resource_id uuid not null references resources (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists resource_clicks_resource_idx on resource_clicks (resource_id, created_at desc);

create table if not exists resource_ratings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (resource_id, user_id)
);

create index if not exists resource_ratings_resource_idx on resource_ratings (resource_id);

-- ── submissões da comunidade ─────────────────────────────────
create table if not exists resource_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  url text not null,
  title text,
  description text,
  status submission_status not null default 'pending',
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists resource_submissions_status_idx on resource_submissions (status, created_at desc);
create index if not exists resource_submissions_user_idx on resource_submissions (user_id, created_at desc);

-- ── triggers ─────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists resources_updated_at on resources;
create trigger resources_updated_at
  before update on resources
  for each row execute function set_updated_at();

drop trigger if exists collections_updated_at on collections;
create trigger collections_updated_at
  before update on collections
  for each row execute function set_updated_at();

-- Cria o profile assim que o usuário se cadastra (e-mail ou OAuth).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
