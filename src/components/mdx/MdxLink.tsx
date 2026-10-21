'use client'

import type { AnchorHTMLAttributes } from 'react'
import { isAppId } from '@/os/apps'
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
        windows.openApp(target.appId, { slug: target.slug })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** `/article/<slug>` or `/thoughts/<slug>` → the window it opens, else null. */
function parseInternal(href: string) {
  const parsed = /^\/[^?#]*$/.test(href) ? parseWindowPath(href) : null
  return parsed?.slug && isAppId(parsed.appId) ? { appId: parsed.appId, slug: parsed.slug } : null
}
