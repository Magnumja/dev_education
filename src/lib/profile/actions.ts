"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export interface ProfileFormState {
  error?: string;
  message?: string;
}

/**
 * Atualiza o nome de exibição.
 *
 * Só o nome: `role` está fora do alcance por GRANT de coluna e por gatilho
 * (ver migration 0008), e o avatar vem do provedor de login. A ação existe
 * porque quem se cadastra por e-mail recebe como nome a parte antes do "@" —
 * um apelido que a pessoa não escolheu.
 */
export async function updateDisplayName(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const nome = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");

  if (nome.length < 2) return { error: "O nome precisa ter ao menos 2 letras." };
  if (nome.length > 60) return { error: "Use no máximo 60 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: nome })
    .eq("id", user.id);

  if (error) {
    console.error("Falha ao atualizar o nome:", error);
    return { error: "Não foi possível salvar. Tente de novo." };
  }

  revalidatePath("/", "layout");
  return { message: "Nome atualizado." };
}
