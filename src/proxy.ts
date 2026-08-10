import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/** Rotas que exigem sessão; o restante do site é público. */
const PROTECTED = ["/favorites", "/collections", "/profile", "/submit", "/admin"];

// /nova-senha e /recuperar-senha ficam fora: a primeira chega pelo link do
// e-mail, com sessão temporária, e a segunda é justamente para quem não
// consegue entrar.

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  // O Supabase só honra o `redirectTo` se ele estiver na lista de Redirect URLs
  // do projeto; fora dela, devolve para o Site URL — normalmente a raiz, que
  // não sabe trocar o código por sessão. O login falhava em silêncio por uma
  // configuração no painel, sem nada no código para indicar o motivo.
  //
  // Encaminhar o código para o callback torna a autenticação tolerante a essa
  // divergência, em vez de depender de duas listas combinarem.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname !== "/auth/callback" && searchParams.has("code")) {
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", searchParams.get("code")!);
    if (pathname !== "/") callback.searchParams.set("next", pathname);
    return NextResponse.redirect(callback);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalida o token no servidor — não confie em getSession() aqui.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && PROTECTED.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todas as rotas exceto assets estáticos e imagens, que não precisam
     * de renovação de sessão.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
