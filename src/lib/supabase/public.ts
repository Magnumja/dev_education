import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Cliente sem cookies, para dados iguais para todo mundo.
 *
 * Existe por causa do cache: `unstable_cache` não pode conter leitura de
 * cookies, e o cliente de servidor lê a sessão em toda chamada. Contagem de
 * tecnologias, total por tipo e destaques da semana não dependem de quem está
 * olhando — cachear uma vez serve todas as visitas.
 *
 * Continua sujeito à RLS como anônimo, então só alcança o catálogo público.
 */
export function createPublicClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
