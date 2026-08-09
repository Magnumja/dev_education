import type { Metadata } from "next";
import { PasswordForm } from "@/components/auth/PasswordForm";
import { updatePassword } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Definir nova senha",
  robots: { index: false },
};

/**
 * Chegada do link enviado por e-mail. A sessão vem do /auth/callback, então a
 * página não checa autenticação por conta própria — a Server Action recusa se
 * o link tiver expirado, com uma mensagem que explica o que fazer.
 */
export default function NovaSenhaPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-14 sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        Definir nova senha
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        Escolha uma senha nova. Por segurança, você entra de novo depois de
        salvar.
      </p>

      <div className="mt-7">
        <PasswordForm action={updatePassword} modo="definir" />
      </div>
    </div>
  );
}
