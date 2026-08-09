
Plataforma educacional gratuita e sem fins lucrativos que **filtra, organiza e conecta**
conteúdos de programação já disponíveis na internet.

O DevEducation não produz aulas nem hospeda material. Ele funciona como uma camada de
descoberta e curadoria: reúne documentações, vídeos, artigos, PDFs, exercícios e
repositórios, classifica por tecnologia, tipo, nível e idioma, e leva o usuário
diretamente à fonte original.

```
YouTube · GitHub · Docs · Artigos · PDFs · Exercícios
                     ↓
               DevEducation
       filtragem + organização + ranking + curadoria
                     ↓
                  Usuário
```

## Tecnologias

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19** e **TypeScript** em modo strict
- **Tailwind CSS v4** com design system próprio da marca
- **Supabase** (PostgreSQL, Auth, RLS)
- **Vercel** para deploy

## Estrutura

```
src/
├── app/                  rotas (App Router)
├── components/
│   ├── layout/           Header, Footer, Logo
│   ├── search/           SearchBar, SearchFilters, FiltersDrawer, SortSelect
│   ├── resources/        ResourceCard, ResourceList, BookmarkButton
│   ├── topics/           TopicCard
│   └── ui/               Badge, Button, EmptyState, Pagination, Skeletons
├── lib/
│   ├── data/             catálogo curado inicial (tópicos e recursos)
│   ├── ranking/          função central de ranking
│   ├── search/           busca, filtros e parsing de parâmetros de URL
│   └── utils/
├── types/                tipos de domínio (SearchResult é o formato canônico)
└── constants/
```

Todo provider externo (YouTube, GitHub, banco) traduz sua resposta para
`SearchResult`, definido em `src/types`. Nenhum componente consome o formato bruto
de uma API de terceiro.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

A aplicação sobe em <http://localhost:3000>. Sem credenciais do Supabase, ela roda
sobre o catálogo curado local — busca, filtros, tecnologias e páginas de recurso
funcionam normalmente.

## Configuração do Supabase

1. Crie um projeto em <https://supabase.com/dashboard> e copie a URL e a `anon key`
   para o `.env.local`.
2. No **SQL Editor**, execute os arquivos nesta ordem:

   | Arquivo | O que faz |
   | --- | --- |
   | `supabase/migrations/0001_schema.sql` | enums, tabelas, índices, full text search e triggers |
   | `supabase/migrations/0002_rls.sql` | Row Level Security de todas as tabelas |
   | `supabase/migrations/0003_search.sql` | função `search_resources` (busca + ranking) |
   | `supabase/migrations/0004_dashboard.sql` | destaques e histórico do painel |
   | `supabase/migrations/0005_fixes.sql` | correções de índice e permissão |
   | `supabase/migrations/0006_providers.sql` | procedência do conteúdo importado |
   | `supabase/migrations/0007_click_limits.sql` | limite de repetição nas métricas |
   | `supabase/seed.sql` | catálogo curado inicial (idempotente) |

3. Em **Authentication → Providers**, habilite *Email* e *GitHub*. No provider do
   GitHub, use como callback a URL que o Supabase exibe; no seu app OAuth do
   GitHub, aponte para ela também.
4. Em **Authentication → URL Configuration**, adicione
   `http://localhost:3000/auth/callback` e a URL de produção.

Para promover um usuário a curador, rode no SQL Editor:

```sql
update profiles set role = 'admin' where id = '<uuid do usuário>';
```

O `seed.sql` é **gerado** a partir de `src/lib/data/`. Depois de alterar tópicos
ou recursos, rode `npm run db:seed` em vez de editar o SQL na mão.

## Variáveis de ambiente

| Variável | Onde é usada | Obrigatória |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | metadata, canonical e sitemap | recomendada |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente e servidor | para auth/banco |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente e servidor | para auth/banco |
| `SUPABASE_SERVICE_ROLE_KEY` | **apenas servidor** | para curadoria/admin |
| `YOUTUBE_API_KEY` | provider do YouTube | opcional |
| `GITHUB_TOKEN` | provider do GitHub | opcional |

`SUPABASE_SERVICE_ROLE_KEY` nunca deve ser prefixada com `NEXT_PUBLIC_` nem
importada em Client Components. `.env.local` não é versionado.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir o build
npm run lint     # ESLint
npm run test     # testes de ranking e busca (node:test)
npm run db:seed  # regenera supabase/seed.sql a partir do catálogo
```

## Deploy

O projeto é preparado para a Vercel: importe o repositório, cadastre as variáveis
de ambiente do `.env.example` e faça o deploy. Nada além de `npm run build` é
necessário.
