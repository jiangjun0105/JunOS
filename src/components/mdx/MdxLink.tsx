'use client'

import type { AnchorHTMLAttributes } from 'react'
import { parseWindowPath } from '@/os/url'
import { useWindows } from '@/os/WindowManager'

/**
 * The `<a>` used inside MDX bodies. Links to `/article/<slug>` and `/thoughts/<slug>`
 * open that window in place instead of a full navigation that would reload the desktop.
 * The href stays intact so new-tab and crawlers still work; other links are plain anchors.
 */
export function MdxLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const windows = useWindows()
  const target = href ? parseInternal(href) : null
  const external = !!href && /^https?:\/\//.test(href)

  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(e) => {
        if (!target) return
        // Let the browser handle new-tab / new-window / download modifiers.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        windows.openApp(target.appId, { params: { slug: target.slug } })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** `/article/<slug>` or `/thoughts/<slug>` → the window it opens, else null. */
function parseInternal(href: string): { appId: 'article' | 'thoughts'; slug: string } | null {
  const parsed = /^\/[^?#]*$/.test(href) ? parseWindowPath(href) : null
  if (!parsed?.slug) return null
  if (parsed.appId === 'article' || parsed.appId === 'thoughts')
    return { appId: parsed.appId, slug: parsed.slug }
  return null
}
