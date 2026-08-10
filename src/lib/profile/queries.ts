import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { toSearchResult } from "@/lib/search";
import type { SearchResourceRow, SubmissionRow } from "@/types/database";
import type { SearchResult } from "@/types";

export interface ProfileData {
  counts: {
    favorites: number;
    ratings: number;
    opened: number;
    submissions: number;
  };
  /** Notas dadas, da mais recente para a mais antiga. */
  ratings: { resource: SearchResult; rating: number }[];
  submissions: Pick<
    SubmissionRow,
    "id" | "url" | "title" | "status" | "created_at" | "review_note"
  >[];
  memberSince: string | null;
}

/**
 * Tudo o que o perfil mostra, numa passagem.
 *
 * As contagens usam `head: true`: o número aparece na tela, a linha não — não
 * há motivo para trafegar centenas de registros para exibir "137".
 */
export const getProfileData = cache(async (): Promise<ProfileData | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const [favorites, ratingsCount, opened, submissionsCount, minhasNotas, envios] =
    await Promise.all([
      supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("resource_ratings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("resource_clicks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("resource_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("resource_ratings")
        .select(
          "rating, created_at, resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("resource_submissions")
        .select("id, url, title, status, created_at, review_note")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const notas = ((minhasNotas.data ?? []) as unknown as RatingRow[]).flatMap(
    (row) => {
      const bruto = Array.isArray(row.resources) ? row.resources[0] : row.resources;
      if (!bruto) return [];
      return [
        {
          rating: row.rating,
          resource: toSearchResult({
            ...bruto,
            id: bruto.slug,
            topics: [],
            tags: [],
            score: 0,
            total_count: 0,
          }),
        },
      ];
    },
  );

  return {
    counts: {
      favorites: favorites.count ?? 0,
      ratings: ratingsCount.count ?? 0,
      opened: opened.count ?? 0,
      submissions: submissionsCount.count ?? 0,
    },
    ratings: notas,
    submissions: (envios.data ?? []) as ProfileData["submissions"],
    memberSince: user.profile?.created_at ?? null,
  };
});

type BareResource = Omit<
  SearchResourceRow,
  "id" | "topics" | "tags" | "score" | "total_count"
>;

interface RatingRow {
  rating: number;
  resources: BareResource | BareResource[] | null;
}
