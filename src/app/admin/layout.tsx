import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getCuratorOrNull } from "@/lib/admin/guard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Curadoria",
  robots: { index: false, follow: false },
};

const TABS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/submissions", label: "Submissões" },
  { href: "/admin/discover", label: "Descobrir" },
  { href: "/admin/resources", label: "Catálogo" },
  { href: "/admin/users", label: "Pessoas" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCuratorOrNull();

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<ShieldAlert className="size-5" aria-hidden />}
          title="Esta área é da curadoria."
          description="Sua conta ainda não tem o papel de curador. Um admin precisa liberar o acesso com: update profiles set role = 'admin' where id = '<seu id>';"
        >
          <ButtonLink href="/profile" variant="secondary" size="sm">
            Ver meu perfil
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-navy-900">
            Curadoria
            <Badge variant="brand">{user.profile?.role}</Badge>
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Nada entra no catálogo sem passar por aqui.
          </p>
        </div>
        <Link
          href="/admin/resources/new"
          className="text-sm font-medium text-brand-500 transition-quick hover:text-brand-400"
        >
          + Novo conteúdo
        </Link>
      </header>

      <nav className="mt-6 flex gap-1 border-b border-line" aria-label="Curadoria">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="-mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-ink-500 transition-quick hover:border-line hover:text-navy-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
