import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminStats } from "@/lib/admin/stats";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();
  const supabase = await createClient();

  const { data } = await supabase
    .from("resources")
    .select("slug, title, is_active, is_verified, updated_at")
    .order("updated_at", { ascending: false })
    .limit(6);

  const recent = (data ?? []) as {
    slug: string;
    title: string;
    is_active: boolean;
    is_verified: boolean;
    updated_at: string;
  }[];

  const queues = [
    {
      href: "/admin/submissions",
      label: "Sugestões da comunidade",
      value: stats.pendingSubmissions,
      hint: "aguardando revisão",
    },
    {
      href: "/admin/discover",
      label: "Descobertas dos providers",
      value: stats.inQueue,
      hint: "importados, ainda despublicados",
    },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="sr-only">Números do catálogo</h2>
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="Publicados" value={stats.published} />
          <Stat label="Com selo de revisão" value={stats.verified} />
          <Stat label="Tecnologias" value={stats.topics} />
          <Stat label="Contas" value={stats.users} />
        </dl>
        <p className="mt-2.5 text-xs text-ink-400">
          {stats.clicksLast7Days === 0
            ? "Nenhum conteúdo aberto nos últimos 7 dias."
            : `${stats.clicksLast7Days} ${
                stats.clicksLast7Days === 1 ? "acesso" : "acessos"
              } a conteúdos nos últimos 7 dias.`}
        </p>
      </section>

      <section>
        <h2 className="text-[15px] font-semibold text-navy-900">
          Esperando por você
        </h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {queues.map((queue) => (
            <Link
              key={queue.href}
              href={queue.href}
              className={cn(
                "flex items-center gap-4 rounded-card border px-4 py-3.5 transition-quick",
                queue.value > 0
                  ? "border-brand-100 bg-brand-50 hover:border-brand-400"
                  : "border-line bg-surface hover:border-brand-400",
              )}
            >
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  queue.value > 0 ? "text-brand-600" : "text-ink-400",
                )}
              >
                {queue.value}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-navy-900">
                  {queue.label}
                </span>
                <span className="block text-xs text-ink-500">{queue.hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-400" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-navy-900">
              Editados recentemente
            </h2>
            <Link
              href="/admin/resources"
              className="text-[13px] font-medium text-brand-500 transition-quick hover:text-brand-400"
            >
              Ver catálogo
            </Link>
          </div>

          <ul className="mt-3 divide-y divide-line border-y border-line">
            {recent.map((resource) => (
              <li key={resource.slug} className="flex items-center gap-3 py-2.5">
                <Link
                  href={`/admin/resources/${resource.slug}`}
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm transition-quick hover:text-brand-500",
                    resource.is_active
                      ? "text-navy-900"
                      : "text-ink-400 line-through",
                  )}
                >
                  {resource.title}
                </Link>
                <span className="shrink-0 text-xs text-ink-400">
                  {resource.is_active ? "publicado" : "na fila"} ·{" "}
                  {formatRelativeTime(resource.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3.5">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-navy-900">
        {value}
      </dd>
    </div>
  );
}
