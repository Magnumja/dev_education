import "server-only";

import {
  detectDifficulty,
  detectLanguage,
  type ProviderResult,
} from "@/lib/providers/types";

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  published_at: string;
  tag_list: string[];
  reading_time_minutes: number;
  positive_reactions_count: number;
  user: { name: string };
}

/**
 * Artigos técnicos do DEV.to (Forem).
 *
 * Preenche o buraco mais visível do catálogo: havia cinco artigos contra
 * centenas de vídeos e repositórios. É gratuito, não exige chave e tem um bom
 * volume em português nas tags da comunidade brasileira.
 *
 * `top` filtra pelos mais bem recebidos do período em vez dos mais recentes —
 * o feed cru do DEV.to tem muito conteúdo raso, e a contagem de reações é o
 * sinal de qualidade que a própria plataforma oferece.
 */
const API = "https://dev.to/api/articles";

export async function fetchArticles(
  tag: string,
  options: {
    topicSlug?: string;
    limit?: number;
    /** Janela em dias para o ranking por reações. */
    topDays?: number;
    minReactions?: number;
  } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 20, topDays = 365, minReactions = 8 } = options;

  const url = new URL(API);
  url.searchParams.set("tag", tag);
  url.searchParams.set("per_page", String(Math.min(limit, 100)));
  url.searchParams.set("top", String(topDays));

  const response = await fetch(url, {
    headers: { "User-Agent": "DevEducation", Accept: "application/json" },
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "DEV.to limitou as requisições. Tente em alguns minutos."
        : `DEV.to respondeu ${response.status}`,
    );
  }

  const articles = (await response.json()) as DevToArticle[];

  return articles
    .filter((article) => article.positive_reactions_count >= minReactions)
    .map((article) => toResult(article, topicSlug));
}

function toResult(article: DevToArticle, topicSlug?: string): ProviderResult {
  return {
    externalId: String(article.id),
    providerId: "devto",
    title: article.title.trim(),
    description: article.description?.trim() || null,
    url: article.url,
    source: "DEV.to",
    sourceDomain: "dev.to",
    type: "article",
    difficulty: detectDifficulty(article.title, article.description),
    language: detectLanguage(article.title, article.description),
    thumbnailUrl: article.cover_image,
    author: article.user.name,
    publishedAt: article.published_at,
    topics: topicSlug ? [topicSlug] : [],
    tags: article.tag_list.slice(0, 4),
    signals: {
      reactions: article.positive_reactions_count,
      readingMinutes: article.reading_time_minutes,
    },
  };
}

/**
 * Tag do DEV.to correspondente a cada tecnologia do catálogo.
 *
 * As tags de lá não seguem os nossos slugs: "nextjs" e não "next.js",
 * "machinelearning" numa palavra só. Sem este mapa, metade das buscas voltaria
 * vazia sem erro nenhum.
 */
const TOPIC_TAGS: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  react: "react",
  nextjs: "nextjs",
  nodejs: "node",
  css: "css",
  html: "html",
  docker: "docker",
  git: "git",
  sql: "sql",
  ai: "machinelearning",
  devops: "devops",
  vue: "vue",
  angular: "angular",
  svelte: "svelte",
  tailwind: "tailwindcss",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  java: "java",
  mobile: "reactnative",
  testing: "testing",
  graphql: "graphql",
  security: "security",
  linux: "linux",
  career: "career",
};

export function devtoTagFor(topicSlug: string): string | null {
  return TOPIC_TAGS[topicSlug] ?? null;
}

/** Tags da comunidade lusófona, sem tecnologia fixa. */
export const PORTUGUESE_TAGS = ["braziliandevs", "portugues", "brasil"];
