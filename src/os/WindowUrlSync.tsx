'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { isAppId, isLaunchable } from './apps'
import { parseWindowPath, pathForWindow } from './url'
import { useWindows } from './WindowManager'

/**
 * Keeps the open window and the address bar in sync so every window is deep-linkable.
 * URL -> window opens the path's window (a no-op if already open); window -> URL
 * rewrites the path via the History API, without navigating.
 */
export function WindowUrlSync() {
  const { win, openApp } = useWindows()
  const pathname = usePathname()
  // Distinguishes "window closed" from "deep link not opened yet", so we don't wipe the link.
  const hadWin = useRef(false)

  useEffect(() => {
    const parsed = parseWindowPath(pathname)
    if (!parsed || !isAppId(parsed.appId)) return
    if (parsed.slug || isLaunchable(parsed.appId)) {
      openApp(parsed.appId, parsed.slug ? { params: { slug: parsed.slug } } : undefined)
    }
  }, [pathname, openApp])

  useEffect(() => {
    if (win) {
      hadWin.current = true
      const desired = pathForWindow(win)
      if (window.location.pathname !== desired)
        window.history.replaceState(window.history.state, '', desired)
    } else if (hadWin.current) {
      hadWin.current = false
      if (window.location.pathname !== '/')
        window.history.replaceState(window.history.state, '', '/')
    }
  }, [win])

  return null
}
