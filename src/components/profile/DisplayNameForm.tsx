"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Pencil, X } from "lucide-react";
import {
  updateDisplayName,
  type ProfileFormState,
} from "@/lib/profile/actions";

/**
 * Edição do nome no lugar onde ele já aparece.
 *
 * Sem formulário separado nem página de configurações: o campo assume o mesmo
 * espaço do título, então a pessoa vê o que está mudando enquanto muda.
 */
export function DisplayNameForm({ current }: { current: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    async (prev, formData) => {
      const resultado = await updateDisplayName(prev, formData);
      if (resultado.message) setEditing(false);
      return resultado;
    },
    {},
  );

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="truncate text-xl font-semibold tracking-tight text-navy-900">
          {current}
        </h1>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Editar nome"
          title="Editar nome"
          className="rounded-md p-1 text-ink-400 transition-quick hover:bg-surface-muted hover:text-navy-900"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
        {state.message ? (
          <span role="status" className="text-xs text-brand-500">
            {state.message}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <label htmlFor="display-name" className="sr-only">
        Seu nome
      </label>
      <input
        id="display-name"
        name="name"
        defaultValue={current}
        autoFocus
        maxLength={60}
        className="h-9 w-full max-w-xs rounded-md border border-line bg-surface px-2.5 text-lg font-semibold text-navy-900 outline-none transition-quick focus:border-brand-400"
      />
      <Salvar />
      <button
        type="button"
        onClick={() => setEditing(false)}
        aria-label="Cancelar"
        className="rounded-md p-1.5 text-ink-400 transition-quick hover:bg-surface-muted"
      >
        <X className="size-4" aria-hidden />
      </button>
      {state.error ? (
        <span role="alert" className="text-xs text-brand-600">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Salvar nome"
      className="rounded-md p-1.5 text-brand-500 transition-quick hover:bg-brand-50 disabled:opacity-50"
    >
      <Check className="size-4" aria-hidden />
    </button>
  );
}
