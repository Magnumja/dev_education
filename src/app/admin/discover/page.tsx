import Link from "next/link";
import { Compass, Star } from "lucide-react";
import { DiscoverForm } from "@/components/admin/DiscoverForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { getTopicsWithCounts } from "@/lib/search/resources";
import {
  discardDiscovery,
  publishDiscovery,
  publishFiltered,
} from "@/lib/admin/discover-actions";
import {
  getQueue,
  getQueueFacets,
  parseQueueFilters,
  queueQueryString,
  QUEUE_PAGE_SIZE,
  PUBLISH_BATCH_LIMIT,
  type QueueFilters,
} from "@/lib/admin/queue";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import { cn } from "@/lib/utils/cn";
import type { Difficulty, ResourceLanguage, ResourceType } from "@/types";

type DiscoverPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const filters = parseQueueFilters(await searchParams);

  const [topicsWithCounts, { items, total }, facets] = await Promise.all([
    getTopicsWithCounts(),
    getQueue(filters),
    getQueueFacets(),
  ]);

  const hasFilter = Boolean(filters.provider || filters.type || filters.language);

  return (
    <div className="max-w-3xl space-y-8">
      <DiscoverForm topics={topicsWithCounts.map((item) => item.topic)} />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-navy-900">
            Fila de descobertas
            <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
              {total}
            </span>
          </h2>
          {hasFilter ? (
            <Link
              href="/admin/discover"
              className="text-xs font-medium text-brand-500 transition-quick hover:text-brand-400"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          <FacetRow
            label="Fonte"
            options={facets.providers}
            current={filters.provider}
            filters={filters}
            param="provider"
          />
          <FacetRow
            label="Tipo"
            options={facets.types}
            current={filters.type}
            filters={filters}
            param="type"
            format={(value) => RESOURCE_TYPE_LABELS[value as ResourceType]}
          />
          <FacetRow
            label="Idioma"
            options={facets.languages}
            current={filters.language}
            filters={filters}
            param="lang"
            format={(value) => LANGUAGE_LABELS[value as ResourceLanguage]}
          />
        </div>

        {hasFilter && total > 1 ? (
          <form
            action={publishFiltered}
            className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-brand-100 bg-brand-50 px-4 py-3"
          >
            <input type="hidden" name="provider" value={filters.provider ?? ""} />
            <input type="hidden" name="type" value={filters.type ?? ""} />
            <input type="hidden" name="lang" value={filters.language ?? ""} />
            <p className="flex-1 text-sm text-navy-900">
              Publicar de uma vez os{" "}
              <strong>{Math.min(total, PUBLISH_BATCH_LIMIT)}</strong> primeiros
              desta seleção
              {total > PUBLISH_BATCH_LIMIT ? (
                <span className="text-ink-500">
                  {" "}
                  (de {total} — repita para continuar)
                </span>
              ) : null}
              .
            </p>
            <button
              type="submit"
              className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-quick hover:bg-brand-600"
            >
              Publicar seleção
            </button>
          </form>
        ) : null}

        {items.length === 0 ? (
          <EmptyState
            icon={<Compass className="size-5" aria-hidden />}
            title={hasFilter ? "Nada com esses filtros." : "Nada na fila."}
            description={
              hasFilter
                ? "Ajuste os filtros acima para ver o restante da fila."
                : "Use o formulário acima, ou rode `npm run ingest` para trazer conteúdo em lote."
            }
          />
        ) : (
          <>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items.map((item) => (
                <li key={item.id} className="py-3.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Badge variant="outline">{item.provider}</Badge>
                    <span className="text-xs text-ink-400">
                      {RESOURCE_TYPE_LABELS[item.resource_type]} ·{" "}
                      {item.source_domain}
                    </span>
                    {item.provider_signals?.stars ? (
                      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                        <Star className="size-3" aria-hidden />
                        {item.provider_signals.stars.toLocaleString("pt-BR")}
                      </span>
                    ) : null}
                    <Badge variant="outline">
                      {LANGUAGE_LABELS[item.language]}
                    </Badge>
                    {item.difficulty ? (
                      <Badge variant="brand">
                        {DIFFICULTY_LABELS[item.difficulty as Difficulty]}
                      </Badge>
                    ) : null}
                    <span className="ml-auto text-xs text-ink-400">
                      {formatRelativeTime(item.discovered_at)}
                    </span>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm font-medium text-navy-900 transition-quick hover:text-brand-500"
                  >
                    {item.title}
                  </a>

                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
                      {item.description}
                    </p>
                  ) : null}

                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <form action={publishDiscovery}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-medium text-white transition-quick hover:bg-brand-600"
                      >
                        Publicar
                      </button>
                    </form>
                    <Link
                      href={`/admin/resources/${item.slug}`}
                      className="text-xs font-medium text-brand-500 transition-quick hover:text-brand-400"
                    >
                      Ajustar antes
                    </Link>
                    <form action={discardDiscovery}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-ink-400 transition-quick hover:text-navy-900"
                      >
                        Descartar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={filters.page}
              total={total}
              pageSize={QUEUE_PAGE_SIZE}
              hrefFor={(page) =>
                `/admin/discover?${queueQueryString(filters, { page })}`
              }
            />
          </>
        )}
      </section>

      <p className="text-xs leading-relaxed text-ink-400">
        Importar não publica nada: os itens entram despublicados e sem selo de
        revisão. Guardamos apenas metadados — título, descrição e link — e o
        acesso sempre vai para a fonte original.
      </p>
    </div>
  );
}

function FacetRow({
  label,
  options,
  current,
  filters,
  param,
  format,
}: {
  label: string;
  options: { value: string; count: number }[];
  current?: string;
  filters: QueueFilters;
  param: "provider" | "type" | "lang";
  format?: (value: string) => string;
}) {
  if (options.length < 2) return null;

  const key = param === "lang" ? "language" : param;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-14 shrink-0 text-xs text-ink-400">{label}</span>
      {options.map((option) => {
        const active = current === option.value;
        const href = `/admin/discover?${queueQueryString(filters, {
          [key]: active ? undefined : option.value,
          page: 1,
        } as Partial<QueueFilters>)}`;

        return (
          <Link
            key={option.value}
            href={href}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-quick",
              active
                ? "border-navy-900 bg-navy-900 font-medium text-surface"
                : "border-line text-ink-700 hover:border-brand-400",
            )}
          >
            {format ? format(option.value) : option.value}
            <span className={cn("ml-1", active ? "opacity-70" : "text-ink-400")}>
              {option.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
