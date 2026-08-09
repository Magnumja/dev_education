import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Traduz os códigos que chegam pela URL depois de um desvio de autenticação.
 *
 * O fluxo do GitHub e a confirmação de e-mail saem da aplicação e voltam com o
 * resultado na query. Sem esta tradução, uma falha devolvia a pessoa ao
 * formulário de login sem dizer nada — do ponto de vista dela, o botão
 * simplesmente não funcionou.
 */
const MENSAGENS: Record<string, string> = {
  oauth:
    "Não foi possível iniciar o login com o GitHub. Tente de novo em instantes.",
  callback:
    "O GitHub recusou o retorno do login. Isso costuma ser endereço de callback divergente na configuração — se persistir, avise a gente.",
  unconfigured:
    "A autenticação ainda não está configurada neste ambiente.",
  access_denied: "Você cancelou a autorização no GitHub.",
  server_error: "O provedor de login está instável. Tente novamente.",
  expired:
    "Este link expirou. Peça um novo para continuar.",
};

const SUCESSOS: Record<string, string> = {
  senha_alterada: "Senha alterada. Entre com a nova senha.",
  email_confirmado: "E-mail confirmado. Agora é só entrar.",
  link_enviado:
    "Se existir uma conta com esse e-mail, o link de recuperação já está a caminho.",
};

export function AuthMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const texto = error
    ? (MENSAGENS[error] ??
      "Não foi possível concluir o login. Tente novamente.")
    : success
      ? SUCESSOS[success]
      : null;

  if (!texto) return null;

  const falhou = Boolean(error);

  return (
    <p
      role={falhou ? "alert" : "status"}
      className={
        falhou
          ? "mb-5 flex items-start gap-2 rounded-md border border-line bg-surface-muted px-3 py-2.5 text-sm text-navy-900"
          : "mb-5 flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm text-navy-900"
      }
    >
      {falhou ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
      )}
      {texto}
    </p>
  );
}
