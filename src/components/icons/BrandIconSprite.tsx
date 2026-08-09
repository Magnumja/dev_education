import { BRAND_ICONS } from "@/components/icons/brand-icons";

/**
 * Declara uma vez os ícones que a lista vai usar.
 *
 * Numa página de resultados, dezenas de cards repetem o mesmo ícone — e o path
 * do simple-icons chega a 3 KB. Inline, esse path é escrito uma vez por card no
 * HTML e mais uma vez no payload do RSC: vinte cards de React custavam ~120 KB
 * só de desenho idêntico.
 *
 * Com `<symbol>` + `<use>`, cada ícone aparece uma única vez e os cards viram
 * uma referência de poucos bytes. Referência interna ao documento, não a um
 * arquivo externo — o Safari não suporta `<use>` apontando para outro arquivo.
 */
export function BrandIconSprite({ slugs }: { slugs: (string | null)[] }) {
  const unique = [
    ...new Set(slugs.filter((slug): slug is string => Boolean(slug && BRAND_ICONS[slug]))),
  ];

  if (unique.length === 0) return null;

  return (
    <svg aria-hidden className="hidden">
      <defs>
        {unique.map((slug) => (
          <symbol key={slug} id={symbolId(slug)} viewBox="0 0 24 24">
            <path d={BRAND_ICONS[slug].path} />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

export function symbolId(slug: string): string {
  return `brand-${slug}`;
}

/** Referência a um ícone já declarado pelo sprite acima. */
export function BrandIconRef({
  slug,
  className,
}: {
  slug: string | null | undefined;
  className?: string;
}) {
  const icon = slug ? BRAND_ICONS[slug] : undefined;
  if (!icon || !slug) return null;

  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      className={className}
      fill={icon.hex}
    >
      <use href={`#${symbolId(slug)}`} />
    </svg>
  );
}
