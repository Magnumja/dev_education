import type { SearchResult } from "@/types";

/**
 * Função central de ranking do DevEducation.
 *
 * Regra única e isolada: nenhum componente ou página deve calcular relevância
 * por conta própria. A ordem dos pesos reflete a prioridade do produto —
 * título > tecnologia > tags > descrição > sinais de qualidade.
 */
export const RANKING_WEIGHTS = {
  titleExact: 60,
  titleStartsWith: 30,
  titleContains: 22,
  topicMatch: 18,
  tagMatch: 10,
  descriptionMatch: 6,
  verified: 12,
  ratingPerPoint: 3,
  sourceAuthority: 8,
  recencyMax: 6,
} as const;

/** Fontes primárias (documentação oficial) valem mais que agregadores. */
const AUTHORITATIVE_DOMAINS = [
  "developer.mozilla.org",
  "docs.python.org",
  "react.dev",
  "nextjs.org",
  "nodejs.org",
  "typescriptlang.org",
  "docs.docker.com",
  "git-scm.com",
  "docs.github.com",
  "postgresql.org",
  "kubernetes.io",
  "scikit-learn.org",
];

export interface RankingSignals {
  /** Média de avaliações (0–5), quando houver. */
  rating?: number | null;
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 1);
}

export function scoreResource(
  resource: SearchResult,
  query: string,
  signals: RankingSignals = {},
): number {
  const w = RANKING_WEIGHTS;
  const q = normalize(query);
  const tokens = tokenize(query);
  const title = normalize(resource.title);
  const description = normalize(resource.description ?? "");
  const topics = resource.topics.map(normalize);
  const tags = resource.tags.map(normalize);

  let score = 0;

  if (q) {
    if (title === q) score += w.titleExact;
    else if (title.startsWith(q)) score += w.titleStartsWith;
    else if (title.includes(q)) score += w.titleContains;

    for (const token of tokens) {
      if (title.includes(token)) score += w.titleContains / 2;
      if (topics.some((topic) => topic.includes(token))) score += w.topicMatch;
      if (tags.some((tag) => tag.includes(token))) score += w.tagMatch;
      if (description.includes(token)) score += w.descriptionMatch;
      if (normalize(resource.source).includes(token)) score += w.tagMatch / 2;
    }
  }

  if (resource.isVerified) score += w.verified;

  if (typeof signals.rating === "number") {
    score += signals.rating * w.ratingPerPoint;
  }

  if (AUTHORITATIVE_DOMAINS.some((d) => resource.sourceDomain.endsWith(d))) {
    score += w.sourceAuthority;
  }

  score += recencyBonus(resource.publishedAt);

  return score;
}

/** Decai linearmente ao longo de ~3 anos; conteúdo sem data não é punido. */
function recencyBonus(publishedAt: string | null): number {
  if (!publishedAt) return 0;
  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return 0;

  const years = (Date.now() - published) / (365 * 24 * 60 * 60 * 1000);
  if (years <= 0) return RANKING_WEIGHTS.recencyMax;
  if (years >= 3) return 0;
  return RANKING_WEIGHTS.recencyMax * (1 - years / 3);
}
