import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/constants";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O DevEducation é um projeto gratuito e sem fins lucrativos que organiza e filtra conteúdos educacionais de programação espalhados pela internet.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
        Sobre o {SITE.name}
      </h1>

      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-700">
        <p>
          Para aprender uma tecnologia hoje, um desenvolvedor precisa pesquisar
          separadamente no Google, no YouTube, no GitHub, nas documentações
          oficiais e em dezenas de blogs. O tempo que deveria ser gasto
          aprendendo é gasto procurando.
        </p>
        <p>
          O {SITE.name} é a camada entre você e essa dispersão. Não produzimos
          aulas nem hospedamos conteúdo: reunimos o que já existe de bom na
          internet, filtramos, organizamos por tecnologia e nível, e levamos você
          direto à fonte original.
        </p>
        <p>
          É um projeto <strong className="font-semibold text-navy-900">gratuito
          e sem fins lucrativos</strong>, feito por desenvolvedores para
          desenvolvedores e estudantes de tecnologia.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">
          Como funciona
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: "Reunimos",
              text: "Documentações oficiais, artigos, vídeos, PDFs, exercícios, repositórios e ferramentas gratuitas.",
            },
            {
              title: "Filtramos",
              text: "Cada material recebe tipo, nível, idioma e tecnologias, para você chegar ao que precisa em poucos cliques.",
            },
            {
              title: "Organizamos",
              text: "O ranking prioriza correspondência com o que você buscou, fontes primárias e conteúdo já revisado.",
            },
            {
              title: "Direcionamos",
              text: "Ao abrir um conteúdo você vai para a fonte original. O crédito e o tráfego são de quem produziu.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[13px] font-semibold text-brand-600"
              >
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-navy-900">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-500">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="curadoria" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">
          Como curamos
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-700">
          Qualquer pessoa pode sugerir um material, mas nada é publicado
          automaticamente. Toda sugestão entra como pendente e passa por revisão
          humana: verificamos se o conteúdo é gratuito, se continua atualizado,
          se a fonte é confiável e a qual nível ele realmente atende. Conteúdos
          aprovados recebem um selo discreto de revisado.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/submit">Sugerir conteúdo</ButtonLink>
          <ButtonLink href="/topics" variant="secondary">
            Explorar tecnologias
          </ButtonLink>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-navy-900">
          É seu conteúdo e quer removê-lo?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-700">
          Armazenamos apenas metadados públicos — título, descrição, link e
          classificação — sempre apontando para a página original. Se você é
          autor de algum material listado e prefere que ele não apareça aqui, é
          só nos avisar que removemos.
        </p>
      </section>
    </div>
  );
}
