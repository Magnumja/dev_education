import "server-only";

import {
  detectDifficulty,
  detectLanguage,
  domainOf,
  slugify,
  type ContentProvider,
  type ProviderQuery,
  type ProviderResult,
} from "@/lib/providers/types";

interface GitHubRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  archived: boolean;
  owner: { login: string };
}

/**
 * Repositórios educacionais: awesome lists, coleções de exercícios, projetos
 * de referência.
 *
 * Sem token são 60 requisições por hora; com um PAT de leitura pública, 5.000.
 * A busca do GitHub tem limite próprio de 30 por minuto — a ingestão roda
 * poucas vezes ao dia, então folga de sobra.
 */
export const githubProvider: ContentProvider = {
  id: "github",
  label: "GitHub",
  quotaCostPerCall: 1,

  isConfigured() {
    return true; // funciona sem token, só com limite menor
  },

  async search({ query, topicSlug, limit = 10 }: ProviderQuery) {
    // Restringe a nome e descrição e deixa o GitHub ordenar por relevância.
    // Ordenar por estrelas traria os repositórios mais populares que apenas
    // citam o termo — ferramentas, não material de estudo.
    const q = [
      query,
      "in:name,description",
      "stars:>200",
      "archived:false",
      "is:public",
    ].join(" ");

    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", q);
    url.searchParams.set("per_page", String(Math.min(limit, 30)));

    let response = await request(url, process.env.GITHUB_TOKEN);

    // Token revogado ou expirado: seguir sem ele é melhor que falhar. O limite
    // cai de 30 para 10 buscas por minuto, mas a ingestão continua.
    if (response.status === 401 && process.env.GITHUB_TOKEN) {
      console.warn(
        "GITHUB_TOKEN inválido (401). Repetindo sem autenticação — gere um token novo.",
      );
      response = await request(url, undefined);
    }

    if (!response.ok) {
      throw new Error(
        `GitHub respondeu ${response.status}${
          response.status === 403 ? " (limite de requisições atingido)" : ""
        }`,
      );
    }

    const payload = (await response.json()) as { items?: GitHubRepo[] };

    return (payload.items ?? [])
      .filter((repo) => !repo.archived && repo.description)
      .map((repo) => toResult(repo, topicSlug));
  },
};

function request(url: URL, token: string | undefined) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "DevEducation",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Cache de 6h: reexecutar a ingestão não gasta requisição de novo.
  return fetch(url, { headers, next: { revalidate: 21600 } });
}

function toResult(repo: GitHubRepo, topicSlug?: string): ProviderResult {
  // Awesome lists são coletâneas; o resto tratamos como projeto de referência.
  const isAwesome = /awesome/i.test(repo.full_name);
  const isExercise = /(exercis|challenge|katas|practice|100-days)/i.test(
    repo.full_name + " " + (repo.description ?? ""),
  );

  const tags = [
    ...(repo.topics ?? []).slice(0, 4),
    ...(isAwesome ? ["awesome list"] : []),
    ...(repo.language ? [repo.language.toLowerCase()] : []),
  ];

  return {
    externalId: String(repo.id),
    providerId: "github",
    title: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    source: "GitHub",
    sourceDomain: domainOf(repo.html_url),
    type: isExercise ? "exercise" : "repository",
    difficulty: detectDifficulty(repo.full_name, repo.description),
    language: detectLanguage(repo.description),
    thumbnailUrl: null,
    author: repo.owner.login,
    publishedAt: repo.pushed_at,
    topics: topicSlug ? [topicSlug] : [],
    tags: [...new Set(tags.map((tag) => tag.replace(/-/g, " ")))].slice(0, 5),
    signals: {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language ?? "",
    },
  };
}

export { slugify };

/**
 * Termo de busca de cada tecnologia.
 *
 * O nome de exibição não serve como consulta: "Git & GitHub" e
 * "SQL & Bancos de dados" devolvem zero resultados, porque o `&` e as palavras
 * em português confundem a busca do GitHub. Aqui o termo é explícito.
 */
const SEARCH_TERMS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  react: "React",
  nextjs: "Next.js",
  nodejs: "Node.js",
  css: "CSS",
  docker: "Docker",
  git: "Git",
  sql: "SQL",
  ai: "machine learning",
  devops: "DevOps",
  html: "HTML",
  vue: "Vue",
  angular: "Angular",
  svelte: "Svelte",
  tailwind: "Tailwind CSS",
  go: "Golang",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  java: "Java",
  mobile: "React Native",
  testing: "testing",
  graphql: "GraphQL",
  security: "security",
  linux: "Linux",
  career: "developer career",
};

export function searchTermFor(topicSlug: string, fallback: string): string {
  // Sem termo mapeado, corta no "&" e fica com a primeira parte do nome.
  return SEARCH_TERMS[topicSlug] ?? fallback.split("&")[0].trim();
}

/**
 * Consultas usadas pela ingestão agendada.
 *
 * Buscar só o nome da tecnologia devolve as ferramentas mais estreladas que a
 * mencionam. Somar a intenção de aprendizado é o que traz coletâneas,
 * tutoriais e listas de exercícios.
 */
export function educationalQueries(term: string): string[] {
  return [`awesome ${term}`, `${term} tutorial`, `${term} exercises`];
}

/**
 * Conjunto ampliado, para a ingestão em lote.
 *
 * Cada padrão pega um tipo diferente de material — coletânea, passo a passo,
 * prática, projeto para copiar, consulta rápida, preparação para entrevista.
 * Buscar seis vezes com intenções distintas cobre muito mais do que buscar
 * seis vezes o mesmo termo.
 */
export function deepEducationalQueries(term: string): string[] {
  return [
    `awesome ${term}`,
    `${term} tutorial`,
    `${term} exercises`,
    `${term} examples`,
    `learn ${term}`,
    `${term} cheatsheet`,
    `${term} interview questions`,
    `${term} best practices`,
    `${term} roadmap`,
  ];
}
