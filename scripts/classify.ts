/**
 * Vincula tecnologias a conteúdos que entraram sem nenhuma.
 *
 *   npm run classify              # tudo que está sem tecnologia
 *   npm run classify -- youtube   # só o que veio de um provider
 *
 * Não publica nada e não desfaz vínculo existente.
 */
process.loadEnvFile(".env.local");

const [provider] = process.argv.slice(2);

async function main() {
  const { classifyUnlinked } = await import("../src/lib/ingest/classify");

  const report = await classifyUnlinked({ onlyProvider: provider });

  console.log(`\n${report.scanned} conteúdos analisados`);
  console.log(`  ${report.linked} ganharam tecnologia`);
  console.log(`  ${report.withoutTopic} sem tecnologia detectável`);

  if (report.examples.length > 0) {
    console.log("\nSem tecnologia detectável (amostra):");
    for (const title of report.examples) {
      console.log(`  · ${title.slice(0, 70)}`);
    }
    console.log(
      "\nEsses costumam ser institucionais, vlogs ou avisos — conteúdo que não\nensina tecnologia nenhuma. Vale descartar em /admin/discover.",
    );
  }

  console.log();
}

main().catch((error) => {
  console.error("Classificação interrompida:", error);
  process.exit(1);
});

export {};
