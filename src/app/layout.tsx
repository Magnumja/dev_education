import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
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
  icons: { icon: "/images/deveducation-icon.png" },
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
      <body className="bg-rail">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Pular para o conteúdo
        </a>

        <div className="lg:flex">
          <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
            <Suspense fallback={<div className="h-full bg-rail" />}>
              <Sidebar user={user} canCurate={isCurator(current)} />
            </Suspense>
          </aside>

          <div className="min-w-0 flex-1 bg-surface lg:ml-64 lg:min-h-dvh lg:rounded-l-2xl">
            <Suspense fallback={<div className="h-16" />}>
              <Topbar user={user} canCurate={isCurator(current)} />
            </Suspense>
            <main id="conteudo">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
