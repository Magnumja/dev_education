import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { SearchFiltersState } from "@/types";

/** Cada aba é um filtro real sobre o catálogo — nenhuma é decorativa. */
export const DISCOVER_TABS = [
  { key: "recomendado", label: "Recomendado", filters: {} },
  {
    key: "novidades",
    label: "Novidades",
    filters: { sort: "recent" as const },
  },
  { key: "documentacoes", label: "Documentações", filters: { types: ["documentation" as const] } },
  { key: "artigos", label: "Artigos", filters: { types: ["article" as const, "pdf" as const] } },
  { key: "exercicios", label: "Exercícios", filters: { types: ["exercise" as const] } },
  { key: "projetos", label: "Projetos", filters: { types: ["repository" as const, "tool" as const] } },
] satisfies {
  key: string;
  label: string;
  filters: Partial<SearchFiltersState>;
}[];

export type DiscoverTabKey = (typeof DISCOVER_TABS)[number]["key"];

export function resolveTab(value: string | undefined) {
  return DISCOVER_TABS.find((tab) => tab.key === value) ?? DISCOVER_TABS[0];
}

export function DiscoverTabs({ active }: { active: string }) {
  return (
    <nav
      aria-label="Filtrar sugestões"
      className="-mx-4 overflow-x-auto px-4 scroll-rail-hidden sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-2">
        {DISCOVER_TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={tab.key === "recomendado" ? "/" : `/?tab=${tab.key}`}
                scroll={false}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition-quick",
                  isActive
                    ? "border-navy-900 bg-navy-900 font-medium text-surface"
                    : "border-line text-ink-700 hover:border-brand-400 hover:text-brand-500",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
