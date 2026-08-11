import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, type ProviderResult } from "@/lib/providers/types";
import { githubProvider } from "@/lib/providers/github";
import {
  fetchAllDocumentation,
  fetchDocumentation,
} from "@/lib/providers/devdocs";
import {
  fetchChannelVideos,
  resolveChannelId,
} from "@/lib/providers/youtube";
import { fetchArticles } from "@/lib/providers/devto";
import { fetchDiscussed } from "@/lib/providers/hackernews";
import { fetchCanonical } from "@/lib/providers/stackoverflow";
import { fetchPapers, type CategoriaArxiv } from "@/lib/providers/arxiv";
import { fetchOpenAccess } from "@/lib/providers/openalex";

export interface IngestReport {
  provider: string;
  found: number;
  inserted: number;
  skipped: number;
  error?: string;
}

/**
 * Grava o que os providers trouxeram.
 *
 * Duas regras inegociáveis:
 *
 * 1. Nada nasce publicado. `is_active = false` e `is_verified = false`:
 *    o material fica na fila de descobertas até um curador aprovar.
 * 2. Nunca sobrescrevemos um recurso existente. Se a URL ou o par
 *    (provider, external_id) já estiver no catálogo, o item é ignorado —
 *    edições da curadoria não podem ser desfeitas por uma importação.
 */
async function persist(results: ProviderResult[]): Promise<{
  inserted: number;
  skipped: number;
}> {
  if (results.length === 0) return { inserted: 0, skipped: 0 };

  const supabase = createAdminClient();

  // Deduplica por URL e pelo par (provider, external_id): a mesma coisa pode
  // voltar com a URL levemente diferente entre execuções.
  const providerId = results[0].providerId;
  const [byUrl, byExternal] = await Promise.all([
    supabase
      .from("resources")
      .select("url")
      .in("url", results.map((result) => result.url)),
    supabase
      .from("resources")
      .select("external_id")
      .eq("provider", providerId)
      .in("external_id", results.map((result) => result.externalId)),
  ]);

  const knownUrls = new Set(
    ((byUrl.data ?? []) as { url: string }[]).map((row) => row.url),
  );
  const knownExternal = new Set(
    ((byExternal.data ?? []) as { external_id: string }[]).map(
      (row) => row.external_id,
    ),
  );

  const fresh = results.filter(
    (result) =>
      !knownUrls.has(result.url) && !knownExternal.has(result.externalId),
  );
  if (fresh.length === 0) return { inserted: 0, skipped: results.length };

  // Títulos diferentes podem gerar o mesmo slug depois de normalizados e
  // cortados — dois artigos "Docker: guia..." colidem. Como o slug é UNIQUE,
  // uma colisão derrubava a gravação inteira do lote, não só a linha repetida.
  const slugs = await resolveSlugs(fresh);

  const now = new Date().toISOString();
  const rows = fresh.map((result) => ({
    slug: slugs.get(result.externalId)!,
    title: trim(result.title, 200),
    description: trim(result.description, 300),
    url: result.url,
    source: result.source,
    source_domain: result.sourceDomain,
    resource_type: result.type,
    difficulty: result.difficulty,
    language: result.language,
    thumbnail_url: result.thumbnailUrl,
    author: result.author,
    published_at: result.publishedAt,
    is_verified: false,
    is_active: false,
    provider: result.providerId,
    external_id: result.externalId,
    provider_signals: result.signals ?? null,
    discovered_at: now,
  }));

  // Conflita por `url`, que tem UNIQUE simples. O índice de
  // (provider, external_id) é parcial e o Postgres não o aceita para inferir
  // ON CONFLICT — ele fica como rede de segurança, não como chave do upsert.
  const { data: inserted, error } = await supabase
    .from("resources")
    .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
    .select("id, slug");

  if (error) throw new Error(error.message);

  const savedRows = (inserted ?? []) as { id: string; slug: string }[];
  await linkTopics(savedRows, fresh, slugs);

  return {
    inserted: savedRows.length,
    skipped: results.length - savedRows.length,
  };
}

/**
 * Garante um slug único para cada item do lote.
 *
 * Resolve as duas fontes de colisão: repetição dentro do próprio lote e slug
 * que já existe no banco. O desempate usa o identificador de origem, que é
 * estável — reimportar o mesmo item gera o mesmo slug.
 */
async function resolveSlugs(
  results: ProviderResult[],
): Promise<Map<string, string>> {
  const supabase = createAdminClient();
  const base = new Map(results.map((r) => [r.externalId, uniqueSlug(r)]));

  const { data } = await supabase
    .from("resources")
    .select("slug")
    .in("slug", [...new Set(base.values())]);

  const taken = new Set(((data ?? []) as { slug: string }[]).map((r) => r.slug));
  const final = new Map<string, string>();

  for (const [externalId, candidate] of base) {
    const livre = !taken.has(candidate);
    const slug = livre ? candidate : `${candidate.slice(0, 60)}-${externalId}`;
    taken.add(slug);
    final.set(externalId, slug);
  }

  return final;
}

/** Vincula os tópicos declarados pelo provider aos recursos recém-criados. */
async function linkTopics(
  saved: { id: string; slug: string }[],
  results: ProviderResult[],
  slugs: Map<string, string>,
) {
  const wanted = [...new Set(results.flatMap((result) => result.topics))];
  if (wanted.length === 0 || saved.length === 0) return;

  const supabase = createAdminClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("id, slug")
    .in("slug", wanted);

  const topicId = new Map(
    ((topics ?? []) as { id: string; slug: string }[]).map((t) => [t.slug, t.id]),
  );
  const bySlug = new Map(saved.map((row) => [row.slug, row.id]));

  const links = results.flatMap((result) => {
    const resourceId = bySlug.get(slugs.get(result.externalId) ?? "");
    if (!resourceId) return [];
    return result.topics.flatMap((slug) => {
      const id = topicId.get(slug);
      return id ? [{ resource_id: resourceId, topic_id: id }] : [];
    });
  });

  if (links.length > 0) {
    await supabase.from("resource_topics").upsert(links, {
      onConflict: "resource_id,topic_id",
      ignoreDuplicates: true,
    });
  }
}

/**
 * Corta textos longos demais para o que a interface mostra.
 *
 * A descrição é um resumo de duas linhas no card, mas nada garante isso na
 * origem: um repositório do GitHub trazia um manifesto de 236 KB no campo de
 * descrição. Vinte e um recursos assim somavam 1 MB, que ia inteiro para o HTML
 * e de novo para o payload do RSC, a cada página que os listasse.
 *
 * O corte respeita a última palavra inteira, para não terminar no meio de uma.
 */
function trim(value: string | null, max: number): string | null {
  if (!value) return null;

  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max)}…`;
}

/** O provider entra no slug para dois providers não colidirem no mesmo título. */
function uniqueSlug(result: ProviderResult): string {
  return slugify(`${result.providerId}-${result.title}`, 70);
}

// ── Execuções ────────────────────────────────────────────────

export async function ingestGitHub(
  query: string,
  topicSlug?: string,
  limit = 10,
): Promise<IngestReport> {
  try {
    const results = await githubProvider.search({ query, topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "GitHub", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "GitHub",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestDevDocs(
  query: string,
  topicSlug?: string,
  limit = 10,
): Promise<IngestReport> {
  try {
    const results = await fetchDocumentation(query, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "DevDocs", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "DevDocs",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

/** Índice inteiro do DevDocs: centenas de documentações numa requisição. */
export async function ingestAllDocumentation(): Promise<IngestReport> {
  try {
    const results = await fetchAllDocumentation();
    const { inserted, skipped } = await persist(results);
    return { provider: "DevDocs", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "DevDocs",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestDevTo(
  tag: string,
  topicSlug?: string,
  limit = 30,
): Promise<IngestReport> {
  try {
    const results = await fetchArticles(tag, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "DEV.to", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "DEV.to",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestHackerNews(
  query: string,
  topicSlug?: string,
  limit = 20,
): Promise<IngestReport> {
  try {
    const results = await fetchDiscussed(query, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "HN", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "HN",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestStackOverflow(
  tag: string,
  topicSlug?: string,
  limit = 15,
): Promise<IngestReport> {
  try {
    const results = await fetchCanonical(tag, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "SO", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "SO",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestArxiv(
  categoria: CategoriaArxiv,
  topicSlug?: string,
  limit = 100,
  offset = 0,
): Promise<IngestReport> {
  try {
    const results = await fetchPapers(categoria, { topicSlug, limit, offset });
    const { inserted, skipped } = await persist(results);
    return { provider: "arXiv", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "arXiv",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

export async function ingestOpenAlex(
  query: string,
  topicSlug?: string,
  limit = 100,
): Promise<IngestReport> {
  try {
    const results = await fetchOpenAccess(query, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "OpenAlex", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "OpenAlex",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

/** Aceita @handle, URL ou o ID do canal. */
export async function ingestYouTubeChannel(
  channel: string,
  topicSlug?: string,
  limit = 10,
): Promise<IngestReport> {
  try {
    const channelId = await resolveChannelId(channel);
    const results = await fetchChannelVideos(channelId, { topicSlug, limit });
    const { inserted, skipped } = await persist(results);
    return { provider: "YouTube", found: results.length, inserted, skipped };
  } catch (error) {
    return {
      provider: "YouTube",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}
