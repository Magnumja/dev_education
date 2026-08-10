import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { FloatingDock } from "@/components/layout/FloatingDock";
import { THEME_SCRIPT } from "@/components/theme/ThemeToggle";
import { SITE } from "@/constants";
import { getCurrentUser, isCurator } from "@/lib/auth/session";
import type { SessionUser } from "@/types";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Aprenda sem perder tempo procurando`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "pt_BR",
    title: `${SITE.name} — Aprenda sem perder tempo procurando`,
    description: SITE.description,
  },
  // Ícones vêm das convenções de arquivo do App Router: src/app/icon.png e
  // src/app/apple-icon.png. Elas têm precedência sobre `metadata.icons`.
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const current = await getCurrentUser();
  const user: SessionUser | null = current
    ? {
        name: current.profile?.name ?? current.email ?? "Conta",
        email: current.email,
        avatarUrl: current.profile?.avatar_url ?? null,
      }
    : null;

  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-surface">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Pular para o conteúdo
        </a>

        <Suspense fallback={<div className="h-16 bg-navbar" />}>
          <Navbar user={user} />
        </Suspense>

        {/* O espaço inferior existe para o dock flutuante não cobrir o fim da
            página — sem ele, o último item de qualquer lista fica inalcançável. */}
        <main id="conteudo" className="mx-auto max-w-6xl pb-28">
          {children}
        </main>

        <Suspense fallback={null}>
          <FloatingDock user={user} canCurate={isCurator(current)} />
        </Suspense>
      </body>
    </html>
  );
}
