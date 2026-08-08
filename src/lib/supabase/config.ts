export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Sem credenciais o app continua funcionando sobre o catálogo curado local:
 * busca, tecnologias e páginas de recurso não dependem de banco. Só os
 * recursos de conta (favoritos, coleções, submissões) exigem Supabase.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
