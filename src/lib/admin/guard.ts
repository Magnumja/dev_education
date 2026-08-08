import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, isCurator, type CurrentUser } from "@/lib/auth/session";

/**
 * Porta de entrada da curadoria.
 *
 * A RLS já bloqueia escrita para quem não é `curator`/`admin` — isto aqui é a
 * segunda camada, para o painel não renderizar nada a quem não deveria vê-lo.
 *
 * Devolve `null` em vez de redirecionar quando falta permissão: quem chama
 * mostra uma explicação, porque um redirecionamento silencioso deixa a pessoa
 * sem entender por que a página sumiu.
 */
export async function getCuratorOrNull(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  return isCurator(user) ? user : null;
}

/** Para Server Actions, onde não há UI para explicar: falha direto. */
export async function requireCurator(): Promise<CurrentUser> {
  const user = await getCuratorOrNull();
  if (!user) throw new Error("Ação restrita à curadoria do DevEducation.");
  return user;
}

/** Só `admin` — curadores editam conteúdo, mas não mexem em permissões. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/users");
  if (user.profile?.role !== "admin") {
    throw new Error("Apenas administradores podem alterar permissões.");
  }
  return user;
}
