import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { signUp } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Criar conta",
  description:
    "Crie sua conta gratuita no DevEducation para salvar conteúdos e sugerir materiais.",
  robots: { index: false },
};

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (await getCurrentUser()) redirect("/");

  const { next = "/" } = await searchParams;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="É gratuito. O DevEducation não tem fins lucrativos e não vende dados."
      next={safeNext}
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(safeNext)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" action={signUp} next={safeNext} />
    </AuthLayout>
  );
}
