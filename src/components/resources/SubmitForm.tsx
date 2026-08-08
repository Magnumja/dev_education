"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitResource, type SubmitState } from "@/lib/submissions/actions";

const FIELD =
  "w-full rounded-md border border-line px-3 py-2 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400";

export function SubmitForm() {
  const [state, formAction] = useActionState<SubmitState, FormData>(
    submitResource,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
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

      <div>
        <label
          htmlFor="url"
          className="mb-1.5 block text-sm font-medium text-navy-900"
        >
          Endereço do conteúdo
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://…"
          className={FIELD}
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-sm font-medium text-navy-900"
        >
          Título <span className="font-normal text-ink-400">(opcional)</span>
        </label>
        <input id="title" name="title" type="text" className={FIELD} />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-navy-900"
        >
          Por que vale a pena?{" "}
          <span className="font-normal text-ink-400">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Ajuda a curadoria a entender o contexto e o nível do material."
          className={`${FIELD} resize-y`}
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enviando…" : "Enviar sugestão"}
    </Button>
  );
}
