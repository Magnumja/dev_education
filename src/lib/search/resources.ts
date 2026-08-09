import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { RESOURCE_BY_ID } from "@/lib/data/resources";
import { TOPICS, TOPIC_BY_SLUG } from "@/lib/data/topics";
import type { SearchResult, Topic } from "@/types";

/** Um recurso pelo seu slug público, do banco ou do catálogo curado. */
export const getResourceBySlug = cache(
  async (slug: string): Promise<SearchResult | null> => {
    if (!isSupabaseConfigured) return RESOURCE_BY_ID.get(slug) ?? null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("resources")
        .select(
          "slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, resource_topics(topics(slug)), resource_tags(tags(name))",
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const row = data as unknown as ResourceWithRelations;

      return {
        id: row.slug,
        title: row.title,
        description: row.description,
        url: row.url,
        source: row.source,
        sourceDomain: row.source_domain,
        type: row.resource_type,
        difficulty: row.difficulty,
        language: row.language,
        thumbnailUrl: row.thumbnail_url,
        author: row.author,
        publishedAt: row.published_at,
        isVerified: row.is_verified,
        topics: row.resource_topics.flatMap((rt) =>
          rt.topics ? [rt.topics.slug] : [],
        ),
        tags: row.resource_tags.flatMap((rt) => (rt.tags ? [rt.tags.name] : [])),
      };
    } catch (error) {
      console.error("Falha ao carregar recurso, usando catálogo local:", error);
      return RESOURCE_BY_ID.get(slug) ?? null;
    }
  },
);

/** Lista de tecnologias com a contagem de conteúdos ativos de cada uma. */
const loadTopicsWithCounts = unstable_cache(
  async (): Promise<{ topic: Topic; count: number }[]> => {
    if (!isSupabaseConfigured) return countFromCatalog();

    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("topics")
        .select("id, name, slug, description, icon, resource_topics(count)")
        .order("name");

      if (error) throw error;

      return (data ?? []).map((row) => {
        const topic = row as unknown as TopicWithCount;
        return {
          topic: {
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            description: topic.description,
            icon: topic.icon,
          },
          count: topic.resource_topics[0]?.count ?? 0,
        };
      });
    } catch (error) {
      console.error("Falha ao carregar tecnologias, usando catálogo:", error);
      return countFromCatalog();
    }
  },
  ["topics-with-counts"],
  // As contagens mudam quando a curadoria publica algo, e a revalidação por
  // caminho no painel já limpa este cache; a janela é só a rede de segurança.
  { revalidate: 300, tags: ["catalog"] },
);

export const getTopicsWithCounts = cache(loadTopicsWithCounts);

export const getTopicBySlug = cache(async (slug: string): Promise<Topic | null> => {
  const topics = await getTopicsWithCounts();
  return topics.find((item) => item.topic.slug === slug)?.topic ?? null;
});

function countFromCatalog() {
  const counts = new Map<string, number>();
  for (const resource of RESOURCE_BY_ID.values()) {
    for (const slug of resource.topics) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return TOPICS.map((topic) => ({
    topic,
    count: counts.get(topic.slug) ?? 0,
  }));
}

export { TOPIC_BY_SLUG };

interface ResourceWithRelations {
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  source_domain: string;
  resource_type: SearchResult["type"];
  difficulty: SearchResult["difficulty"];
  language: SearchResult["language"];
  thumbnail_url: string | null;
  author: string | null;
  published_at: string | null;
  is_verified: boolean;
  resource_topics: { topics: { slug: string } | null }[];
  resource_tags: { tags: { name: string } | null }[];
}

interface TopicWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  resource_topics: { count: number }[];
}
