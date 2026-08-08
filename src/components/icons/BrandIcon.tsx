import { BRAND_ICONS } from "@/components/icons/brand-icons";
import { cn } from "@/lib/utils/cn";

interface BrandIconProps {
  /** Slug do simple-icons. Slug desconhecido devolve `null`. */
  slug: string | null | undefined;
  /** Usa a cor oficial da marca. Sem isso, herda `currentColor`. */
  colored?: boolean;
  className?: string;
}

/**
 * Ícone de marca renderizado a partir dos dados embutidos.
 *
 * Componente de servidor de propósito: só o `<path>` usado vai para o HTML,
 * em vez de mandar o dicionário inteiro de ícones para o navegador.
 */
export function BrandIcon({ slug, colored, className }: BrandIconProps) {
  const icon = slug ? BRAND_ICONS[slug] : undefined;
  if (!icon) return null;

  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0", className)}
      fill={colored ? icon.hex : "currentColor"}
    >
      <path d={icon.path} />
    </svg>
  );
}

export function hasBrandIcon(slug: string | null | undefined): boolean {
  return Boolean(slug && BRAND_ICONS[slug]);
}
