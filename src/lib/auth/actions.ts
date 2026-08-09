"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AuthFormState {
  error?: string;
  message?: string;
}

const GENERIC_ERROR =
  "Não foi possível concluir. Verifique os dados e tente novamente.";

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  // Só caminhos internos: evita open redirect via ?next=
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

async function origin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return { error: "Autenticação indisponível: Supabase não configurado." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return { error: "Cadastro indisponível: Supabase não configurado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) return { error: "Informe seu nome e e-mail." };
  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message || GENERIC_ERROR };

  // Com confirmação de e-mail ativa não há sessão imediata.
  if (!data.session) {
    return {
      message:
        "Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.",
    };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signInWithGitHub(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured) redirect("/login?error=unconfigured");

  const next = safeNext(formData.get("next"));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Envia o link de recuperação de senha.
 *
 * A resposta é sempre a mesma, exista a conta ou não. Diferenciar permitiria
 * descobrir quais e-mails estão cadastrados testando um a um.
 */
export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return { error: "Recuperação indisponível: Supabase não configurado." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe o e-mail da sua conta." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/nova-senha`,
  });

  if (error) console.error("Falha ao enviar recuperação:", error);

  return {
    message:
      "Se existir uma conta com esse e-mail, o link de recuperação já está a caminho. Confira também o spam.",
  };
}

/** Grava a nova senha. Exige a sessão criada pelo link do e-mail. */
export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const senha = String(formData.get("password") ?? "");
  const confirmacao = String(formData.get("password_confirm") ?? "");

  if (senha.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmacao) {
    return { error: "As duas senhas não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "O link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?ok=senha_alterada");
}
