/**
 * Publica em lote a partir da linha de comando.
 *
 *   npm run publish -- youtube            # o que veio do YouTube
 *   npm run publish -- youtube --all      # inclusive sem tecnologia vinculada
 *   npm run publish -- devdocs
 *
 * Por padrão publica apenas o que tem tecnologia vinculada: conteúdo sem
 * tecnologia não aparece em nenhuma página de tecnologia nem responde ao
 * filtro — entra no catálogo para ficar invisível.
 */
process.loadEnvFile(".env.local");

const args = process.argv.slice(2);
const provider = args.find((arg) => !arg.startsWith("--"));
const includeUnlinked = args.includes("--all");
const dryRun = args.includes("--dry-run");

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const supabase = createAdminClient();

  if (!provider) {
    console.error("\nInforme o provider. Ex.: npm run publish -- youtube\n");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("resources")
    .select("id, title, resource_topics (topic_id)")
    .eq("provider", provider)
    .eq("is_active", false)
    .limit(3000);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as {
    id: string;
    title: string;
    resource_topics: { topic_id: string }[];
  }[];

  const linked = rows.filter((row) => row.resource_topics.length > 0);
  const unlinked = rows.filter((row) => row.resource_topics.length === 0);
  const target = includeUnlinked ? rows : linked;

  console.log(`\n${provider}: ${rows.length} na fila`);
  console.log(`  ${linked.length} com tecnologia vinculada`);
  console.log(`  ${unlinked.length} sem tecnologia`);
  console.log(
    `\n${dryRun ? "Publicaria" : "Publicando"} ${target.length}${
      includeUnlinked ? " (incluindo os sem tecnologia)" : ""
    }`,
  );

  if (dryRun || target.length === 0) {
    console.log();
    return;
  }

  const ids = target.map((row) => row.id);

  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { error: updateError } = await supabase
      .from("resources")
      .update({ is_active: true, is_verified: true })
      .in("id", batch);

    if (updateError) throw new Error(updateError.message);
    console.log(`  ${Math.min(i + batch.length, ids.length)}/${ids.length}`);
  }

  console.log("\nPublicado. Ficam na fila os itens não selecionados.\n");
}

main().catch((error) => {
  console.error("Publicação interrompida:", error);
  process.exit(1);
});

export {};
