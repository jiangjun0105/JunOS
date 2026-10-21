import type { MetadataRoute } from 'next'
import { getDoc } from '@/content'
import { sitePaths } from '@/os/paths'
import { SITE_URL } from '@/site'

const PRIORITY: Record<string, number> = { article: 0.8, thoughts: 0.7 }

/** Lists the same paths generateStaticParams prerenders. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return sitePaths.map(([appId, slug]) => {
    const date = getDoc(appId, slug)?.date
    return {
      url: [SITE_URL, appId, slug && encodeURIComponent(slug)].filter(Boolean).join('/'),
      lastModified: date ? new Date(date) : now,
      changeFrequency: appId ? 'monthly' : 'weekly',
      priority: appId ? (PRIORITY[appId] ?? 0.6) : 1,
    }
  })
}
