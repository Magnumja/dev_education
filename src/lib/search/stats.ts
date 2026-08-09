import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { RESOURCES } from "@/lib/data/resources";
import { searchCatalog } from "@/lib/search/catalog-search";
import { search, toSearchResult } from "@/lib/search";
import type { ResourceType, SearchResult } from "@/types";

/** Agrupamentos exibidos no painel "Fontes integradas". */
const SOURCE_GROUPS: {
  label: string;
  unit: string;
  types: ResourceType[];
}[] = [
  { label: "Vídeos e cursos", unit: "conteúdos", types: ["video", "course"] },
  { label: "Documentações", unit: "fontes", types: ["documentation"] },
  { label: "PDFs & Artigos", unit: "documentos", types: ["pdf", "article"] },
  { label: "Repositórios", unit: "projetos", types: ["repository", "tool"] },
  { label: "Exercícios", unit: "conjuntos", types: ["exercise"] },
];

export interface SourceStat {
  label: string;
  unit: string;
  count: number;
  href: string;
  /** Tipo representativo do grupo, para escolher o ícone. */
  icon: ResourceType;
}

/** Contagem real por tipo de conteúdo — nada é estimado. */
const loadSourceStats = unstable_cache(
  async (): Promise<SourceStat[]> => {
  const counts = await countByType();

  return SOURCE_GROUPS.map((group) => ({
    label: group.label,
    unit: group.unit,
    count: group.types.reduce((total, type) => total + (counts[type] ?? 0), 0),
    href: `/search?${group.types.map((type) => `type=${type}`).join("&")}`,
    icon: group.types[0],
  }));
  },
  ["source-stats"],
  { revalidate: 300, tags: ["catalog"] },
);

export const getSourceStats = cache(loadSourceStats);

async function countByType(): Promise<Partial<Record<ResourceType, number>>> {
  const fromCatalog = () => {
    const counts: Partial<Record<ResourceType, number>> = {};
    for (const resource of RESOURCES) {
      counts[resource.type] = (counts[resource.type] ?? 0) + 1;
    }
    return counts;
  };

  if (!isSupabaseConfigured) return fromCatalog();

  try {
    const supabase = createPublicClient();
    // Agregado no banco: trazer uma linha por recurso não escala.
    const { data, error } = await supabase.rpc("resource_type_counts");

    if (error) throw error;

    const counts: Partial<Record<ResourceType, number>> = {};
    for (const row of (data ?? []) as {
      resource_type: ResourceType;
      total: number;
    }[]) {
      counts[row.resource_type] = Number(row.total);
    }
    return counts;
  } catch (error) {
    console.error("Falha ao contar recursos, usando catálogo:", error);
    return fromCatalog();
  }
}

export interface TrendingItem {
  resource: SearchResult;
  clicks: number;
}

/**
 * Mais acessados nos últimos 7 dias. Sem cliques registrados ainda, devolve
 * `clicks: 0` e a UI passa a rotular a lista como destaques da curadoria —
 * nunca inventamos número de acessos.
 */
export const getTrending = cache(
  async (limit = 5): Promise<TrendingItem[]> => {
    // Com Supabase ativo, o fallback precisa vir do banco também — senão o
    // painel mostraria o catálogo local enquanto o resto da tela mostra o banco.
    const curated = async () => {
      const { results } = isSupabaseConfigured
        ? await search({}, { limit })
        : searchCatalog({}, limit);
      return results.map((resource) => ({ resource, clicks: 0 }));
    };

    if (!isSupabaseConfigured) return curated();

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("trending_resources", {
        p_days: 7,
        p_limit: limit,
      });

      if (error) throw error;

      const rows = (data ?? []) as (Parameters<typeof toSearchResult>[0] & {
        click_count: number;
      })[];

      if (rows.length === 0) return curated();

      return rows.map((row) => ({
        resource: toSearchResult(row),
        clicks: Number(row.click_count ?? 0),
      }));
    } catch (error) {
      console.error("Falha ao carregar destaques, usando curadoria:", error);
      return curated();
    }
  },
);

/**
 * Últimos conteúdos que o usuário abriu. Só existe com sessão e cliques
 * registrados — não há barra de progresso porque não rastreamos progresso.
 */
export const getRecentlyOpened = cache(
  async (limit = 6): Promise<{ resource: SearchResult; openedAt: string }[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase.rpc("recent_resources", {
        p_user: user.id,
        p_limit: limit,
      });

      if (error) throw error;

      const rows = (data ?? []) as (Parameters<typeof toSearchResult>[0] & {
        opened_at: string;
      })[];

      return rows.map((row) => ({
        resource: toSearchResult(row),
        openedAt: row.opened_at,
      }));
    } catch (error) {
      console.error("Falha ao carregar histórico recente:", error);
      return [];
    }
  },
);
