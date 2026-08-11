import "server-only";

import { detectDifficulty, type ProviderResult } from "@/lib/providers/types";

/**
 * Artigos científicos do arXiv.
 *
 * É a fonte certa para visão computacional e redes neurais: praticamente todo
 * trabalho relevante da área aparece aqui antes de sair em conferência, o PDF
 * é sempre aberto, não há chave para gerenciar e não há cota.
 *
 * O Google Scholar ficou de fora porque não tem API pública — o termo de uso
 * proíbe raspagem e o bloqueio por IP vem em minutos.
 *
 * A API devolve Atom (XML), não JSON. A extração abaixo é feita à mão, com
 * expressões regulares presas à estrutura de cada `<entry>`: é um formato
 * estável há mais de quinze anos e não vale uma dependência de parser.
 */
const API = "https://export.arxiv.org/api/query";

/**
 * Categorias do arXiv que interessam ao catálogo.
 *
 * O rótulo vira nome legível na descrição, já que "cs.CV" não diz nada a quem
 * está começando.
 */
export const CATEGORIAS = {
  "cs.CV": "visão computacional",
  "cs.NE": "redes neurais",
  "cs.LG": "aprendizado de máquina",
  "cs.AI": "inteligência artificial",
  "cs.CL": "processamento de linguagem natural",
  "cs.RO": "robótica",
  "stat.ML": "aprendizado estatístico",
} as const;

export type CategoriaArxiv = keyof typeof CATEGORIAS;

interface Entrada {
  id: string;
  titulo: string;
  resumo: string;
  publicado: string;
  autores: string[];
  categorias: string[];
}

export async function fetchPapers(
  categoria: CategoriaArxiv,
  options: {
    topicSlug?: string;
    limit?: number;
    /** Deslocamento, para varrer além dos mais recentes. */
    offset?: number;
  } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 50, offset = 0 } = options;

  const url = new URL(API);
  url.searchParams.set("search_query", `cat:${categoria}`);
  url.searchParams.set("start", String(offset));
  // O teto da API é 2000 por requisição; 100 mantém a resposta leve.
  url.searchParams.set("max_results", String(Math.min(limit, 100)));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const response = await fetch(url, {
    headers: { "User-Agent": "DevEducation (catalogo educacional)" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`arXiv respondeu ${response.status}`);
  }

  const xml = await response.text();

  return parseEntradas(xml)
    .filter(vaiPraCatalogo)
    .map((entrada) => toResult(entrada, categoria, topicSlug));
}

/**
 * Filtro de qualidade. Sem ele entram anúncios de retirada e resumos de uma
 * linha, que ocupam espaço na fila de curadoria sem ensinar nada.
 */
function vaiPraCatalogo(entrada: Entrada): boolean {
  if (entrada.resumo.length < 120) return false;
  if (/^\s*(this (paper|submission) has been withdrawn|withdrawn)/i.test(entrada.resumo)) {
    return false;
  }
  return entrada.titulo.length > 15;
}

function parseEntradas(xml: string): Entrada[] {
  const entradas: Entrada[] = [];

  for (const bloco of xml.split("<entry>").slice(1)) {
    const corpo = bloco.split("</entry>")[0];

    const id = tag(corpo, "id");
    const titulo = tag(corpo, "title");
    const resumo = tag(corpo, "summary");
    if (!id || !titulo || !resumo) continue;

    entradas.push({
      id,
      titulo,
      resumo,
      publicado: tag(corpo, "published") ?? "",
      autores: [...corpo.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) =>
        limpar(m[1]),
      ),
      categorias: [...corpo.matchAll(/<category term="([^"]+)"/g)].map(
        (m) => m[1],
      ),
    });
  }

  return entradas;
}

function tag(corpo: string, nome: string): string | null {
  const match = corpo.match(new RegExp(`<${nome}>([\\s\\S]*?)</${nome}>`));
  return match ? limpar(match[1]) : null;
}

/** O arXiv quebra título e resumo em várias linhas indentadas. */
function limpar(valor: string): string {
  return valor
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function toResult(
  entrada: Entrada,
  categoria: CategoriaArxiv,
  topicSlug?: string,
): ProviderResult {
  // O id vem como http://arxiv.org/abs/2012.11486v1 — a versão sai para o
  // mesmo trabalho não entrar de novo a cada revisão publicada.
  const externalId = entrada.id
    .replace(/^https?:\/\/arxiv\.org\/abs\//, "")
    .replace(/v\d+$/, "");

  const outras = entrada.categorias
    .filter((c): c is CategoriaArxiv => c in CATEGORIAS && c !== categoria)
    .map((c) => CATEGORIAS[c]);

  return {
    externalId,
    providerId: "arxiv",
    title: entrada.titulo,
    description: entrada.resumo.slice(0, 600),
    // A página do abstract, e não o PDF: ela traz o resumo, a lista de versões
    // e o link do PDF. Quem só quer o PDF chega lá em um clique.
    url: `https://arxiv.org/abs/${externalId}`,
    source: "arXiv",
    sourceDomain: "arxiv.org",
    // Artigo, e não PDF: no catálogo "pdf" é a prateleira de livros e apostilas.
    type: "article",
    // Todo paper é leitura avançada, independentemente das palavras do resumo.
    difficulty: detectDifficulty(entrada.titulo) ?? "advanced",
    // O arXiv é integralmente em inglês.
    language: "en",
    thumbnailUrl: null,
    author: formatarAutores(entrada.autores),
    publishedAt: entrada.publicado || null,
    topics: topicSlug ? [topicSlug] : [],
    tags: ["artigo científico", CATEGORIAS[categoria], ...outras],
    signals: { arxiv_category: categoria, autores: entrada.autores.length },
  };
}

/** "Fulano, Beltrano e mais 4" — a lista inteira estoura o campo. */
function formatarAutores(autores: string[]): string | null {
  if (autores.length === 0) return null;
  if (autores.length <= 2) return autores.join(" e ");
  return `${autores.slice(0, 2).join(", ")} e mais ${autores.length - 2}`;
}
