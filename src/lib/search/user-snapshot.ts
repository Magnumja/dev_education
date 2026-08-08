import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/session";
import { toSearchResult } from "@/lib/search";
import type { SearchResourceRow } from "@/types/database";
import type { SearchResult } from "@/types";

export interface UserSnapshot {
  favorites: number;
  opened: number;
  submissions: number;
  /** Tecnologias que a pessoa mais salvou, da mais frequente para a menos. */
  affinity: { slug: string; name: string; count: number }[];
  recentFavorites: SearchResult[];
}

const EMPTY: UserSnapshot = {
  favorites: 0,
  opened: 0,
  submissions: 0,
  affinity: [],
  recentFavorites: [],
};

/**
 * Retrato do que a pessoa já fez no DevEducation.
 *
 * Só dados reais: nada de progresso estimado. A afinidade sai das tecnologias
 * dos conteúdos que ela salvou — é o sinal mais honesto que temos hoje.
 */
export const getUserSnapshot = cache(async (): Promise<UserSnapshot> => {
  if (!isSupabaseConfigured) return EMPTY;

  const user = await getCurrentUser();
  if (!user) return EMPTY;

  try {
    const supabase = await createClient();

    const [favorites, opened, submissions] = await Promise.all([
      supabase
        .from("favorites")
        .select(
          "created_at, resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, resource_topics (topics (slug, name)))",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("resource_clicks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("resource_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    const rows = (favorites.data ?? []) as unknown as FavoriteRow[];
    const counts = new Map<string, { name: string; count: number }>();
    const resources: SearchResult[] = [];

    for (const row of rows) {
      const resource = row.resources;
      if (!resource) continue;

      for (const link of resource.resource_topics ?? []) {
        if (!link.topics) continue;
        const current = counts.get(link.topics.slug);
        counts.set(link.topics.slug, {
          name: link.topics.name,
          count: (current?.count ?? 0) + 1,
        });
      }

      resources.push(
        toSearchResult({
          ...resource,
          id: resource.slug,
          topics: (resource.resource_topics ?? []).flatMap((link) =>
            link.topics ? [link.topics.slug] : [],
          ),
          tags: [],
          score: 0,
          total_count: 0,
        }),
      );
    }

    return {
      favorites: rows.length,
      opened: opened.count ?? 0,
      submissions: submissions.count ?? 0,
      affinity: [...counts]
        .map(([slug, value]) => ({ slug, ...value }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
      recentFavorites: resources.slice(0, 6),
    };
  } catch (error) {
    console.error("Falha ao montar o resumo do usuário:", error);
    return EMPTY;
  }
});

type FavoriteResource = Omit<
  SearchResourceRow,
  "id" | "topics" | "tags" | "score" | "total_count"
> & {
  resource_topics?: { topics: { slug: string; name: string } | null }[];
};

interface FavoriteRow {
  resources: FavoriteResource | null;
}
