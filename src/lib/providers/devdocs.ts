import "server-only";

import type { ProviderResult } from "@/lib/providers/types";

interface DevDocsEntry {
  name: string;
  slug: string;
  release?: string;
  links?: { home?: string; code?: string };
}

/**
 * Documentações oficiais catalogadas pelo DevDocs (projeto MIT).
 *
 * Não copiamos o conteúdo: usamos o índice deles apenas para descobrir a
 * página oficial de cada tecnologia e apontar para lá.
 */
const INDEX_URL = "https://devdocs.io/docs.json";

export async function fetchDocumentation(
  query: string,
  options: { topicSlug?: string; limit?: number } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 10 } = options;

  const response = await fetch(INDEX_URL, {
    // O índice muda pouco: um dia de cache é folgado.
    next: { revalidate: 86400 },
    headers: { "User-Agent": "DevEducation" },
  });

  if (!response.ok) {
    throw new Error(`DevDocs respondeu ${response.status}`);
  }

  const entries = (await response.json()) as DevDocsEntry[];
  const term = query.trim().toLowerCase();

  const matches = entries.filter((entry) => {
    if (!entry.links?.home) return false;
    return (
      entry.name.toLowerCase().includes(term) ||
      entry.slug.toLowerCase().includes(term)
    );
  });

  // Uma entrada por tecnologia: o DevDocs lista várias versões do mesmo doc.
  const byName = new Map<string, DevDocsEntry>();
  for (const entry of matches) {
    const key = entry.name.toLowerCase();
    const current = byName.get(key);
    if (!current || (entry.release ?? "") > (current.release ?? "")) {
      byName.set(key, entry);
    }
  }

  return [...byName.values()].slice(0, limit).map((entry) => toResult(entry, topicSlug));
}

function toResult(entry: DevDocsEntry, topicSlug?: string): ProviderResult {
  // `links.home` é a página do projeto, não a documentação. O conteúdo em si
  // vive no leitor do DevDocs, então é para lá que apontamos — e o título diz
  // isso, em vez de fingir ser o site oficial.
  const url = `https://devdocs.io/${entry.slug}`;

  return {
    externalId: entry.slug,
    providerId: "devdocs",
    title: `${entry.name} — documentação de referência`,
    description: `Documentação de ${entry.name}${
      entry.release ? ` ${entry.release}` : ""
    } no DevDocs: busca instantânea sobre a documentação oficial, com acesso offline.`,
    url,
    source: "DevDocs",
    sourceDomain: "devdocs.io",
    type: "documentation",
    difficulty: null,
    language: "en",
    thumbnailUrl: null,
    author: null,
    publishedAt: null,
    topics: topicSlug ? [topicSlug] : [],
    tags: ["referência", "oficial"],
    signals: { release: entry.release ?? "" },
  };
}
