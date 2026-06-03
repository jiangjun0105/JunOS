import type { Metadata } from 'next'
import { Desktop } from '@/os/Desktop'
import { appList } from '@/os/apps'
import { articles, getArticle } from '@/content/articles'
import { thoughts, getThought } from '@/content/thoughts'
import { parseWindowPath } from '@/os/url'

/**
 * Canonical origin for absolute URLs (Open Graph images, sitemap, canonical
 * links). Overridable per-environment via NEXT_PUBLIC_SITE_URL (e.g. a preview
 * deploy can point at its own origin); falls back to the project's production
 * domain. Kept here AND in sitemap.ts/robots.ts as a tiny duplicated constant —
 * the WP touches only the app/ files, and a shared util would mean a new module.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://junbot.dev'

/**
 * The home route IS the desktop — and so is every other path. This optional
 * catch-all lets deep links like `/article/<slug>` or `/projects` resolve to the
 * desktop instead of 404ing; the client (`WindowUrlSync`) reads the path and
 * opens the matching window. Windows live in the layout, so they persist across
 * navigation and the page body never needs the segments itself.
 */
export default function Home() {
  return <Desktop />
}

/**
 * PERF-4: prerender the desktop AND every deep link as static HTML. An optional
 * catch-all WITHOUT `generateStaticParams` opts the route into on-demand dynamic
 * rendering (`ƒ`); enumerating the known paths here flips them to static (`○`).
 *
 * The segment arrays mirror the URL scheme in `src/os/url.ts` exactly:
 *   - the bare desktop `/`            -> `{ segments: [] }`  (an empty array, the
 *     shape an optional catch-all expects for its index; `pathForWindow` emits
 *     `/` and `parseWindowPath('/')` returns null)
 *   - a launchable app `/<id>`        -> `{ segments: [id] }`     (e.g. /about)
 *   - an article `/article/<slug>`    -> `{ segments: ['article', slug] }`
 *
 * Launchable ids come from `appList` minus non-launcher windows (`article`,
 * `about-junos`) so we don't prerender paths that have no desktop entry point;
 * `article` is covered explicitly by the per-slug routes below.
 */
export function generateStaticParams(): { segments: string[] }[] {
  const root = [{ segments: [] as string[] }]

  const appPaths = appList
    .filter((a) => a.launcher !== false)
    .map((a) => ({ segments: [a.id] }))

  const articlePaths = articles.map((a) => ({ segments: ['article', a.slug] }))
  const thoughtPaths = thoughts.map((t) => ({ segments: ['thoughts', t.slug] }))

  return [...root, ...appPaths, ...articlePaths, ...thoughtPaths]
}

/**
 * PERF-3: per-path metadata. We resolve the SAME path the client uses
 * (`parseWindowPath`) so the prerendered <head> matches whatever window the deep
 * link will open. Article paths get rich, article-specific tags (title, summary,
 * cover as the OG image); everything else (the bare desktop, app launchers)
 * falls back to a sensible site default.
 *
 * `params` is a Promise in Next 15 (App Router) — note this stays a Server
 * Component (no `'use client'`), which is what lets it export metadata at all.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ segments?: string[] }>
}): Promise<Metadata> {
  const { segments } = await params
  // Reconstruct the pathname from the segments so we can reuse the client's
  // parser (the single source of truth for "which window does this path open").
  const pathname = '/' + (segments ?? []).join('/')
  const intent = parseWindowPath(pathname)

  if (intent?.appId === 'article' && intent.slug) {
    const article = getArticle(intent.slug)
    if (article) {
      const canonical = `${SITE_URL}/article/${encodeURIComponent(article.slug)}`
      return {
        title: article.title,
        description: article.summary,
        openGraph: {
          title: article.title,
          description: article.summary,
          type: 'article',
          url: canonical,
          ...(article.cover ? { images: [`${SITE_URL}${article.cover}`] } : {}),
        },
        alternates: { canonical },
      }
    }
  }

  if (intent?.appId === 'thoughts' && intent.slug) {
    const thought = getThought(intent.slug)
    if (thought) {
      const canonical = `${SITE_URL}/thoughts/${encodeURIComponent(thought.slug)}`
      return {
        title: thought.title,
        description: thought.summary,
        openGraph: {
          title: thought.title,
          description: thought.summary,
          type: 'article',
          url: canonical,
        },
        alternates: { canonical },
      }
    }
  }

  // Site default — mirrors the root layout's title/description so the desktop
  // and app launchers present a consistent identity to crawlers and link unfurls.
  const title = 'JunOS'
  const description = 'A desktop OS in the browser.'
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: SITE_URL },
    alternates: { canonical: SITE_URL },
  }
}
