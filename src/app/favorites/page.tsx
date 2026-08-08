import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { ResourceList } from "@/components/resources/ResourceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { toSearchResult } from "@/lib/search";
import type { SearchResourceRow } from "@/types/database";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Os conteúdos que você salvou no DevEducation.",
  robots: { index: false },
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/favorites");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(
      "created_at, resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Falha ao carregar favoritos:", error);

  const resources = (data ?? []).flatMap((row) => {
    const related = (row as unknown as FavoriteRow).resources;
    if (!related) return [];
    const rows = Array.isArray(related) ? related : [related];
    // Topics e tags não são necessários no card de favoritos.
    return rows.map((item) =>
      toSearchResult({
        ...item,
        id: item.slug,
        topics: [],
        tags: [],
        score: 0,
        total_count: 0,
      }),
    );
  });

  const savedIds = new Set(resources.map((resource) => resource.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
          Favoritos
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {resources.length === 0
            ? "Nada salvo ainda."
            : `${resources.length} ${resources.length === 1 ? "conteúdo salvo" : "conteúdos salvos"}.`}
        </p>
      </header>

      <div className="mt-8">
        {resources.length > 0 ? (
          <ResourceList resources={resources} isAuthenticated savedIds={savedIds} />
        ) : (
          <EmptyState
            icon={<Bookmark className="size-5" aria-hidden />}
            title="Você ainda não salvou nenhum conteúdo."
            description="Toque no ícone de marcador em qualquer resultado para guardá-lo aqui e voltar depois."
          >
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink href="/search" size="sm">
                Explorar conteúdos
              </ButtonLink>
              <ButtonLink href="/topics" variant="secondary" size="sm">
                Ver tecnologias
              </ButtonLink>
            </div>
          </EmptyState>
        )}
      </div>
    </div>
  );
}

type FavoriteResource = Omit<
  SearchResourceRow,
  "id" | "topics" | "tags" | "score" | "total_count"
>;

interface FavoriteRow {
  resources: FavoriteResource | FavoriteResource[] | null;
}
