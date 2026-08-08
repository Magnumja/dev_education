"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { runDiscovery, type DiscoverState } from "@/lib/admin/discover-actions";
import type { Topic } from "@/types";

const PROVIDERS = [
  {
    id: "github",
    label: "GitHub",
    field: "Termo de busca",
    placeholder: "react, docker, machine learning…",
    hint: "Tente “awesome react” ou “docker tutorial” — buscar só a tecnologia traz ferramentas, não material de estudo.",
  },
  {
    id: "devdocs",
    label: "DevDocs",
    field: "Tecnologia",
    placeholder: "postgresql, python, css…",
    hint: "Encontra a documentação oficial e aponta para o site original.",
  },
  {
    id: "youtube",
    label: "YouTube",
    field: "Canal",
    placeholder: "@rocketseat, youtube.com/@fireship ou UC...",
    hint: "Últimos 15 vídeos pelo feed público — sem chave e sem cota de API.",
  },
] as const;

export function DiscoverForm({ topics }: { topics: Topic[] }) {
  const [state, formAction] = useActionState<DiscoverState, FormData>(
    runDiscovery,
    {},
  );
  const [provider, setProvider] = useState<string>("github");

  const active = PROVIDERS.find((item) => item.id === provider) ?? PROVIDERS[0];

  return (
    <form
      action={formAction}
      className="rounded-card border border-line bg-surface p-5"
    >
      <h2 className="text-[15px] font-semibold text-navy-900">
        Buscar conteúdo nas fontes
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        O que vier entra despublicado, na fila abaixo. Nada vai ao ar sem você
        revisar.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Fonte">
        {PROVIDERS.map((item) => (
          <label
            key={item.id}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] transition-quick ${
              provider === item.id
                ? "border-navy-900 bg-navy-900 font-medium text-surface"
                : "border-line text-ink-700 hover:border-brand-400"
            }`}
          >
            <input
              type="radio"
              name="provider"
              value={item.id}
              checked={provider === item.id}
              onChange={(event) => setProvider(event.target.value)}
              className="sr-only"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <label
            htmlFor="query"
            className="mb-1.5 block text-sm font-medium text-navy-900"
          >
            {active.field}
          </label>
          <input
            id="query"
            name="query"
            required
            placeholder={active.placeholder}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400"
          />
          <p className="mt-1 text-xs text-ink-400">{active.hint}</p>
        </div>

        <div>
          <label
            htmlFor="topic"
            className="mb-1.5 block text-sm font-medium text-navy-900"
          >
            Vincular à tecnologia
          </label>
          <select
            id="topic"
            name="topic"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-navy-900 outline-none transition-quick focus:border-brand-400"
          >
            <option value="">Nenhuma</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.slug}>
                {topic.name}
              </option>
            ))}
          </select>
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

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-4" disabled={pending}>
      {pending ? "Buscando…" : "Buscar e adicionar à fila"}
    </Button>
  );
}
