"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const isHero = size === "hero";

  // "/" foca a busca, como em qualquer ferramenta de desenvolvedor. Ignorado
  // enquanto a pessoa digita em outro campo, para não roubar a tecla.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
        ref={inputRef}
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
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Limpar busca"
          className="shrink-0 rounded-md p-1 text-ink-400 transition-quick hover:text-navy-900"
        >
          <X className={isHero ? "size-5" : "size-4"} aria-hidden />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink-400 sm:block"
        >
          /
        </kbd>
      )}

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
