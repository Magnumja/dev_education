import { ResourceCard } from "@/components/resources/ResourceCard";
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
