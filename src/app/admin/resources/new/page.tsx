import { ResourceForm } from "@/components/admin/ResourceForm";
import { createClient } from "@/lib/supabase/server";
import { getTopicsWithCounts } from "@/lib/search/resources";
import { slugify } from "@/lib/providers/types";

type NewResourcePageProps = {
  searchParams: Promise<{ submission?: string }>;
};

export default async function NewResourcePage({
  searchParams,
}: NewResourcePageProps) {
  const { submission: submissionId } = await searchParams;

  const supabase = await createClient();
  const [topicsWithCounts, submission] = await Promise.all([
    getTopicsWithCounts(),
    submissionId
      ? supabase
          .from("resource_submissions")
          .select("id, url, title, description")
          .eq("id", submissionId)
          .maybeSingle<{
            id: string;
            url: string;
            title: string | null;
            description: string | null;
          }>()
          .then((result) => result.data)
      : null,
  ]);

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-navy-900">
        {submission ? "Catalogar sugestão" : "Novo conteúdo"}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
        {submission
          ? "Complete os metadados. Ao publicar, a sugestão é marcada como aprovada."
          : "Cadastre um material que já vive em outro lugar da web. O DevEducation guarda só os metadados."}
      </p>

      <div className="mt-6">
        <ResourceForm
          submissionId={submission?.id}
          topics={topicsWithCounts.map((item) => item.topic)}
          values={{
            url: submission?.url,
            title: submission?.title ?? undefined,
            description: submission?.description ?? undefined,
            slug: submission?.title ? slugify(submission.title) : undefined,
          }}
        />
      </div>
    </div>
  );
}
