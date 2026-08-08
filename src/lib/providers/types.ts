import type { SearchResult } from "@/types";

/**
 * Contrato dos provedores externos do DevEducation.
 *
 * Regras que valem para todos:
 *
 * 1. O provider traduz a resposta da API para `SearchResult`. Nenhum
 *    componente ou página vê o formato bruto de terceiros.
 * 2. Provider nunca é chamado no caminho de uma busca de usuário. As cotas
 *    (YouTube: 100 buscas/dia) acabariam em minutos. Eles rodam na ingestão
 *    agendada e no painel de curadoria.
 * 3. Nada entra publicado: o que a ingestão traz nasce `is_verified = false`
 *    e passa pela revisão humana, igual às sugestões da comunidade.
 * 4. Só metadados. Nunca copiamos nem hospedamos o conteúdo em si.
 */
export interface ContentProvider {
  /** Identificador estável, usado em logs e no painel de curadoria. */
  id: string;
  label: string;
  /** Falso quando faltam credenciais — a ingestão pula o provider. */
  isConfigured(): boolean;
  /**
   * Custo aproximado por chamada, na unidade da própria API. Serve para o
   * agendador não estourar cota (YouTube search.list = 100 unidades).
   */
  quotaCostPerCall: number;
  search(input: ProviderQuery): Promise<ProviderResult[]>;
}

export interface ProviderQuery {
  /** Termo de busca, normalmente o nome da tecnologia. */
  query: string;
  /** Slug do tópico do DevEducation ao qual o resultado será vinculado. */
  topicSlug?: string;
  limit?: number;
  language?: "pt" | "en" | "es";
}

/**
 * Resultado ainda não persistido. `externalId` permite deduplicar entre
 * execuções sem depender da URL, que pode mudar de forma.
 */
export interface ProviderResult
  extends Omit<SearchResult, "id" | "isVerified" | "score"> {
  externalId: string;
  providerId: string;
  /** Sinais crus da fonte (stars, views, forks) para a curadoria avaliar. */
  signals?: Record<string, number | string>;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Slug estável e legível, usado como identificador público do recurso. */
export function slugify(value: string, maxLength = 60): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);
}
