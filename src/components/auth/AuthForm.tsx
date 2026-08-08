"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AuthFormState } from "@/lib/auth/actions";

interface AuthFormProps {
  mode: "signin" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next: string;
}

export function AuthForm({ mode, action, next }: AuthFormProps) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});
  const isSignUp = mode === "signup";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

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

      {isSignUp ? (
        <Field
          id="name"
          name="name"
          label="Nome"
          autoComplete="name"
          required
        />
      ) : null}

      <Field
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
      />

      <Field
        id="password"
        name="password"
        type="password"
        label="Senha"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        hint={isSignUp ? "Mínimo de 8 caracteres." : undefined}
        required
      />

      <SubmitButton label={isSignUp ? "Criar conta" : "Entrar"} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Aguarde…" : label}
    </Button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

function Field({ id, label, hint, ...props }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-navy-900"
      >
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-10 w-full rounded-md border border-line px-3 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400"
        {...props}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
