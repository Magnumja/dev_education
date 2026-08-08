import { ResourceList } from "@/components/resources/ResourceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { ButtonLink } from "@/components/ui/Button";
import { search } from "@/lib/search";
import { buildSearchQuery, hasActiveFilters } from "@/lib/search/params";
import { getCurrentUser, getSavedResourceSlugs } from "@/lib/auth/session";
import type { SearchFiltersState } from "@/types";

/**
 * Componente assíncrono separado de propósito: é ele que suspende, para que
 * o <Suspense> da página mostre o skeleton de verdade enquanto a busca roda.
 */
export async function SearchResults({
  filters,
}: {
  filters: SearchFiltersState;
}) {
  const [{ results, total, page, pageSize }, user, savedIds] = await Promise.all([
    search(filters),
    getCurrentUser(),
    getSavedResourceSlugs(),
  ]);

  if (results.length === 0) {
    const filtered = hasActiveFilters(filters);
    return (
      <EmptyState
        title="Nenhum conteúdo encontrado para sua busca."
        description={
          filtered
            ? "Tente remover alguns filtros, buscar um termo relacionado ou explorar as tecnologias disponíveis."
            : "Tente buscar um termo relacionado ou explorar as tecnologias disponíveis."
        }
      >
        <div className="flex flex-wrap justify-center gap-2">
          {filtered ? (
            <ButtonLink
              href={`/search${filters.query ? `?q=${encodeURIComponent(filters.query)}` : ""}`}
              variant="secondary"
              size="sm"
            >
              Remover filtros
            </ButtonLink>
          ) : null}
          <ButtonLink href="/topics" variant="secondary" size="sm">
            Explorar tecnologias
          </ButtonLink>
          <ButtonLink href="/submit" size="sm">
            Sugerir conteúdo
          </ButtonLink>
        </div>
      </EmptyState>
    );
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {total} {total === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}
      </p>
      <ResourceList
        resources={results}
        isAuthenticated={Boolean(user)}
        savedIds={savedIds}
      />
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        hrefFor={(nextPage) =>
          `/search?${buildSearchQuery({ ...filters, page: nextPage })}`
        }
      />
    </>
  );
}

/** Total de resultados, exibido acima da lista. Suspende junto. */
export async function SearchResultCount({
  filters,
}: {
  filters: SearchFiltersState;
}) {
  const { total } = await search(filters);

  return (
    <p className="text-sm text-ink-500">
      <strong className="font-semibold text-navy-900">{total}</strong>{" "}
      {total === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}
      {filters.query ? (
        <>
          {" "}
          para <span className="text-navy-900">“{filters.query}”</span>
        </>
      ) : null}
    </p>
  );
}
