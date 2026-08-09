"use server";

import { revalidatePath } from "next/cache";
import { requireCurator } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { PUBLISH_BATCH_LIMIT } from "@/lib/admin/queue";
import {
  ingestDevDocs,
  ingestGitHub,
  ingestYouTubeChannel,
} from "@/lib/ingest/run";

export interface DiscoverState {
  error?: string;
  message?: string;
}

export async function runDiscovery(
  _prevState: DiscoverState,
  formData: FormData,
): Promise<DiscoverState> {
  await requireCurator();

  const provider = String(formData.get("provider") ?? "");
  const query = String(formData.get("query") ?? "").trim();
  const topicSlug = String(formData.get("topic") ?? "").trim() || undefined;

  if (!query) {
    return {
      error:
        provider === "youtube"
          ? "Informe o @handle, a URL ou o ID do canal."
          : "Informe o termo de busca.",
    };
  }

  let report;
  try {
    report =
      provider === "github"
        ? await ingestGitHub(query, topicSlug, 10)
        : provider === "devdocs"
          ? await ingestDevDocs(query, topicSlug, 10)
          : provider === "youtube"
            ? await ingestYouTubeChannel(query, topicSlug, 10)
            : null;
  } catch (error) {
    // Erro ao resolver o canal: a mensagem já é orientada ao usuário.
    return { error: (error as Error).message };
  }

  if (!report) return { error: "Provider desconhecido." };
  if (report.error) return { error: `${report.provider}: ${report.error}` };

  revalidatePath("/admin/discover");

  if (report.found === 0) {
    return { message: `${report.provider}: nada encontrado para “${query}”.` };
  }

  if (report.inserted === 0) {
    return {
      message: `${report.provider}: ${report.found} encontrados, todos já estavam no catálogo.`,
    };
  }

  return {
    message: `${report.provider}: ${report.inserted} novos na fila (${report.skipped} já existiam).`,
  };
}

/**
 * Publica direto da fila, sem passar pelo formulário.
 *
 * Existe porque revisar cinquenta itens um a um em um formulário completo é
 * inviável: a maioria só precisa de um "sim". Quem quiser ajustar nível,
 * idioma ou tags continua tendo o formulário.
 */
export async function publishDiscovery(formData: FormData): Promise<void> {
  await requireCurator();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("resources")
    .update({ is_active: true, is_verified: true })
    .eq("id", id);

  revalidatePath("/admin/discover");
  revalidatePath("/", "layout");
}

/**
 * Publica de uma vez tudo que corresponde ao filtro aberto na tela.
 *
 * Os critérios são reenviados e reaplicados no servidor, em vez de receber uma
 * lista de identificadores do cliente: assim a ação não pode ser usada para
 * publicar itens que a pessoa não estava vendo.
 *
 * Existe um teto por chamada — publicar centenas de itens sem olhar seria o
 * oposto de curadoria, e um clique acidental não pode encher o catálogo.
 */
export async function publishFiltered(formData: FormData): Promise<void> {
  await requireCurator();

  const provider = String(formData.get("provider") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const language = String(formData.get("lang") ?? "").trim();

  // Sem nenhum filtro, a ação publicaria a fila inteira sem revisão.
  if (!provider && !type && !language) return;

  const supabase = await createClient();

  let selection = supabase
    .from("resources")
    .select("id")
    .eq("is_active", false)
    .not("provider", "is", null);

  if (provider) selection = selection.eq("provider", provider);
  if (type) selection = selection.eq("resource_type", type);
  if (language) selection = selection.eq("language", language);

  const { data } = await selection.limit(PUBLISH_BATCH_LIMIT);
  const ids = ((data ?? []) as { id: string }[]).map((row) => row.id);

  if (ids.length === 0) return;

  await supabase
    .from("resources")
    .update({ is_active: true, is_verified: true })
    .in("id", ids);

  revalidatePath("/admin/discover");
  revalidatePath("/", "layout");
}

/** Descarta uma descoberta que não vale a pena catalogar. */
export async function discardDiscovery(formData: FormData): Promise<void> {
  await requireCurator();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // Só remove o que nunca foi publicado, para não apagar catálogo por engano.
  await supabase.from("resources").delete().eq("id", id).eq("is_active", false);

  revalidatePath("/admin/discover");
}
