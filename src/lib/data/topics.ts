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
];

export const TOPIC_BY_SLUG = new Map(TOPICS.map((topic) => [topic.slug, topic]));
