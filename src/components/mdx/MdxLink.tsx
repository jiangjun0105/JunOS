'use client'

import type { AnchorHTMLAttributes } from 'react'
import { getArticle } from '@/content/articles'
import { getThought } from '@/content/thoughts'
import { useWindowsOptional } from '@/os/WindowManager'

/**
 * The `<a>` used inside article / thought / notification bodies.
 *
 * Cross-references in the knowledge base become site paths (`/article/<slug>`,
 * `/thoughts/<slug>`) — the same paths `src/os/url.ts` maps to windows. A plain
 * anchor would work, but it would trigger a full navigation and tear down the
 * whole desktop (every open window) just to open one more reader. So for those
 * two internal shapes we intercept the click and open the window directly; the
 * URL then follows via WindowUrlSync, exactly as if the reader had been opened
 * from the Research index.
 *
 * Everything else (external links, mailto:, anchors) stays a normal anchor, and
 * the href is always left intact so middle-click / "open in new tab" / crawlers
 * still see a real, resolvable URL.
 */
export function MdxLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const windows = useWindowsOptional()
  const target = href ? parseInternal(href) : null
  const external = !!href && /^https?:\/\//.test(href)

  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => {
        if (!target || !windows) return
        // Let the browser handle new-tab / new-window / download modifiers.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        windows.openApp(target.appId, { params: { slug: target.slug }, title: target.title })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** `/article/<slug>` or `/thoughts/<slug>` → the window it opens, else null. */
function parseInternal(href: string): { appId: 'article' | 'thoughts'; slug: string; title?: string } | null {
  const article = /^\/article\/([^/?#]+)$/.exec(href)
  if (article) {
    const slug = decodeURIComponent(article[1])
    return { appId: 'article', slug, title: getArticle(slug)?.title }
  }
  const thought = /^\/thoughts\/([^/?#]+)$/.exec(href)
  if (thought) {
    const slug = decodeURIComponent(thought[1])
    return { appId: 'thoughts', slug, title: getThought(slug)?.title ?? 'Thoughts' }
  }
  return null
}
