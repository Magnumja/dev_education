"use client";

import { Bookmark } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface BookmarkButtonProps {
  resourceId: string;
  initialSaved?: boolean;
  /** Quando falso, o clique leva ao login em vez de salvar. */
  isAuthenticated?: boolean;
  className?: string;
}

export function BookmarkButton({
  resourceId,
  initialSaved = false,
  isAuthenticated = false,
  className,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const next = !saved;
    setSaved(next); // otimista: o bookmark precisa parecer instantâneo
    setFailed(false);

    startTransition(async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId }),
        });
        if (!response.ok) throw new Error(String(response.status));
      } catch {
        // Desfaz e avisa: sem isso, a pessoa acredita ter salvo algo que se
        // perdeu, e só descobre ao voltar em /favorites.
        setSaved(!next);
        setFailed(true);
      }
    });
  }

  const label = failed
    ? "Não foi possível salvar. Tente de novo."
    : saved
      ? "Remover dos favoritos"
      : "Salvar nos favoritos";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={cn(
          "rounded-md p-1.5 transition-quick",
          failed
            ? "text-brand-600"
            : saved
              ? "text-brand-500 hover:bg-brand-50"
              : "text-ink-400 hover:bg-surface-muted hover:text-navy-900",
          className,
        )}
      >
        <Bookmark
          className={cn("size-[18px]", saved && "fill-current")}
          aria-hidden
        />
      </button>

      {/* Só para leitores de tela: o ícone preenchido já comunica visualmente. */}
      <span role="status" aria-live="polite" className="sr-only">
        {failed
          ? "Falha ao salvar o conteúdo."
          : saved
            ? "Conteúdo salvo nos favoritos."
            : ""}
      </span>
    </span>
  );
}
