import type { MetadataRoute } from "next";
import { SITE } from "@/constants";
import { TOPICS } from "@/lib/data/topics";
import { RESOURCES } from "@/lib/data/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/topics", "/search", "/about", "/submit"].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  return [
    ...staticRoutes,
    ...TOPICS.map((topic) => ({
      url: `${SITE.url}/topics/${topic.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...RESOURCES.map((resource) => ({
      url: `${SITE.url}/resource/${resource.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
