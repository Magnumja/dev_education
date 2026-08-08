import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface PanelProps {
  title: string;
  action?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}

/** Cartão dos painéis da coluna direita do painel inicial. */
export function Panel({ title, action, className, children }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface p-5 shadow-soft",
        className,
      )}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-navy-900">
          {title}
        </h2>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-[13px] font-medium text-brand-500 transition-quick hover:text-brand-400"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
