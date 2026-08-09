import Image from "next/image";
import { GrantRoleForm } from "@/components/admin/GrantRoleForm";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { Badge } from "@/components/ui/Badge";
import { listUsers } from "@/lib/admin/users";
import { getCurrentUser } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/utils/format";

export default async function AdminUsersPage() {
  const current = await getCurrentUser();
  const isAdmin = current?.profile?.role === "admin";

  // E-mail é dado pessoal e não faz parte do trabalho de curadoria. Só quem
  // administra permissões precisa da lista — e só para ela ela é carregada.
  if (!isAdmin) {
    return (
      <p className="max-w-3xl rounded-card border border-line bg-surface-muted px-4 py-3.5 text-sm text-ink-700">
        Esta área é dos administradores. Curadores revisam e publicam conteúdo,
        mas não gerenciam contas nem enxergam e-mails.
      </p>
    );
  }

  const users = await listUsers();

  return (
    <div className="max-w-3xl space-y-8">
      <GrantRoleForm />

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

              <RoleSelect userId={user.id} role={user.role} />
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
