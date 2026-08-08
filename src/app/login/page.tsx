import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { signIn } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta para salvar conteúdos e criar coleções.",
  robots: { index: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentUser()) redirect("/");

  const { next = "/" } = await searchParams;
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
      <AuthForm mode="signin" action={signIn} next={safeNext} />
    </AuthLayout>
  );
}
