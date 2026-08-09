-- =============================================================
-- DevEducation — correção de escalação de privilégio
--
-- FALHA CRÍTICA: a policy "usuário edita o próprio profile" permitia UPDATE na
-- própria linha. RLS no Postgres é por LINHA, não por COLUNA — então `role`
-- estava incluído. Qualquer conta cadastrada virava administradora com uma
-- chamada direta à API REST:
--
--   PATCH /rest/v1/profiles?id=eq.<próprio id>   {"role":"admin"}
--
-- Confirmado em teste: uma conta comum se promoveu a admin e passaria a ter
-- acesso ao painel de curadoria, ao catálogo e às permissões de todo mundo.
--
-- A correção tem duas camadas independentes, porque uma única linha de GRANT
-- perdida reabriria o buraco inteiro.
-- =============================================================

-- Camada 1 — privilégio de coluna.
--
-- Atenção a uma armadilha do Postgres: não existe "revogar uma coluna" quando
-- o papel tem UPDATE na tabela inteira — o privilégio amplo continua valendo e
-- o REVOKE por coluna vira um comando sem efeito. O Supabase concede
-- `GRANT ALL ON ALL TABLES` para anon e authenticated, então é exatamente esse
-- o caso aqui.
--
-- O caminho correto é retirar o UPDATE da tabela e devolver apenas as colunas
-- que o usuário pode mesmo editar.
revoke update on profiles from anon, authenticated;
grant update (name, avatar_url) on profiles to authenticated;

-- Camada 2 — gatilho. Vale mesmo que alguém reconceda o privilégio acima por
-- engano, e cobre qualquer caminho de escrita, não só o PostgREST.
create or replace function prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- auth.uid() nulo = service role (ingestão, painel administrativo do
    -- Supabase). Esses caminhos já são privilegiados por definição.
    if auth.uid() is not null and not is_admin() then
      raise exception 'Alterar o papel de uma conta exige permissão de administrador'
        using errcode = 'insufficient_privilege';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on profiles;
create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function prevent_role_escalation();

-- A policy segue permitindo o usuário editar nome e avatar; o que muda é que
-- `role` deixou de estar ao alcance dela.
comment on policy "usuário edita o próprio profile" on profiles is
  'Permite editar o próprio perfil. A coluna role é protegida por GRANT e por gatilho — ver 0008.';
