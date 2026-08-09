import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BookmarkButton } from "@/components/resources/BookmarkButton";
import { ExternalResourceLink } from "@/components/resources/ExternalResourceLink";
import { ResourceTypeIcon } from "@/components/resources/ResourceTypeIcon";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import { cn } from "@/lib/utils/cn";
import { BrandIconRef } from "@/components/icons/BrandIconSprite";
import { resourceIcon } from "@/lib/icons";
import { isAllowedImageHost } from "@/lib/image-hosts";
import type { SearchResult } from "@/types";

interface ResourceCardProps {
  resource: SearchResult;
  isAuthenticated?: boolean;
  isSaved?: boolean;
  className?: string;
}

export function ResourceCard({
  resource,
  isAuthenticated,
  isSaved,
  className,
}: ResourceCardProps) {
  return (
    <article
      className={cn(
        "group flex gap-4 border-b border-line py-5 last:border-b-0",
        className,
      )}
    >
      {isAllowedImageHost(resource.thumbnailUrl) ? (
        <ExternalResourceLink
          resourceId={resource.id}
          url={resource.url}
          tabIndex={-1}
          aria-hidden
          className="relative hidden h-[84px] w-[148px] shrink-0 overflow-hidden rounded border border-line bg-surface-muted sm:block"
        >
          <Image
            src={resource.thumbnailUrl!}
            alt=""
            fill
            sizes="148px"
            className="object-cover"
          />
        </ExternalResourceLink>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <ResourceTypeIcon type={resource.type} />
          <span className="font-medium text-ink-700">
            {RESOURCE_TYPE_LABELS[resource.type]}
          </span>
          <span aria-hidden>·</span>
          <BrandIconRef
            slug={resourceIcon(resource.sourceDomain, resource.topics)}
            className="size-3.5 shrink-0"
          />
          <span className="truncate">{resource.sourceDomain}</span>
          {resource.isVerified ? (
            <span
              className="inline-flex items-center gap-1 text-brand-500"
              title="Revisado pela curadoria do DevEducation"
            >
              <BadgeCheck className="size-3.5" aria-hidden />
              <span className="sr-only">
                Revisado pela curadoria do DevEducation
              </span>
            </span>
          ) : null}
        </div>

        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-navy-900">
          <ExternalResourceLink
            resourceId={resource.id}
            url={resource.url}
            className="hover:text-brand-600 hover:underline"
          >
            {resource.title}
            <ArrowUpRight
              className="ml-0.5 inline size-3.5 shrink-0 align-[-1px] text-ink-400"
              aria-hidden
            />
          </ExternalResourceLink>
        </h3>

        {resource.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">
            {resource.description}
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {resource.difficulty ? (
            <Badge variant="brand">{DIFFICULTY_LABELS[resource.difficulty]}</Badge>
          ) : null}
          <Badge variant="outline">{LANGUAGE_LABELS[resource.language]}</Badge>
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <Link
            href={`/resource/${resource.id}`}
            className="ml-auto text-xs font-medium text-ink-400 transition-quick hover:text-brand-600"
          >
            Detalhes
          </Link>
        </div>
      </div>

      <div className="shrink-0">
        <BookmarkButton
          resourceId={resource.id}
          initialSaved={isSaved}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  );
}
