import Image from "next/image";
import { SITE } from "@/constants";
import { cn } from "@/lib/utils/cn";

/**
 * Indicador exibido enquanto uma rota carrega.
 *
 * Existe porque, sem um limite de Suspense na rota, o navegador permanece na
 * página anterior até o servidor terminar — o clique não produz reação e a
 * navegação parece travada. Com ele, a troca é imediata e a espera fica
 * explícita.
 *
 * A aparição é adiada em 250ms de propósito. A maioria das rotas responde
 * entre 7 e 230ms; mostrar de imediato faria o indicador piscar e sumir, o que
 * lê como defeito. Adiado, ele só aparece quando há de fato uma espera.
 */
export function RouteLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-5",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="animate-route-loading flex flex-col items-center gap-5">
        {/* O ícone tem fundo branco (sem canal alfa), então ganha um cartão
            claro próprio em vez de virar um quadrado branco no tema escuro. */}
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-soft">
          <Image
            src="/images/deveducation-icon.png"
            alt=""
            width={64}
            height={64}
            priority
            className="size-11"
          />
        </span>

        <span
          aria-hidden
          className="block h-1 w-28 overflow-hidden rounded-full bg-line"
        >
          <span className="animate-loading-bar block h-full w-1/2 rounded-full brand-gradient" />
        </span>
      </div>

      <span className="sr-only">Carregando {SITE.name}…</span>
    </div>
  );
}
