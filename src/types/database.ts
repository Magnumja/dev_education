import type {
  Difficulty,
  ResourceLanguage,
  ResourceType,
  SubmissionStatus,
  UserRole,
} from "@/types";

/**
 * Contrato mínimo do banco consumido pela aplicação.
 *
 * Mantido à mão de propósito: descreve apenas o que o app realmente lê ou
 * escreve. Para regenerar a partir do projeto real:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ResourceRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  source_domain: string;
  resource_type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  thumbnail_url: string | null;
  author: string | null;
  published_at: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Linha devolvida pela função search_resources (ver 0003_search.sql). */
export interface SearchResourceRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  source_domain: string;
  resource_type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  thumbnail_url: string | null;
  author: string | null;
  published_at: string | null;
  is_verified: boolean;
  topics: string[];
  tags: string[];
  score: number;
  total_count: number;
  /** Média das avaliações; ausente nas consultas que não a solicitam. */
  rating_avg?: number | null;
  rating_count?: number | null;
}

export interface SubmissionRow {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  status: SubmissionStatus;
  review_note: string | null;
  created_at: string;
}
