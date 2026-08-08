"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types";

export interface RoleState {
  error?: string;
  message?: string;
}

const ROLES: UserRole[] = ["user", "curator", "admin"];

/**
 * Concede ou remove permissões.
 *
 * Usa a service role porque a RLS de `profiles` só permite que cada um edite o
 * próprio registro — e assim continua: nenhuma policy dá a um usuário o poder
 * de mexer no papel de outro. A autorização acontece aqui, no servidor.
 */
export async function setUserRole(
  _prevState: RoleState,
  formData: FormData,
): Promise<RoleState> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (error) {
    return { error: (error as Error).message };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!ROLES.includes(role)) return { error: "Papel inválido." };

  const admin = createAdminClient();

  let targetId = userId;
  let targetLabel = userId;

  if (!targetId) {
    if (!email) return { error: "Informe o e-mail da conta." };

    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) return { error: error.message };

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );

    if (!found) {
      return {
        error: `Nenhuma conta com o e-mail ${email}. A pessoa precisa se cadastrar antes.`,
      };
    }

    targetId = found.id;
    targetLabel = email;
  }

  // Rebaixar a si mesmo tira seu próprio acesso ao painel na hora seguinte.
  if (targetId === actor.id && role !== "admin") {
    return { error: "Você não pode remover o próprio acesso de administrador." };
  }

  // Sem nenhum admin, ninguém consegue mais conceder permissões.
  if (role !== "admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return { error: "É preciso manter pelo menos um administrador." };
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", targetId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");

  return { message: `${targetLabel} agora é ${role}.` };
}
