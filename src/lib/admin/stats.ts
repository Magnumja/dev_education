import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminStats {
  published: number;
  verified: number;
  inQueue: number;
  pendingSubmissions: number;
  users: number;
  clicksLast7Days: number;
  topics: number;
}

/** Contagens do painel. Tudo `head: true`: conta no banco, não traz linhas. */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    published,
    verified,
    inQueue,
    pendingSubmissions,
    users,
    clicks,
    topics,
  ] = await Promise.all([
    count(supabase, "resources", (q) => q.eq("is_active", true)),
    count(supabase, "resources", (q) =>
      q.eq("is_active", true).eq("is_verified", true),
    ),
    count(supabase, "resources", (q) => q.eq("is_active", false)),
    count(supabase, "resource_submissions", (q) => q.eq("status", "pending")),
    count(admin, "profiles", (q) => q),
    count(admin, "resource_clicks", (q) => q.gte("created_at", sevenDaysAgo)),
    count(supabase, "topics", (q) => q),
  ]);

  return {
    published,
    verified,
    inQueue,
    pendingSubmissions,
    users,
    clicksLast7Days: clicks,
    topics,
  };
}

type CountQuery = ReturnType<
  ReturnType<SupabaseClient["from"]>["select"]
>;

async function count(
  client: SupabaseClient,
  table: string,
  refine: (query: CountQuery) => CountQuery,
): Promise<number> {
  const { count: total, error } = await refine(
    client.from(table).select("*", { count: "exact", head: true }),
  );

  if (error) {
    console.error(`Falha ao contar ${table}:`, error);
    return 0;
  }
  return total ?? 0;
}
