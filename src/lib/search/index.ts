import "server-only";

import { RESULTS_PER_PAGE } from "@/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { searchCatalog } from "@/lib/search/catalog-search";
import { expandQuery } from "@/lib/search/aliases";
import type { SearchResourceRow } from "@/types/database";
import type {
  SearchFiltersState,
  SearchResponse,
  SearchResult,
} from "@/types";

/**
 * Ponto único de entrada da busca.
 *
 * Com Supabase configurado, delega à função `search_resources` (Full Text
 * Search + ranking em SQL). Sem ele, cai no catálogo curado local. Os dois
 * caminhos devolvem exatamente o mesmo `SearchResponse`.
 */
export async function search(
  filters_: Partial<SearchFiltersState>,
  options: { limit?: number } = {},
): Promise<SearchResponse> {
  const pageSize = options.limit ?? RESULTS_PER_PAGE;

  // Traduz apelidos ("reactjs" → "react") antes de qualquer consulta, para os
  // dois caminhos — banco e catálogo local — enxergarem o mesmo termo.
  const filters = filters_.query
    ? { ...filters_, query: expandQuery(filters_.query) }
    : filters_;

  if (!isSupabaseConfigured) return searchCatalog(filters, pageSize);

  const page = Math.max(filters.page ?? 1, 1);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_resources", {
      p_query: filters.query ?? "",
      p_types: filters.types?.length ? filters.types : null,
      p_levels: filters.difficulties?.length ? filters.difficulties : null,
      p_langs: filters.languages?.length ? filters.languages : null,
      p_topics: filters.topics?.length ? filters.topics : null,
      p_sort: filters.sort ?? "relevance",
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    });

    if (error) throw error;

    const rows = (data ?? []) as SearchResourceRow[];

    return {
      results: rows.map(toSearchResult),
      total: rows[0]?.total_count ?? 0,
      page,
      pageSize,
    };
  } catch (error) {
    // Uma indisponibilidade do banco não pode derrubar a descoberta:
    // o catálogo curado responde no lugar.
    console.error("Falha na busca via Supabase, usando catálogo local:", error);
    return searchCatalog(filters, pageSize);
  }
}

export function toSearchResult(row: SearchResourceRow): SearchResult {
  return {
    // O slug é o identificador público — mantém /resource/<slug> legível.
    id: row.slug,
    title: row.title,
    description: row.description,
    url: row.url,
    source: row.source,
    sourceDomain: row.source_domain,
    type: row.resource_type,
    difficulty: row.difficulty,
    language: row.language,
    thumbnailUrl: row.thumbnail_url,
    author: row.author,
    publishedAt: row.published_at,
    isVerified: row.is_verified,
    topics: row.topics ?? [],
    tags: row.tags ?? [],
    score: row.score,
    rating: row.rating_avg ?? null,
    ratingCount: row.rating_count ?? 0,
  };
}
