import { cn } from "@/lib/utils/cn";

type BadgeVariant = "neutral" | "brand" | "outline" | "verified";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-ink-700 border-line",
  brand: "bg-brand-50 text-brand-600 border-brand-100",
  outline: "bg-transparent text-ink-500 border-line",
  verified: "bg-brand-50 text-navy-900 border-brand-100",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-4",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
