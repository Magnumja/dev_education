/**
 * Gera supabase/seed.sql a partir do catálogo curado em src/lib/data.
 *
 * O catálogo é a única fonte de verdade: rode `npm run db:seed` depois de
 * alterar tópicos ou recursos, em vez de editar o SQL na mão.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { TOPICS } from "../src/lib/data/topics";
import { RESOURCES } from "../src/lib/data/resources";

function quote(value: string | null): string {
  if (value === null) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function array(values: string[]): string {
  return `array[${values.map(quote).join(", ")}]::text[]`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const allTags = new Map<string, string>();
for (const resource of RESOURCES) {
  for (const tag of resource.tags) allTags.set(slugify(tag), tag);
}

const lines: string[] = [
  "-- =============================================================",
  "-- DevEducation — seed do catálogo curado",
  "-- GERADO AUTOMATICAMENTE por scripts/generate-seed.ts — não edite à mão.",
  "-- Idempotente: pode ser executado novamente com segurança.",
  "-- =============================================================",
  "",
  "-- ── topics ───────────────────────────────────────────────────",
  "insert into topics (name, slug, description, icon) values",
  TOPICS.map(
    (t) =>
      `  (${quote(t.name)}, ${quote(t.slug)}, ${quote(t.description)}, ${quote(t.icon)})`,
  ).join(",\n") +
    "\non conflict (slug) do update set\n" +
    "  name = excluded.name,\n" +
    "  description = excluded.description,\n" +
    "  icon = excluded.icon;",
  "",
  "-- ── tags ─────────────────────────────────────────────────────",
  "insert into tags (name, slug) values",
  [...allTags]
    .map(([slug, name]) => `  (${quote(name)}, ${quote(slug)})`)
    .join(",\n") + "\non conflict (slug) do update set name = excluded.name;",
  "",
  "-- ── resources ────────────────────────────────────────────────",
];

for (const resource of RESOURCES) {
  lines.push(
    `insert into resources (slug, title, description, url, source, source_domain, resource_type, difficulty, language, thumbnail_url, author, published_at, is_verified, is_active) values (`,
    `  ${quote(resource.id)},`,
    `  ${quote(resource.title)},`,
    `  ${quote(resource.description)},`,
    `  ${quote(resource.url)},`,
    `  ${quote(resource.source)},`,
    `  ${quote(resource.sourceDomain)},`,
    `  ${quote(resource.type)}::resource_type,`,
    `  ${resource.difficulty ? `${quote(resource.difficulty)}::difficulty_level` : "null"},`,
    `  ${quote(resource.language)}::resource_language,`,
    `  ${quote(resource.thumbnailUrl)},`,
    `  ${quote(resource.author)},`,
    `  ${resource.publishedAt ? `${quote(resource.publishedAt)}::timestamptz` : "null"},`,
    `  ${resource.isVerified},`,
    `  true`,
    `)`,
    `on conflict (slug) do update set`,
    `  title = excluded.title,`,
    `  description = excluded.description,`,
    `  url = excluded.url,`,
    `  source = excluded.source,`,
    `  source_domain = excluded.source_domain,`,
    `  resource_type = excluded.resource_type,`,
    `  difficulty = excluded.difficulty,`,
    `  language = excluded.language,`,
    `  author = excluded.author,`,
    `  is_verified = excluded.is_verified;`,
    "",
    `insert into resource_topics (resource_id, topic_id)`,
    `select r.id, t.id from resources r, topics t`,
    `where r.slug = ${quote(resource.id)} and t.slug = any (${array(resource.topics)})`,
    `on conflict do nothing;`,
    "",
  );

  if (resource.tags.length > 0) {
    lines.push(
      `insert into resource_tags (resource_id, tag_id)`,
      `select r.id, tg.id from resources r, tags tg`,
      `where r.slug = ${quote(resource.id)} and tg.slug = any (${array(resource.tags.map(slugify))})`,
      `on conflict do nothing;`,
      "",
    );
  }
}

const outputPath = resolve(import.meta.dirname, "../supabase/seed.sql");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join("\n") + "\n", "utf8");

console.log(
  `seed.sql gerado: ${TOPICS.length} tópicos, ${allTags.size} tags, ${RESOURCES.length} recursos.`,
);
