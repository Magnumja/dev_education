import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Difficulty, ResourceLanguage, ResourceType } from "@/types";

export const QUEUE_PAGE_SIZE = 40;

/**
 * Teto de itens publicados por clique na ação em lote.
 *
 * Vive aqui, e não junto da Server Action, porque um arquivo "use server" só
 * pode exportar funções assíncronas — constante ali quebra o build.
 */
export const PUBLISH_BATCH_LIMIT = 50;

export interface QueueFilters {
  provider?: string;
  type?: string;
  language?: string;
  page: number;
}

export interface QueueItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source_domain: string;
  resource_type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  provider: string | null;
  provider_signals: { stars?: number } | null;
  discovered_at: string | null;
}

export interface QueueFacet {
  value: string;
  count: number;
}

export function parseQueueFilters(
  params: Record<string, string | string[] | undefined>,
): QueueFilters {
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return {
    provider: one(params.provider) || undefined,
    type: one(params.type) || undefined,
    language: one(params.lang) || undefined,
    page: Math.max(Number.parseInt(one(params.page) ?? "1", 10) || 1, 1),
  };
}

export function queueQueryString(
  filters: QueueFilters,
  overrides: Partial<QueueFilters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.provider) params.set("provider", merged.provider);
  if (merged.type) params.set("type", merged.type);
  if (merged.language) params.set("lang", merged.language);
  if (merged.page > 1) params.set("page", String(merged.page));

  return params.toString();
}

/**
 * A fila com filtro e paginação.
 *
 * Com centenas de itens importados, listar tudo de uma vez não ajuda ninguém:
 * a curadoria precisa recortar ("só documentação", "só em português") e agir
 * sobre o recorte.
 */
export async function getQueue(filters: QueueFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("resources")
    .select(
      "id, slug, title, description, url, source_domain, resource_type, difficulty, language, provider, provider_signals, discovered_at",
      { count: "exact" },
    )
    .eq("is_active", false)
    .not("provider", "is", null);

  if (filters.provider) query = query.eq("provider", filters.provider);
  if (filters.type) query = query.eq("resource_type", filters.type);
  if (filters.language) query = query.eq("language", filters.language);

  const from = (filters.page - 1) * QUEUE_PAGE_SIZE;

  const { data, count, error } = await query
    .order("discovered_at", { ascending: false })
    .range(from, from + QUEUE_PAGE_SIZE - 1);

  if (error) console.error("Falha ao carregar a fila:", error);

  return {
    items: (data ?? []) as unknown as QueueItem[],
    total: count ?? 0,
  };
}

/** Contagens por provider, tipo e idioma, para montar os filtros. */
export async function getQueueFacets(): Promise<{
  providers: QueueFacet[];
  types: QueueFacet[];
  languages: QueueFacet[];
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("resources")
    .select("provider, resource_type, language")
    .eq("is_active", false)
    .not("provider", "is", null)
    .limit(5000);

  const rows = (data ?? []) as {
    provider: string;
    resource_type: string;
    language: string;
  }[];

  const tally = (key: keyof (typeof rows)[number]): QueueFacet[] => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
    }
    return [...counts]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    providers: tally("provider"),
    types: tally("resource_type"),
    languages: tally("language"),
  };
}
