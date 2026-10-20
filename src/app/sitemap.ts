import type { MetadataRoute } from 'next'
import { appList, isLaunchable, type AppId } from '@/os/apps'
import { SITE_URL } from '@/site'
import { articles } from '@/content/articles'
import { thoughts } from '@/content/thoughts'

/** Lists the same paths generateStaticParams prerenders. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
  ]

  const apps: MetadataRoute.Sitemap = appList
    .filter((a) => isLaunchable(a.id as AppId))
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

  const thoughtPages: MetadataRoute.Sitemap = thoughts.map((t) => ({
    url: `${SITE_URL}/thoughts/${encodeURIComponent(t.slug)}`,
    lastModified: new Date(t.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...home, ...apps, ...articlePages, ...thoughtPages]
}
