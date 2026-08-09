-- =============================================================
-- DevEducation — seed do catálogo curado
-- GERADO AUTOMATICAMENTE por scripts/generate-seed.ts — não edite à mão.
-- Idempotente: pode ser executado novamente com segurança.
-- =============================================================

-- ── topics ───────────────────────────────────────────────────
insert into topics (name, slug, description, icon) values
  ('JavaScript', 'javascript', 'A linguagem da web. Base para front-end, back-end com Node.js e praticamente todo o ecossistema moderno.', 'javascript'),
  ('TypeScript', 'typescript', 'JavaScript com tipagem estática. Reduz bugs em projetos grandes e melhora a experiência no editor.', 'typescript'),
  ('Python', 'python', 'Linguagem versátil e de sintaxe simples, dominante em automação, dados, back-end e inteligência artificial.', 'python'),
  ('React', 'react', 'Biblioteca para construir interfaces com componentes. Base do Next.js e do front-end moderno.', 'react'),
  ('Next.js', 'nextjs', 'Framework React full stack com renderização no servidor, rotas e otimizações prontas para produção.', 'nextdotjs'),
  ('Node.js', 'nodejs', 'JavaScript no servidor. APIs, ferramentas de linha de comando e serviços em tempo real.', 'nodedotjs'),
  ('CSS', 'css', 'Layout, tipografia e responsividade na web — de Flexbox e Grid a design systems.', 'css3'),
  ('Docker', 'docker', 'Containers para empacotar aplicações com suas dependências e rodar igual em qualquer ambiente.', 'docker'),
  ('Git & GitHub', 'git', 'Controle de versão, colaboração, branches e pull requests — a base do trabalho em equipe.', 'git'),
  ('SQL & Bancos de dados', 'sql', 'Modelagem, consultas e performance em bancos relacionais como PostgreSQL e MySQL.', 'postgresql'),
  ('Inteligência Artificial', 'ai', 'Machine learning, deep learning e LLMs — dos fundamentos matemáticos às aplicações práticas.', 'openai'),
  ('DevOps & Cloud', 'devops', 'CI/CD, infraestrutura, observabilidade e deploy — como o software chega e se mantém em produção.', 'kubernetes'),
  ('HTML', 'html', 'A estrutura de toda página web: semântica, formulários, acessibilidade e as APIs do navegador.', 'html5'),
  ('Vue', 'vue', 'Framework progressivo para interfaces, com curva de aprendizado suave e ecossistema próprio.', 'vuedotjs'),
  ('Angular', 'angular', 'Framework completo do Google para aplicações grandes, com TypeScript e injeção de dependência.', 'angular'),
  ('Svelte', 'svelte', 'Compila os componentes em JavaScript puro: sem framework em tempo de execução, menos código enviado.', 'svelte'),
  ('Tailwind CSS', 'tailwind', 'Estilos por classes utilitárias, direto no HTML — a abordagem que dispensa arquivos de CSS separados.', 'tailwindcss'),
  ('Go', 'go', 'Linguagem compilada e simples do Google, forte em serviços de rede, concorrência e ferramentas de linha de comando.', 'go'),
  ('Rust', 'rust', 'Desempenho de C com segurança de memória garantida em tempo de compilação, sem coletor de lixo.', 'rust'),
  ('PHP', 'php', 'Presente em boa parte da web, com Laravel, Symfony e WordPress no ecossistema.', 'php'),
  ('Ruby', 'ruby', 'Linguagem centrada na felicidade de quem escreve, com Ruby on Rails como maior expoente.', 'ruby'),
  ('Java & Kotlin', 'java', 'A base do software corporativo e do Android: JVM, Spring e Kotlin como sucessor moderno.', 'kotlin'),
  ('Mobile', 'mobile', 'Aplicativos para Android e iOS: React Native, Flutter, Swift e Kotlin.', 'dart'),
  ('Testes', 'testing', 'Testes automatizados de unidade, integração e ponta a ponta — Jest, Vitest, Playwright e Cypress.', 'jest'),
  ('GraphQL & APIs', 'graphql', 'Como sistemas conversam entre si: REST, GraphQL, autenticação e desenho de contratos.', 'graphql'),
  ('Segurança', 'security', 'Autenticação, criptografia, vulnerabilidades comuns e como não deixar portas abertas.', null),
  ('Linux & Terminal', 'linux', 'Shell, Bash, permissões e as ferramentas de linha de comando que todo dev acaba usando.', 'linux'),
  ('Carreira', 'career', 'Entrevistas, portfólio, primeiro emprego, senioridade e o lado não técnico da profissão.', null)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

-- ── tags ─────────────────────────────────────────────────────
insert into tags (name, slug) values
  ('fundamentos', 'fundamentos'),
  ('web', 'web'),
  ('referência', 'referencia'),
  ('tutorial', 'tutorial'),
  ('livro', 'livro'),
  ('closures', 'closures'),
  ('aprofundamento', 'aprofundamento'),
  ('exercícios', 'exercicios'),
  ('projetos', 'projetos'),
  ('tipos', 'tipos'),
  ('oficial', 'oficial'),
  ('generics', 'generics'),
  ('desafios', 'desafios'),
  ('cheatsheet', 'cheatsheet'),
  ('automação', 'automacao'),
  ('prático', 'pratico'),
  ('algoritmos', 'algoritmos'),
  ('estruturas de dados', 'estruturas-de-dados'),
  ('hooks', 'hooks'),
  ('componentes', 'componentes'),
  ('awesome list', 'awesome-list'),
  ('ecossistema', 'ecossistema'),
  ('app router', 'app-router'),
  ('server components', 'server-components'),
  ('cache', 'cache'),
  ('event loop', 'event-loop'),
  ('streams', 'streams'),
  ('boas práticas', 'boas-praticas'),
  ('arquitetura', 'arquitetura'),
  ('produção', 'producao'),
  ('layout', 'layout'),
  ('flexbox', 'flexbox'),
  ('guia', 'guia'),
  ('grid', 'grid'),
  ('jogo', 'jogo'),
  ('prática', 'pratica'),
  ('containers', 'containers'),
  ('começar', 'comecar'),
  ('laboratório', 'laboratorio'),
  ('dockerfile', 'dockerfile'),
  ('build', 'build'),
  ('branches', 'branches'),
  ('interativo', 'interativo'),
  ('rebase', 'rebase'),
  ('pull request', 'pull-request'),
  ('colaboração', 'colaboracao'),
  ('postgresql', 'postgresql'),
  ('consultas', 'consultas'),
  ('joins', 'joins'),
  ('window functions', 'window-functions'),
  ('índices', 'indices'),
  ('performance', 'performance'),
  ('otimização', 'otimizacao'),
  ('machine learning', 'machine-learning'),
  ('currículo', 'curriculo'),
  ('scikit-learn', 'scikit-learn'),
  ('modelos', 'modelos'),
  ('deep learning', 'deep-learning'),
  ('teoria', 'teoria'),
  ('cloud', 'cloud'),
  ('roadmap', 'roadmap'),
  ('trilha', 'trilha'),
  ('carreira', 'carreira'),
  ('kubernetes', 'kubernetes'),
  ('orquestração', 'orquestracao')
on conflict (slug) do update set name = excluded.name;

-- ── resources ────────────────────────────────────────────────
insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'mdn-js-guide',
  'Guia JavaScript da MDN',
  'Guia oficial e completo da linguagem, do básico à programação assíncrona, escrito e revisado pela comunidade Mozilla.',
  'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide',
  'MDN Web Docs',
  'developer.mozilla.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'Mozilla',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'mdn-js-guide' and t.slug = any (array['javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'mdn-js-guide' and tg.slug = any (array['fundamentos', 'web', 'referencia']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'javascript-info',
  'The Modern JavaScript Tutorial',
  'Tutorial progressivo que cobre a linguagem do zero até tópicos avançados como prototypes, promises e módulos.',
  'https://javascript.info/',
  'javascript.info',
  'javascript.info',
  'course'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Ilya Kantor',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'javascript-info' and t.slug = any (array['javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'javascript-info' and tg.slug = any (array['fundamentos', 'tutorial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'ydkjs',
  'You Don''t Know JS Yet',
  'Série de livros gratuitos que mergulha nos mecanismos internos do JavaScript: escopo, closures, tipos e o this.',
  'https://github.com/getify/You-Dont-Know-JS',
  'GitHub',
  'github.com',
  'repository'::resource_type,
  'advanced'::difficulty_level,
  'en'::resource_language,
  null,
  'Kyle Simpson',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'ydkjs' and t.slug = any (array['javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'ydkjs' and tg.slug = any (array['livro', 'closures', 'aprofundamento']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'eloquent-javascript',
  'Eloquent JavaScript',
  'Livro online gratuito com exercícios interativos e projetos práticos ao final de cada bloco de capítulos.',
  'https://eloquentjavascript.net/',
  'eloquentjavascript.net',
  'eloquentjavascript.net',
  'exercise'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Marijn Haverbeke',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'eloquent-javascript' and t.slug = any (array['javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'eloquent-javascript' and tg.slug = any (array['livro', 'exercicios', 'projetos']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'ts-handbook',
  'TypeScript Handbook',
  'Documentação oficial da linguagem: tipos, generics, narrowing, módulos e configuração do compilador.',
  'https://www.typescriptlang.org/docs/handbook/intro.html',
  'TypeScript',
  'typescriptlang.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Microsoft',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'ts-handbook' and t.slug = any (array['typescript', 'javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'ts-handbook' and tg.slug = any (array['referencia', 'tipos', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'type-challenges',
  'Type Challenges',
  'Coleção de desafios de tipos, do nível fácil ao extremo, para dominar o sistema de tipos do TypeScript.',
  'https://github.com/type-challenges/type-challenges',
  'GitHub',
  'github.com',
  'exercise'::resource_type,
  'advanced'::difficulty_level,
  'en'::resource_language,
  null,
  'Anthony Fu',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'type-challenges' and t.slug = any (array['typescript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'type-challenges' and tg.slug = any (array['exercicios', 'generics', 'desafios']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'total-typescript-tips',
  'TypeScript Cheat Sheets',
  'Folhas de consulta visuais para tipos, interfaces, classes e control flow — úteis no dia a dia.',
  'https://www.typescriptlang.org/cheatsheets/',
  'TypeScript',
  'typescriptlang.org',
  'documentation'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Microsoft',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'total-typescript-tips' and t.slug = any (array['typescript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'total-typescript-tips' and tg.slug = any (array['cheatsheet', 'referencia']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'python-tutorial',
  'Tutorial oficial do Python',
  'Introdução oficial à linguagem em português: estruturas de dados, funções, módulos, classes e biblioteca padrão.',
  'https://docs.python.org/pt-br/3/tutorial/',
  'Python Docs',
  'docs.python.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'Python Software Foundation',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'python-tutorial' and t.slug = any (array['python']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'python-tutorial' and tg.slug = any (array['fundamentos', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'automate-boring-stuff',
  'Automate the Boring Stuff with Python',
  'Livro gratuito focado em automação prática: arquivos, planilhas, e-mails, web scraping e tarefas repetitivas.',
  'https://automatetheboringstuff.com/',
  'automatetheboringstuff.com',
  'automatetheboringstuff.com',
  'course'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Al Sweigart',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'automate-boring-stuff' and t.slug = any (array['python']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'automate-boring-stuff' and tg.slug = any (array['automacao', 'pratico', 'livro']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'algorithms-python',
  'The Algorithms — Python',
  'Implementações didáticas de algoritmos e estruturas de dados clássicos, com código legível e testado.',
  'https://github.com/TheAlgorithms/Python',
  'GitHub',
  'github.com',
  'repository'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'The Algorithms',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'algorithms-python' and t.slug = any (array['python']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'algorithms-python' and tg.slug = any (array['algoritmos', 'estruturas-de-dados']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'react-learn',
  'Aprender React — Documentação oficial',
  'A nova documentação do React, com explicações interativas sobre componentes, estado, efeitos e hooks.',
  'https://react.dev/learn',
  'react.dev',
  'react.dev',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Meta',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'react-learn' and t.slug = any (array['react', 'javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'react-learn' and tg.slug = any (array['hooks', 'componentes', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'react-reference',
  'React — Referência da API',
  'Referência completa de hooks, componentes e APIs do React, com exemplos e armadilhas comuns.',
  'https://react.dev/reference/react',
  'react.dev',
  'react.dev',
  'documentation'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Meta',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'react-reference' and t.slug = any (array['react']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'react-reference' and tg.slug = any (array['referencia', 'hooks']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'awesome-react',
  'Awesome React',
  'Lista mantida pela comunidade com bibliotecas, ferramentas, artigos e recursos do ecossistema React.',
  'https://github.com/enaqx/awesome-react',
  'GitHub',
  'github.com',
  'repository'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'enaqx',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'awesome-react' and t.slug = any (array['react']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'awesome-react' and tg.slug = any (array['awesome-list', 'ecossistema']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'nextjs-learn',
  'Learn Next.js — Curso oficial',
  'Curso guiado da Vercel: você constrói um painel real aprendendo App Router, Server Components e deploy.',
  'https://nextjs.org/learn',
  'nextjs.org',
  'nextjs.org',
  'course'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Vercel',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'nextjs-learn' and t.slug = any (array['nextjs', 'react']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'nextjs-learn' and tg.slug = any (array['app-router', 'pratico', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'nextjs-docs',
  'Documentação do Next.js',
  'Referência do App Router, roteamento, renderização, cache, Server Actions e otimizações de performance.',
  'https://nextjs.org/docs',
  'nextjs.org',
  'nextjs.org',
  'documentation'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Vercel',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'nextjs-docs' and t.slug = any (array['nextjs', 'react']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'nextjs-docs' and tg.slug = any (array['referencia', 'server-components', 'cache']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'nodejs-learn',
  'Node.js — Guias oficiais',
  'Guias introdutórios da equipe do Node: event loop, módulos, streams, sistema de arquivos e diagnóstico.',
  'https://nodejs.org/en/learn',
  'nodejs.org',
  'nodejs.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'OpenJS Foundation',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'nodejs-learn' and t.slug = any (array['nodejs', 'javascript']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'nodejs-learn' and tg.slug = any (array['event-loop', 'streams', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'node-best-practices',
  'Node.js Best Practices',
  'Compilado de boas práticas de arquitetura, tratamento de erros, testes, segurança e produção em Node.js.',
  'https://github.com/goldbergyoni/nodebestpractices',
  'GitHub',
  'github.com',
  'repository'::resource_type,
  'advanced'::difficulty_level,
  'en'::resource_language,
  null,
  'Yoni Goldberg',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'node-best-practices' and t.slug = any (array['nodejs', 'devops']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'node-best-practices' and tg.slug = any (array['boas-praticas', 'arquitetura', 'producao']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'mdn-css',
  'CSS — Documentação da MDN',
  'Referência completa de propriedades, seletores, layout e responsividade, com exemplos executáveis.',
  'https://developer.mozilla.org/pt-BR/docs/Web/CSS',
  'MDN Web Docs',
  'developer.mozilla.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'Mozilla',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'mdn-css' and t.slug = any (array['css']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'mdn-css' and tg.slug = any (array['referencia', 'layout']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'flexbox-guide',
  'A Complete Guide to Flexbox',
  'Guia visual definitivo do Flexbox, com diagrama de cada propriedade do container e dos itens.',
  'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
  'CSS-Tricks',
  'css-tricks.com',
  'article'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'CSS-Tricks',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'flexbox-guide' and t.slug = any (array['css']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'flexbox-guide' and tg.slug = any (array['flexbox', 'layout', 'guia']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'grid-guide',
  'A Complete Guide to CSS Grid',
  'Referência visual do CSS Grid: áreas, linhas, alinhamento e padrões de layout bidimensional.',
  'https://css-tricks.com/snippets/css/complete-guide-grid/',
  'CSS-Tricks',
  'css-tricks.com',
  'article'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'CSS-Tricks',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'grid-guide' and t.slug = any (array['css']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'grid-guide' and tg.slug = any (array['grid', 'layout', 'guia']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'flexbox-froggy',
  'Flexbox Froggy',
  'Jogo com 24 níveis para praticar Flexbox escrevendo CSS de verdade — ótimo para fixar as propriedades.',
  'https://flexboxfroggy.com/#pt-br',
  'flexboxfroggy.com',
  'flexboxfroggy.com',
  'exercise'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'Thomas Park',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'flexbox-froggy' and t.slug = any (array['css']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'flexbox-froggy' and tg.slug = any (array['flexbox', 'jogo', 'pratica']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'docker-get-started',
  'Docker — Get Started',
  'Trilha oficial do zero: o que é um container, como criar imagens, volumes, redes e Docker Compose.',
  'https://docs.docker.com/get-started/',
  'Docker Docs',
  'docs.docker.com',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Docker',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'docker-get-started' and t.slug = any (array['docker', 'devops']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'docker-get-started' and tg.slug = any (array['containers', 'oficial', 'comecar']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'docker-labs',
  'Docker Labs',
  'Laboratórios práticos mantidos pela Docker, com tutoriais passo a passo para diferentes stacks.',
  'https://github.com/docker/labs',
  'GitHub',
  'github.com',
  'exercise'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Docker',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'docker-labs' and t.slug = any (array['docker', 'devops']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'docker-labs' and tg.slug = any (array['laboratorio', 'pratica']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'dockerfile-reference',
  'Dockerfile — Referência',
  'Todas as instruções de Dockerfile explicadas, com boas práticas de cache de camadas e multi-stage build.',
  'https://docs.docker.com/reference/dockerfile/',
  'Docker Docs',
  'docs.docker.com',
  'documentation'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Docker',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'dockerfile-reference' and t.slug = any (array['docker']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'dockerfile-reference' and tg.slug = any (array['dockerfile', 'referencia', 'build']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'pro-git',
  'Pro Git (livro oficial, em português)',
  'Livro completo sobre Git: fundamentos, branches, remotos, rebase, internals e fluxos de trabalho.',
  'https://git-scm.com/book/pt-br/v2',
  'git-scm.com',
  'git-scm.com',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'Scott Chacon, Ben Straub',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'pro-git' and t.slug = any (array['git']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'pro-git' and tg.slug = any (array['livro', 'branches', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'learn-git-branching',
  'Learn Git Branching',
  'Simulador visual e interativo para entender commits, branches, merge e rebase na prática.',
  'https://learngitbranching.js.org/?locale=pt_BR',
  'learngitbranching.js.org',
  'learngitbranching.js.org',
  'exercise'::resource_type,
  'intermediate'::difficulty_level,
  'pt'::resource_language,
  null,
  'Peter Cottle',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'learn-git-branching' and t.slug = any (array['git']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'learn-git-branching' and tg.slug = any (array['interativo', 'rebase', 'pratica']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'github-get-started',
  'Introdução ao GitHub',
  'Documentação oficial sobre repositórios, pull requests, issues, forks e colaboração em equipe.',
  'https://docs.github.com/pt/get-started',
  'GitHub Docs',
  'docs.github.com',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'pt'::resource_language,
  null,
  'GitHub',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'github-get-started' and t.slug = any (array['git']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'github-get-started' and tg.slug = any (array['pull-request', 'colaboracao', 'oficial']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'postgres-tutorial',
  'PostgreSQL — Tutorial oficial',
  'Introdução ao PostgreSQL direto da documentação: tabelas, consultas, joins, views e transações.',
  'https://www.postgresql.org/docs/current/tutorial.html',
  'PostgreSQL',
  'postgresql.org',
  'documentation'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'PostgreSQL Global Development Group',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'postgres-tutorial' and t.slug = any (array['sql']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'postgres-tutorial' and tg.slug = any (array['postgresql', 'oficial', 'consultas']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'pgexercises',
  'PostgreSQL Exercises',
  'Mais de 80 exercícios de SQL com correção automática, de SELECT básico a window functions.',
  'https://pgexercises.com/',
  'pgexercises.com',
  'pgexercises.com',
  'exercise'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'Alisdair Owens',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'pgexercises' and t.slug = any (array['sql']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'pgexercises' and tg.slug = any (array['exercicios', 'joins', 'window-functions']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'use-the-index-luke',
  'Use The Index, Luke!',
  'Guia sobre índices e performance em bancos relacionais, explicando por que consultas ficam lentas.',
  'https://use-the-index-luke.com/pt',
  'use-the-index-luke.com',
  'use-the-index-luke.com',
  'article'::resource_type,
  'advanced'::difficulty_level,
  'pt'::resource_language,
  null,
  'Markus Winand',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'use-the-index-luke' and t.slug = any (array['sql']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'use-the-index-luke' and tg.slug = any (array['indices', 'performance', 'otimizacao']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'ml-for-beginners',
  'Machine Learning for Beginners',
  'Currículo de 12 semanas da Microsoft com aulas, quizzes e projetos de ML clássico usando Python.',
  'https://github.com/microsoft/ML-For-Beginners',
  'GitHub',
  'github.com',
  'course'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'Microsoft',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'ml-for-beginners' and t.slug = any (array['ai', 'python']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'ml-for-beginners' and tg.slug = any (array['machine-learning', 'curriculo', 'projetos']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'scikit-learn-guide',
  'scikit-learn — User Guide',
  'Guia da principal biblioteca de machine learning clássico em Python, com teoria e exemplos por algoritmo.',
  'https://scikit-learn.org/stable/user_guide.html',
  'scikit-learn',
  'scikit-learn.org',
  'documentation'::resource_type,
  'intermediate'::difficulty_level,
  'en'::resource_language,
  null,
  'scikit-learn developers',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'scikit-learn-guide' and t.slug = any (array['ai', 'python']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'scikit-learn-guide' and tg.slug = any (array['scikit-learn', 'modelos', 'referencia']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'deep-learning-book',
  'Deep Learning Book',
  'Livro de referência de Goodfellow, Bengio e Courville, disponível gratuitamente online.',
  'https://www.deeplearningbook.org/',
  'deeplearningbook.org',
  'deeplearningbook.org',
  'pdf'::resource_type,
  'advanced'::difficulty_level,
  'en'::resource_language,
  null,
  'Ian Goodfellow et al.',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'deep-learning-book' and t.slug = any (array['ai']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'deep-learning-book' and tg.slug = any (array['deep-learning', 'livro', 'teoria']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'twelve-factor',
  'The Twelve-Factor App',
  'Doze princípios para construir aplicações modernas, portáveis e prontas para escalar na nuvem.',
  'https://12factor.net/pt_br/',
  '12factor.net',
  '12factor.net',
  'article'::resource_type,
  'intermediate'::difficulty_level,
  'pt'::resource_language,
  null,
  'Adam Wiggins',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'twelve-factor' and t.slug = any (array['devops']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'twelve-factor' and tg.slug = any (array['arquitetura', 'cloud', 'boas-praticas']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'roadmap-devops',
  'DevOps Roadmap',
  'Mapa visual com a ordem sugerida de estudo em DevOps, ligando cada etapa a materiais recomendados.',
  'https://roadmap.sh/devops',
  'roadmap.sh',
  'roadmap.sh',
  'tool'::resource_type,
  'beginner'::difficulty_level,
  'en'::resource_language,
  null,
  'roadmap.sh',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'roadmap-devops' and t.slug = any (array['devops']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'roadmap-devops' and tg.slug = any (array['roadmap', 'trilha', 'carreira']::text[])
on conflict do nothing;

insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (
  'kubernetes-tutorials',
  'Kubernetes — Tutoriais oficiais',
  'Tutoriais guiados sobre pods, deployments, services e configuração, com ambiente interativo no navegador.',
  'https://kubernetes.io/docs/tutorials/',
  'kubernetes.io',
  'kubernetes.io',
  'documentation'::resource_type,
  'advanced'::difficulty_level,
  'en'::resource_language,
  null,
  'CNCF',
  null,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  url = excluded.url,
  source = excluded.source,
  source_domain = excluded.source_domain,
  resource_type = excluded.resource_type,
  difficulty = excluded.difficulty,
  language = excluded.language,
  author = excluded.author,
  is_verified = excluded.is_verified;

insert into resource_topics (resource_id, topic_id)
select r.id, t.id from resources r, topics t
where r.slug = 'kubernetes-tutorials' and t.slug = any (array['devops', 'docker']::text[])
on conflict do nothing;

insert into resource_tags (resource_id, tag_id)
select r.id, tg.id from resources r, tags tg
where r.slug = 'kubernetes-tutorials' and tg.slug = any (array['kubernetes', 'orquestracao', 'oficial']::text[])
on conflict do nothing;

