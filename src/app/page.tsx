import { Suspense } from "react";
import { Check } from "lucide-react";
import { HeroArt } from "@/components/dashboard/HeroArt";
import { resolveTab } from "@/components/dashboard/DiscoverTabs";
import {
  ContinueSection,
  DiscoverSection,
  FavoritesSection,
  PanelSkeleton,
  RailSkeleton,
  SidePanels,
  TechSection,
} from "@/components/dashboard/HomeSections";
import { ResourceListSkeleton } from "@/components/ui/LoadingSkeleton";
import { getCurrentUser } from "@/lib/auth/session";

const CLAIMS = [
  "Várias fontes, um só lugar",
  "Conteúdo relevante e atualizado",
  "Economize tempo, aprenda mais",
];

// Painel personalizado (histórico, favoritos): sempre dinâmica.
export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const tab = resolveTab((await searchParams).tab);

  // A única espera antes do primeiro byte: o nome de quem está no cabeçalho.
  // Todo o resto é transmitido depois, atrás dos Suspense abaixo — antes, a
  // página aguardava oito consultas e a tela ficava vazia por até 1,3 segundo.
  const user = await getCurrentUser();
  const firstName = user?.profile?.name?.split(" ")[0];

  return (
    <div className="px-4 pb-14 pt-4 sm:px-6 lg:pt-2">
      <header className="max-w-2xl">
        <h1 className="text-[26px] font-semibold tracking-tight text-navy-900 sm:text-[32px]">
          Foco no que importa,{" "}
          <span className="text-brand-500">{firstName ?? "dev"}</span>
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

          <Suspense fallback={<RailSkeleton />}>
            <ContinueSection />
          </Suspense>

          <Suspense fallback={null}>
            <FavoritesSection />
          </Suspense>

          <Suspense fallback={<RailSkeleton />}>
            <TechSection />
          </Suspense>

          <Suspense
            key={tab.key}
            fallback={
              <div>
                <div className="mb-6 h-6" />
                <ResourceListSkeleton count={4} />
              </div>
            }
          >
            <DiscoverSection filters={tab.filters} tabKey={tab.key} />
          </Suspense>
        </div>

        <aside className="min-w-0 space-y-4">
          <Suspense fallback={<PanelSkeleton />}>
            <SidePanels />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
