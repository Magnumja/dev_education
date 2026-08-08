import Link from "next/link";
import { BadgeCheck, CheckCircle2, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toggleResourceFlag } from "@/lib/admin/actions";
import { RESOURCE_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import type { ResourceType } from "@/types";

interface Row {
  id: string;
  slug: string;
  title: string;
  source_domain: string;
  resource_type: ResourceType;
  is_verified: boolean;
  is_active: boolean;
}

type ResourcesPageProps = {
  searchParams: Promise<{ q?: string; saved?: string }>;
};

export default async function AdminResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const { q = "", saved } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("resources")
    .select(
      "id, slug, title, source_domain, resource_type, is_verified, is_active",
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

  const { data, error } = await query;
  if (error) console.error("Falha ao carregar catálogo:", error);

  const resources = (data ?? []) as Row[];

  return (
    <div>
      {saved ? (
        <p
          role="status"
          className="mb-5 flex items-center gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-navy-900"
        >
          <CheckCircle2 className="size-4 shrink-0 text-brand-500" aria-hidden />
          Conteúdo salvo.{" "}
          <Link
            href={`/resource/${saved}`}
            className="font-medium text-brand-500 hover:underline"
          >
            Ver na página pública
          </Link>
        </p>
      ) : null}

      <form className="mb-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Filtrar por título…"
          aria-label="Filtrar catálogo por título"
          className="h-9 w-full max-w-xs rounded-md border border-line bg-surface px-3 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400"
        />
      </form>

      <p className="mb-3 text-xs text-ink-400">
        {resources.length} {resources.length === 1 ? "conteúdo" : "conteúdos"}
        {q ? ` para “${q}”` : ""}
      </p>

      <ul className="divide-y divide-line border-y border-line">
        {resources.map((resource) => (
          <li key={resource.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/resources/${resource.slug}`}
                className={cn(
                  "block truncate text-sm font-medium transition-quick hover:text-brand-500",
                  resource.is_active ? "text-navy-900" : "text-ink-400 line-through",
                )}
              >
                {resource.title}
              </Link>
              <p className="mt-0.5 truncate text-xs text-ink-400">
                {RESOURCE_TYPE_LABELS[resource.resource_type]} ·{" "}
                {resource.source_domain}
              </p>
            </div>

            <FlagButton
              id={resource.id}
              field="is_verified"
              value={resource.is_verified}
              onLabel="Revisado"
              offLabel="Marcar como revisado"
              icon={<BadgeCheck className="size-3.5" aria-hidden />}
            />
            <FlagButton
              id={resource.id}
              field="is_active"
              value={resource.is_active}
              onLabel="Publicado"
              offLabel="Despublicado"
              icon={<EyeOff className="size-3.5" aria-hidden />}
            />
          </li>
        ))}
      </ul>

      {resources.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-500">
          Nenhum conteúdo encontrado.
        </p>
      ) : null}
    </div>
  );
}

function FlagButton({
  id,
  field,
  value,
  onLabel,
  offLabel,
  icon,
}: {
  id: string;
  field: "is_verified" | "is_active";
  value: boolean;
  onLabel: string;
  offLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <form action={toggleResourceFlag} className="shrink-0">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="next" value={String(!value)} />
      <button
        type="submit"
        title={value ? `${onLabel} — clique para desfazer` : offLabel}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-quick",
          value
            ? "border-brand-100 bg-brand-50 text-brand-600"
            : "border-line text-ink-400 hover:text-navy-900",
        )}
      >
        {icon}
        <span className="hidden sm:inline">{value ? onLabel : offLabel}</span>
      </button>
    </form>
  );
}
