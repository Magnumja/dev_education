import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Registra que um recurso foi aberto antes do usuário seguir para a fonte.
 * É uma métrica anônima e best-effort: nunca deve atrapalhar a navegação,
 * por isso qualquer falha responde 204 em silêncio.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return new NextResponse(null, { status: 204 });

  try {
    const { resourceId } = (await request.json()) as { resourceId?: string };
    if (!resourceId) return new NextResponse(null, { status: 204 });

    const supabase = await createClient();

    const { data: resource } = await supabase
      .from("resources")
      .select("id")
      .eq("slug", resourceId)
      .maybeSingle<{ id: string }>();

    if (!resource) return new NextResponse(null, { status: 204 });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("resource_clicks").insert({
      resource_id: resource.id,
      user_id: user?.id ?? null,
    });
  } catch (error) {
    console.error("Falha ao registrar clique:", error);
  }

  return new NextResponse(null, { status: 204 });
}
