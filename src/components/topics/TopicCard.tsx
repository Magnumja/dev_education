import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { BrandIcon, hasBrandIcon } from "@/components/icons/BrandIcon";
import { topicIcon } from "@/lib/icons";
import type { Topic } from "@/types";

interface TopicCardProps {
  topic: Topic;
  count?: number;
  className?: string;
}

export function TopicCard({ topic, count, className }: TopicCardProps) {
  const icon = topicIcon(topic.slug);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 transition-quick",
        "hover:border-brand-400 hover:shadow-soft",
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded bg-surface-muted transition-quick group-hover:bg-brand-50">
        {hasBrandIcon(icon) ? (
          <BrandIcon slug={icon} colored className="size-[18px]" />
        ) : (
          <span aria-hidden className="text-sm font-semibold text-brand-600">
            {topic.name.slice(0, 2)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-navy-900">
          {topic.name}
        </span>
        {typeof count === "number" ? (
          <span className="block text-xs text-ink-400">
            {count} {count === 1 ? "conteúdo" : "conteúdos"}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
