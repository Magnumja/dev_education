import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileRow } from "@/types/database";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
}

/**
 * Usuário da requisição atual, ou null. Memoizado por request para que
 * várias partes da árvore possam chamar sem gerar consultas repetidas.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return { id: user.id, email: user.email ?? null, profile };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Autenticação obrigatória.");
  return user;
}

export function isCurator(user: CurrentUser | null): boolean {
  return user?.profile?.role === "curator" || user?.profile?.role === "admin";
}

/** IDs (slugs) dos recursos favoritados, para marcar os cards já salvos. */
export const getSavedResourceSlugs = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("resources (slug)")
    .eq("user_id", user.id);

  // O embed do PostgREST chega como objeto ou array conforme a cardinalidade.
  const slugs = (data ?? []).flatMap((row) => {
    const related = (row as unknown as FavoriteRow).resources;
    if (!related) return [];
    return Array.isArray(related)
      ? related.map((item) => item.slug)
      : [related.slug];
  });

  return new Set(slugs);
});

interface FavoriteRow {
  resources: { slug: string } | { slug: string }[] | null;
}
