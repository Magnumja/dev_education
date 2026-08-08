"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface SubmitState {
  error?: string;
  message?: string;
}

/**
 * Registra a sugestão como `pending`. Nada enviado pela comunidade é
 * publicado automaticamente — a curadoria revisa antes.
 */
export async function submitResource(
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre na sua conta para sugerir um conteúdo." };

  const rawUrl = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { error: "Informe uma URL válida, começando com http:// ou https://." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Só aceitamos endereços http:// ou https://." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("resources")
    .select("slug")
    .eq("url", url.toString())
    .maybeSingle<{ slug: string }>();

  if (existing) {
    return { error: "Esse conteúdo já está no catálogo do DevEducation." };
  }

  const { error } = await supabase.from("resource_submissions").insert({
    user_id: user.id,
    url: url.toString(),
    title: title || null,
    description: description || null,
  });

  if (error) {
    console.error("Falha ao registrar sugestão:", error);
    return { error: "Não foi possível enviar agora. Tente novamente." };
  }

  revalidatePath("/submit");

  return {
    message:
      "Sugestão recebida. Nossa curadoria revisa o material antes de publicá-lo.",
  };
}
