import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

// 6-hour cache as mandated by PROJECT_SPEC.md to protect serverless quotas
export const revalidate = 21600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hoyba.app";

  return routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}`])
      ),
    },
  }));
}
