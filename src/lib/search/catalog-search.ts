import { RESOURCES } from "@/lib/data/resources";
import { normalize, scoreResource, tokenize } from "@/lib/ranking/score";
import { RESULTS_PER_PAGE } from "@/constants";
import type {
  SearchFiltersState,
  SearchResponse,
  SearchResult,
} from "@/types";

/**
 * Busca sobre o catálogo curado em memória.
 *
 * É o provider padrão enquanto o Supabase não está configurado, e continua
 * servindo como fallback. A ordenação usa a mesma função de ranking que a
 * versão em PostgreSQL usará, para que os resultados sejam consistentes.
 */
export function searchCatalog(
  filters: Partial<SearchFiltersState>,
  pageSize: number = RESULTS_PER_PAGE,
): SearchResponse {
  const {
    query = "",
    types = [],
    difficulties = [],
    languages = [],
    topics = [],
    sort = "relevance",
    page = 1,
  } = filters;

  const tokens = tokenize(query);

  let matched = RESOURCES.filter((resource) => {
    if (types.length && !types.includes(resource.type)) return false;
    if (
      difficulties.length &&
      (!resource.difficulty || !difficulties.includes(resource.difficulty))
    ) {
      return false;
    }
    if (languages.length && !languages.includes(resource.language)) return false;
    if (topics.length && !resource.topics.some((t) => topics.includes(t))) {
      return false;
    }
    return tokens.length === 0 || matchesTokens(resource, tokens);
  });

  matched = sortResults(matched, query, sort);

  const start = (Math.max(page, 1) - 1) * pageSize;

  return {
    results: matched.slice(start, start + pageSize),
    total: matched.length,
    page: Math.max(page, 1),
    pageSize,
  };
}

function matchesTokens(resource: SearchResult, tokens: string[]): boolean {
  const haystack = normalize(
    [
      resource.title,
      resource.description ?? "",
      resource.source,
      ...resource.topics,
      ...resource.tags,
    ].join(" "),
  );
  return tokens.some((token) => haystack.includes(token));
}

function sortResults(
  results: SearchResult[],
  query: string,
  sort: SearchFiltersState["sort"],
): SearchResult[] {
  const scored = results.map((resource) => ({
    ...resource,
    score: scoreResource(resource, query),
  }));

  if (sort === "recent") {
    return scored.sort(
      (a, b) => timestamp(b.publishedAt) - timestamp(a.publishedAt),
    );
  }

  // "rating" ainda não tem avaliações de usuários: cai no ranking curado,
  // que já pondera verificação e autoridade da fonte.
  return scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

function timestamp(date: string | null): number {
  if (!date) return 0;
  const value = new Date(date).getTime();
  return Number.isNaN(value) ? 0 : value;
}

/** Recursos de um tópico, já ordenados pelo ranking curado. */
export function resourcesByTopic(topicSlug: string): SearchResult[] {
  return sortResults(
    RESOURCES.filter((resource) => resource.topics.includes(topicSlug)),
    "",
    "relevance",
  );
}

/** Seleção editorial para a Home: os melhores itens verificados. */
export function featuredResources(limit = 6): SearchResult[] {
  return sortResults(
    RESOURCES.filter((resource) => resource.isVerified),
    "",
    "relevance",
  ).slice(0, limit);
}
