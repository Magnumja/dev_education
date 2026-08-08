"use server";

import { revalidatePath } from "next/cache";
import { requireCurator } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";
import {
  ingestDevDocs,
  ingestGitHub,
  ingestYouTubeChannel,
} from "@/lib/ingest/run";
import { resolveChannelId } from "@/lib/providers/youtube";

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
            ? await ingestYouTubeChannel(
                await resolveChannelId(query),
                topicSlug,
                10,
              )
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
