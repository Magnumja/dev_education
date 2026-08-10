"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Aplicado antes da primeira pintura para não haver flash de tema errado. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('deveducation-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

/**
 * Forma compartilhada pelos botões redondos da navbar. Ela é sempre azul
 * escura, nos dois temas, então as cores aqui são claras por definição.
 */
export const iconButtonClasses =
  "icon-button flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-quick hover:border-white/35 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300";

/**
 * O tema vive no atributo `data-theme` do documento, não em estado React:
 * evita divergência na hidratação e deixa o CSS decidir o que desenhar.
 *
 * Os dois ícones ficam sobrepostos e trocam de lugar girando — o que sai
 * afunda e gira para um lado, o que entra chega girando do outro. Tentei antes
 * um ícone só, com o crescente recortado por `clipPath`; o Safari não desenhava
 * o recorte e o botão ficava vazio.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("deveducation-theme", next);
    } catch {
      // Modo privado pode bloquear o storage; o tema vale para esta sessão.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar entre tema claro e escuro"
      title="Alternar tema"
      className={cn(iconButtonClasses, className)}
    >
      <span className="relative block size-[18px]">
        <Sun
          aria-hidden
          className="absolute inset-0 size-[18px] rotate-0 scale-100 opacity-100 transition-all duration-300 ease-out dark:-rotate-90 dark:scale-50 dark:opacity-0"
        />
        <Moon
          aria-hidden
          className="absolute inset-0 size-[18px] rotate-90 scale-50 opacity-0 transition-all duration-300 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100"
        />
      </span>
    </button>
  );
}

/**
 * Marcador que se preenche ao receber mouse ou foco.
 *
 * São dois desenhos sobrepostos, e não um `fill` que aparece: o contorno fica
 * parado enquanto o miolo sobe, o que dá a sensação de encher.
 */
export function BookmarkIcon({ className }: { className?: string }) {
  const d = "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-[18px]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className="icon-fill" d={d} fill="currentColor" stroke="none" />
      <path d={d} />
    </svg>
  );
}
