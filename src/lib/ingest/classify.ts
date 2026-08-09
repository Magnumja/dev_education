import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Palavras que ligam um conteúdo a uma tecnologia do catálogo.
 *
 * Providers de canal não sabem do que o vídeo trata — o feed de um canal traz
 * de tudo. Sem esta classificação, o conteúdo entra no catálogo e some: aparece
 * na busca por palavra, mas não em nenhuma página de tecnologia e não responde
 * ao filtro de tecnologia.
 *
 * As expressões são deliberadamente específicas. "java" casando com
 * "javascript" ou "go" casando com "google" encheria as páginas de material
 * errado, o que é pior do que deixar o item sem classificação.
 */
const TOPIC_KEYWORDS: Record<string, RegExp> = {
  javascript:
    /\b(javascripts?|js|es6|es2015|ecmascript|vanilla js|dom|promises?|async\/await|closures?)\b/i,
  typescript: /\b(typescripts?|tipagem estática|generics?)\b/i,
  python: /\b(pythons?|djangos?|flask|fastapi|pandas|numpy|jupyter)\b/i,
  react: /\b(reacts?|reactjs|jsx|hooks?|redux|react native)\b/i,
  nextjs: /\b(next\.?js|nextjs|app router|server components?|vercel)\b/i,
  nodejs: /\b(node\.?js|nodejs|express|nest\.?js|deno|bun|npm|apis?|backend|back-end)\b/i,
  css: /\b(css|tailwind|flexbox|grids?|sass|scss|styled.components|responsiv|figma|front-?end|ui|design system)\b/i,
  docker: /\b(dockers?|containers?|dockerfile|docker.compose)\b/i,
  git: /\b(git|github|gitlab|versionamento|controle de vers|pull requests?|commits?)\b/i,
  sql: /\b(sql|postgres|postgresql|mysql|sqlite|banco de dados|databases?|prisma|supabase|orm)\b/i,
  // Plurais e formas curtas importam: "prompts", "IAs" e "agents" são a forma
  // como esses vídeos são de fato titulados.
  ai: /\b(ias?|a\.i|inteligência artificial|machine learning|deep learning|llms?|chatgpt|openai|claude|gemini|copilot|cursor|prompts?|agents?|agentes?|rag|redes? neura|neural networks?|mcp)\b/i,
  devops:
    /\b(devops|kubernetes|k8s|ci\/cd|aws|azure|cloud|terraform|linux|nginx|deploys?|infraestrutura|observabilidade|servidor|self-?host)\b/i,
};

export interface ClassifyReport {
  scanned: number;
  linked: number;
  withoutTopic: number;
  examples: string[];
}

/**
 * Vincula tecnologias a conteúdos que entraram sem nenhuma.
 *
 * Não sobrescreve o que já tem tecnologia: classificação automática nunca deve
 * desfazer decisão de curadoria.
 */
export async function classifyUnlinked(
  options: { onlyProvider?: string; limit?: number } = {},
): Promise<ClassifyReport> {
  const supabase = createAdminClient();

  let query = supabase
    .from("resources")
    .select("id, title, description, resource_topics (topic_id)")
    .limit(options.limit ?? 2000);

  if (options.onlyProvider) query = query.eq("provider", options.onlyProvider);

  const [{ data: resources, error }, { data: topics }] = await Promise.all([
    query,
    supabase.from("topics").select("id, slug"),
  ]);

  if (error) throw new Error(error.message);

  const topicId = new Map(
    ((topics ?? []) as { id: string; slug: string }[]).map((t) => [t.slug, t.id]),
  );

  const rows = (resources ?? []) as unknown as {
    id: string;
    title: string;
    description: string | null;
    resource_topics: { topic_id: string }[];
  }[];

  const links: { resource_id: string; topic_id: string }[] = [];
  const examples: string[] = [];
  let linked = 0;
  let withoutTopic = 0;

  for (const resource of rows) {
    if (resource.resource_topics.length > 0) continue;

    const text = `${resource.title} ${resource.description ?? ""}`;
    const matched = Object.entries(TOPIC_KEYWORDS)
      .filter(([, pattern]) => pattern.test(text))
      .map(([slug]) => topicId.get(slug))
      .filter((id): id is string => Boolean(id));

    if (matched.length === 0) {
      withoutTopic += 1;
      if (examples.length < 10) examples.push(resource.title);
      continue;
    }

    linked += 1;
    // Teto de três: um vídeo que cita dez tecnologias não é sobre nenhuma.
    for (const id of matched.slice(0, 3)) {
      links.push({ resource_id: resource.id, topic_id: id });
    }
  }

  for (let i = 0; i < links.length; i += 500) {
    await supabase.from("resource_topics").upsert(links.slice(i, i + 500), {
      onConflict: "resource_id,topic_id",
      ignoreDuplicates: true,
    });
  }

  return { scanned: rows.length, linked, withoutTopic, examples };
}
