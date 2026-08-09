"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { rateResource, type RatingState } from "@/lib/ratings/actions";
import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  slug: string;
  /** Nota já dada por quem está vendo. */
  mine: number | null;
  isAuthenticated: boolean;
}

const LEGENDAS = [
  "Não recomendo",
  "Fraco",
  "Razoável",
  "Bom",
  "Excelente",
] as const;

/**
 * Avaliação de 1 a 5 estrelas.
 *
 * Cada estrela é um botão dentro do mesmo formulário, em vez de um campo e um
 * botão "enviar": avaliar é uma decisão de um clique, e um passo a mais é o
 * suficiente para a maioria desistir.
 *
 * O destaque ao passar o mouse é local; a nota confirmada vem do servidor.
 * Assim, mover o cursor nunca dá a impressão de ter mudado o voto.
 */
export function RatingStars({ slug, mine, isAuthenticated }: RatingStarsProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<RatingState, FormData>(
    rateResource,
    { rating: mine ?? undefined },
  );
  const [hover, setHover] = useState<number | null>(null);

  const atual = state.rating ?? mine ?? 0;
  const exibida = hover ?? atual;

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(`/login?next=${encodeURIComponent(`/resource/${slug}`)}`)
        }
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-quick hover:text-brand-600"
      >
        <Star className="size-4" aria-hidden />
        Entre para avaliar
      </button>
    );
  }

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="slug" value={slug} />

      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="submit"
            name="rating"
            value={nota}
            disabled={pending}
            onMouseEnter={() => setHover(nota)}
            onFocus={() => setHover(nota)}
            onBlur={() => setHover(null)}
            aria-label={`${nota} de 5 — ${LEGENDAS[nota - 1]}`}
            aria-pressed={atual === nota}
            className="rounded p-0.5 transition-quick disabled:opacity-50"
          >
            <Star
              className={cn(
                "size-5 transition-quick",
                nota <= exibida
                  ? "fill-brand-400 text-brand-400"
                  : "text-ink-400",
              )}
              aria-hidden
            />
          </button>
        ))}

        <span className="ml-2 text-xs text-ink-500">
          {state.error
            ? state.error
            : exibida > 0
              ? LEGENDAS[exibida - 1]
              : "Sua avaliação"}
        </span>
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {state.rating ? `Você avaliou com ${state.rating} de 5.` : ""}
      </span>
    </form>
  );
}
