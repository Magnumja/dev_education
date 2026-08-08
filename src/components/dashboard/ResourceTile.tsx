import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { ResourceTypeIcon } from "@/components/resources/ResourceTypeIcon";
import { RESOURCE_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import type { SearchResult } from "@/types";
import { BrandIcon, hasBrandIcon } from "@/components/icons/BrandIcon";
import { resourceIcon } from "@/lib/icons";

interface ResourceTileProps {
  resource: SearchResult;
  /** Linha de apoio: origem, quando foi aberto, etc. */
  footnote?: React.ReactNode;
  className?: string;
}

export function ResourceTile({
  resource,
  footnote,
  className,
}: ResourceTileProps) {
  const icon = resourceIcon(resource.sourceDomain, resource.topics);

  return (
    <Link
      href={`/resource/${resource.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-quick hover:border-brand-400 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative flex h-[104px] items-center justify-center overflow-hidden bg-navy-950">
        {resource.thumbnailUrl ? (
          <Image
            src={resource.thumbnailUrl}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
          />
        ) : hasBrandIcon(icon) ? (
          <BrandIcon slug={icon} className="size-9 text-white/85" />
        ) : (
          <span
            aria-hidden
            className="text-2xl font-semibold tracking-tight text-white/90"
          >
            {resource.topics[0]?.slice(0, 2).toUpperCase() ?? "</>"}
          </span>
        )}

        <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-white/95">
          <ResourceTypeIcon type={resource.type} className="size-3.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
          {RESOURCE_TYPE_LABELS[resource.type]}
          {resource.isVerified ? (
            <BadgeCheck
              className="size-3.5 text-brand-400"
              aria-label="Revisado pela curadoria"
            />
          ) : null}
        </span>

        <span className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-navy-900 transition-quick group-hover:text-brand-500">
          {resource.title}
        </span>

        <span className="mt-auto pt-2.5 text-xs text-ink-400">
          {footnote ?? resource.sourceDomain}
        </span>
      </div>
    </Link>
  );
}
