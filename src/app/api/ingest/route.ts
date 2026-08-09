import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { TOPICS } from "@/lib/data/topics";
import {
  ingestDevDocs,
  ingestGitHub,
  ingestYouTubeChannel,
  type IngestReport,
} from "@/lib/ingest/run";
import { resolveChannelId } from "@/lib/providers/youtube";
import { educationalQueries, searchTermFor } from "@/lib/providers/github";

export const maxDuration = 60;

/** Quantas tecnologias processar por execução, para caber no tempo e na cota. */
const TOPICS_PER_RUN = 3;

/**
 * Ingestão agendada (Vercel Cron).
 *
 * Roda fora do caminho da busca do usuário de propósito: providers têm cota e
 * latência. Tudo que entra fica despublicado, esperando a curadoria.
 *
 * A busca do GitHub permite 10 requisições por minuto sem token e 30 com token.
 * Por isso cada execução cobre apenas uma fatia das tecnologias, girando por
 * dia — com 12 tecnologias e 3 por execução, quatro dias cobrem o catálogo.
 *
 * Autenticação: Authorization: Bearer <CRON_SECRET ou INGEST_SECRET>
 *
 * Parâmetros opcionais:
 *   ?topic=<slug>     processa só uma tecnologia
 *   ?all=1            ignora o fatiamento (use apenas com GITHUB_TOKEN)
 *   ?channel=@handle  importa apenas os vídeos recentes de um canal
 *
 * Canais acompanhados a cada execução vêm de YOUTUBE_CHANNELS, separados por
 * vírgula (aceita @handle, URL ou o ID UC...). O feed é público e sem cota,
 * então não há fatiamento aqui.
 */
/**
 * O Vercel Cron chama por GET e manda `Authorization: Bearer $CRON_SECRET`.
 * Aceitamos os dois segredos: CRON_SECRET para o agendamento e INGEST_SECRET
 * para disparos manuais.
 */
export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const accepted = [process.env.CRON_SECRET, process.env.INGEST_SECRET].filter(
    Boolean,
  );

  if (accepted.length === 0) {
    return NextResponse.json(
      { error: "Configure CRON_SECRET ou INGEST_SECRET." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  if (!accepted.some((secret) => safeEqual(header, `Bearer ${secret}`))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hasToken = Boolean(process.env.GITHUB_TOKEN);
  const { searchParams } = request.nextUrl;
  const topicSlug = searchParams.get("topic");
  const channel = searchParams.get("channel");

  // Importação avulsa de um canal: não mexe nas tecnologias.
  if (channel) {
    const report = await ingestChannel(channel);
    return NextResponse.json({
      channels: [channel],
      found: report.found,
      inserted: report.inserted,
      skipped: report.skipped,
      errors: report.error ? [`YouTube: ${report.error}`] : [],
    });
  }

  const selected = topicSlug
    ? TOPICS.filter((topic) => topic.slug === topicSlug)
    : searchParams.get("all") === "1"
      ? TOPICS
      : rotatingSlice();

  if (selected.length === 0) {
    return NextResponse.json({ error: "Tecnologia não encontrada." }, { status: 404 });
  }

  // Sem token o orçamento é curto: uma consulta por tecnologia em vez de três.
  const queriesPerTopic = hasToken ? 3 : 1;
  const reports: IngestReport[] = [];

  for (const topic of selected) {
    const term = searchTermFor(topic.slug, topic.name);

    for (const query of educationalQueries(term).slice(0, queriesPerTopic)) {
      reports.push(await ingestGitHub(query, topic.slug, 5));
      await pause(hasToken ? 2000 : 6500);
    }
    reports.push(await ingestDevDocs(term, topic.slug, 3));
  }

  for (const entry of channelList()) {
    reports.push(await ingestChannel(entry));
  }

  const errors = reports
    .filter((report) => report.error)
    .map((report) => `${report.provider}: ${report.error}`);

  return NextResponse.json({
    topics: selected.map((topic) => topic.slug),
    authenticated: hasToken,
    found: reports.reduce((sum, report) => sum + report.found, 0),
    inserted: reports.reduce((sum, report) => sum + report.inserted, 0),
    skipped: reports.reduce((sum, report) => sum + report.skipped, 0),
    errors,
  });
}

/**
 * Comparação em tempo constante.
 *
 * `===` para em cada byte divergente, e o tempo de resposta revela quantos
 * caracteres do segredo já estão certos — dá para descobri-lo byte a byte.
 */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  // timingSafeEqual exige mesmo tamanho; comparar o comprimento antes só
  // revela o tamanho do segredo, que não é o segredo.
  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}

function channelList(): string[] {
  return (process.env.YOUTUBE_CHANNELS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function ingestChannel(entry: string): Promise<IngestReport> {
  try {
    return await ingestYouTubeChannel(await resolveChannelId(entry), undefined, 10);
  } catch (error) {
    return {
      provider: "YouTube",
      found: 0,
      inserted: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}

/** Fatia que muda a cada dia, cobrindo todas as tecnologias em poucos dias. */
function rotatingSlice() {
  const dayOfYear = Math.floor(Date.now() / 86_400_000);
  const groups = Math.ceil(TOPICS.length / TOPICS_PER_RUN);
  const start = (dayOfYear % groups) * TOPICS_PER_RUN;
  return TOPICS.slice(start, start + TOPICS_PER_RUN);
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
