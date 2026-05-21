import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // WR-05: VERCEL_ENV só existe em deploys Vercel. Builds não-Vercel (Docker,
  // CI standalone) têm VERCEL_ENV=undefined mas NODE_ENV=production — sem o
  // fallback, retornariam Disallow:/ silenciosamente, bloqueando SEO.
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    (typeof process.env.VERCEL_ENV === "undefined" &&
      process.env.NODE_ENV === "production");
  return {
    rules: isProd
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: isProd ? `${getSiteUrl()}/sitemap.xml` : undefined,
  };
}
