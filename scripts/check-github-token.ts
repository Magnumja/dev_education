/**
 * Diagnóstico do GITHUB_TOKEN.
 *
 * Nunca imprime o token — só o que está errado com ele. Existe porque as
 * falhas mais comuns (espaço depois do `=`, aspas coladas, token truncado no
 * copiar/colar) são invisíveis olhando o arquivo.
 *
 *   npm run check:github
 */
process.loadEnvFile(".env.local");

const raw = process.env.GITHUB_TOKEN ?? "";

function fail(message: string, hint?: string): never {
  console.log(`\n✗ ${message}`);
  if (hint) console.log(`  ${hint}`);
  console.log();
  process.exit(1);
}

if (!raw) {
  fail(
    "GITHUB_TOKEN não está definido no .env.local.",
    "Adicione a linha GITHUB_TOKEN=... e rode de novo.",
  );
}

// ── Problemas de formatação, antes de gastar uma requisição ──────────
if (raw !== raw.trim()) {
  fail(
    "O valor tem espaço em branco em volta.",
    'Provavelmente há um espaço depois do "=" — o formato correto é GITHUB_TOKEN=ghp_xxx, sem espaço.',
  );
}

if (/^["']|["']$/.test(raw)) {
  fail("O valor está entre aspas.", "Cole o token sem aspas.");
}

const kind = raw.startsWith("github_pat_")
  ? "fine-grained"
  : raw.startsWith("ghp_")
    ? "classic"
    : null;

if (!kind) {
  fail(
    "O valor não parece um token do GitHub.",
    'Um token começa com "ghp_" (classic) ou "github_pat_" (fine-grained). Confira se você não colou a URL ou o nome do token por engano.',
  );
}

console.log(`\nToken ${kind}, ${raw.length} caracteres.`);

async function main() {
  // ── Teste real contra a API ────────────────────────────────────────

  const headers = {
    Authorization: `Bearer ${raw}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "DevEducation",
  };

  const limit = await fetch("https://api.github.com/rate_limit", { headers });

  if (limit.status === 401) {
    fail(
      "O GitHub recusou o token (401 Bad credentials).",
      "Ele foi revogado, expirou, ou o texto colado está incompleto. Gere um novo em github.com/settings/tokens.",
    );
  }

  if (!limit.ok) {
    fail(`O GitHub respondeu ${limit.status}.`);
  }

  const data = (await limit.json()) as {
    resources: { search: { limit: number; remaining: number } };
  };

  const search = data.resources.search;
  console.log(`Autenticado: busca liberada em ${search.limit} requisições/minuto.`);

  if (search.limit < 30) {
    console.log(
      "Atenção: sem autenticação o limite seria 10/min. Este valor sugere que o token não está sendo aceito como esperado.",
    );
  }

  // ── Teste do que a ingestão realmente faz ────────────────────────────
  const probe = await fetch(
    "https://api.github.com/search/repositories?q=awesome+react+in:name,description+stars:%3E200&per_page=1",
    { headers },
  );

  if (!probe.ok) {
    fail(
      `A busca de repositórios falhou com ${probe.status}.`,
      "O token autentica, mas não consegue buscar. Se for fine-grained, confirme o acesso a repositórios públicos.",
    );
  }

  const result = (await probe.json()) as { total_count: number };

  console.log(`Busca funcionando: ${result.total_count} repositórios para "awesome react".`);
  console.log(`\n✓ Token válido e pronto para o \`npm run ingest\`.\n`);
}

main().catch((error) => {
  console.error("\nFalha inesperada:", (error as Error).message, "\n");
  process.exit(1);
});
