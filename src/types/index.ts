/**
 * Tipos de domínio do DevEducation.
 *
 * `SearchResult` é o formato interno canônico: todo provider externo
 * (YouTube, GitHub, banco) traduz sua resposta para cá. Nenhum componente
 * deve consumir o formato bruto de uma API de terceiro.
 */

export const RESOURCE_TYPES = [
  "video",
  "documentation",
  "article",
  "pdf",
  "exercise",
  "repository",
  "course",
  "tool",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const LANGUAGES = ["pt", "en", "es", "other"] as const;
export type ResourceLanguage = (typeof LANGUAGES)[number];

export type SubmissionStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "curator" | "admin";

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** Formato canônico consumido pela UI, venha de onde vier. */
export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  sourceDomain: string;
  type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  thumbnailUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  isVerified: boolean;
  topics: string[];
  tags: string[];
  /** Score do ranking central — ausente quando não houve busca. */
  score?: number;
}

export type SortOption = "relevance" | "rating" | "recent";

export interface SearchFiltersState {
  query: string;
  types: ResourceType[];
  difficulties: Difficulty[];
  languages: ResourceLanguage[];
  topics: string[];
  sort: SortOption;
  page: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

/** Dados mínimos da sessão exibidos no shell (barra lateral e topo). */
export interface SessionUser {
  name: string;
  email: string | null;
  avatarUrl: string | null;
}
