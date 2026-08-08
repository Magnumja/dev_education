import {
  DIFFICULTIES,
  LANGUAGES,
  RESOURCE_TYPES,
  type Difficulty,
  type ResourceLanguage,
  type ResourceType,
  type SearchFiltersState,
  type SortOption,
} from "@/types";

const SORTS: SortOption[] = ["relevance", "rating", "recent"];

/** Único ponto de tradução entre a URL e o estado de filtros. */
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): SearchFiltersState {
  return {
    query: single(params.q) ?? "",
    types: list(params.type).filter(isResourceType),
    difficulties: list(params.level).filter(isDifficulty),
    languages: list(params.lang).filter(isLanguage),
    topics: list(params.topic),
    sort: asSort(single(params.sort)),
    page: Math.max(Number.parseInt(single(params.page) ?? "1", 10) || 1, 1),
  };
}

export function buildSearchQuery(filters: SearchFiltersState): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  for (const type of filters.types) params.append("type", type);
  for (const level of filters.difficulties) params.append("level", level);
  for (const lang of filters.languages) params.append("lang", lang);
  for (const topic of filters.topics) params.append("topic", topic);
  if (filters.sort !== "relevance") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function hasActiveFilters(filters: SearchFiltersState): boolean {
  return (
    filters.types.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.languages.length > 0 ||
    filters.topics.length > 0
  );
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asSort(value: string | undefined): SortOption {
  return SORTS.includes(value as SortOption)
    ? (value as SortOption)
    : "relevance";
}

function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value);
}

function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

function isLanguage(value: string): value is ResourceLanguage {
  return (LANGUAGES as readonly string[]).includes(value);
}
