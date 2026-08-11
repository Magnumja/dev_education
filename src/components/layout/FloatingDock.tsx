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
 * teclado. O balão só mostra o título — é etiqueta, não texto de ajuda — e é
 * `aria-hidden` porque repetiria o que o link já anuncia.
 *
 * Documentações e Exercícios saíram porque são recortes da busca, alcançáveis
 * pelos filtros de Explorar; Favoritos saiu porque já tem lugar fixo na navbar.
 * Um dock só se lê de relance enquanto for curto.
 */
const ITENS = [
  {
    href: "/",
    label: "Início",
    icon: Home,
    exact: true,
  },
  {
    href: "/search",
    label: "Explorar",
    icon: Compass,
  },
  {
    href: "/topics",
    label: "Tecnologias",
    icon: Layers,
  },
  {
    href: "/search?type=course",
    label: "Cursos",
    icon: GraduationCap,
  },
  {
    href: "/submit",
    label: "Sugerir",
    icon: Plus,
  },
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
      ? [
          {
            href: "/admin",
            label: "Curadoria",
            icon: ShieldCheck,
          },
        ]
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
          // Sem `overflow-x-auto`: rolagem no eixo X também recorta o eixo Y, e
          // era isso que cortava o balão logo acima dos ícones.
          "pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full",
          "border border-rail-line bg-rail/95 p-1.5 shadow-lift backdrop-blur-md",
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
                    o movimento é o que liga o rótulo ao ícone que o gerou.

                    Só o título: uma etiqueta de uma linha se lê no tempo de um
                    relance, que é o tempo que o mouse fica parado ali. */}
                <span
                  aria-hidden
                  className={cn(
                    // Escondido no celular: dedo não tem "passar por cima".
                    "pointer-events-none absolute bottom-full left-1/2 mb-2.5 hidden w-max -translate-x-1/2 sm:block",
                    "rounded-md border border-rail-line bg-rail-raised px-3 py-1.5 shadow-lift",
                    "text-xs font-medium text-rail-text-strong",
                    "origin-bottom translate-y-1.5 scale-90 opacity-0",
                    "transition-all duration-200 ease-out",
                    "group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
                    "group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100",
                  )}
                >
                  {item.label}
                  {/* A seta desenha a própria borda e cobre a linha do balão no
                      trecho que ela ocupa — por isso é SVG, e não um quadrado
                      girado: um losango com borda mostraria os cantos. */}
                  <SetaBalao className="absolute left-1/2 top-full -mt-px -translate-x-1/2" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Seta do balão, com borda contínua.
 *
 * O primeiro traçado é o preenchimento: a faixa reta no topo apaga a borda do
 * balão exatamente na largura da seta, e daí desce até a ponta. O segundo é a
 * borda, que retoma a linha interrompida e desenha as duas diagonais — é o que
 * faz a seta parecer recortada no balão, e não colada por cima dele.
 */
function SetaBalao({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.3356 7.39793L15.1924 3.02682C15.9269 2.36577 16.8801 2 17.8683 2H20V0H0V2H1.4651C2.4532 2 3.4064 2.36577 4.1409 3.02682L8.9977 7.39793C9.378 7.7402 9.9553 7.74021 10.3356 7.39793Z"
        fill="var(--color-rail-raised)"
      />
      <path
        d="M9.6667 6.65461L14.5235 2.28352C15.4416 1.45721 16.6331 1 17.8683 1H20V2H17.8683C16.8801 2 15.9269 2.36577 15.1924 3.02682L10.3356 7.39793C9.9553 7.74021 9.378 7.7402 8.9977 7.39793L4.1409 3.02682C3.4064 2.36577 2.4532 2 1.4651 2H0V1H1.4651C2.7002 1 3.8917 1.45722 4.8099 2.28352L9.6667 6.65461Z"
        fill="var(--color-rail-line)"
      />
    </svg>
  );
}
