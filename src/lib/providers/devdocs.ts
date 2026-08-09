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

async function loadIndex(): Promise<DevDocsEntry[]> {
  const response = await fetch(INDEX_URL, {
    // O índice muda pouco: um dia de cache é folgado.
    next: { revalidate: 86400 },
    headers: { "User-Agent": "DevEducation" },
  });

  if (!response.ok) {
    throw new Error(`DevDocs respondeu ${response.status}`);
  }

  return (await response.json()) as DevDocsEntry[];
}

/** Uma entrada por tecnologia: o DevDocs lista várias versões do mesmo doc. */
function latestPerName(entries: DevDocsEntry[]): DevDocsEntry[] {
  const byName = new Map<string, DevDocsEntry>();

  for (const entry of entries) {
    if (!entry.links?.home) continue;

    const key = entry.name.toLowerCase();
    const current = byName.get(key);
    if (!current || (entry.release ?? "") > (current.release ?? "")) {
      byName.set(key, entry);
    }
  }

  return [...byName.values()];
}

export async function fetchDocumentation(
  query: string,
  options: { topicSlug?: string; limit?: number } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 10 } = options;
  const term = query.trim().toLowerCase();

  const matches = (await loadIndex()).filter(
    (entry) =>
      entry.name.toLowerCase().includes(term) ||
      entry.slug.toLowerCase().includes(term),
  );

  return latestPerName(matches)
    .slice(0, limit)
    .map((entry) => toResult(entry, topicSlug));
}

/**
 * Índice inteiro do DevDocs — centenas de documentações oficiais numa única
 * requisição, sem chave e sem cota.
 *
 * É a forma mais barata de dar volume real ao catálogo: em vez de descobrir
 * documentação uma tecnologia por vez, traz todas de uma vez e deixa a
 * curadoria escolher. Nada é publicado automaticamente.
 */
export async function fetchAllDocumentation(): Promise<ProviderResult[]> {
  return latestPerName(await loadIndex()).map((entry) => toResult(entry));
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
