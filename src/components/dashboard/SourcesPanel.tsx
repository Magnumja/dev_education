import Link from "next/link";
import { Panel } from "@/components/dashboard/Panel";
import type { SourceStat } from "@/lib/search/stats";
import { ResourceTypeIcon } from "@/components/resources/ResourceTypeIcon";

export function SourcesPanel({ stats }: { stats: SourceStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <Panel title="Fontes integradas" action={{ href: "/search", label: "Ver todas" }}>
      <ul className="space-y-1">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link
              href={stat.href}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-quick hover:bg-surface-muted"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                <ResourceTypeIcon type={stat.icon} className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink-700">
                {stat.label}
              </span>
              <span className="shrink-0 text-xs text-ink-400">
                {stat.count} {stat.unit}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-400">
        {total} conteúdos no catálogo, todos gratuitos e hospedados na fonte
        original.
      </p>
    </Panel>
  );
}
