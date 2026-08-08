"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCurator } from "@/lib/admin/guard";
import { domainOf, slugify } from "@/lib/providers/types";
import {
  DIFFICULTIES,
  LANGUAGES,
  RESOURCE_TYPES,
  type Difficulty,
  type ResourceLanguage,
  type ResourceType,
} from "@/types";

export interface AdminFormState {
  error?: string;
  message?: string;
}

/** Revalida tudo que exibe catálogo: home, busca, tecnologias e o painel. */
function revalidateCatalog() {
  revalidatePath("/", "layout");
}

// ── Submissões ───────────────────────────────────────────────

export async function rejectSubmission(formData: FormData): Promise<void> {
  await requireCurator();

  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("resource_submissions")
    .update({
      status: "rejected",
      review_note: note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/submissions");
}

/** Devolve uma submissão já revisada para a fila. */
export async function reopenSubmission(formData: FormData): Promise<void> {
  await requireCurator();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("resource_submissions")
    .update({ status: "pending", review_note: null, reviewed_at: null })
    .eq("id", id);

  revalidatePath("/admin/submissions");
}

// ── Recursos ─────────────────────────────────────────────────

export async function toggleResourceFlag(formData: FormData): Promise<void> {
  await requireCurator();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const next = String(formData.get("next") ?? "") === "true";

  if (!id || (field !== "is_active" && field !== "is_verified")) return;

  const supabase = await createClient();
  await supabase
    .from("resources")
    .update({ [field]: next })
    .eq("id", id);

  revalidateCatalog();
}

/**
 * Cria ou atualiza um recurso a partir do formulário de curadoria.
 * Quando vem de uma submissão, marca a submissão como aprovada no fim.
 */
export async function saveResource(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const user = await requireCurator();
  const supabase = await createClient();

  const existingId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const rawUrl = String(formData.get("url") ?? "").trim();
  const submissionId = String(formData.get("submission_id") ?? "").trim();

  if (!title) return { error: "O título é obrigatório." };

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { error: "Informe uma URL válida (http:// ou https://)." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Só aceitamos endereços http:// ou https://." };
  }

  const type = String(formData.get("resource_type") ?? "");
  const difficulty = String(formData.get("difficulty") ?? "");
  const language = String(formData.get("language") ?? "");

  if (!(RESOURCE_TYPES as readonly string[]).includes(type)) {
    return { error: "Tipo de conteúdo inválido." };
  }
  if (difficulty && !(DIFFICULTIES as readonly string[]).includes(difficulty)) {
    return { error: "Nível inválido." };
  }
  if (!(LANGUAGES as readonly string[]).includes(language)) {
    return { error: "Idioma inválido." };
  }

  const domain = domainOf(url.toString());
  const payload = {
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    url: url.toString(),
    source: String(formData.get("source") ?? "").trim() || domain,
    source_domain: domain,
    resource_type: type as ResourceType,
    difficulty: (difficulty || null) as Difficulty | null,
    language: language as ResourceLanguage,
    author: String(formData.get("author") ?? "").trim() || null,
    is_verified: formData.get("is_verified") === "on",
    is_active: formData.get("is_active") === "on",
  };

  const { data: saved, error } = await supabase
    .from("resources")
    .upsert(
      existingId
        ? { id: existingId, ...payload }
        : { ...payload, created_by: user.id },
      { onConflict: "id" },
    )
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (error || !saved) {
    // 23505 = violação de unique: slug ou URL já cadastrados.
    if (error?.code === "23505") {
      return { error: "Já existe um recurso com esta URL ou este slug." };
    }
    console.error("Falha ao salvar recurso:", error);
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  const topics = formData.getAll("topics").map(String).filter(Boolean);
  await syncTopics(saved.id, topics);

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  await syncTags(saved.id, tags);

  if (submissionId) {
    await supabase
      .from("resource_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
  }

  revalidateCatalog();
  redirect(`/admin/resources?saved=${encodeURIComponent(saved.slug)}`);
}

async function syncTopics(resourceId: string, topicSlugs: string[]) {
  const supabase = await createClient();

  await supabase.from("resource_topics").delete().eq("resource_id", resourceId);
  if (topicSlugs.length === 0) return;

  const { data: topics } = await supabase
    .from("topics")
    .select("id, slug")
    .in("slug", topicSlugs);

  const rows = (topics ?? []).map((topic) => ({
    resource_id: resourceId,
    topic_id: (topic as { id: string }).id,
  }));

  if (rows.length > 0) await supabase.from("resource_topics").insert(rows);
}

async function syncTags(resourceId: string, tagNames: string[]) {
  const supabase = await createClient();

  await supabase.from("resource_tags").delete().eq("resource_id", resourceId);
  if (tagNames.length === 0) return;

  // Cria as tags que ainda não existem, sem duplicar pelo slug.
  const unique = new Map(tagNames.map((name) => [slugify(name), name]));
  const { data: tags } = await supabase
    .from("tags")
    .upsert(
      [...unique].map(([slug, name]) => ({ slug, name })),
      { onConflict: "slug" },
    )
    .select("id");

  const rows = (tags ?? []).map((tag) => ({
    resource_id: resourceId,
    tag_id: (tag as { id: string }).id,
  }));

  if (rows.length > 0) await supabase.from("resource_tags").insert(rows);
}
