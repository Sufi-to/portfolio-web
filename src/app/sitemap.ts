import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { nav, siteUrl } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...nav.map((n) => n.href), "/evidence/", "/certificate/", ...projects.map((p) => `/projects/${p.slug}/`)];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
