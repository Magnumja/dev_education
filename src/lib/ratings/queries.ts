import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/session";

export interface RatingSummary {
  /** Média de 1 a 5, ou null quando ninguém avaliou ainda. */
  average: number | null;
  count: number;
  /** A nota de quem está vendo, se houver. */
  mine: number | null;
}

const VAZIO: RatingSummary = { average: null, count: 0, mine: null };

/**
 * Resumo das avaliações de um conteúdo.
 *
 * As notas individuais são públicas por RLS, então a média é calculada aqui em
 * vez de por RPC — são poucos registros por recurso e evita mais uma função no
 * banco para uma conta trivial.
 */
export const getRatingSummary = cache(
  async (resourceSlug: string): Promise<RatingSummary> => {
    if (!isSupabaseConfigured) return VAZIO;

    try {
      const supabase = await createClient();

      const { data: resource } = await supabase
        .from("resources")
        .select("id")
        .eq("slug", resourceSlug)
        .maybeSingle<{ id: string }>();

      if (!resource) return VAZIO;

      const [{ data: ratings }, user] = await Promise.all([
        supabase
          .from("resource_ratings")
          .select("rating, user_id")
          .eq("resource_id", resource.id),
        getCurrentUser(),
      ]);

      const rows = (ratings ?? []) as { rating: number; user_id: string }[];
      if (rows.length === 0) return VAZIO;

      const soma = rows.reduce((total, row) => total + row.rating, 0);

      return {
        average: soma / rows.length,
        count: rows.length,
        mine: rows.find((row) => row.user_id === user?.id)?.rating ?? null,
      };
    } catch (error) {
      console.error("Falha ao carregar avaliações:", error);
      return VAZIO;
    }
  },
);
