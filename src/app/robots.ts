import type { MetadataRoute } from 'next'

/**
 * Canonical origin for absolute URLs. See the same constant in `page.tsx` —
 * overridable via NEXT_PUBLIC_SITE_URL, falling back to the project's production
 * domain (junbot.dev). Duplicated rather than shared because this WP only touches
 * the app/ files; robots.ts needs an ABSOLUTE sitemap URL.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://junbot.dev'

/**
 * PERF-3: generated robots.txt. The whole site is public, so allow all crawlers
 * everywhere and point them at the sitemap (which Next serves at /sitemap.xml
 * from `sitemap.ts`).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
