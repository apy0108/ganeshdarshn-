import { MetadataRoute } from "next";
import { MANDALS } from "@/lib/mandals";
import { CURATED_ROUTES_DATA } from "@/lib/curatedRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ganpatidarshan.pune";

  const staticPages = [
    "",
    "/explore",
    "/map",
    "/routes",
    "/start",
    "/plan",
    "/saved",
    "/parking",
    "/how-to-use",
    "/about",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const mandalPages = MANDALS.map((m) => ({
    url: `${baseUrl}/ganpati/${m.id}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  const routePages = CURATED_ROUTES_DATA.map((r) => ({
    url: `${baseUrl}/routes/${r.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...mandalPages, ...routePages];
}
