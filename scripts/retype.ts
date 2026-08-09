/**
 * Reclassifica o tipo dos recursos vindos do GitHub.
 *
 * O provider antigo marcava tudo como repositório ou exercício, e o catálogo
 * ficou com 1.367 repositórios contra 4 cursos. Quem filtrava por "Curso" não
 * achava nada, embora o material estivesse lá.
 *
 *   npm run retype -- --dry-run   # mostra o que mudaria
 *   npm run retype
 */
process.loadEnvFile(".env.local");

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { detectResourceType } = await import("../src/lib/providers/types");
  const supabase = createAdminClient();

  type Row = { id: string; title: string; description: string | null; resource_type: string };
  const rows: Row[] = [];

  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from("resources")
      .select("id, title, description, resource_type")
      .eq("provider", "github")
      .range(offset, offset + 999);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as Row[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }

  const mudancas = rows
    .map((row) => ({ row, novo: detectResourceType(row.title, row.description) }))
    .filter(({ row, novo }) => novo !== row.resource_type);

  const porTipo = new Map<string, number>();
  for (const { row, novo } of mudancas) {
    const chave = `${row.resource_type} → ${novo}`;
    porTipo.set(chave, (porTipo.get(chave) ?? 0) + 1);
  }

  console.log(`\n  ${rows.length} recursos do GitHub, ${mudancas.length} mudariam de tipo\n`);
  for (const [chave, n] of [...porTipo].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${chave}`);
  }

  if (dryRun) {
    console.log("\n  Amostra:");
    for (const { row, novo } of mudancas.slice(0, 8)) {
      console.log(`    ${row.resource_type} → ${novo.padEnd(13)} ${row.title.slice(0, 44)}`);
    }
    console.log();
    return;
  }

  for (const { row, novo } of mudancas) {
    await supabase.from("resources").update({ resource_type: novo }).eq("id", row.id);
  }
  console.log(`\n  ${mudancas.length} reclassificados\n`);
}

main().catch((error) => {
  console.error("Reclassificação interrompida:", error);
  process.exit(1);
});

export {};
