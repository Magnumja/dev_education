import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Cliente com service role — ignora RLS.
 *
 * Uso restrito a operações de curadoria executadas no servidor (aprovar
 * submissões, importar recursos de providers externos). Nunca importe este
 * módulo em Client Components: `server-only` quebra o build se isso acontecer.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL são obrigatórios para operações administrativas.",
    );
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
