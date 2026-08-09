/**
 * Como as pessoas escrevem versus como o catálogo está escrito.
 *
 * Quem procura tecnologia digita "reactjs", "k8s", "postgres" ou "js" — e o
 * catálogo guarda "React", "Kubernetes", "PostgreSQL", "JavaScript". Sem esta
 * tradução, buscas legítimas voltam vazias e o usuário conclui que o site não
 * tem o conteúdo, quando na verdade tem.
 *
 * O mapa é intencionalmente curto e explícito: correção automática por
 * similaridade traz falsos positivos e piora o resultado.
 */
const ALIASES: Record<string, string> = {
  // JavaScript e ecossistema
  js: "javascript",
  ecmascript: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  nextjs: "next.js",
  "next js": "next.js",
  nodejs: "node.js",
  "node js": "node.js",
  node: "node.js",
  vuejs: "vue",
  "vue.js": "vue",

  // Dados
  postgres: "postgresql",
  pg: "postgresql",
  psql: "postgresql",
  database: "sql",
  bd: "sql",

  // Infra
  k8s: "kubernetes",
  "docker-compose": "docker compose",
  ci: "ci/cd",
  cicd: "ci/cd",

  // IA — apontam para "machine learning" porque é o termo que o catálogo
  // realmente usa em tags e títulos; "inteligência artificial" não casaria.
  ia: "machine learning",
  ai: "machine learning",
  ml: "machine learning",
  llm: "machine learning",
  "deep learning": "deep learning",

  // Outros
  py: "python",
  golang: "go",
  "c#": "csharp",
  css3: "css",
  html5: "html",
};

/**
 * Traduz apelidos para o termo do catálogo, palavra por palavra e também na
 * expressão inteira ("react js" → "react").
 */
export function expandQuery(query: string): string {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return query;

  const whole = ALIASES[normalized];
  if (whole) return whole;

  const words = normalized.split(/\s+/);
  const translated = words.map((word) => ALIASES[word] ?? word);

  return translated.join(" ") === normalized ? query : translated.join(" ");
}

/** Tecnologias do catálogo, para sugerir quando a busca não acha nada. */
const KNOWN_TERMS = [
  "javascript", "typescript", "python", "react", "next.js", "node.js",
  "css", "docker", "git", "sql", "postgresql", "kubernetes",
  "machine learning", "devops",
];

/**
 * Sugestões para uma busca vazia, por proximidade de escrita.
 *
 * Distância de edição em vez de correspondência exata: quem digita "pyton" ou
 * "kubernets" erra por uma ou duas letras, e mandar essa pessoa para a lista
 * de tecnologias é pior do que oferecer o termo certo.
 */
export function suggestTerms(query: string, limit = 2): string[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return [];

  return KNOWN_TERMS.map((term) => ({
    term,
    distance: editDistance(normalized, term),
  }))
    .filter(({ term, distance }) => distance <= Math.max(2, term.length / 3))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ term }) => term);
}

/** Levenshtein com uma linha de cada vez: entrada curta, custo irrelevante. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }

  return previous[b.length];
}
