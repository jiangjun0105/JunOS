'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { getArticle } from '@/content/articles'
import { getThought } from '@/content/thoughts'
import { isAppId, isLaunchable } from './apps'
import { parseWindowPath, pathForWindow } from './url'
import { useWindows } from './WindowManager'

/**
 * Two-way sync between the open window and the browser URL, so every window is
 * deep-linkable and shareable. Renders nothing.
 *
 *  - URL -> window: on load (and on any navigation) the path opens its window.
 *    `openApp` is a no-op when that window is already open, so re-running is safe.
 *  - window -> URL: the open window's path is written with the History API
 *    (no navigation, no history entries); closing it returns to '/'.
 */
export function WindowUrlSync() {
  const { win, openApp } = useWindows()
  const pathname = usePathname()
  // Has a window been open? Lets us reset to '/' when it closes, without
  // clobbering a fresh deep link before its window has opened.
  const hadWin = useRef(false)
  // URL -> window
  useEffect(() => {
    const parsed = parseWindowPath(pathname)
    if (!parsed) return
    if (parsed.appId === 'article') {
      if (!parsed.slug) return
      openApp('article', { params: { slug: parsed.slug }, title: getArticle(parsed.slug)?.title })
      return
    }
    if (parsed.appId === 'thoughts') {
      if (parsed.slug) {
        openApp('thoughts', { params: { slug: parsed.slug }, title: getThought(parsed.slug)?.title ?? 'Thoughts' })
      } else {
        openApp('thoughts')
      }
      return
    }
    // `parsed.appId` is an arbitrary `string` from the URL. `isAppId` guards
    // against unknown paths AND narrows it to `AppId`, so `isLaunchable(...)` and
    // `openApp(...)` are sound without a cast. Indirect-only apps
    // (launcher === false, e.g. About JunOS) aren't deep-linkable by their bare id.
    if (isAppId(parsed.appId) && isLaunchable(parsed.appId)) {
      openApp(parsed.appId)
    }
  }, [pathname, openApp])

  // window -> URL
  useEffect(() => {
    if (win) {
      hadWin.current = true
      const desired = pathForWindow(win)
      if (window.location.pathname !== desired) window.history.replaceState(window.history.state, '', desired)
    } else if (hadWin.current) {
      hadWin.current = false
      if (window.location.pathname !== '/') window.history.replaceState(window.history.state, '', '/')
    }
  }, [win])

  return null
}
