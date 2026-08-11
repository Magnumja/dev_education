import "server-only";

import { domainOf, type ProviderResult } from "@/lib/providers/types";

/**
 * Artigos científicos de acesso aberto, via OpenAlex.
 *
 * O arXiv cobre o que é publicado como preprint; o OpenAlex cobre o resto —
 * Nature, IEEE, ACM, revistas e conferências — e é catálogo aberto, sem chave
 * e sem cota. O par dá conta do que se esperaria do Google Scholar, que não
 * tem API pública.
 *
 * Dois filtros carregam o peso da qualidade aqui: `is_oa` garante que o texto
 * completo está disponível de graça (não adianta catalogar o que está atrás de
 * paywall), e a ordenação por citações traz o que a área de fato leu.
 */
const API = "https://api.openalex.org/works";

/**
 * O OpenAlex pede um e-mail de contato para liberar a fila rápida. Sem ele a
 * requisição vai para a fila comum, mais lenta e sujeita a estrangulamento.
 */
const CONTATO = process.env.OPENALEX_CONTACT_EMAIL?.trim();

const CAMPOS = [
  "id",
  "doi",
  "display_name",
  "publication_date",
  "language",
  "cited_by_count",
  "authorships",
  "best_oa_location",
  "primary_location",
  "abstract_inverted_index",
].join(",");

interface Obra {
  id: string;
  doi: string | null;
  display_name: string | null;
  publication_date: string | null;
  language: string | null;
  cited_by_count: number;
  authorships: { author: { display_name: string } }[];
  best_oa_location: {
    pdf_url: string | null;
    landing_page_url: string | null;
  } | null;
  primary_location: { source: { display_name: string } | null } | null;
  abstract_inverted_index: Record<string, number[]> | null;
}

export async function fetchOpenAccess(
  query: string,
  options: {
    topicSlug?: string;
    limit?: number;
    /** Piso de citações: abaixo disso o trabalho ainda não foi lido. */
    minCitations?: number;
    /** Ano mínimo de publicação. */
    since?: number;
  } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 50, minCitations = 20, since = 2018 } = options;

  const url = new URL(API);
  url.searchParams.set(
    "filter",
    [
      // Busca só em título e resumo. O `search` solto varre o texto inteiro e
      // devolve trabalhos que apenas citam o termo de passagem.
      `title_and_abstract.search:${query}`,
      "is_oa:true",
      "type:article",
      `cited_by_count:>${minCitations}`,
      `from_publication_date:${since}-01-01`,
    ].join(","),
  );
  url.searchParams.set("sort", "cited_by_count:desc");
  url.searchParams.set("per-page", String(Math.min(limit, 200)));
  url.searchParams.set("select", CAMPOS);
  if (CONTATO) url.searchParams.set("mailto", CONTATO);

  const response = await fetch(url, {
    headers: { "User-Agent": "DevEducation (catalogo educacional)" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`OpenAlex respondeu ${response.status}`);
  }

  const payload = (await response.json()) as { results: Obra[] };

  return payload.results.flatMap((obra) => {
    const resultado = toResult(obra, topicSlug);
    return resultado ? [resultado] : [];
  });
}

function toResult(obra: Obra, topicSlug?: string): ProviderResult | null {
  const titulo = obra.display_name?.trim();
  if (!titulo || titulo.length < 15) return null;

  // Sem link aberto não há o que catalogar: o item viraria um beco sem saída.
  const url =
    obra.best_oa_location?.landing_page_url ??
    obra.best_oa_location?.pdf_url ??
    obra.doi;
  if (!url) return null;

  const resumo = montarResumo(obra.abstract_inverted_index);
  if (!resumo || resumo.length < 120) return null;

  const fonte = obra.primary_location?.source?.display_name ?? domainOf(url);

  return {
    externalId: obra.id.replace("https://openalex.org/", ""),
    providerId: "openalex",
    title: titulo,
    description: resumo.slice(0, 600),
    url,
    source: fonte || "OpenAlex",
    sourceDomain: domainOf(url),
    type: "article",
    difficulty: "advanced",
    // O campo do OpenAlex é ISO; o catálogo só distingue estes três.
    language:
      obra.language === "pt" ? "pt" : obra.language === "es" ? "es" : "en",
    thumbnailUrl: null,
    author: formatarAutores(
      obra.authorships.map((a) => a.author.display_name).filter(Boolean),
    ),
    publishedAt: obra.publication_date,
    topics: topicSlug ? [topicSlug] : [],
    tags: ["artigo científico", "acesso aberto"],
    signals: { citacoes: obra.cited_by_count, fonte: fonte ?? "" },
  };
}

/**
 * O OpenAlex não guarda o resumo como texto: guarda um índice invertido,
 * `{ palavra: [posições] }`, por questão de licenciamento. Remontar é só
 * espalhar cada palavra nas suas posições e ler o vetor em ordem.
 */
function montarResumo(indice: Record<string, number[]> | null): string | null {
  if (!indice) return null;

  const palavras: string[] = [];
  for (const [palavra, posicoes] of Object.entries(indice)) {
    for (const posicao of posicoes) palavras[posicao] = palavra;
  }

  const texto = palavras.filter(Boolean).join(" ").trim();
  return texto || null;
}

function formatarAutores(autores: string[]): string | null {
  if (autores.length === 0) return null;
  if (autores.length <= 2) return autores.join(" e ");
  return `${autores.slice(0, 2).join(", ")} e mais ${autores.length - 2}`;
}
