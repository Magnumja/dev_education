-- =============================================================
-- DevEducation — Row Level Security
--
-- Regra geral: catálogo é público para leitura quando ativo;
-- tudo que pertence a um usuário só é acessível por ele; curadoria
-- exige papel 'curator' ou 'admin'.
--
-- Idempotente: o Postgres não tem `create policy if not exists`, então
-- cada policy é removida antes de ser recriada. Pode rodar quantas vezes
-- precisar.
-- =============================================================

alter table profiles              enable row level security;
alter table topics                enable row level security;
alter table tags                  enable row level security;
alter table resources             enable row level security;
alter table resource_topics       enable row level security;
alter table resource_tags         enable row level security;
alter table favorites             enable row level security;
alter table collections           enable row level security;
alter table collection_resources  enable row level security;
alter table resource_clicks       enable row level security;
alter table resource_ratings      enable row level security;
alter table resource_submissions  enable row level security;

-- security definer evita recursão: a policy de profiles consultaria profiles.
create or replace function is_curator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('curator', 'admin')
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────
drop policy if exists "profiles são públicos para leitura" on profiles;
create policy "profiles são públicos para leitura"
  on profiles for select using (true);

drop policy if exists "usuário edita o próprio profile" on profiles;
create policy "usuário edita o próprio profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── catálogo (leitura pública) ───────────────────────────────
drop policy if exists "topics são públicos" on topics;
create policy "topics são públicos" on topics for select using (true);

drop policy if exists "tags são públicas" on tags;
create policy "tags são públicas" on tags for select using (true);

drop policy if exists "resources ativos são públicos" on resources;
create policy "resources ativos são públicos"
  on resources for select
  using (is_active or is_curator());

drop policy if exists "curadoria gerencia resources" on resources;
create policy "curadoria gerencia resources"
  on resources for all
  using (is_curator())
  with check (is_curator());

drop policy if exists "curadoria gerencia topics" on topics;
create policy "curadoria gerencia topics"
  on topics for all using (is_curator()) with check (is_curator());

drop policy if exists "curadoria gerencia tags" on tags;
create policy "curadoria gerencia tags"
  on tags for all using (is_curator()) with check (is_curator());

drop policy if exists "vínculos de topics são públicos" on resource_topics;
create policy "vínculos de topics são públicos"
  on resource_topics for select using (true);

drop policy if exists "curadoria gerencia vínculos de topics" on resource_topics;
create policy "curadoria gerencia vínculos de topics"
  on resource_topics for all using (is_curator()) with check (is_curator());

drop policy if exists "vínculos de tags são públicos" on resource_tags;
create policy "vínculos de tags são públicos"
  on resource_tags for select using (true);

drop policy if exists "curadoria gerencia vínculos de tags" on resource_tags;
create policy "curadoria gerencia vínculos de tags"
  on resource_tags for all using (is_curator()) with check (is_curator());

-- ── favorites ────────────────────────────────────────────────
drop policy if exists "usuário lê os próprios favoritos" on favorites;
create policy "usuário lê os próprios favoritos"
  on favorites for select using (auth.uid() = user_id);

drop policy if exists "usuário cria os próprios favoritos" on favorites;
create policy "usuário cria os próprios favoritos"
  on favorites for insert with check (auth.uid() = user_id);

drop policy if exists "usuário remove os próprios favoritos" on favorites;
create policy "usuário remove os próprios favoritos"
  on favorites for delete using (auth.uid() = user_id);

-- ── collections ──────────────────────────────────────────────
drop policy if exists "coleções próprias ou públicas são legíveis" on collections;
create policy "coleções próprias ou públicas são legíveis"
  on collections for select
  using (auth.uid() = user_id or is_public);

drop policy if exists "usuário gerencia as próprias coleções" on collections;
create policy "usuário gerencia as próprias coleções"
  on collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "itens seguem a visibilidade da coleção" on collection_resources;
create policy "itens seguem a visibilidade da coleção"
  on collection_resources for select
  using (
    exists (
      select 1 from collections c
      where c.id = collection_id
        and (c.user_id = auth.uid() or c.is_public)
    )
  );

drop policy if exists "usuário gerencia itens das próprias coleções" on collection_resources;
create policy "usuário gerencia itens das próprias coleções"
  on collection_resources for all
  using (
    exists (
      select 1 from collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- ── cliques ──────────────────────────────────────────────────
-- Qualquer visitante pode registrar um clique (métrica anônima),
-- mas ninguém lê a tabela pelo cliente: só a curadoria.
drop policy if exists "qualquer pessoa registra clique" on resource_clicks;
create policy "qualquer pessoa registra clique"
  on resource_clicks for insert with check (true);

drop policy if exists "curadoria lê cliques" on resource_clicks;
create policy "curadoria lê cliques"
  on resource_clicks for select using (is_curator());

-- ── avaliações ───────────────────────────────────────────────
drop policy if exists "avaliações são públicas para leitura" on resource_ratings;
create policy "avaliações são públicas para leitura"
  on resource_ratings for select using (true);

drop policy if exists "usuário gerencia as próprias avaliações" on resource_ratings;
create policy "usuário gerencia as próprias avaliações"
  on resource_ratings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── submissões ───────────────────────────────────────────────
drop policy if exists "usuário lê as próprias submissões" on resource_submissions;
create policy "usuário lê as próprias submissões"
  on resource_submissions for select
  using (auth.uid() = user_id or is_curator());

drop policy if exists "usuário cria as próprias submissões" on resource_submissions;
create policy "usuário cria as próprias submissões"
  on resource_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "curadoria revisa submissões" on resource_submissions;
create policy "curadoria revisa submissões"
  on resource_submissions for update
  using (is_curator())
  with check (is_curator());

drop policy if exists "admin remove submissões" on resource_submissions;
create policy "admin remove submissões"
  on resource_submissions for delete using (is_admin());
