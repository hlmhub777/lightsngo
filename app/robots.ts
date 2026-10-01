import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/races", "/races/", "/terms", "/privacy"],
      disallow: ["/feed", "/profile", "/messages", "/login", "/signup"],
    },
    sitemap: "https://lightsngo.com/sitemap.xml",
  };
}
