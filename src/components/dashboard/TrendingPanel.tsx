import Link from "next/link";
import { Flame } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { ResourceTypeIcon } from "@/components/resources/ResourceTypeIcon";
import type { TrendingItem } from "@/lib/search/stats";

export function TrendingPanel({ items }: { items: TrendingItem[] }) {
  if (items.length === 0) return null;

  // Sem cliques registrados ainda, a lista é curadoria — e o título diz isso.
  const hasClicks = items.some((item) => item.clicks > 0);

  return (
    <Panel
      title={hasClicks ? "Em alta esta semana" : "Destaques da curadoria"}
      action={{ href: "/search", label: "Ver tudo" }}
    >
      <ol className="space-y-1">
        {items.map((item, index) => (
          <li key={item.resource.id}>
            <Link
              href={`/resource/${item.resource.id}`}
              className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 transition-quick hover:bg-surface-muted"
            >
              <span
                aria-hidden
                className="w-4 shrink-0 pt-0.5 text-sm font-semibold text-ink-400"
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-snug text-navy-900">
                  {item.resource.title}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                  {item.clicks > 0 ? (
                    <>
                      <Flame className="size-3.5 text-brand-400" aria-hidden />
                      {item.clicks}{" "}
                      {item.clicks === 1 ? "acesso" : "acessos"}
                    </>
                  ) : (
                    <>
                      <ResourceTypeIcon
                        type={item.resource.type}
                        className="size-3.5"
                      />
                      {item.resource.sourceDomain}
                    </>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
