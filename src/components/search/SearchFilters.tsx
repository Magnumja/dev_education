"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import { DIFFICULTIES, LANGUAGES, RESOURCE_TYPES } from "@/types";
import { TOPICS } from "@/lib/data/topics";

interface Group {
  param: "type" | "level" | "lang" | "topic";
  legend: string;
  options: { value: string; label: string }[];
}

const GROUPS: Group[] = [
  {
    param: "type",
    legend: "Tipo",
    options: RESOURCE_TYPES.map((type) => ({
      value: type,
      label: RESOURCE_TYPE_LABELS[type],
    })),
  },
  {
    param: "level",
    legend: "Nível",
    options: DIFFICULTIES.map((level) => ({
      value: level,
      label: DIFFICULTY_LABELS[level],
    })),
  },
  {
    param: "lang",
    legend: "Idioma",
    options: LANGUAGES.map((lang) => ({
      value: lang,
      label: LANGUAGE_LABELS[lang],
    })),
  },
  {
    param: "topic",
    legend: "Tecnologia",
    options: TOPICS.map((topic) => ({
      value: topic.slug,
      label: topic.name,
    })),
  },
];

export function SearchFilters({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggle = useCallback(
    (param: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      const current = next.getAll(param);
      next.delete(param);
      for (const item of current) {
        if (item !== value) next.append(param, item);
      }
      if (!current.includes(value)) next.append(param, value);
      next.delete("page");
      router.push(`/search?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function clearAll() {
    const next = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) next.set("q", query);
    router.push(`/search?${next.toString()}`, { scroll: false });
  }

  const activeCount = GROUPS.reduce(
    (total, group) => total + searchParams.getAll(group.param).length,
    0,
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy-900">Filtros</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-brand-600 transition-quick hover:text-brand-500"
          >
            Limpar ({activeCount})
          </button>
        ) : null}
      </div>

      {GROUPS.map((group) => {
        const selected = searchParams.getAll(group.param);
        return (
          <fieldset key={group.param}>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {group.legend}
            </legend>
            <div className="space-y-1.5">
              {group.options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-ink-700 transition-quick hover:text-navy-900"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(group.param, option.value)}
                      className="size-3.5 shrink-0 cursor-pointer accent-brand-500"
                    />
                    <span className={cn(checked && "font-medium text-navy-900")}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
