import "server-only";

import {
  detectDifficulty,
  detectLanguage,
  domainOf,
  type ProviderResult,
} from "@/lib/providers/types";

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
  author: string;
}

/**
 * Artigos técnicos que passaram pelo crivo do Hacker News.
 *
 * O que o HN acrescenta ao catálogo não é volume, é filtro: uma publicação com
 * centenas de pontos foi lida e discutida por milhares de desenvolvedores. É o
 * sinal de qualidade mais barato que existe — não há API para pagar nem chave
 * para gerenciar, e a curadoria da comunidade já aconteceu.
 *
 * A API de busca é a do Algolia, aberta e sem autenticação.
 */
const API = "https://hn.algolia.com/api/v1/search";

export async function fetchDiscussed(
  query: string,
  options: {
    topicSlug?: string;
    limit?: number;
    /** Piso de pontos: abaixo disso a discussão não aconteceu de fato. */
    minPoints?: number;
  } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 20, minPoints = 100 } = options;

  const url = new URL(API);
  url.searchParams.set("query", query);
  url.searchParams.set("tags", "story");
  url.searchParams.set("hitsPerPage", String(Math.min(limit, 100)));
  url.searchParams.set("numericFilters", `points>${minPoints}`);

  const response = await fetch(url, {
    headers: { "User-Agent": "DevEducation" },
    next: { revalidate: 21600 },
  });

  if (!response.ok) {
    throw new Error(`Hacker News respondeu ${response.status}`);
  }

  const payload = (await response.json()) as { hits: HNHit[] };

  return (
    payload.hits
      // Sem URL são discussões escritas no próprio HN (Ask HN, Show HN). Não
      // apontam para material de estudo, que é o que catalogamos.
      .filter((hit) => hit.url && hit.title)
      .map((hit) => toResult(hit, topicSlug))
  );
}

function toResult(hit: HNHit, topicSlug?: string): ProviderResult {
  const url = hit.url!;

  return {
    externalId: hit.objectID,
    providerId: "hackernews",
    title: hit.title.trim(),
    // O HN não guarda resumo; a descrição registra o sinal que importa.
    description: `Discutido no Hacker News com ${hit.points} pontos e ${hit.num_comments} comentários.`,
    url,
    source: domainOf(url) || "Hacker News",
    sourceDomain: domainOf(url),
    type: "article",
    difficulty: detectDifficulty(hit.title),
    language: detectLanguage(hit.title),
    thumbnailUrl: null,
    author: hit.author,
    publishedAt: hit.created_at,
    topics: topicSlug ? [topicSlug] : [],
    tags: ["hacker news"],
    signals: { points: hit.points, comments: hit.num_comments },
  };
}
