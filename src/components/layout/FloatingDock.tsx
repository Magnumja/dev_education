"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  GraduationCap,
  Home,
  Layers,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/types";

/**
 * Navegação flutuante, no lugar da barra lateral.
 *
 * A barra ocupava 256px em toda largura de tela para exibir oito links. Como
 * dock, o conteúdo ganha a largura inteira e a navegação continua sempre ao
 * alcance — inclusive no celular, onde a barra ficava escondida atrás de um
 * botão de menu.
 *
 * Ícone sozinho não comunica: cada item tem `aria-label` para leitores de tela
 * e um balão com o nome, que sobe ao passar o mouse ou ao receber foco pelo
 * teclado. O balão é `aria-hidden` porque repetiria o que o link já anuncia.
 *
 * Documentações e Exercícios saíram porque são recortes da busca, alcançáveis
 * pelos filtros de Explorar; Favoritos saiu porque já tem lugar fixo na navbar.
 * Um dock só se lê de relance enquanto for curto.
 */
const ITENS = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/search", label: "Explorar", icon: Compass },
  { href: "/topics", label: "Tecnologias", icon: Layers },
  { href: "/search?type=course", label: "Cursos", icon: GraduationCap },
  { href: "/submit", label: "Sugerir", icon: Plus },
];

export function FloatingDock({
  user,
  canCurate,
}: {
  user: SessionUser | null;
  canCurate: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const consulta = searchParams.toString();

  function ativo(item: (typeof ITENS)[number]): boolean {
    const [caminho, query] = item.href.split("?");
    if (item.exact) return pathname === caminho;
    if (pathname !== caminho) return false;
    return query ? consulta === query : consulta === "";
  }

  const itens = [
    ...ITENS,
    ...(canCurate
      ? [{ href: "/admin", label: "Curadoria", icon: ShieldCheck }]
      : []),
    {
      href: user ? "/profile" : "/login",
      label: user ? "Perfil" : "Entrar",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul
        className={cn(
          "pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full",
          "border border-rail-line bg-rail/95 p-1.5 shadow-lift backdrop-blur-md",
          "scroll-rail-hidden",
        )}
      >
        {itens.map((item) => {
          const selecionado = ativo(item as (typeof ITENS)[number]);

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={selecionado ? "page" : undefined}
                className={cn(
                  "group relative flex size-11 items-center justify-center rounded-full transition-quick",
                  selecionado
                    ? "bg-rail-raised text-brand-300"
                    : "text-rail-text hover:bg-rail-raised/70 hover:text-rail-text-strong",
                )}
              >
                <item.icon
                  className="size-[18px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                  aria-hidden
                />

                {/* O balão nasce um pouco abaixo e menor, e sobe até o lugar:
                    o movimento é o que liga o rótulo ao ícone que o gerou. */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap",
                    "rounded-lg bg-rail-raised px-2.5 py-1 text-xs font-medium text-rail-text-strong",
                    "origin-bottom translate-y-1.5 scale-90 opacity-0 shadow-lift",
                    "transition-all duration-200 ease-out",
                    "group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
                    "group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-rail-raised"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
