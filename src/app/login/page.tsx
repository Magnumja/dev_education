import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { signIn } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta para salvar conteúdos e criar coleções.",
  robots: { index: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string; ok?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentUser()) redirect("/");

  const { next = "/", error, ok } = await searchParams;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Salve conteúdos, organize coleções e acompanhe suas sugestões."
      next={safeNext}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(safeNext)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      {/* Falhas do GitHub e confirmações por e-mail voltam pela URL. Sem
          exibi-las, a pessoa era devolvida ao formulário sem explicação. */}
      <AuthMessage error={error} success={ok} />
      <AuthForm mode="signin" action={signIn} next={safeNext} />

      <p className="mt-4 text-sm">
        <Link
          href="/recuperar-senha"
          className="text-ink-500 transition-quick hover:text-brand-600"
        >
          Esqueci minha senha
        </Link>
      </p>
    </AuthLayout>
  );
}
