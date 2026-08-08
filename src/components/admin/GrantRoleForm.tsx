"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { setUserRole, type RoleState } from "@/lib/admin/user-actions";

/** Concede um papel a partir do e-mail, sem precisar caçar a pessoa na lista. */
export function GrantRoleForm() {
  const [state, formAction] = useActionState<RoleState, FormData>(
    setUserRole,
    {},
  );

  return (
    <form
      action={formAction}
      className="rounded-card border border-line bg-surface p-5"
    >
      <h2 className="text-[15px] font-semibold text-navy-900">
        Conceder permissão por e-mail
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        A pessoa precisa já ter uma conta no DevEducation. Curadores revisam
        conteúdo; administradores também gerenciam permissões.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <div>
          <label
            htmlFor="grant-email"
            className="mb-1.5 block text-sm font-medium text-navy-900"
          >
            E-mail da conta
          </label>
          <input
            id="grant-email"
            name="email"
            type="email"
            required
            placeholder="pessoa@exemplo.com"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400"
          />
        </div>

        <div>
          <label
            htmlFor="grant-role"
            className="mb-1.5 block text-sm font-medium text-navy-900"
          >
            Papel
          </label>
          <select
            id="grant-role"
            name="role"
            defaultValue="curator"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-navy-900 outline-none transition-quick focus:border-brand-400"
          >
            <option value="user">Usuário</option>
            <option value="curator">Curador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex items-end">
          <SubmitButton />
        </div>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-md border border-line bg-surface-muted px-3 py-2.5 text-sm text-navy-900"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-navy-900"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Aplicando…" : "Conceder"}
    </Button>
  );
}
