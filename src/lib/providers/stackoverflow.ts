import "server-only";

import type { ProviderResult } from "@/lib/providers/types";

interface SOQuestion {
  question_id: number;
  title: string;
  link: string;
  score: number;
  view_count: number;
  answer_count: number;
  is_answered: boolean;
  creation_date: number;
  tags: string[];
  owner?: { display_name?: string };
}

/**
 * As perguntas canônicas de cada tecnologia no Stack Overflow.
 *
 * Uma pergunta com centenas de votos e resposta aceita costuma ser a melhor
 * explicação existente para uma dúvida que todo mundo tem — "qual a diferença
 * entre String e str", "como concatenar strings". É material de referência, não
 * de leitura corrida.
 *
 * O piso de votos é alto de propósito: o Stack Overflow tem milhões de
 * perguntas, e trazer qualquer uma afogaria o catálogo. Só entram as que a
 * comunidade elegeu ao longo de anos.
 *
 * Sem chave são 300 requisições por dia, folgado para a ingestão.
 */
const API = "https://api.stackexchange.com/2.3/questions";

export async function fetchCanonical(
  tag: string,
  options: {
    topicSlug?: string;
    limit?: number;
    minScore?: number;
  } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 15, minScore = 80 } = options;

  const url = new URL(API);
  url.searchParams.set("order", "desc");
  url.searchParams.set("sort", "votes");
  url.searchParams.set("tagged", tag);
  url.searchParams.set("site", "stackoverflow");
  url.searchParams.set("pagesize", String(Math.min(limit, 100)));

  const response = await fetch(url, {
    headers: { "User-Agent": "DevEducation" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 400
        ? `Tag "${tag}" não existe no Stack Overflow.`
        : `Stack Overflow respondeu ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    items?: SOQuestion[];
    error_message?: string;
  };

  if (payload.error_message) throw new Error(payload.error_message);

  return (payload.items ?? [])
    .filter((q) => q.is_answered && q.score >= minScore)
    .map((question) => toResult(question, tag, topicSlug));
}

function toResult(
  question: SOQuestion,
  tag: string,
  topicSlug?: string,
): ProviderResult {
  return {
    externalId: String(question.question_id),
    providerId: "stackoverflow",
    // A API devolve o título com entidades HTML escapadas.
    title: decodeEntities(question.title),
    description: `Pergunta de referência sobre ${tag}, com ${question.score} votos, ${question.answer_count} respostas e ${question.view_count.toLocaleString("pt-BR")} visualizações.`,
    url: question.link,
    source: "Stack Overflow",
    sourceDomain: "stackoverflow.com",
    // Não existe tipo "pergunta" no catálogo. "article" é o mais próximo, e a
    // fonte visível no card deixa claro do que se trata.
    type: "article",
    difficulty: null,
    language: "en",
    thumbnailUrl: null,
    author: question.owner?.display_name ?? null,
    publishedAt: new Date(question.creation_date * 1000).toISOString(),
    topics: topicSlug ? [topicSlug] : [],
    tags: question.tags.slice(0, 4),
    signals: {
      score: question.score,
      views: question.view_count,
      answers: question.answer_count,
    },
  };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Tag do Stack Overflow de cada tecnologia.
 *
 * Assim como no DEV.to, as tags não seguem nossos slugs — e aqui uma tag
 * inexistente devolve erro 400, não uma lista vazia.
 */
const TOPIC_TAGS: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  react: "reactjs",
  nextjs: "next.js",
  nodejs: "node.js",
  css: "css",
  html: "html",
  docker: "docker",
  git: "git",
  sql: "sql",
  ai: "machine-learning",
  devops: "devops",
  vue: "vue.js",
  angular: "angular",
  svelte: "svelte",
  tailwind: "tailwind-css",
  go: "go",
  rust: "rust",
  php: "php",
  ruby: "ruby",
  java: "java",
  mobile: "react-native",
  testing: "unit-testing",
  graphql: "graphql",
  security: "security",
  linux: "linux",
};

export function stackTagFor(topicSlug: string): string | null {
  return TOPIC_TAGS[topicSlug] ?? null;
}
