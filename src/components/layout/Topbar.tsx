"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bookmark, Menu, X } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Sidebar } from "@/components/layout/Sidebar";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { SessionUser } from "@/types";

export function Topbar({
  user,
  canCurate = false,
}: {
  user: SessionUser | null;
  canCurate?: boolean;
}) {
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useFocusTrap<HTMLDivElement>(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:border-b-0 lg:bg-transparent lg:pt-6 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-ink-500 transition-quick hover:bg-surface-muted lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <SearchBar
          key={searchParams.get("q") ?? ""}
          defaultValue={searchParams.get("q") ?? ""}
          className="max-w-xl"
        />

        {/* Marcador, não sino: leva aos salvos, e o projeto não tem
            notificações. Um sino aqui prometeria algo que não existe. */}
        <Link
          href="/favorites"
          aria-label="Conteúdos salvos"
          title="Conteúdos salvos"
          className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-500 transition-quick hover:border-brand-400 hover:text-brand-500 sm:flex"
        >
          <Bookmark className="size-[18px]" aria-hidden />
        </Link>

        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            onClick={(event) => {
              // Fecha ao navegar, sem sincronizar estado com a rota.
              if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
            }}
            className="absolute inset-y-0 left-0 w-[80%] max-w-[16rem] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
              className="absolute right-2 top-2 z-10 rounded-lg p-2 text-rail-text transition-quick hover:text-rail-text-strong"
            >
              <X className="size-5" aria-hidden />
            </button>
            <Sidebar user={user} canCurate={canCurate} />
          </div>
        </div>
      ) : null}
    </>
  );
}
