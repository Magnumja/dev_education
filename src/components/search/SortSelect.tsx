"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_LABELS } from "@/constants";
import type { SortOption } from "@/types";

export function SortSelect({ value }: { value: SortOption }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString());
    if (event.target.value === "relevance") next.delete("sort");
    else next.set("sort", event.target.value);
    next.delete("page");
    router.push(`/search?${next.toString()}`, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink-500">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={value}
        onChange={handleChange}
        className="h-8 cursor-pointer rounded-md border border-line bg-surface px-2 text-sm text-navy-900 transition-quick hover:border-brand-400"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
