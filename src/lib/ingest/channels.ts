/**
 * Canais acompanhados pela ingestão.
 *
 * Cada handle foi resolvido e teve o feed verificado antes de entrar aqui —
 * canal inexistente vira erro silencioso na ingestão e some no meio do log.
 *
 * A lista é curta e curada de propósito: o feed traz os 15 vídeos mais
 * recentes, então cada canal adicionado é um compromisso de que o que ele
 * publica costuma valer a revisão da curadoria.
 */
export const YOUTUBE_CHANNELS: { handle: string; language: "pt" | "en" }[] = [
  // Português
  { handle: "@rocketseat", language: "pt" },
  { handle: "@FilipeDeschamps", language: "pt" },
  { handle: "@codigofontetv", language: "pt" },
  { handle: "@CursoemVideo", language: "pt" },
  { handle: "@programadorbr", language: "pt" },
  { handle: "@dionisiochiuratto", language: "pt" },

  // Inglês
  { handle: "@Fireship", language: "en" },
  { handle: "@freecodecamp", language: "en" },
  { handle: "@TraversyMedia", language: "en" },
  { handle: "@NetNinja", language: "en" },
  { handle: "@academind", language: "en" },
  { handle: "@WebDevSimplified", language: "en" },
  { handle: "@KevinPowell", language: "en" },
  { handle: "@ArjanCodes", language: "en" },
  { handle: "@codewithmosh", language: "en" },
  { handle: "@developedbyed", language: "en" },
  { handle: "@TechWithTim", language: "en" },
  { handle: "@NetworkChuck", language: "en" },
  { handle: "@ThePrimeagen", language: "en" },
  { handle: "@t3dotgg", language: "en" },
  { handle: "@JamesQQuick", language: "en" },
];
