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
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const next = !saved;
    setSaved(next); // otimista: o bookmark precisa parecer instantâneo
    startTransition(async () => {
      const response = await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      if (!response.ok) setSaved(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remover dos favoritos" : "Salvar nos favoritos"}
      title={saved ? "Remover dos favoritos" : "Salvar"}
      className={cn(
        "rounded-md p-1.5 transition-quick",
        saved
          ? "text-brand-500 hover:bg-brand-50"
          : "text-ink-400 hover:bg-surface-muted hover:text-navy-900",
        className,
      )}
    >
      <Bookmark className={cn("size-[18px]", saved && "fill-current")} aria-hidden />
    </button>
  );
}
