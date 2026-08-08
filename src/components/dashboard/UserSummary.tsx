import Link from "next/link";
import { Panel } from "@/components/dashboard/Panel";
import { ButtonLink } from "@/components/ui/Button";
import type { UserSnapshot } from "@/lib/search/user-snapshot";

/**
 * Resumo da conta na coluna direita. Só aparece com sessão, e só mostra o que
 * de fato registramos — sem progresso estimado.
 */
export function UserSummary({ snapshot }: { snapshot: UserSnapshot }) {
  const isNew =
    snapshot.favorites === 0 &&
    snapshot.opened === 0 &&
    snapshot.submissions === 0;

  if (isNew) {
    return (
      <Panel title="Seu espaço">
        <p className="text-sm leading-relaxed text-ink-500">
          Salve conteúdos com o marcador e eles ficam guardados aqui, prontos
          para retomar depois.
        </p>
        <ButtonLink href="/search" size="sm" className="mt-4">
          Encontrar algo para salvar
        </ButtonLink>
      </Panel>
    );
  }

  const stats = [
    { label: "Salvos", value: snapshot.favorites, href: "/favorites" },
    { label: "Abertos", value: snapshot.opened, href: "/search" },
    { label: "Sugestões", value: snapshot.submissions, href: "/submit" },
  ];

  return (
    <Panel title="Seu espaço" action={{ href: "/profile", label: "Perfil" }}>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-line px-2 py-2.5 transition-quick hover:border-brand-400"
          >
            <dt className="text-[11px] text-ink-500">{stat.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-navy-900">
              {stat.value}
            </dd>
          </Link>
        ))}
      </dl>

      {snapshot.affinity.length > 0 ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs text-ink-500">
            Você tem salvado mais sobre:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {snapshot.affinity.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-700 transition-quick hover:border-brand-400 hover:text-brand-500"
              >
                {topic.name}
                <span className="ml-1 text-ink-400">{topic.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
