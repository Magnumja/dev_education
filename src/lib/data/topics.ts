import type { Topic } from "@/types";

/**
 * Catálogo inicial de tecnologias. Espelhado na tabela `topics` do Supabase
 * (ver supabase/seed.sql). `icon` guarda o slug simple-icons correspondente.
 */
export const TOPICS: Topic[] = [
  {
    id: "javascript",
    name: "JavaScript",
    slug: "javascript",
    description:
      "A linguagem da web. Base para front-end, back-end com Node.js e praticamente todo o ecossistema moderno.",
    icon: "javascript",
  },
  {
    id: "typescript",
    name: "TypeScript",
    slug: "typescript",
    description:
      "JavaScript com tipagem estática. Reduz bugs em projetos grandes e melhora a experiência no editor.",
    icon: "typescript",
  },
  {
    id: "python",
    name: "Python",
    slug: "python",
    description:
      "Linguagem versátil e de sintaxe simples, dominante em automação, dados, back-end e inteligência artificial.",
    icon: "python",
  },
  {
    id: "react",
    name: "React",
    slug: "react",
    description:
      "Biblioteca para construir interfaces com componentes. Base do Next.js e do front-end moderno.",
    icon: "react",
  },
  {
    id: "nextjs",
    name: "Next.js",
    slug: "nextjs",
    description:
      "Framework React full stack com renderização no servidor, rotas e otimizações prontas para produção.",
    icon: "nextdotjs",
  },
  {
    id: "nodejs",
    name: "Node.js",
    slug: "nodejs",
    description:
      "JavaScript no servidor. APIs, ferramentas de linha de comando e serviços em tempo real.",
    icon: "nodedotjs",
  },
  {
    id: "css",
    name: "CSS",
    slug: "css",
    description:
      "Layout, tipografia e responsividade na web — de Flexbox e Grid a design systems.",
    icon: "css3",
  },
  {
    id: "docker",
    name: "Docker",
    slug: "docker",
    description:
      "Containers para empacotar aplicações com suas dependências e rodar igual em qualquer ambiente.",
    icon: "docker",
  },
  {
    id: "git",
    name: "Git & GitHub",
    slug: "git",
    description:
      "Controle de versão, colaboração, branches e pull requests — a base do trabalho em equipe.",
    icon: "git",
  },
  {
    id: "sql",
    name: "SQL & Bancos de dados",
    slug: "sql",
    description:
      "Modelagem, consultas e performance em bancos relacionais como PostgreSQL e MySQL.",
    icon: "postgresql",
  },
  {
    id: "ai",
    name: "Inteligência Artificial",
    slug: "ai",
    description:
      "Machine learning, deep learning e LLMs — dos fundamentos matemáticos às aplicações práticas.",
    icon: "openai",
  },
  {
    id: "devops",
    name: "DevOps & Cloud",
    slug: "devops",
    description:
      "CI/CD, infraestrutura, observabilidade e deploy — como o software chega e se mantém em produção.",
    icon: "kubernetes",
  },
  {
    id: "html",
    name: "HTML",
    slug: "html",
    description:
      "A estrutura de toda página web: semântica, formulários, acessibilidade e as APIs do navegador.",
    icon: "html5",
  },
  {
    id: "vue",
    name: "Vue",
    slug: "vue",
    description:
      "Framework progressivo para interfaces, com curva de aprendizado suave e ecossistema próprio.",
    icon: "vuedotjs",
  },
  {
    id: "angular",
    name: "Angular",
    slug: "angular",
    description:
      "Framework completo do Google para aplicações grandes, com TypeScript e injeção de dependência.",
    icon: "angular",
  },
  {
    id: "svelte",
    name: "Svelte",
    slug: "svelte",
    description:
      "Compila os componentes em JavaScript puro: sem framework em tempo de execução, menos código enviado.",
    icon: "svelte",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    slug: "tailwind",
    description:
      "Estilos por classes utilitárias, direto no HTML — a abordagem que dispensa arquivos de CSS separados.",
    icon: "tailwindcss",
  },
  {
    id: "go",
    name: "Go",
    slug: "go",
    description:
      "Linguagem compilada e simples do Google, forte em serviços de rede, concorrência e ferramentas de linha de comando.",
    icon: "go",
  },
  {
    id: "rust",
    name: "Rust",
    slug: "rust",
    description:
      "Desempenho de C com segurança de memória garantida em tempo de compilação, sem coletor de lixo.",
    icon: "rust",
  },
  {
    id: "php",
    name: "PHP",
    slug: "php",
    description:
      "Presente em boa parte da web, com Laravel, Symfony e WordPress no ecossistema.",
    icon: "php",
  },
  {
    id: "ruby",
    name: "Ruby",
    slug: "ruby",
    description:
      "Linguagem centrada na felicidade de quem escreve, com Ruby on Rails como maior expoente.",
    icon: "ruby",
  },
  {
    id: "java",
    name: "Java & Kotlin",
    slug: "java",
    description:
      "A base do software corporativo e do Android: JVM, Spring e Kotlin como sucessor moderno.",
    icon: "kotlin",
  },
  {
    id: "mobile",
    name: "Mobile",
    slug: "mobile",
    description:
      "Aplicativos para Android e iOS: React Native, Flutter, Swift e Kotlin.",
    icon: "dart",
  },
  {
    id: "testing",
    name: "Testes",
    slug: "testing",
    description:
      "Testes automatizados de unidade, integração e ponta a ponta — Jest, Vitest, Playwright e Cypress.",
    icon: "jest",
  },
  {
    id: "graphql",
    name: "GraphQL & APIs",
    slug: "graphql",
    description:
      "Como sistemas conversam entre si: REST, GraphQL, autenticação e desenho de contratos.",
    icon: "graphql",
  },
  {
    id: "security",
    name: "Segurança",
    slug: "security",
    description:
      "Autenticação, criptografia, vulnerabilidades comuns e como não deixar portas abertas.",
    icon: null,
  },
  {
    id: "linux",
    name: "Linux & Terminal",
    slug: "linux",
    description:
      "Shell, Bash, permissões e as ferramentas de linha de comando que todo dev acaba usando.",
    icon: "linux",
  },
  {
    id: "career",
    name: "Carreira",
    slug: "career",
    description:
      "Entrevistas, portfólio, primeiro emprego, senioridade e o lado não técnico da profissão.",
    icon: null,
  },
];

export const TOPIC_BY_SLUG = new Map(TOPICS.map((topic) => [topic.slug, topic]));
