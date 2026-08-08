import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function resolve(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return { error: NextResponse.json({ error: "unconfigured" }, { status: 503 }) } as const;
  }

  const { resourceId } = (await request.json()) as { resourceId?: string };
  if (!resourceId) {
    return { error: NextResponse.json({ error: "resourceId" }, { status: 400 }) } as const;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) } as const;
  }

  const { data: resource } = await supabase
    .from("resources")
    .select("id")
    .eq("slug", resourceId)
    .maybeSingle<{ id: string }>();

  if (!resource) {
    return { error: NextResponse.json({ error: "not_found" }, { status: 404 }) } as const;
  }

  return { error: null, supabase, userId: user.id, resourceId: resource.id };
}

export async function POST(request: NextRequest) {
  const context = await resolve(request);
  if (context.error) return context.error;

  const { error } = await context.supabase
    .from("favorites")
    .upsert(
      { user_id: context.userId, resource_id: context.resourceId },
      { onConflict: "user_id,resource_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/favorites");
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: NextRequest) {
  const context = await resolve(request);
  if (context.error) return context.error;

  const { error } = await context.supabase
    .from("favorites")
    .delete()
    .eq("user_id", context.userId)
    .eq("resource_id", context.resourceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidatePath("/favorites");
  return NextResponse.json({ saved: false });
}
