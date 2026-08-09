/**
 * De onde vem o ícone de cada coisa.
 *
 * Duas tabelas separadas de propósito: o ícone de uma tecnologia é escolha
 * editorial (o tópico "SQL & Bancos" usa o do PostgreSQL), enquanto o ícone de
 * um conteúdo vem do domínio de onde ele saiu.
 */

/** Slug do tópico → slug do simple-icons. */
const TOPIC_ICONS: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  react: "react",
  nextjs: "nextdotjs",
  nodejs: "nodedotjs",
  css: "css",
  docker: "docker",
  git: "git",
  sql: "postgresql",
  devops: "kubernetes",
  html: "html5",
  vue: "vuedotjs",
  angular: "angular",
  svelte: "svelte",
  tailwind: "tailwindcss",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  java: "kotlin",
  mobile: "dart",
  testing: "jest",
  graphql: "graphql",
  linux: "linux",
  // "Inteligência Artificial" não tem marca própria: cai no monograma.
};

/** Sufixo de domínio → slug do simple-icons. */
const DOMAIN_ICONS: [string, string][] = [
  ["youtube.com", "youtube"],
  ["youtu.be", "youtube"],
  ["github.com", "github"],
  ["github.io", "github"],
  ["developer.mozilla.org", "mdnwebdocs"],
  ["docs.docker.com", "docker"],
  ["docker.com", "docker"],
  ["react.dev", "react"],
  ["nextjs.org", "nextdotjs"],
  ["nodejs.org", "nodedotjs"],
  ["typescriptlang.org", "typescript"],
  ["docs.python.org", "python"],
  ["python.org", "python"],
  ["git-scm.com", "git"],
  ["postgresql.org", "postgresql"],
  ["kubernetes.io", "kubernetes"],
  ["scikit-learn.org", "scikitlearn"],
  ["dev.to", "devdotto"],
  ["supabase.com", "supabase"],
  ["vercel.com", "vercel"],
  ["tailwindcss.com", "tailwindcss"],
  ["developer.chrome.com", "googlechrome"],
  ["go.dev", "go"],
  ["rust-lang.org", "rust"],
  ["php.net", "php"],
  ["ruby-lang.org", "ruby"],
  ["djangoproject.com", "django"],
  ["mongodb.com", "mongodb"],
  ["redis.io", "redis"],
  ["graphql.org", "graphql"],
  ["mysql.com", "mysql"],
  ["jestjs.io", "jest"],
  ["deno.com", "deno"],
  ["bun.sh", "bun"],
  ["figma.com", "figma"],
  ["cloud.google.com", "googlecloud"],
];

export function topicIcon(slug: string): string | null {
  return TOPIC_ICONS[slug] ?? null;
}

export function domainIcon(domain: string): string | null {
  const host = domain.toLowerCase();
  for (const [suffix, icon] of DOMAIN_ICONS) {
    if (host === suffix || host.endsWith(`.${suffix}`)) return icon;
  }
  return null;
}

/** Ícone de um conteúdo: o do domínio, ou o da primeira tecnologia dele. */
export function resourceIcon(
  domain: string,
  topics: string[] = [],
): string | null {
  return domainIcon(domain) ?? topics.map(topicIcon).find(Boolean) ?? null;
}
