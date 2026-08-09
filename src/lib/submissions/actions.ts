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

  // Normaliza antes de comparar: a mesma página chega com barra final, com
  // "www" e com parâmetros de campanha, e cada variação viraria uma sugestão
  // nova na fila da curadoria.
  const normalized = normalizeUrl(url);

  const [catalog, queued] = await Promise.all([
    supabase
      .from("resources")
      .select("slug")
      .eq("url", normalized)
      .maybeSingle<{ slug: string }>(),
    supabase
      .from("resource_submissions")
      .select("id, status")
      .eq("url", normalized)
      .in("status", ["pending", "rejected"])
      .maybeSingle<{ id: string; status: string }>(),
  ]);

  if (catalog.data) {
    return { error: "Esse conteúdo já está no catálogo do DevEducation." };
  }

  if (queued.data?.status === "pending") {
    return { error: "Esse link já está na fila, aguardando revisão." };
  }

  if (queued.data?.status === "rejected") {
    return {
      error:
        "Esse link já foi avaliado pela curadoria e não entrou no catálogo.",
    };
  }

  const { error } = await supabase.from("resource_submissions").insert({
    user_id: user.id,
    url: normalized,
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

/**
 * Forma canônica de uma URL, para comparação.
 *
 * Remove parâmetros de rastreio, barra final e o "www": sem isso, a mesma
 * página entra várias vezes na fila e a curadoria revisa o mesmo material
 * repetidas vezes.
 */
function normalizeUrl(url: URL): string {
  const clean = new URL(url.toString());

  for (const key of [...clean.searchParams.keys()]) {
    if (/^(utm_|fbclid|gclid|ref|source)/i.test(key)) {
      clean.searchParams.delete(key);
    }
  }

  clean.hostname = clean.hostname.replace(/^www\./, "");
  clean.hash = "";
  clean.pathname = clean.pathname.replace(/\/+$/, "") || "/";

  return clean.toString();
}
