"use client";

import { Moon, Sun } from "lucide-react";

/** Aplicado antes da primeira pintura para não haver flash de tema errado. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('deveducation-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

/**
 * O tema vive no atributo `data-theme` do documento, não em estado React:
 * evita divergência na hidratação e deixa o CSS decidir qual ícone mostrar.
 */
export function ThemeToggle() {
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
      className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-500 transition-quick hover:border-brand-400 hover:text-brand-500"
    >
      <Moon className="size-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
    </button>
  );
}
