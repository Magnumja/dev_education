"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-400">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <h1 className="text-lg font-semibold text-navy-900">
        Algo deu errado por aqui.
      </h1>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
        A falha foi registrada. Você pode tentar de novo ou voltar para a busca —
        o catálogo continua disponível.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-400">
          Referência: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset} size="sm">
          Tentar novamente
        </Button>
        <ButtonLink href="/search" variant="secondary" size="sm">
          Ir para a busca
        </ButtonLink>
      </div>
    </div>
  );
}
