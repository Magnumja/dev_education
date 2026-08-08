import Link from "next/link";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { rejectSubmission, reopenSubmission } from "@/lib/admin/actions";
import { formatRelativeTime } from "@/lib/utils/format";
import { SUBMISSION_LABELS } from "@/constants";
import type { SubmissionStatus } from "@/types";

interface SubmissionRow {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  status: SubmissionStatus;
  review_note: string | null;
  created_at: string;
  profiles: { name: string | null } | null;
}

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resource_submissions")
    .select(
      "id, url, title, description, status, review_note, created_at, profiles (name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) console.error("Falha ao carregar submissões:", error);

  const submissions = (data ?? []) as unknown as SubmissionRow[];
  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h2 className="text-[15px] font-semibold text-navy-900">
          Aguardando revisão
          {pending.length > 0 ? (
            <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
              {pending.length}
            </span>
          ) : null}
        </h2>

        {pending.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-5" aria-hidden />}
            title="Nenhuma sugestão na fila."
            description="Quando alguém sugerir um conteúdo em /submit, ele aparece aqui para revisão."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((submission) => (
              <li
                key={submission.id}
                className="rounded-card border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-navy-900">
                    {submission.title ?? "Sem título informado"}
                  </h3>
                  <span className="text-xs text-ink-400">
                    {submission.profiles?.name ?? "anônimo"} ·{" "}
                    {formatRelativeTime(submission.created_at)}
                  </span>
                </div>

                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-xs text-brand-500 transition-quick hover:underline"
                >
                  {submission.url}
                </a>

                {submission.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {submission.description}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <ButtonLink
                    href={`/admin/resources/new?submission=${submission.id}`}
                    size="sm"
                  >
                    Aprovar e catalogar
                  </ButtonLink>

                  <form action={rejectSubmission} className="flex gap-2">
                    <input type="hidden" name="id" value={submission.id} />
                    <input
                      name="note"
                      placeholder="Motivo (opcional)"
                      aria-label="Motivo da recusa"
                      className="h-8 w-44 rounded-md border border-line px-2 text-[13px] text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Recusar
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {reviewed.length > 0 ? (
        <section>
          <h2 className="text-[15px] font-semibold text-navy-900">
            Já revisadas
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {reviewed.map((submission) => (
              <li
                key={submission.id}
                className="flex items-start gap-3 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy-900">
                    {submission.title ?? submission.url}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {submission.url}
                  </p>
                  {submission.review_note ? (
                    <p className="mt-1 text-xs text-ink-500">
                      Nota: {submission.review_note}
                    </p>
                  ) : null}
                </div>

                <Badge
                  variant={submission.status === "approved" ? "brand" : "neutral"}
                >
                  {SUBMISSION_LABELS[submission.status]}
                </Badge>

                <form action={reopenSubmission}>
                  <input type="hidden" name="id" value={submission.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-ink-400 transition-quick hover:text-brand-500"
                  >
                    Reabrir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs leading-relaxed text-ink-400">
        Recusar não apaga a sugestão — ela fica registrada e pode ser reaberta.
        Para tirar um conteúdo já publicado do ar, desative-o em{" "}
        <Link href="/admin/resources" className="text-brand-500 hover:underline">
          Catálogo
        </Link>
        .
      </p>
    </div>
  );
}
