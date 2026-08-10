"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import {
  BookmarkIcon,
  ThemeToggle,
  iconButtonClasses,
} from "@/components/theme/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { SITE } from "@/constants";
import type { SessionUser } from "@/types";

/**
 * Barra superior fixa, com a marca sempre visível.
 *
 * A logo saiu da barra lateral e veio para cá porque o dock é só de ícones —
 * sem ela, nada na tela diria em que site a pessoa está.
 */
export function Navbar({ user }: { user: SessionUser | null }) {
  const searchParams = useSearchParams();

  return (
    <header className="sticky top-0 z-30 bg-navbar">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${SITE.name} — página inicial`}
          className="shrink-0 transition-quick hover:opacity-85"
        >
          {/* A barra é azul escura nos dois temas, então a arte é uma só — a
              mesma de texto branco que a marca sempre usou. */}
          <Image
            src="/images/deveducation-wordmark.png"
            alt={SITE.name}
            width={640}
            height={160}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <SearchBar
            key={searchParams.get("q") ?? ""}
            defaultValue={searchParams.get("q") ?? ""}
            className="mx-auto max-w-xl"
          />
        </div>

        <Link
          href="/favorites"
          aria-label="Conteúdos salvos"
          title="Conteúdos salvos"
          className={cn(iconButtonClasses, "hidden sm:flex")}
        >
          <BookmarkIcon />
        </Link>

        <ThemeToggle />

        {user ? (
          <Link
            href="/profile"
            aria-label={`Perfil de ${user.name}`}
            className="hidden shrink-0 rounded-full transition-quick hover:opacity-85 sm:block"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="size-9 rounded-full border border-white/25 object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(buttonClasses("primary", "sm"), "hidden shrink-0 sm:inline-flex")}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
