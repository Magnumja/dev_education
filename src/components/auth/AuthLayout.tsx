import Link from "next/link";
import { signInWithGitHub } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  next: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  next,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-14 sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{subtitle}</p>

      {!isSupabaseConfigured ? (
        <p className="mt-6 rounded-md border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-700">
          A autenticação exige as variáveis do Supabase em{" "}
          <code className="font-mono text-[13px]">.env.local</code>. Enquanto isso,
          busca e navegação seguem funcionando sem conta.
        </p>
      ) : null}

      <div className="mt-7">{children}</div>

      <div className="my-6 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-ink-400">ou</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGitHub}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" className="w-full">
          Continuar com GitHub
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-500">{footer}</p>

      <p className="mt-6 text-xs leading-relaxed text-ink-400">
        Sua conta serve apenas para salvar conteúdos, criar coleções e sugerir
        materiais. Não é necessária para buscar ou navegar.{" "}
        <Link href="/about" className="text-brand-600 hover:underline">
          Saiba mais
        </Link>
        .
      </p>
    </div>
  );
}
