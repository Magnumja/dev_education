import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  /** Recebe o número da página e devolve a href correspondente. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, total, pageSize, hrefFor }: PaginationProps) {
  const lastPage = Math.ceil(total / pageSize);
  if (lastPage <= 1) return null;

  const pages = pageWindow(page, lastPage);

  return (
    <nav
      aria-label="Paginação dos resultados"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <PageLink
        href={hrefFor(page - 1)}
        disabled={page === 1}
        label="Página anterior"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </PageLink>

      {pages.map((item, index) =>
        item === null ? (
          <span key={`gap-${index}`} className="px-1.5 text-sm text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-md border px-2 py-1.5 text-center text-sm transition-quick",
              item === page
                ? "border-brand-500 bg-brand-50 font-medium text-brand-600"
                : "border-line text-ink-700 hover:border-brand-400 hover:text-brand-600",
            )}
          >
            {item}
          </Link>
        ),
      )}

      <PageLink
        href={hrefFor(page + 1)}
        disabled={page === lastPage}
        label="Próxima página"
      >
        <ChevronRight className="size-4" aria-hidden />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const classes =
    "flex size-9 items-center justify-center rounded-md border border-line transition-quick";

  if (disabled) {
    return (
      <span aria-hidden className={cn(classes, "text-ink-400 opacity-40")}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(classes, "text-ink-700 hover:border-brand-400 hover:text-brand-600")}
    >
      {children}
    </Link>
  );
}

/** Janela de páginas com elipses: 1 … 4 5 6 … 20 */
function pageWindow(page: number, lastPage: number): (number | null)[] {
  const window = new Set([1, lastPage, page, page - 1, page + 1]);
  const visible = [...window]
    .filter((value) => value >= 1 && value <= lastPage)
    .sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let previous = 0;
  for (const value of visible) {
    if (previous && value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }
  return result;
}
