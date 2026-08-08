import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TileRailProps {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}

/**
 * Faixa horizontal de cartões. Rola no toque e no teclado; sem setas
 * decorativas que não funcionam sem JavaScript.
 */
export function TileRail({
  title,
  description,
  action,
  children,
}: TileRailProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-navy-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-ink-500">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand-500 transition-quick hover:text-brand-400"
          >
            {action.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 scroll-rail scroll-rail-hidden sm:mx-0 sm:px-0">
        <div className="grid auto-cols-[236px] grid-flow-col gap-3">
          {children}
        </div>
      </div>
    </section>
  );
}
