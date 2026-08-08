import type {
  Difficulty,
  ResourceLanguage,
  ResourceType,
  SortOption,
  SubmissionStatus,
} from "@/types";

export const SITE = {
  name: "DevEducation",
  tagline: "Filtra. Organiza. Conecta.",
  description:
    "Encontre vídeos, documentações, artigos, exercícios e projetos para desenvolvedores em um só lugar.",
  // A variável pode existir vazia no .env.local, então `??` não basta.
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
} as const;

export const RESULTS_PER_PAGE = 20;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  video: "Vídeo",
  documentation: "Documentação",
  article: "Artigo",
  pdf: "PDF",
  exercise: "Exercício",
  repository: "Repositório",
  course: "Curso",
  tool: "Ferramenta",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export const LANGUAGE_LABELS: Record<ResourceLanguage, string> = {
  pt: "Português",
  en: "Inglês",
  es: "Espanhol",
  other: "Outros",
};

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Mais relevantes",
  rating: "Melhor avaliados",
  recent: "Mais recentes",
};

/** Sugestões exibidas abaixo da busca da Home. */
export const QUICK_TOPICS = [
  "React",
  "Python",
  "JavaScript",
  "TypeScript",
  "Docker",
  "Git",
  "Node.js",
  "Inteligência Artificial",
] as const;

export const SEARCH_PLACEHOLDERS = [
  "React",
  "Python",
  "Docker",
  "Git",
  "Machine Learning",
] as const;

export const SUBMISSION_LABELS: Record<SubmissionStatus, string> = {
  pending: "Em revisão",
  approved: "Aprovado",
  rejected: "Recusado",
};
