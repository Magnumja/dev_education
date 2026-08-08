"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { buttonClasses } from "@/components/ui/Button";

interface SearchBarProps {
  defaultValue?: string;
  size?: "hero" | "compact";
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  defaultValue = "",
  size = "compact",
  placeholder = "O que você quer aprender?",
  autoFocus,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  // id único: a barra aparece em mais de um lugar (topo e drawer).
  const inputId = useId();
  const isHero = size === "hero";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border border-line bg-surface transition-quick",
        "focus-within:border-brand-400 focus-within:shadow-lift hover:border-ink-400/50",
        isHero ? "h-14 px-3 shadow-soft sm:h-16 sm:px-4" : "h-10 px-2.5",
        className,
      )}
    >
      <Search
        className={cn("shrink-0 text-ink-400", isHero ? "size-5" : "size-4")}
        aria-hidden
      />
      <label htmlFor={inputId} className="sr-only">
        Buscar conteúdos para desenvolvedores
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-navy-900 outline-none placeholder:text-ink-400",
          "[&::-webkit-search-cancel-button]:appearance-none",
          isHero ? "text-base sm:text-lg" : "text-sm",
        )}
      />
      <button
        type="submit"
        className={cn(
          buttonClasses("primary", isHero ? "md" : "sm"),
          isHero && "sm:h-11 sm:px-6",
        )}
      >
        Buscar
      </button>
    </form>
  );
}
