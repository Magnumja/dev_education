import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DisplayNameForm } from "@/components/profile/DisplayNameForm";
import { ResourceTile } from "@/components/dashboard/ResourceTile";
import { TileRail } from "@/components/dashboard/TileRail";
import { getCurrentUser } from "@/lib/auth/session";
import { getProfileData } from "@/lib/profile/queries";
import { getUserSnapshot } from "@/lib/search/user-snapshot";
import { getRecentlyOpened } from "@/lib/search/stats";
import { signOut } from "@/lib/auth/actions";
import { formatRelativeTime } from "@/lib/utils/format";
import { SUBMISSION_LABELS } from "@/constants";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false },
};

const PAPEIS = {
  user: null,
  curator: "Curador",
  admin: "Administrador",
} as const;

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const [dados, snapshot, recentes] = await Promise.all([
    getProfileData(),
    getUserSnapshot(),
    getRecentlyOpened(6),
  ]);

  if (!dados) redirect("/login?next=/profile");

  const nome = user.profile?.name ?? user.email ?? "Sua conta";
  const papel = user.profile?.role ?? "user";
  const rotuloPapel = PAPEIS[papel];

  const numeros = [
    { rotulo: "Salvos", valor: dados.counts.favorites, href: "/favorites" },
    { rotulo: "Avaliados", valor: dados.counts.ratings, href: null },
    { rotulo: "Abertos", valor: dados.counts.opened, href: null },
    { rotulo: "Sugestões", valor: dados.counts.submissions, href: "/submit" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-4">
          {user.profile?.avatar_url ? (
            <Image
              src={user.profile.avatar_url}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="size-16 shrink-0 rounded-full border border-line object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xl font-semibold text-brand-600"
            >
              {nome.slice(0, 1).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <DisplayNameForm current={nome} />
            <p className="mt-1 truncate text-sm text-ink-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {rotuloPapel ? (
                <Badge variant="brand">
                  <ShieldCheck className="size-3" aria-hidden />
                  {rotuloPapel}
                </Badge>
              ) : null}
              {dados.memberSince ? (
                <span className="text-xs text-ink-400">
                  Por aqui desde{" "}
                  {new Date(dados.memberSince).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {numeros.map((item) => {
            const conteudo = (
              <>
                <dt className="text-xs text-ink-500">{item.rotulo}</dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums text-navy-900">
                  {item.valor}
                </dd>
              </>
            );

            return item.href ? (
              <Link
                key={item.rotulo}
                href={item.href}
                className="rounded-lg border border-line px-3 py-2.5 transition-quick hover:border-brand-400"
              >
                {conteudo}
              </Link>
            ) : (
              <div
                key={item.rotulo}
                className="rounded-lg border border-line px-3 py-2.5"
              >
                {conteudo}
              </div>
            );
          })}
        </dl>

        {snapshot.affinity.length > 0 ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-ink-500">Você tem salvado mais sobre:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {snapshot.affinity.map((topico) => (
                <Link
                  key={topico.slug}
                  href={`/topics/${topico.slug}`}
                  className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-700 transition-quick hover:border-brand-400 hover:text-brand-500"
                >
                  {topico.name}
                  <span className="ml-1 text-ink-400">{topico.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      {papel !== "user" ? (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-card border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-navy-900">
          Você tem acesso à curadoria do DevEducation.
          <Link
            href="/admin"
            className="font-medium text-brand-600 transition-quick hover:underline"
          >
            Abrir painel
          </Link>
        </p>
      ) : null}

      {recentes.length > 0 ? (
        <section className="mt-10">
          <TileRail
            title="Você abriu recentemente"
            action={{ href: "/favorites", label: "Ver salvos" }}
          >
            {recentes.map((item) => (
              <ResourceTile
                key={item.resource.id}
                resource={item.resource}
                footnote={formatRelativeTime(item.openedAt)}
              />
            ))}
          </TileRail>
        </section>
      ) : null}

      {dados.ratings.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
            Suas avaliações
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {dados.ratings.map(({ resource, rating }) => (
              <li key={resource.id} className="flex items-center gap-3 py-3">
                <Link
                  href={`/resource/${resource.id}`}
                  className="min-w-0 flex-1 truncate text-sm text-navy-900 transition-quick hover:text-brand-500"
                >
                  {resource.title}
                </Link>
                <span
                  className="flex shrink-0 items-center gap-0.5"
                  title={`Você deu ${rating} de 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        n <= rating
                          ? "fill-brand-400 text-brand-400"
                          : "text-line",
                      )}
                    />
                  ))}
                  <span className="sr-only">{rating} de 5</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
            Suas avaliações
          </h2>
          <EmptyState
            icon={<Star className="size-5" aria-hidden />}
            title="Você ainda não avaliou nada."
            description="A sua nota entra no ranking da busca e ajuda quem vier depois a escolher."
          >
            <ButtonLink href="/search" size="sm" variant="secondary">
              Encontrar algo para avaliar
            </ButtonLink>
          </EmptyState>
        </section>
      )}

      {dados.submissions.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
            Suas sugestões
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {dados.submissions.map((envio) => (
              <li key={envio.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy-900">
                    {envio.title ?? envio.url}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {formatRelativeTime(envio.created_at)}
                    {envio.review_note ? ` · ${envio.review_note}` : ""}
                  </p>
                </div>
                <Badge
                  variant={envio.status === "approved" ? "brand" : "neutral"}
                  className={cn(envio.status === "rejected" && "opacity-70")}
                >
                  {SUBMISSION_LABELS[envio.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form action={signOut} className="mt-12">
        <Button type="submit" variant="secondary">
          Sair da conta
        </Button>
      </form>
    </div>
  );
}
