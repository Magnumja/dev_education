import Link from "next/link";
import { Check } from "lucide-react";
import { HeroArt } from "@/components/dashboard/HeroArt";
import { SourcesPanel } from "@/components/dashboard/SourcesPanel";
import { TrendingPanel } from "@/components/dashboard/TrendingPanel";
import { TechRail } from "@/components/dashboard/TechRail";
import { TileRail } from "@/components/dashboard/TileRail";
import { ResourceTile } from "@/components/dashboard/ResourceTile";
import {
  DiscoverTabs,
  resolveTab,
} from "@/components/dashboard/DiscoverTabs";
import { Panel } from "@/components/dashboard/Panel";
import { ResourceList } from "@/components/resources/ResourceList";
import { ButtonLink } from "@/components/ui/Button";
import { search } from "@/lib/search";
import { getTopicsWithCounts } from "@/lib/search/resources";
import { getRecentlyOpened, getSourceStats, getTrending } from "@/lib/search/stats";
import { getCurrentUser, getSavedResourceSlugs } from "@/lib/auth/session";
import { getUserSnapshot } from "@/lib/search/user-snapshot";
import { UserSummary } from "@/components/dashboard/UserSummary";
import { formatRelativeTime } from "@/lib/utils/format";

const CLAIMS = [
  "Várias fontes, um só lugar",
  "Conteúdo relevante e atualizado",
  "Economize tempo, aprenda mais",
];

type HomeProps = {
  searchParams: Promise<{ tab?: string }>;
};

// Painel personalizado (histórico, favoritos): sempre dinâmica.
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomeProps) {
  const tab = resolveTab((await searchParams).tab);

  const [user, savedIds, topics, sourceStats, trending, recent, discover, snapshot] =
    await Promise.all([
      getCurrentUser(),
      getSavedResourceSlugs(),
      getTopicsWithCounts(),
      getSourceStats(),
      getTrending(5),
      getRecentlyOpened(6),
      search(tab.filters, { limit: 6 }),
      getUserSnapshot(),
    ]);

  const firstName = user?.profile?.name?.split(" ")[0];
  const listProps = { isAuthenticated: Boolean(user), savedIds };

  // Sem histórico (visitante ou primeiro acesso), sugerimos por onde começar.
  const starters =
    recent.length > 0
      ? null
      : await search({ difficulties: ["beginner"] }, { limit: 6 });

  return (
    <div className="px-4 pb-14 pt-4 sm:px-6 lg:pt-2">
      <header className="max-w-2xl">
        <h1 className="text-[26px] font-semibold tracking-tight text-navy-900 sm:text-[32px]">
          Foco no que importa
          {firstName ? (
            <>
              , <span className="text-brand-500">{firstName}</span>
            </>
          ) : (
            <>
              , <span className="text-brand-500">dev</span>
            </>
          )}
          <span className="text-brand-400">._</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500 sm:text-base">
          Todo o melhor conteúdo da web, filtrado para acelerar seu aprendizado.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          <section className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-7">
            <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <HeroArt className="h-auto w-full max-w-md" />

              <div>
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-navy-900 sm:text-[22px]">
                  Um filtro inteligente para o conhecimento de desenvolvedores
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {CLAIMS.map((claim) => (
                    <li key={claim} className="flex items-center gap-2.5 text-sm">
                      <span
                        aria-hidden
                        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50"
                      >
                        <Check className="size-3 text-brand-500" />
                      </span>
                      <span className="text-ink-700">{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {recent.length > 0 ? (
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
          ) : starters && starters.results.length > 0 ? (
            <TileRail
              title="Comece por aqui"
              description="Materiais introdutórios bem avaliados para dar o primeiro passo."
              action={{ href: "/search?level=beginner", label: "Ver todos" }}
            >
              {starters.results.map((resource) => (
                <ResourceTile key={resource.id} resource={resource} />
              ))}
            </TileRail>
          ) : null}

          {snapshot.recentFavorites.length > 0 ? (
            <TileRail
              title="Seus favoritos"
              description="O que você guardou para depois."
              action={{ href: "/favorites", label: "Ver todos" }}
            >
              {snapshot.recentFavorites.map((resource) => (
                <ResourceTile key={resource.id} resource={resource} />
              ))}
            </TileRail>
          ) : null}

          <TechRail topics={topics} />

          <section>
            <div className="mb-4">
              <h2 className="text-[17px] font-semibold tracking-tight text-navy-900">
                Descubra algo novo
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Filtre por tipo de material e veja o que a curadoria separou.
              </p>
            </div>

            <DiscoverTabs active={tab.key} />

            <div className="mt-2">
              <ResourceList resources={discover.results} {...listProps} />
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          {user ? <UserSummary snapshot={snapshot} /> : null}
          <SourcesPanel stats={sourceStats} />
          <TrendingPanel items={trending} />

          <Panel title="Falta algo aqui?">
            <p className="text-sm leading-relaxed text-ink-500">
              O DevEducation é gratuito e construído junto com a comunidade. Sugira
              um material e a curadoria revisa antes de publicar.
            </p>
            <ButtonLink href="/submit" variant="secondary" size="sm" className="mt-4">
              Sugerir conteúdo
            </ButtonLink>
          </Panel>

          <p className="px-1 text-xs leading-relaxed text-ink-400">
            Não hospedamos conteúdo. Cada link leva à fonte original, que fica com
            o crédito e o acesso.{" "}
            <Link href="/about" className="text-brand-500 hover:underline">
              Como funciona
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
