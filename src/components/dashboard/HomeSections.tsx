import Link from "next/link";
import { SourcesPanel } from "@/components/dashboard/SourcesPanel";
import { TrendingPanel } from "@/components/dashboard/TrendingPanel";
import { TechRail } from "@/components/dashboard/TechRail";
import { TileRail } from "@/components/dashboard/TileRail";
import { ResourceTile } from "@/components/dashboard/ResourceTile";
import { UserSummary } from "@/components/dashboard/UserSummary";
import { Panel } from "@/components/dashboard/Panel";
import { DiscoverTabs } from "@/components/dashboard/DiscoverTabs";
import { ResourceList } from "@/components/resources/ResourceList";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { search } from "@/lib/search";
import { getTopicsWithCounts } from "@/lib/search/resources";
import { getRecentlyOpened, getSourceStats, getTrending } from "@/lib/search/stats";
import { getUserSnapshot } from "@/lib/search/user-snapshot";
import { getCurrentUser, getSavedResourceSlugs } from "@/lib/auth/session";
import { formatRelativeTime } from "@/lib/utils/format";
import type { SearchFiltersState } from "@/types";

/**
 * Cada seção da home busca os próprios dados.
 *
 * Antes a página aguardava oito consultas antes de enviar qualquer coisa: o
 * primeiro byte saía junto com o último, e a pessoa olhava para uma tela vazia
 * por até 1,3 segundo. Separadas, elas ficam atrás de <Suspense> e o cabeçalho
 * com a busca aparece de imediato, enquanto o resto preenche.
 */

export async function ContinueSection() {
  const [recent, savedIds] = await Promise.all([
    getRecentlyOpened(6),
    getSavedResourceSlugs(),
  ]);

  if (recent.length > 0) {
    return (
      <TileRail
        title="Continue de onde parou"
        description="Os últimos conteúdos que você abriu pelo DevEducation."
        action={{ href: "/favorites", label: "Ver salvos" }}
      >
        {recent.map((item) => (
          <ResourceTile
            key={item.resource.id}
            resource={item.resource}
            footnote={`Aberto ${formatRelativeTime(item.openedAt)}`}
          />
        ))}
      </TileRail>
    );
  }

  const starters = await search({ difficulties: ["beginner"] }, { limit: 6 });
  if (starters.results.length === 0) return null;

  return (
    <TileRail
      title="Comece por aqui"
      description="Materiais introdutórios bem avaliados para dar o primeiro passo."
      action={{ href: "/search?level=beginner", label: "Ver todos" }}
    >
      {starters.results.map((resource) => (
        <ResourceTile
          key={resource.id}
          resource={resource}
          footnote={savedIds.has(resource.id) ? "Salvo" : undefined}
        />
      ))}
    </TileRail>
  );
}

export async function FavoritesSection() {
  const snapshot = await getUserSnapshot();
  if (snapshot.recentFavorites.length === 0) return null;

  return (
    <TileRail
      title="Seus favoritos"
      description="O que você guardou para depois."
      action={{ href: "/favorites", label: "Ver todos" }}
    >
      {snapshot.recentFavorites.map((resource) => (
        <ResourceTile key={resource.id} resource={resource} />
      ))}
    </TileRail>
  );
}

export async function TechSection() {
  return <TechRail topics={await getTopicsWithCounts()} />;
}

export async function DiscoverSection({
  filters,
  tabKey,
}: {
  filters: Partial<SearchFiltersState>;
  tabKey: string;
}) {
  const [discover, user, savedIds] = await Promise.all([
    search(filters, { limit: 6 }),
    getCurrentUser(),
    getSavedResourceSlugs(),
  ]);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[17px] font-semibold tracking-tight text-navy-900">
          Descubra algo novo
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Filtre por tipo de material e veja o que a curadoria separou.
        </p>
      </div>

      <DiscoverTabs active={tabKey} />

      <div className="mt-2">
        <ResourceList
          resources={discover.results}
          isAuthenticated={Boolean(user)}
          savedIds={savedIds}
        />
      </div>
    </section>
  );
}

export async function SidePanels() {
  const [user, snapshot, sourceStats, trending] = await Promise.all([
    getCurrentUser(),
    getUserSnapshot(),
    getSourceStats(),
    getTrending(5),
  ]);

  return (
    <>
      {user ? <UserSummary snapshot={snapshot} /> : null}
      <SourcesPanel stats={sourceStats} />
      <TrendingPanel items={trending} />

      <Panel title="Falta algo aqui?">
        <p className="text-sm leading-relaxed text-ink-500">
          O DevEducation é gratuito e construído junto com a comunidade. Sugira um
          material e a curadoria revisa antes de publicar.
        </p>
        <ButtonLink href="/submit" variant="secondary" size="sm" className="mt-4">
          Sugerir conteúdo
        </ButtonLink>
      </Panel>

      <p className="px-1 text-xs leading-relaxed text-ink-400">
        Não hospedamos conteúdo. Cada link leva à fonte original, que fica com o
        crédito e o acesso.{" "}
        <Link href="/about" className="text-brand-500 hover:underline">
          Como funciona
        </Link>
      </p>
    </>
  );
}

/** Reservas de espaço com a mesma altura do conteúdo, para não haver salto. */
export function RailSkeleton() {
  return (
    <section>
      <Skeleton className="mb-4 h-6 w-56" />
      <div className="grid auto-cols-[236px] grid-flow-col gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[196px]" />
        ))}
      </div>
    </section>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-52 rounded-card" />
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}
