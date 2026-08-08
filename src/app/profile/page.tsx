import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const supabase = await createClient();
  const [favorites, submissions] = await Promise.all([
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("resource_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const name = user.profile?.name ?? user.email ?? "Sua conta";
  const role = user.profile?.role ?? "user";

  const stats = [
    { label: "Conteúdos salvos", value: favorites.count ?? 0, href: "/favorites" },
    { label: "Sugestões enviadas", value: submissions.count ?? 0, href: "/submit" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex items-center gap-4">
        {user.profile?.avatar_url ? (
          <Image
            src={user.profile.avatar_url}
            alt=""
            width={56}
            height={56}
            className="rounded-full border border-line"
            unoptimized
          />
        ) : (
          <span
            aria-hidden
            className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-600"
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-navy-900">
            {name}
          </h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-500">
            <span className="truncate">{user.email}</span>
            {role !== "user" ? <Badge variant="brand">{role}</Badge> : null}
          </p>
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-line px-4 py-3.5 transition-quick hover:border-brand-400"
          >
            <dt className="text-xs text-ink-500">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold text-navy-900">
              {stat.value}
            </dd>
          </Link>
        ))}
      </dl>

      {role === "curator" || role === "admin" ? (
        <p className="mt-8 rounded-card border border-line bg-surface-muted px-4 py-3.5 text-sm text-ink-700">
          Você tem acesso à curadoria.{" "}
          <Link href="/admin" className="font-medium text-brand-500 hover:underline">
            Abrir painel de revisão
          </Link>
        </p>
      ) : null}

      <form action={signOut} className="mt-10">
        <Button type="submit" variant="secondary">
          Sair da conta
        </Button>
      </form>
    </div>
  );
}
