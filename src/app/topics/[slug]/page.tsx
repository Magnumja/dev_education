import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceList } from "@/components/resources/ResourceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { search } from "@/lib/search";
import { getTopicBySlug, getTopicsWithCounts } from "@/lib/search/resources";
import { getCurrentUser, getSavedResourceSlugs } from "@/lib/auth/session";
import type { ResourceType, SearchResult } from "@/types";

type TopicPageProps = { params: Promise<{ slug: string }> };

// Mesma razão de /resource/[id]: conteúdo por sessão, sempre dinâmico.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const topic = await getTopicBySlug((await params).slug);
  if (!topic) return {};

  return {
    title: topic.name,
    description: topic.description ?? undefined,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: {
      title: `${topic.name} — conteúdos selecionados`,
      description: topic.description ?? undefined,
    },
  };
}

/** Ordem editorial das seções da página de tecnologia. */
const SECTIONS: { title: string; types: ResourceType[] }[] = [
  { title: "Documentações", types: ["documentation"] },
  { title: "Cursos e vídeos", types: ["course", "video"] },
  { title: "Artigos e leituras", types: ["article", "pdf"] },
  { title: "Exercícios", types: ["exercise"] },
  { title: "Projetos e ferramentas", types: ["repository", "tool"] },
];

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;

  const [topic, { results }, user, savedIds] = await Promise.all([
    getTopicBySlug(slug),
    // 40 em vez de 100: cada card custa ~4 KB entre HTML e payload, e ninguém
    // percorre cem itens numa página de tecnologia sem filtrar antes.
    search({ topics: [slug] }, { limit: 40 }),
    getCurrentUser(),
    getSavedResourceSlugs(),
  ]);

  if (!topic) notFound();

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title={`Ainda não há conteúdos de ${topic.name}.`}
          description="Esta tecnologia acabou de entrar no catálogo. Volte em breve ou sugira o primeiro material."
        >
          <ButtonLink href="/submit">Sugerir conteúdo</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const listProps = { isAuthenticated: Boolean(user), savedIds };
  const starters = results.filter((r) => r.difficulty === "beginner").slice(0, 3);
  const starterIds = new Set(starters.map((r) => r.id));
  const related = await relatedTopics(results, slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Trilha de navegação" className="text-sm text-ink-400">
        <Link href="/topics" className="transition-quick hover:text-brand-600">
          Tecnologias
        </Link>
        <span className="mx-1.5" aria-hidden>
          /
        </span>
        <span className="text-ink-700">{topic.name}</span>
      </nav>

      <header className="mt-4 border-b border-line pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
          {topic.name}
        </h1>
        {topic.description ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
            {topic.description}
          </p>
        ) : null}

        {related.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/topics/${item.slug}`}
                className="rounded-full border border-line px-3 py-1 text-[13px] text-ink-700 transition-quick hover:border-brand-400 hover:text-brand-600"
              >
                {item.name}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {starters.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-navy-900">
            Comece por aqui
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Materiais introdutórios para quem está chegando agora em {topic.name}.
          </p>
          <div className="mt-4">
            <ResourceList resources={starters} {...listProps} />
          </div>
        </section>
      ) : null}

      {SECTIONS.map((section) => {
        const items = results.filter(
          (resource) =>
            section.types.includes(resource.type) && !starterIds.has(resource.id),
        );
        if (items.length === 0) return null;

        return (
          <section key={section.title} className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-navy-900">
              {section.title}
            </h2>
            <div className="mt-4">
              <ResourceList resources={items} {...listProps} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

async function relatedTopics(resources: SearchResult[], currentSlug: string) {
  const slugs = new Set<string>();
  for (const resource of resources) {
    for (const slug of resource.topics) {
      if (slug !== currentSlug) slugs.add(slug);
    }
  }

  const all = await getTopicsWithCounts();
  return all.map(({ topic }) => topic).filter((topic) => slugs.has(topic.slug));
}
