"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AuthFormState } from "@/lib/auth/actions";

const CAMPO =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400";

interface PasswordFormProps {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  modo: "pedir" | "definir";
}

export function PasswordForm({ action, modo }: PasswordFormProps) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});
  const pedindo = modo === "pedir";

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-line bg-surface-muted px-3 py-2.5 text-sm text-navy-900"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-navy-900"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {state.message}
        </p>
      ) : null}

      {pedindo ? (
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-900">
            E-mail da conta
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={CAMPO} />
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-900">
              Nova senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className={CAMPO}
            />
            <p className="mt-1 text-xs text-ink-400">Mínimo de 8 caracteres.</p>
          </div>
          <div>
            <label
              htmlFor="password_confirm"
              className="mb-1.5 block text-sm font-medium text-navy-900"
            >
              Repita a nova senha
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              autoComplete="new-password"
              className={CAMPO}
            />
          </div>
        </>
      )}

      <Enviar rotulo={pedindo ? "Enviar link" : "Salvar nova senha"} />
    </form>
  );
}

function Enviar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Aguarde…" : rotulo}
    </Button>
  );
}
