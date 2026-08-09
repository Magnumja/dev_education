import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Troca o code do OAuth/confirmação de e-mail por uma sessão. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  // O provedor devolve o motivo na própria URL quando recusa; repassá-lo é o
  // que permite distinguir "você cancelou" de "a configuração está errada".
  const providerError = searchParams.get("error_code") ?? searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
