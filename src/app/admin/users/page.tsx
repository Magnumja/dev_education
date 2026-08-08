import Image from "next/image";
import { GrantRoleForm } from "@/components/admin/GrantRoleForm";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import { listUsers } from "@/lib/admin/users";
import { getCurrentUser } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/utils/format";

const ROLE_LABELS = {
  user: "Usuário",
  curator: "Curador",
  admin: "Administrador",
} as const;

export default async function AdminUsersPage() {
  const [users, current] = await Promise.all([listUsers(), getCurrentUser()]);
  const isAdmin = current?.profile?.role === "admin";

  return (
    <div className="max-w-3xl space-y-8">
      {isAdmin ? (
        <GrantRoleForm />
      ) : (
        <p className="rounded-card border border-line bg-surface-muted px-4 py-3.5 text-sm text-ink-700">
          Curadores podem ver as contas, mas só administradores alteram
          permissões.
        </p>
      )}

      <section>
        <h2 className="text-[15px] font-semibold text-navy-900">
          Contas
          <span className="ml-2 text-xs font-normal text-ink-400">
            {users.length}
          </span>
        </h2>

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {users.map((user) => (
            <li key={user.id} className="flex items-center gap-3 py-3.5">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  width={34}
                  height={34}
                  unoptimized
                  className="size-[34px] shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500"
                >
                  {(user.name ?? user.email).slice(0, 1).toUpperCase()}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-navy-900">
                  {user.name ?? "Sem nome"}
                  {user.id === current?.id ? (
                    <Badge variant="outline">você</Badge>
                  ) : null}
                </p>
                <p className="truncate text-xs text-ink-400">{user.email}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {user.favorites} salvos · {user.submissions} sugestões ·
                  entrou {formatRelativeTime(user.lastSignInAt ?? user.createdAt)}
                </p>
              </div>

              {isAdmin ? (
                <RoleSelect userId={user.id} role={user.role} />
              ) : (
                <Badge variant={user.role === "user" ? "neutral" : "brand"}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-ink-400">
        Os e-mails são lidos no servidor pela Admin API do Supabase e nunca
        passam pela API pública — a tabela `profiles` tem leitura aberta e
        guardar e-mail nela exporia o endereço de todo mundo.
      </p>
    </div>
  );
}
