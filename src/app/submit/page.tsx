import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmitForm } from "@/components/resources/SubmitForm";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { SubmissionRow } from "@/types/database";
import { SUBMISSION_LABELS } from "@/constants";

export const metadata: Metadata = {
  title: "Sugerir conteúdo",
  description:
    "Indique um material gratuito que deveria estar no DevEducation. Toda sugestão passa por revisão da curadoria.",
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/submit");

  const supabase = await createClient();
  const { data } = await supabase
    .from("resource_submissions")
    .select("id, url, title, status, created_at, review_note")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const submissions = (data ?? []) as Pick<
    SubmissionRow,
    "id" | "url" | "title" | "status" | "created_at" | "review_note"
  >[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
        Sugerir conteúdo
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-500">
        Conhece um material gratuito que ajudaria outros desenvolvedores? Envie o
        link. Nada é publicado automaticamente: a curadoria verifica se o conteúdo
        é gratuito, atual e de fonte confiável antes de entrar no catálogo.
      </p>

      <div className="mt-8">
        <SubmitForm />
      </div>

      {submissions.length > 0 ? (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-lg font-semibold tracking-tight text-navy-900">
            Suas sugestões
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {submissions.map((submission) => (
              <li key={submission.id} className="flex items-start gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {submission.title ?? submission.url}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {submission.url}
                  </p>
                  {submission.review_note ? (
                    <p className="mt-1.5 text-xs text-ink-500">
                      {submission.review_note}
                    </p>
                  ) : null}
                </div>
                <Badge
                  variant={submission.status === "approved" ? "brand" : "neutral"}
                >
                  {SUBMISSION_LABELS[submission.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
