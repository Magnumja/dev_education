import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  lastSignInAt: string | null;
  favorites: number;
  submissions: number;
}

/**
 * Lista as contas para a tela de permissões.
 *
 * O e-mail vive em `auth.users`, não em `profiles`, e é lido aqui pela Admin
 * API — de propósito. Copiar e-mails para `profiles`, que tem leitura pública,
 * exporia o endereço de todo mundo pela API REST.
 */
export async function listUsers(): Promise<ManagedUser[]> {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData, error }, profilesResult, favorites, submissions] =
    await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabase.from("profiles").select("id, name, avatar_url, role"),
      supabase.from("favorites").select("user_id"),
      supabase.from("resource_submissions").select("user_id"),
    ]);

  if (error) throw new Error(error.message);

  const profiles = new Map(
    ((profilesResult.data ?? []) as {
      id: string;
      name: string | null;
      avatar_url: string | null;
      role: UserRole;
    }[]).map((row) => [row.id, row]),
  );

  const favoriteCount = tally(favorites.data);
  const submissionCount = tally(submissions.data);

  return authData.users
    .map((user) => {
      const profile = profiles.get(user.id);
      return {
        id: user.id,
        email: user.email ?? "—",
        name: profile?.name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? "user",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        favorites: favoriteCount.get(user.id) ?? 0,
        submissions: submissionCount.get(user.id) ?? 0,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function tally(rows: { user_id: string }[] | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  return counts;
}
