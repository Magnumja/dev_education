/**
 * Ingestão em lote — para encher a fila de descobertas de uma vez.
 *
 * Existe separado da rota /api/ingest porque as duas coisas têm restrições
 * opostas: a rota roda na Vercel com teto de 60 segundos e precisa terminar
 * rápido; este script roda na sua máquina, sem teto, e pode esperar o tempo
 * necessário para respeitar o limite de requisições do GitHub.
 *
 * Uso:
 *   npm run ingest              # tudo: documentações, repositórios e vídeos
 *   npm run ingest -- docs      # só as documentações do DevDocs
 *   npm run ingest -- github    # só repositórios
 *   npm run ingest -- youtube   # só vídeos dos canais curados
 *   npm run ingest -- artigos   # só artigos do DEV.to
 *
 * Nada é publicado: tudo entra despublicado, esperando a curadoria.
 */
import { TOPICS } from "../src/lib/data/topics";
import { YOUTUBE_CHANNELS } from "../src/lib/ingest/channels";
import {
  deepEducationalQueries,
  searchTermFor,
} from "../src/lib/providers/github";
import { devtoTagFor, PORTUGUESE_TAGS } from "../src/lib/providers/devto";

process.loadEnvFile(".env.local");

const [mode = "all"] = process.argv.slice(2);
const hasToken = Boolean(process.env.GITHUB_TOKEN);

// GitHub permite 30 buscas por minuto com token e 10 sem. Uma folga de meio
// segundo evita esbarrar no limite por diferença de relógio.
const GITHUB_DELAY = hasToken ? 2_100 : 6_500;

const totals = { found: 0, inserted: 0, skipped: 0, errors: 0 };

function report(label: string, r: { found: number; inserted: number; skipped: number; error?: string }) {
  totals.found += r.found;
  totals.inserted += r.inserted;
  totals.skipped += r.skipped;

  if (r.error) {
    totals.errors += 1;
    console.log(`  ✗ ${label.padEnd(42)} ${r.error}`);
    return;
  }

  const suffix = r.inserted > 0 ? `+${r.inserted} novos` : "nada novo";
  console.log(`  · ${label.padEnd(42)} ${String(r.found).padStart(3)} achados, ${suffix}`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  // Importado aqui dentro: o módulo lê variáveis de ambiente na avaliação, e
  // elas só existem depois do loadEnvFile acima.
  const {
    ingestAllDocumentation,
    ingestDevTo,
    ingestGitHub,
    ingestYouTubeChannel,
  } = await import("../src/lib/ingest/run");

  if (mode === "all" || mode === "docs") {
    console.log("\nDocumentações (DevDocs — uma requisição, sem cota)");
    report("índice completo", await ingestAllDocumentation());
  }

  if (mode === "all" || mode === "artigos") {
    const tags = [
      ...TOPICS.map((topic) => ({
        tag: devtoTagFor(topic.slug),
        topicSlug: topic.slug as string | undefined,
      })).filter((entry) => entry.tag),
      // Comunidade lusófona: sem tecnologia fixa, a classificação decide depois.
      ...PORTUGUESE_TAGS.map((tag) => ({ tag, topicSlug: undefined })),
    ];

    console.log(`\nArtigos (DEV.to — ${tags.length} tags)`);
    for (const { tag, topicSlug } of tags) {
      report(tag!, await ingestDevTo(tag!, topicSlug, 30));
      await sleep(1_200); // ~30 requisições a cada 30 segundos
    }
  }

  if (mode === "all" || mode === "youtube") {
    console.log(`\nVídeos (${YOUTUBE_CHANNELS.length} canais curados)`);
    for (const channel of YOUTUBE_CHANNELS) {
      report(channel.handle, await ingestYouTubeChannel(channel.handle, undefined, 15));
      await sleep(1_500); // o YouTube estrangula sequências rápidas
    }
  }

  if (mode === "all" || mode === "github") {
    const queries = TOPICS.flatMap((topic) =>
      deepEducationalQueries(searchTermFor(topic.slug, topic.name)).map(
        (query) => ({ query, topicSlug: topic.slug }),
      ),
    );

    const minutes = Math.ceil((queries.length * GITHUB_DELAY) / 60_000);
    console.log(
      `\nRepositórios (${queries.length} buscas, ~${minutes} min${
        hasToken ? "" : " — sem GITHUB_TOKEN, no limite de 10/min"
      })`,
    );

    for (const [index, { query, topicSlug }] of queries.entries()) {
      report(`[${index + 1}/${queries.length}] ${query}`, await ingestGitHub(query, topicSlug, 15));
      await sleep(GITHUB_DELAY);
    }
  }

  console.log(
    `\n${totals.inserted} novos na fila · ${totals.found} avaliados · ${totals.skipped} já existiam · ${totals.errors} falhas`,
  );
  console.log("Revise em /admin/discover — nada foi publicado.\n");
}

run().catch((error) => {
  console.error("Ingestão interrompida:", error);
  process.exit(1);
});

export {};
