import type { MetadataRoute } from "next";
import { SITE } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Resultados de busca são infinitos e não devem ser indexados.
      disallow: ["/search?", "/admin", "/profile", "/favorites", "/collections"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
