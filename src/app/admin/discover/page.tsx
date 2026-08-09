import Link from "next/link";
import { Compass, Star } from "lucide-react";
import { DiscoverForm } from "@/components/admin/DiscoverForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { getTopicsWithCounts } from "@/lib/search/resources";
import {
  discardDiscovery,
  publishDiscovery,
} from "@/lib/admin/discover-actions";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import type { Difficulty, ResourceLanguage, ResourceType } from "@/types";

interface DiscoveryRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  url: string;
  source_domain: string;
  resource_type: ResourceType;
  difficulty: Difficulty | null;
  language: ResourceLanguage;
  provider: string | null;
  provider_signals: { stars?: number; release?: string } | null;
  discovered_at: string | null;
}

export default async function DiscoverPage() {
  const supabase = await createClient();

  const [topicsWithCounts, result] = await Promise.all([
    getTopicsWithCounts(),
    supabase
      .from("resources")
      .select(
        "id, slug, title, description, url, source_domain, resource_type, difficulty, language, provider, provider_signals, discovered_at",
      )
      .eq("is_active", false)
      .not("provider", "is", null)
      .order("discovered_at", { ascending: false })
      .limit(60),
  ]);

  if (result.error) console.error("Falha ao carregar descobertas:", result.error);
  const discoveries = (result.data ?? []) as unknown as DiscoveryRow[];

  return (
    <div className="max-w-3xl space-y-8">
      <DiscoverForm topics={topicsWithCounts.map((item) => item.topic)} />

      <section>
        <h2 className="text-[15px] font-semibold text-navy-900">
          Fila de descobertas
          {discoveries.length > 0 ? (
            <span className="ml-2 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
              {discoveries.length}
            </span>
          ) : null}
        </h2>

        {discoveries.length === 0 ? (
          <EmptyState
            icon={<Compass className="size-5" aria-hidden />}
            title="Nada na fila."
            description="Use o formulário acima para buscar conteúdo nas fontes, ou espere a ingestão agendada rodar."
          />
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {discoveries.map((item) => (
              <li key={item.id} className="py-3.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <Badge variant="outline">{item.provider}</Badge>
                  <span className="text-xs text-ink-400">
                    {RESOURCE_TYPE_LABELS[item.resource_type]} ·{" "}
                    {item.source_domain}
                  </span>
                  {item.provider_signals?.stars ? (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                      <Star className="size-3" aria-hidden />
                      {item.provider_signals.stars.toLocaleString("pt-BR")}
                    </span>
                  ) : null}
                  <Badge variant="outline">
                    {LANGUAGE_LABELS[item.language]}
                  </Badge>
                  {item.difficulty ? (
                    <Badge variant="brand">
                      {DIFFICULTY_LABELS[item.difficulty]}
                    </Badge>
                  ) : null}
                  <span className="ml-auto text-xs text-ink-400">
                    {formatRelativeTime(item.discovered_at)}
                  </span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-medium text-navy-900 transition-quick hover:text-brand-500"
                >
                  {item.title}
                </a>

                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <form action={publishDiscovery}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-brand-500 px-2.5 py-1 text-xs font-medium text-white transition-quick hover:bg-brand-600"
                    >
                      Publicar
                    </button>
                  </form>
                  <Link
                    href={`/admin/resources/${item.slug}`}
                    className="text-xs font-medium text-brand-500 transition-quick hover:text-brand-400"
                  >
                    Ajustar antes
                  </Link>
                  <form action={discardDiscovery}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-ink-400 transition-quick hover:text-navy-900"
                    >
                      Descartar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs leading-relaxed text-ink-400">
        Importar não publica nada: os itens entram como despublicados e sem selo
        de revisão. Guardamos apenas metadados — título, descrição e link — e o
        acesso sempre vai para a fonte original.
      </p>
    </div>
  );
}
