
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
