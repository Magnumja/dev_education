import type { Metadata } from "next";
import { TopicCard } from "@/components/topics/TopicCard";
import { getTopicsWithCounts } from "@/lib/search/resources";
import { TOPIC_GROUPS } from "@/lib/data/topics";

export const metadata: Metadata = {
  title: "Tecnologias",
  description:
    "Navegue por tecnologia e encontre cursos, documentações, artigos, exercícios e projetos selecionados pela curadoria do DevEducation.",
  alternates: { canonical: "/topics" },
};

export default async function TopicsPage() {
  const topics = await getTopicsWithCounts();
  const porSlug = new Map(topics.map((item) => [item.topic.slug, item]));

  const agrupadas = new Set(TOPIC_GROUPS.flatMap((g) => g.slugs));
  const restantes = topics.filter((item) => !agrupadas.has(item.topic.slug));

  const total = topics.reduce((soma, item) => soma + item.count, 0);

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
          Tecnologias
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Cada tecnologia reúne o essencial em um só lugar: por onde começar,
          documentação oficial, cursos, artigos, exercícios e projetos para
          praticar. São {total.toLocaleString("pt-BR")} conteúdos catalogados.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {TOPIC_GROUPS.map((grupo) => {
          const itens = grupo.slugs
            .map((slug) => porSlug.get(slug))
            .filter((item) => item !== undefined);

          if (itens.length === 0) return null;

          return (
            <section key={grupo.title}>
              <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
                {grupo.title}
              </h2>
              <p className="mt-0.5 text-sm text-ink-500">{grupo.hint}</p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {itens.map(({ topic, count }) => (
                  <TopicCard key={topic.id} topic={topic} count={count} />
                ))}
              </div>
            </section>
          );
        })}

        {restantes.length > 0 ? (
          <section>
            <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
              Outras
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {restantes.map(({ topic, count }) => (
                <TopicCard key={topic.id} topic={topic} count={count} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
