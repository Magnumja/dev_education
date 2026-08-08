"use client";

import { useActionState, useEffect, useRef } from "react";
import { setUserRole, type RoleState } from "@/lib/admin/user-actions";
import type { UserRole } from "@/types";

/** Troca o papel direto na lista, sem passo intermediário de confirmação. */
export function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<RoleState, FormData>(
    setUserRole,
    {},
  );

  // Recusa do servidor (último admin, auto-rebaixamento): volta ao valor real.
  useEffect(() => {
    if (state.error) formRef.current?.reset();
  }, [state.error]);

  return (
    <form ref={formRef} action={formAction} className="shrink-0 text-right">
      <input type="hidden" name="user_id" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Papel da conta
      </label>
      <select
        id={`role-${userId}`}
        name="role"
        defaultValue={role}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-8 cursor-pointer rounded-md border border-line bg-surface px-2 text-[13px] text-navy-900 outline-none transition-quick hover:border-brand-400 disabled:opacity-50"
      >
        <option value="user">Usuário</option>
        <option value="curator">Curador</option>
        <option value="admin">Administrador</option>
      </select>
      {state.error ? (
        <p role="alert" className="mt-1 max-w-[13rem] text-[11px] text-brand-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
