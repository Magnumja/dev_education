"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Compass,
  Dumbbell,
  Heart,
  Home,
  Info,
  Layers,
  Plus,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SITE } from "@/constants";
import type { SessionUser } from "@/types";
import { signOut } from "@/lib/auth/actions";

/**
 * Só entram itens que levam a uma página com função real. Trilhas, Salvos e
 * Histórico ficam de fora até existirem de verdade.
 */
const NAV = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/search", label: "Explorar", icon: Compass },
  { href: "/topics", label: "Tecnologias", icon: Layers },
  {
    href: "/search?type=documentation",
    label: "Documentações",
    icon: BookOpen,
  },
  { href: "/search?type=exercise", label: "Exercícios", icon: Dumbbell },
  { href: "/favorites", label: "Favoritos", icon: Bookmark },
  { href: "/submit", label: "Sugerir", icon: Plus },
  { href: "/about", label: "Sobre", icon: Info },
];

export function Sidebar({
  user,
  canCurate = false,
}: {
  user: SessionUser | null;
  canCurate?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(item: { href: string; exact?: boolean }): boolean {
    const [path, query] = item.href.split("?");
    if (item.exact) return pathname === path;
    if (pathname !== path) return false;
    if (!query) return searchParams.toString() === "";
    return searchParams.toString() === query;
  }

  return (
    <div className="flex h-full flex-col bg-rail">
      <Link
        href="/"
        className="block px-4 pb-5 pt-7"
        aria-label={`${SITE.name} — página inicial`}
      >
        {/* Recorte de deveduclogo.png, com o texto em branco: assenta direto
            sobre o azul-marinho, sem faixa atrás.

            O nome do arquivo mudou junto com a arte de propósito. O otimizador
            de imagens do Next e o cache do navegador guardam por URL: manter o
            mesmo nome faria a versão antiga continuar sendo servida. */}
        {/* 74% da largura: o desenho preenche 94% da arte, então a marca
            visível fica com ~156px numa barra de 256 — folga de 50px de cada
            lado. */}
        <Image
          src="/images/deveducation-wordmark.png"
          alt={SITE.name}
          width={640}
          height={160}
          priority
          className="mx-auto h-auto w-[74%]"
        />
        <span className="mt-1 block px-1 text-center text-[11px] font-medium leading-none text-rail-text">
          {SITE.tagline}
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Principal">
        {[
          ...NAV,
          ...(canCurate
            ? [{ href: "/admin", label: "Curadoria", icon: ShieldCheck }]
            : []),
        ].map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-quick",
                active
                  ? "bg-rail-raised font-medium text-brand-300"
                  : "text-rail-text hover:bg-rail-raised/60 hover:text-rail-text-strong",
              )}
            >
              <item.icon className="size-[18px] shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mt-6 rounded-xl border border-rail-line bg-rail-raised/50 p-4">
        <p className="flex items-center gap-2 text-[13px] font-medium text-rail-text-strong">
          <Heart className="size-4 shrink-0 text-brand-400" aria-hidden />
          Projeto sem fins lucrativos
        </p>
        <p className="mt-2 text-xs leading-relaxed text-rail-text">
          Feito por devs, para devs. Não hospedamos conteúdo — todo material leva à
          fonte original.
        </p>
        <Link
          href="/about"
          className="mt-3 inline-block text-xs font-medium text-brand-300 transition-quick hover:text-brand-400"
        >
          Saiba mais →
        </Link>
      </div>

      <div className="p-3">
        {user ? (
          <div className="flex items-center gap-1 rounded-xl border border-rail-line pr-1">
            <Link
              href="/profile"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-l-xl px-3 py-2.5 transition-quick hover:bg-rail-raised"
            >
              <Avatar user={user} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-rail-text-strong">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-rail-text">
                  {user.email}
                </span>
              </span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sair da conta"
                title="Sair da conta"
                className="rounded-lg p-2 text-rail-text transition-quick hover:bg-rail-raised hover:text-rail-text-strong"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-medium text-white transition-quick hover:bg-brand-400"
          >
            Entrar
          </Link>
        )}
      </div>
    </div>
  );
}

function Avatar({ user }: { user: SessionUser }) {
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt=""
        width={34}
        height={34}
        unoptimized
        className="size-[34px] shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-rail-raised text-sm font-semibold text-brand-300"
    >
      {user.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
