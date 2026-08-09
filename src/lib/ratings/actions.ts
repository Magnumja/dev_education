"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface RatingState {
  error?: string;
  rating?: number;
}

/**
 * Registra ou troca a nota de quem está logado.
 *
 * A tabela tem UNIQUE (resource_id, user_id), então avaliar de novo substitui
 * em vez de acumular: cada pessoa tem um voto, e mudar de ideia é normal
 * depois de usar o material de verdade.
 *
 * O valor chega como número inteiro do formulário e é validado aqui também —
 * a checagem do banco existe, mas devolver "nota inválida" é melhor do que
 * deixar o Postgres recusar com uma mensagem que ninguém entende.
 */
export async function rateResource(
  _prevState: RatingState,
  formData: FormData,
): Promise<RatingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Entre na sua conta para avaliar." };
  }

  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Escolha uma nota de 1 a 5." };
  }

  const supabase = await createClient();

  const { data: resource } = await supabase
    .from("resources")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<{ id: string }>();

  if (!resource) return { error: "Conteúdo não encontrado." };

  const { error } = await supabase.from("resource_ratings").upsert(
    { resource_id: resource.id, user_id: user.id, rating },
    { onConflict: "resource_id,user_id" },
  );

  if (error) {
    console.error("Falha ao avaliar:", error);
    return { error: "Não foi possível registrar sua nota. Tente de novo." };
  }

  revalidatePath(`/resource/${slug}`);
  return { rating };
}

/** Remove a própria nota. */
export async function clearRating(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const supabase = await createClient();
  const { data: resource } = await supabase
    .from("resources")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (!resource) return;

  await supabase
    .from("resource_ratings")
    .delete()
    .eq("resource_id", resource.id)
    .eq("user_id", user.id);

  revalidatePath(`/resource/${slug}`);
}
