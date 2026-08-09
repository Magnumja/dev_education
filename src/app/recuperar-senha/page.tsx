import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { requestPasswordReset } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false },
};

export default function RecuperarSenhaPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-14 sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        Esqueci minha senha
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Informe o e-mail da conta e enviamos um link para você definir uma nova
        senha.
      </p>

      <div className="mt-7">
        <PasswordForm action={requestPasswordReset} modo="pedir" />
      </div>

      <p className="mt-8 text-sm text-ink-500">
        Lembrou?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
