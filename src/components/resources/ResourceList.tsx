import { ResourceCard } from "@/components/resources/ResourceCard";
import { BrandIconSprite } from "@/components/icons/BrandIconSprite";
import { resourceIcon } from "@/lib/icons";
import type { SearchResult } from "@/types";

interface ResourceListProps {
  resources: SearchResult[];
  isAuthenticated?: boolean;
  savedIds?: Set<string>;
}

export function ResourceList({
  resources,
  isAuthenticated,
  savedIds,
}: ResourceListProps) {
  return (
    <div>
      <BrandIconSprite
        slugs={resources.map((resource) =>
          resourceIcon(resource.sourceDomain, resource.topics),
        )}
      />
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          isAuthenticated={isAuthenticated}
          isSaved={savedIds?.has(resource.id)}
        />
      ))}
    </div>
  );
}
