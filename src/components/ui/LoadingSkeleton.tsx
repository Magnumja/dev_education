import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-surface-muted", className)}
      aria-hidden
    />
  );
}

/** Espelha a estrutura real do ResourceCard para não haver salto de layout. */
export function ResourceCardSkeleton() {
  return (
    <div className="flex gap-4 border-b border-line py-5">
      <Skeleton className="hidden h-[84px] w-[148px] shrink-0 sm:block" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ResourceListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <ResourceCardSkeleton key={i} />
      ))}
    </div>
  );
}
