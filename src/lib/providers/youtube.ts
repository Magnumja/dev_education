import "server-only";

import {
  detectDifficulty,
  detectLanguage,
  type ProviderResult,
} from "@/lib/providers/types";

/**
 * Vídeos pelo feed Atom público de um canal.
 *
 * Escolha deliberada: a YouTube Data API dá 10.000 unidades/dia e cada
 * `search.list` custa 100 — cerca de 100 buscas por dia no total. O feed RSS
 * não tem chave, não tem cota e devolve os 15 vídeos mais recentes do canal.
 * Para acompanhar canais educacionais escolhidos a dedo, é melhor negócio.
 *
 * Guardamos só metadados públicos e sempre linkamos para o YouTube.
 */
const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=";

const CHANNEL_ID = /^UC[\w-]{20,24}$/;

/**
 * Aceita o que a pessoa tiver em mãos: o ID, uma URL /channel/UC..., um
 * @handle ou a URL do canal. Handles e URLs antigas (/c/, /user/) não contêm o
 * ID, então resolvemos pela página do canal — é a única forma sem usar a Data
 * API, que gastaria cota.
 */
export async function resolveChannelId(input: string): Promise<string> {
  const value = input.trim();

  const direct = value.match(/UC[\w-]{20,24}/);
  if (direct && CHANNEL_ID.test(direct[0])) return direct[0];

  const handle = value.startsWith("@")
    ? value
    : value.match(/youtube\.com\/(@[\w.-]+|c\/[\w.-]+|user\/[\w.-]+)/)?.[1];

  if (!handle) {
    throw new Error(
      "Não reconheci o canal. Use o @handle, a URL do canal ou o ID que começa com UC.",
    );
  }

  const response = await fetch(`https://www.youtube.com/${handle}`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR" },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Canal ${handle} não encontrado no YouTube.`);
  }

  const html = await response.text();
  const found =
    html.match(/"channelId":"(UC[\w-]{20,24})"/)?.[1] ??
    html.match(/channel\/(UC[\w-]{20,24})/)?.[1];

  if (!found) {
    throw new Error(
      `Não consegui descobrir o ID de ${handle}. Abra o canal, vá em Compartilhar e copie o ID.`,
    );
  }

  return found;
}

export async function fetchChannelVideos(
  channelId: string,
  options: { topicSlug?: string; limit?: number; language?: "pt" | "en" | "es" } = {},
): Promise<ProviderResult[]> {
  const { topicSlug, limit = 10, language = "pt" } = options;

  if (!CHANNEL_ID.test(channelId)) {
    throw new Error("ID de canal inválido.");
  }

  const response = await fetch(`${FEED}${channelId}`, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "DevEducation" },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Canal não encontrado. Confira o ID."
        : `YouTube respondeu ${response.status}`,
    );
  }

  return parseFeed(await response.text(), { topicSlug, limit, language });
}

/**
 * Parser mínimo do Atom do YouTube. O formato é fixo e simples, então não
 * vale carregar uma dependência de XML só para isto.
 */
function parseFeed(
  xml: string,
  options: { topicSlug?: string; limit: number; language: "pt" | "en" | "es" },
): ProviderResult[] {
  const channelName = tagValue(xml.split("<entry>")[0] ?? "", "name") ?? "YouTube";
  const entries = xml.split("<entry>").slice(1);
  const results: ProviderResult[] = [];

  for (const entry of entries.slice(0, options.limit)) {
    const videoId = tagValue(entry, "yt:videoId");
    const title = tagValue(entry, "title");
    if (!videoId || !title) continue;

    const description = tagValue(entry, "media:description");

    results.push({
      externalId: videoId,
      providerId: "youtube",
      title: decodeEntities(title),
      description: description
        ? decodeEntities(description).split("\n")[0].slice(0, 300)
        : null,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      source: "YouTube",
      sourceDomain: "youtube.com",
      type: "video",
      difficulty: detectDifficulty(title, description),
      language: detectLanguage(title, description),
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      author: decodeEntities(channelName),
      publishedAt: tagValue(entry, "published"),
      topics: options.topicSlug ? [options.topicSlug] : [],
      tags: [],
      signals: { channelId: tagValue(entry, "yt:channelId") ?? "" },
    });
  }

  return results;
}

function tagValue(source: string, tag: string): string | null {
  const match = source.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`),
  );
  return match ? match[1].trim() : null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
