import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { Topic } from "@/types";
import { BrandIcon, hasBrandIcon } from "@/components/icons/BrandIcon";
import { topicIcon } from "@/lib/icons";

interface TechRailProps {
  topics: { topic: Topic; count: number }[];
}

export function TechRail({ topics }: TechRailProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-navy-900">
          Explore por tecnologia
        </h2>
        <Link
          href="/topics"
          className="shrink-0 text-[13px] font-medium text-brand-500 transition-quick hover:text-brand-400"
        >
          Todas as tecnologias
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 scroll-rail scroll-rail-hidden sm:mx-0 sm:px-0">
        <div className="flex gap-2.5">
          {topics.map(({ topic, count }) => {
            const icon = topicIcon(topic.slug);
            return (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-quick hover:border-brand-400 hover:shadow-soft"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-surface-muted">
                {hasBrandIcon(icon) ? (
                  <BrandIcon slug={icon} colored className="size-4" />
                ) : (
                  <span aria-hidden className="text-[11px] font-semibold text-brand-500">
                    {topic.name.slice(0, 2)}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-navy-900">
                {topic.name}
              </span>
              <span className="text-xs text-ink-400">{count}</span>
            </Link>
            );
          })}

          <Link
            href="/topics"
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 transition-quick hover:border-brand-400"
          >
            <LayoutGrid className="size-4 text-ink-500" aria-hidden />
            <span className="whitespace-nowrap text-sm font-medium text-ink-700">
              Ver todas
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
