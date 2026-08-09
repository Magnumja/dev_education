import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BookmarkButton } from "@/components/resources/BookmarkButton";
import { ExternalResourceLink } from "@/components/resources/ExternalResourceLink";
import { ResourceTypeIcon } from "@/components/resources/ResourceTypeIcon";
import { ResourceList } from "@/components/resources/ResourceList";
import { buttonClasses } from "@/components/ui/Button";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import { getResourceBySlug } from "@/lib/search/resources";
import { getTopicsWithCounts } from "@/lib/search/resources";
import { search } from "@/lib/search";
import { getCurrentUser, getSavedResourceSlugs } from "@/lib/auth/session";
import { getRatingSummary } from "@/lib/ratings/queries";
import { RatingStars } from "@/components/resources/RatingStars";
import { RatingSummary } from "@/components/resources/RatingSummary";
import { cn } from "@/lib/utils/cn";

type ResourcePageProps = { params: Promise<{ id: string }> };

// Sem geração estática: a página mostra o estado de favorito do usuário e lê
// o banco pela sessão, então depende de cookies em toda requisição.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const resource = await getResourceBySlug((await params).id);
  if (!resource) return {};

  return {
    title: resource.title,
    description: resource.description ?? undefined,
    alternates: { canonical: `/resource/${resource.id}` },
    openGraph: {
      title: resource.title,
      description: resource.description ?? undefined,
      images: resource.thumbnailUrl ? [resource.thumbnailUrl] : undefined,
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;
  const [resource, user, savedIds] = await Promise.all([
    getResourceBySlug(id),
    getCurrentUser(),
    getSavedResourceSlugs(),
  ]);

  if (!resource) notFound();

  const [allTopics, relatedSearch, ratings] = await Promise.all([
    getTopicsWithCounts(),
    search({ topics: resource.topics }, { limit: 5 }),
    getRatingSummary(resource.id),
  ]);

  const topics = allTopics
    .map(({ topic }) => topic)
    .filter((topic) => resource.topics.includes(topic.slug));

  const related = relatedSearch.results
    .filter((item) => item.id !== resource.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <article>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <ResourceTypeIcon type={resource.type} />
          <span className="font-medium text-ink-700">
            {RESOURCE_TYPE_LABELS[resource.type]}
          </span>
          <span aria-hidden>·</span>
          <span>{resource.source}</span>
          {ratings.count > 0 ? (
            <>
              <span aria-hidden>·</span>
              <RatingSummary average={ratings.average} count={ratings.count} />
            </>
          ) : null}
        </div>

        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-3xl">
          {resource.title}
        </h1>

        {resource.description ? (
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            {resource.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {resource.difficulty ? (
            <Badge variant="brand">{DIFFICULTY_LABELS[resource.difficulty]}</Badge>
          ) : null}
          <Badge variant="outline">{LANGUAGE_LABELS[resource.language]}</Badge>
          {resource.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <ExternalResourceLink
            resourceId={resource.id}
            url={resource.url}
            className={cn(buttonClasses("primary", "md"))}
          >
            Abrir conteúdo
            <ArrowUpRight className="size-4" aria-hidden />
          </ExternalResourceLink>
          <BookmarkButton
            resourceId={resource.id}
            initialSaved={savedIds.has(resource.id)}
            isAuthenticated={Boolean(user)}
            className="border border-line"
          />
        </div>

        <section className="mt-7 rounded-card border border-line bg-surface-muted px-4 py-3.5">
          <h2 className="text-sm font-medium text-navy-900">
            {ratings.count > 0
              ? "O que a comunidade achou"
              : "Já usou este conteúdo?"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            {ratings.count > 0
              ? "Sua nota ajuda a ordenar os resultados para quem vier depois."
              : "Seja a primeira pessoa a avaliar — a nota entra no ranking da busca."}
          </p>
          <div className="mt-3">
            <RatingStars
              slug={resource.id}
              mine={ratings.mine}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </section>

        <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
          <Row label="Fonte">
            <span>{resource.source}</span>
          </Row>
          <Row label="Endereço">
            <span className="break-all text-ink-500">{resource.url}</span>
          </Row>
          {resource.author ? (
            <Row label="Autoria">
              <span>{resource.author}</span>
            </Row>
          ) : null}
          {topics.length > 0 ? (
            <Row label="Tecnologias">
              <span className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/topics/${topic.slug}`}
                    className="text-brand-600 transition-quick hover:underline"
                  >
                    {topic.name}
                  </Link>
                ))}
              </span>
            </Row>
          ) : null}
          <Row label="Curadoria">
            {resource.isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-navy-900">
                <BadgeCheck className="size-4 text-brand-500" aria-hidden />
                Revisado pela equipe do DevEducation
              </span>
            ) : (
              <span className="text-ink-500">Ainda não revisado</span>
            )}
          </Row>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-ink-400">
          O DevEducation não hospeda este conteúdo. Todo o material pertence a{" "}
          {resource.author ?? resource.source} e é acessado diretamente em{" "}
          {resource.sourceDomain}.
        </p>
      </article>

      {related.length > 0 ? (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-lg font-semibold tracking-tight text-navy-900">
            Conteúdos relacionados
          </h2>
          <div className="mt-4">
            <ResourceList
              resources={related}
              isAuthenticated={Boolean(user)}
              savedIds={savedIds}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-4 py-3">
      <dt className="text-ink-400">{label}</dt>
      <dd className="min-w-0 text-navy-900">{children}</dd>
    </div>
  );
}
