/**
 * Domínios de onde aceitamos miniaturas.
 *
 * Fonte única: o `next.config.ts` monta os `remotePatterns` a partir daqui, e
 * os componentes checam a mesma lista antes de renderizar. Manter as duas
 * pontas separadas foi o que derrubou as páginas de tecnologia — o Next lança
 * erro em host não autorizado, e um erro de imagem vira uma página inteira em
 * branco.
 *
 * Como o DevEducation agrega conteúdo de terceiros, a lista nunca estará
 * completa. Por isso a checagem em tempo de execução importa mais que a lista:
 * host desconhecido deve significar "sem miniatura", nunca "página quebrada".
 */
export const IMAGE_HOSTS = [
  // YouTube
  "i.ytimg.com",
  "img.youtube.com",
  // DEV.to — os domínios de mídia são numerados e rotativos
  "**.dev.to",
  "dev-to-uploads.s3.amazonaws.com",
  "dev-to-uploads.s3.us-east-2.amazonaws.com",
  // GitHub
  "opengraph.githubassets.com",
  "raw.githubusercontent.com",
  "avatars.githubusercontent.com",
] as const;

/** Converte o padrão com `**` em teste de sufixo. */
function matches(hostname: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    const suffix = pattern.slice(2); // ".dev.to"
    return hostname === suffix.slice(1) || hostname.endsWith(suffix);
  }
  return hostname === pattern;
}

export function isAllowedImageHost(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return IMAGE_HOSTS.some((pattern) => matches(hostname, pattern));
  } catch {
    return false;
  }
}
