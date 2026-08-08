import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, type ProviderResult } from "@/lib/providers/types";
import { githubProvider } from "@/lib/providers/github";
import { fetchDocumentation } from "@/lib/providers/devdocs";
import { fetchChannelVideos } from "@/lib/providers/youtube";

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

  const now = new Date().toISOString();
  const rows = fresh.map((result) => ({
    slug: uniqueSlug(result),
    title: result.title,
    description: result.description,
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
  await linkTopics(savedRows, fresh);

  return {
    inserted: savedRows.length,
    skipped: results.length - savedRows.length,
  };
}

/** Vincula os tópicos declarados pelo provider aos recursos recém-criados. */
async function linkTopics(
  saved: { id: string; slug: string }[],
  results: ProviderResult[],
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
    const resourceId = bySlug.get(uniqueSlug(result));
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

export async function ingestYouTubeChannel(
  channelId: string,
  topicSlug?: string,
  limit = 10,
): Promise<IngestReport> {
  try {
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
