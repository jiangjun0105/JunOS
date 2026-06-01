import type { MetadataRoute } from 'next'
import { appList } from '@/os/apps'
import { articles } from '@/content/articles'

/**
 * Canonical origin for absolute URLs. See the same constant in `page.tsx` —
 * overridable per-environment via NEXT_PUBLIC_SITE_URL, falling back to the
 * project's production domain (junbot.dev). Duplicated rather than shared because
 * this WP only touches the app/ files.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://junbot.dev'

/**
 * PERF-3: a sitemap so crawlers can discover every deep link the SPA exposes.
 * It enumerates the SAME paths `generateStaticParams` prerenders:
 *   - `/`                         the desktop home
 *   - `/<id>`                     each launchable app window (cheap to include)
 *   - `/article/<slug>`           each article reader
 *
 * `lastModified` uses each article's publish date so re-published articles
 * re-surface; non-dated routes use build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ]

  // Launcher windows only — `article`/`about-junos` (launcher: false) have no
  // standalone landing intent of their own (articles are listed individually).
  const apps: MetadataRoute.Sitemap = appList
    .filter((a) => a.launcher !== false)
    .map((a) => ({
      url: `${SITE_URL}/${a.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/article/${encodeURIComponent(a.slug)}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...home, ...apps, ...articlePages]
}
