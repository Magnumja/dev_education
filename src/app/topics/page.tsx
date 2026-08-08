import type { Metadata } from "next";
import { TopicCard } from "@/components/topics/TopicCard";
import { getTopicsWithCounts } from "@/lib/search/resources";

export const metadata: Metadata = {
  title: "Tecnologias",
  description:
    "Navegue por tecnologia e encontre documentações, artigos, exercícios e projetos selecionados pela curadoria do DevEducation.",
  alternates: { canonical: "/topics" },
};

// Lê o catálogo pela sessão do usuário: sempre dinâmica.
export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await getTopicsWithCounts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
          Tecnologias
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          Cada tecnologia reúne o essencial em um só lugar: por onde começar,
          documentação oficial, artigos, exercícios e projetos para praticar.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(({ topic, count }) => (
          <TopicCard key={topic.id} topic={topic} count={count} />
        ))}
      </div>
    </div>
  );
}
