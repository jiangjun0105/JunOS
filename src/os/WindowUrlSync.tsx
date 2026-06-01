'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { getArticle } from '@/content/articles'
import { apps, isAppId } from './apps'
import { parseWindowPath, pathForWindow } from './url'
import { useWindows } from './WindowManager'

/**
 * Two-way sync between the open windows and the browser URL, so every window is
 * deep-linkable and shareable. Renders nothing.
 *
 *  - URL -> windows: on load (and on any navigation) the path opens/focuses its
 *    window. `openApp` is idempotent, so re-running this is a no-op once the right
 *    window is focused.
 *  - windows -> URL: the focused (top-most) window's path is written to the
 *    address bar with the History API. That's purely cosmetic — it never triggers
 *    a Next navigation, re-render, or data fetch, and adds no history entries — so
 *    window STATE stays the source of truth for what's open and where. The URL
 *    just names the focused window.
 *
 * The two directions share one fixed point (pathname === focused window's path),
 * and both updates are idempotent there, so they converge without looping.
 */
export function WindowUrlSync() {
  const { windows, focusedId, openApp } = useWindows()
  const pathname = usePathname()
  // Has a window ever been focused? Lets us reset to '/' when the LAST window
  // closes, without clobbering a fresh deep link before its window has opened.
  const hadFocus = useRef(false)

  // URL -> windows
  useEffect(() => {
    const parsed = parseWindowPath(pathname)
    if (!parsed) return
    if (parsed.appId === 'article') {
      if (!parsed.slug) return
      openApp('article', { params: { slug: parsed.slug }, title: getArticle(parsed.slug)?.title })
      return
    }
    // `parsed.appId` is an arbitrary `string` from the URL. `isAppId` guards
    // against unknown paths AND narrows it to `AppId`, so `apps[...]` and
    // `openApp(...)` are sound without a cast. Indirect-only apps
    // (launcher === false, e.g. About JunOS) aren't deep-linkable by their bare id.
    if (isAppId(parsed.appId) && apps[parsed.appId].launcher !== false) {
      openApp(parsed.appId)
    }
  }, [pathname, openApp])

  // windows -> URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const focused = windows.find((w) => w.id === focusedId)
    if (focused) {
      hadFocus.current = true
      const desired = pathForWindow(focused)
      if (window.location.pathname !== desired) {
        window.history.replaceState(window.history.state, '', desired)
      }
    } else if (hadFocus.current) {
      // The last window just closed — return the address bar to the bare desktop.
      hadFocus.current = false
      if (window.location.pathname !== '/') {
        window.history.replaceState(window.history.state, '', '/')
      }
    }
    // else: initial empty desktop — leave any deep-link path for the effect above.
  }, [windows, focusedId])

  return null
}
