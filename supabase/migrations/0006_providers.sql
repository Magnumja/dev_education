-- =============================================================
-- DevEducation — procedência dos conteúdos importados
--
-- Guarda de qual provider veio cada recurso e o identificador dele na
-- origem, para deduplicar entre execuções mesmo que a URL mude de forma
-- (barra final, parâmetros de campanha, http→https).
-- =============================================================

alter table resources add column if not exists provider text;
alter table resources add column if not exists external_id text;
alter table resources add column if not exists discovered_at timestamptz;

create unique index if not exists resources_provider_external_idx
  on resources (provider, external_id)
  where provider is not null and external_id is not null;

create index if not exists resources_pending_review_idx
  on resources (discovered_at desc)
  where not is_active;

-- Sinais crus da origem (stars, views, forks) para a curadoria decidir.
-- Ficam separados das colunas do catálogo porque variam por provider.
alter table resources add column if not exists provider_signals jsonb;
