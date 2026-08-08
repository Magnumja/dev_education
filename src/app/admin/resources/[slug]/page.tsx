import { notFound } from "next/navigation";
import Link from "next/link";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { createClient } from "@/lib/supabase/server";
import { getTopicsWithCounts } from "@/lib/search/resources";
import type { Difficulty, ResourceLanguage, ResourceType } from "@/types";

interface EditRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  author: string | null;
  resource_type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  is_verified: boolean;
  is_active: boolean;
  resource_topics: { topics: { slug: string } | null }[];
  resource_tags: { tags: { name: string } | null }[];
}

type EditPageProps = { params: Promise<{ slug: string }> };

export default async function EditResourcePage({ params }: EditPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [topicsWithCounts, result] = await Promise.all([
    getTopicsWithCounts(),
    supabase
      .from("resources")
      .select(
        "id, slug, title, description, url, source, author, resource_type, difficulty, language, is_verified, is_active, resource_topics(topics(slug)), resource_tags(tags(name))",
      )
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (!result.data) notFound();
  const resource = result.data as unknown as EditRow;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-navy-900">
          Editar conteúdo
        </h2>
        <Link
          href={`/resource/${resource.slug}`}
          className="text-xs font-medium text-brand-500 transition-quick hover:text-brand-400"
        >
          Ver página pública
        </Link>
      </div>

      <div className="mt-6">
        <ResourceForm
          topics={topicsWithCounts.map((item) => item.topic)}
          values={{
            id: resource.id,
            slug: resource.slug,
            title: resource.title,
            description: resource.description ?? undefined,
            url: resource.url,
            source: resource.source,
            author: resource.author ?? undefined,
            resourceType: resource.resource_type,
            difficulty: resource.difficulty ?? "",
            language: resource.language,
            isVerified: resource.is_verified,
            isActive: resource.is_active,
            topics: resource.resource_topics.flatMap((rt) =>
              rt.topics ? [rt.topics.slug] : [],
            ),
            tags: resource.resource_tags.flatMap((rt) =>
              rt.tags ? [rt.tags.name] : [],
            ),
          }}
        />
      </div>
    </div>
  );
}
