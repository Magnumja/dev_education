import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { FiltersDrawer } from "@/components/search/FiltersDrawer";
import { SortSelect } from "@/components/search/SortSelect";
import {
  SearchResults,
  SearchResultCount,
} from "@/components/search/SearchResults";
import { ResourceListSkeleton, Skeleton } from "@/components/ui/LoadingSkeleton";
import { buildSearchQuery, parseSearchParams } from "@/lib/search/params";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { query } = parseSearchParams(await searchParams);
  return {
    title: query ? `${query} — resultados` : "Explorar conteúdos",
    description: query
      ? `Vídeos, documentações, artigos e exercícios sobre ${query}, reunidos e revisados pelo DevEducation.`
      : "Explore conteúdos de programação filtrados por tipo, nível, idioma e tecnologia.",
    robots: query ? { index: false } : undefined,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseSearchParams(await searchParams);
  const activeFilterCount =
    filters.types.length +
    filters.difficulties.length +
    filters.languages.length +
    filters.topics.length;

  // A chave reinicia o Suspense a cada mudança de filtro, para que o
  // skeleton reapareça em vez de segurar os resultados anteriores.
  const key = buildSearchQuery(filters);

  return (
    <div className="px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-navy-900">
        {filters.query ? (
          <>
            Resultados para{" "}
            <span className="text-brand-500">“{filters.query}”</span>
          </>
        ) : (
          "Explorar conteúdos"
        )}
      </h1>

      <div className="flex items-center justify-between gap-4">
        <Suspense key={`count-${key}`} fallback={<Skeleton className="h-5 w-48" />}>
          <SearchResultCount filters={filters} />
        </Suspense>

        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <FiltersDrawer activeCount={activeFilterCount} />
          </div>
          <SortSelect value={filters.sort} />
        </div>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <SearchFilters />
          </div>
        </aside>

        <section aria-label="Resultados da busca">
          <Suspense key={key} fallback={<ResourceListSkeleton />}>
            <SearchResults filters={filters} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
