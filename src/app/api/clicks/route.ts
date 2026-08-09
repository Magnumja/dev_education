import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Registra que um recurso foi aberto antes do usuário seguir para a fonte.
 *
 * É uma métrica anônima e best-effort: nunca deve atrapalhar a navegação, por
 * isso qualquer falha responde 204 em silêncio.
 *
 * A deduplicação por origem acontece no banco (record_resource_click), que
 * ignora repetições do mesmo visitante no mesmo conteúdo dentro de uma hora.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return new NextResponse(null, { status: 204 });

  try {
    const { resourceId } = (await request.json()) as { resourceId?: string };
    if (!resourceId) return new NextResponse(null, { status: 204 });

    const supabase = await createClient();
    const { error } = await supabase.rpc("record_resource_click", {
      p_slug: resourceId,
      p_source_hash: sourceHash(request),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Falha ao registrar clique:", error);
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Identificador de origem que não guarda dado pessoal.
 *
 * O hash mistura IP e user-agent com um segredo do servidor, então não é
 * reversível nem comparável entre instalações — serve só para reconhecer
 * repetição. Sem isso, guardar IP puro seria dado pessoal em uma tabela de
 * métrica que não precisa dele.
 */
function sourceHash(request: NextRequest): string | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");

  if (!ip) return null;

  const salt =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.INGEST_SECRET ?? "";

  return createHash("sha256")
    .update(`${ip}|${request.headers.get("user-agent") ?? ""}|${salt}`)
    .digest("hex")
    .slice(0, 32);
}
