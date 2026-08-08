/**
 * Gera src/components/icons/brand-icons.ts a partir do pacote `simple-icons`.
 *
 * O pacote fica só em devDependencies: embutimos apenas os ícones usados, para
 * não carregar 3.000 SVGs no bundle. Rode `npm run icons` depois de incluir
 * uma tecnologia nova em ICON_SLUGS.
 *
 * Os ícones são CC0; as marcas pertencem aos respectivos donos e aparecem aqui
 * apenas para identificar a origem de cada conteúdo.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as simpleIcons from "simple-icons";

/** Slugs do simple-icons que o DevEducation usa. */
const ICON_SLUGS = [
  // linguagens e runtimes
  "javascript", "typescript", "python", "go", "rust", "php", "ruby",
  "kotlin", "swift", "dart", "cplusplus", "c", "dotnet",
  // front-end
  "react", "nextdotjs", "vuedotjs", "angular", "svelte", "html5", "css",
  "tailwindcss",
  // back-end e dados
  "nodedotjs", "django", "flask", "fastapi", "spring", "graphql",
  "postgresql", "mysql", "mongodb", "redis", "supabase",
  // infra
  "docker", "kubernetes", "linux", "googlecloud", "vercel",
  // ferramentas e fontes
  "git", "github", "youtube", "mdnwebdocs", "scikitlearn", "devdotto",
  "googlechrome", "figma", "jest", "deno", "bun",
] as const;

interface SimpleIcon {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

const icons = simpleIcons as unknown as Record<string, SimpleIcon>;
const entries: string[] = [];
const missing: string[] = [];

for (const slug of ICON_SLUGS) {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  const icon = icons[key];

  if (!icon) {
    missing.push(slug);
    continue;
  }

  entries.push(
    `  "${slug}": {\n` +
      `    title: ${JSON.stringify(icon.title)},\n` +
      `    hex: "#${icon.hex}",\n` +
      `    path: ${JSON.stringify(icon.path)},\n` +
      `  },`,
  );
}

if (missing.length > 0) {
  console.warn(`Slugs não encontrados no simple-icons: ${missing.join(", ")}`);
}

const output = `// GERADO AUTOMATICAMENTE por scripts/generate-icons.ts — não edite à mão.
// Ícones do projeto simple-icons (CC0). As marcas pertencem a seus donos e são
// exibidas apenas para identificar a origem de cada conteúdo.

export interface BrandIcon {
  title: string;
  hex: string;
  path: string;
}

export const BRAND_ICONS: Record<string, BrandIcon> = {
${entries.join("\n")}
};

export type BrandIconSlug = keyof typeof BRAND_ICONS;
`;

const outputPath = resolve(
  import.meta.dirname,
  "../src/components/icons/brand-icons.ts",
);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output, "utf8");

console.log(`brand-icons.ts gerado com ${entries.length} ícones.`);
