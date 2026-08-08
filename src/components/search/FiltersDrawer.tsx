"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/Button";

/** No mobile os filtros vivem em um drawer para não roubar a tela dos resultados. */
export function FiltersDrawer({ activeCount }: { activeCount: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtros
        {activeCount > 0 ? (
          <span className="rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/25"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de busca"
            className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-navy-900">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar filtros"
                className="rounded-md p-1.5 text-ink-500 transition-quick hover:bg-surface-muted"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <SearchFilters />
            </div>
            <div className="border-t border-line p-4">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Ver resultados
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
