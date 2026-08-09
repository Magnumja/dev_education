import type { SearchResult } from "@/types";

/**
 * Contrato dos provedores externos do DevEducation.
 *
 * Regras que valem para todos:
 *
 * 1. O provider traduz a resposta da API para `SearchResult`. Nenhum
 *    componente ou página vê o formato bruto de terceiros.
 * 2. Provider nunca é chamado no caminho de uma busca de usuário. As cotas
 *    (YouTube: 100 buscas/dia) acabariam em minutos. Eles rodam na ingestão
 *    agendada e no painel de curadoria.
 * 3. Nada entra publicado: o que a ingestão traz nasce `is_verified = false`
 *    e passa pela revisão humana, igual às sugestões da comunidade.
 * 4. Só metadados. Nunca copiamos nem hospedamos o conteúdo em si.
 */
export interface ContentProvider {
  /** Identificador estável, usado em logs e no painel de curadoria. */
  id: string;
  label: string;
  /** Falso quando faltam credenciais — a ingestão pula o provider. */
  isConfigured(): boolean;
  /**
   * Custo aproximado por chamada, na unidade da própria API. Serve para o
   * agendador não estourar cota (YouTube search.list = 100 unidades).
   */
  quotaCostPerCall: number;
  search(input: ProviderQuery): Promise<ProviderResult[]>;
}

export interface ProviderQuery {
  /** Termo de busca, normalmente o nome da tecnologia. */
  query: string;
  /** Slug do tópico do DevEducation ao qual o resultado será vinculado. */
  topicSlug?: string;
  limit?: number;
  language?: "pt" | "en" | "es";
}

/**
 * Resultado ainda não persistido. `externalId` permite deduplicar entre
 * execuções sem depender da URL, que pode mudar de forma.
 */
export interface ProviderResult
  extends Omit<SearchResult, "id" | "isVerified" | "score"> {
  externalId: string;
  providerId: string;
  /** Sinais crus da fonte (stars, views, forks) para a curadoria avaliar. */
  signals?: Record<string, number | string>;
}

/**
 * Deduz o idioma pelo texto.
 *
 * Conteúdo importado chega sem essa informação, e marcar tudo como inglês
 * esconderia material em português do filtro de idioma — justamente o que um
 * catálogo brasileiro não pode fazer.
 *
 * A detecção usa palavras funcionais (preposições, pronomes), que aparecem em
 * qualquer frase do idioma e quase nunca em nomes de tecnologia.
 */
export function detectLanguage(
  ...parts: (string | null | undefined)[]
): "pt" | "en" | "es" {
  const raw = parts.filter(Boolean).join(" ").toLowerCase();

  // Ortografia decide primeiro: "ã", "õ" e "ç" não existem no espanhol nem no
  // inglês, e "ñ" não existe no português. Um único acerto já basta.
  if (/[ãõç]/.test(raw)) return "pt";
  if (/ñ/.test(raw)) return "es";

  const spanishOnly = /\b(cómo|usted|guía|español|aprende|desarrollo|gratis)\b/;
  if (spanishOnly.test(raw)) return "es";

  // Comparações por palavra usam o texto sem acento, para "rápido" casar com
  // "rapido" sem precisar duplicar cada termo da lista.
  const text = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Palavras marcadamente portuguesas: uma já resolve.
  const strongPt =
    /\b(voce|nao|entao|portugues|iniciantes|aprenda|passos|pratica|pratico|rapido|aulas|dicas|gratuito|conteudo)\b/;
  if (strongPt.test(text)) return "pt";

  // Palavras ambíguas (existem em espanhol, ou são curtas demais): exigem duas.
  const weakPt =
    /\b(para|como|com|uma|guia|curso|criar|passo|isso|tambem|completo|sobre|melhor|tudo|zero|projeto|ferramenta)\b/g;

  return (text.match(weakPt) ?? []).length >= 2 ? "pt" : "en";
}

/** Nível quando o próprio título sinaliza; `null` deixa a decisão à curadoria. */
export function detectDifficulty(
  ...parts: (string | null | undefined)[]
): "beginner" | "intermediate" | "advanced" | null {
  const text = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const beginner =
    /\b(iniciante|iniciantes|beginner|beginners|básico|basico|do zero|from scratch|introdu|introduction|getting started|primeiros passos|101|crash course|for dummies|learn)\b/;

  const advanced =
    /\b(avançado|avancado|advanced|deep dive|internals|em profundidade|expert|mastery|maestria|under the hood)\b/;

  if (beginner.test(text)) return "beginner";
  if (advanced.test(text)) return "advanced";
  return null;
}

/**
 * Deduz o tipo do conteúdo pelo nome e pela descrição.
 *
 * O provider do GitHub classificava tudo como repositório ou exercício, e o
 * catálogo terminou com 1.367 repositórios contra 4 cursos — quando boa parte
 * daqueles repositórios é currículo, livro ou ferramenta. Quem filtra por
 * "Curso" não encontrava nada, embora o material estivesse lá.
 *
 * A ordem das verificações é a precedência: um "curso com exercícios" é curso,
 * e um "livro sobre Docker" é livro antes de ser repositório.
 */
export function detectResourceType(
  ...parts: (string | null | undefined)[]
): "course" | "pdf" | "exercise" | "tool" | "documentation" | "repository" {
  const text = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    /\b(course|courses|curso|cursos|curriculum|curriculo|bootcamp|masterclass|classes|aulas|treinamento|training|especializacao|nanodegree|zero to (hero|mastery))\b/.test(
      text,
    )
  ) {
    return "course";
  }

  if (/\b(book|books|livro|ebook|handbook|manual|apostila|the little)\b/.test(text)) {
    return "pdf";
  }

  if (
    /\b(exercise|exercises|exercicios|challenge|challenges|desafios|katas|koans|practice|praticar|playground|100-days|30-days|quiz)\b/.test(
      text,
    )
  ) {
    return "exercise";
  }

  if (
    /\b(cli|tool|tools|toolkit|generator|starter|template|boilerplate|scaffold|extension|plugin|linter|formatter|devtools)\b/.test(
      text,
    )
  ) {
    return "tool";
  }

  if (/\b(docs|documentation|documentacao|reference|referencia|api docs|spec)\b/.test(text)) {
    return "documentation";
  }

  return "repository";
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Slug estável e legível, usado como identificador público do recurso. */
export function slugify(value: string, maxLength = 60): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);
}
