import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  children,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-400">
        {icon ?? <SearchX className="size-5" aria-hidden />}
      </div>
      <p className="text-base font-semibold text-navy-900">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-ink-500">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
