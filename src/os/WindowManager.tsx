'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getArticle } from '@/content/articles'
import { getNotification } from '@/content/notifications'
import { getThought } from '@/content/thoughts'
import { apps, type AppId } from './apps'
import { windowKey } from './url'

/**
 * The city desktop shows ONE window at a time. Opening another app (from a
 * landmark, the Files tree, an article link) swaps the window's content in place;
 * re-opening what's already shown is a no-op, so the URL sync can call it freely.
 */
export interface OpenWindow {
  appId: AppId
  params?: Record<string, unknown>
}

interface WindowManagerValue {
  win: OpenWindow | null
  openApp: (appId: AppId, opts?: { params?: Record<string, unknown> }) => void
  close: () => void
  /** The window that was showing before this one, if any; `back` returns to it. */
  canGoBack: boolean
  back: () => void
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  // Swapping content pushes the old window here so `back` can return to it; closing clears it.
  const [state, setState] = useState<{ win: OpenWindow | null; stack: OpenWindow[] }>({
    win: null,
    stack: [],
  })
  const { win, stack } = state

  const openApp = useCallback<WindowManagerValue['openApp']>((appId, opts) => {
    if (!apps[appId]) return
    const params = opts?.params
    setState((cur) =>
      cur.win && windowKey(cur.win.appId, cur.win.params) === windowKey(appId, params)
        ? cur
        : { win: { appId, params }, stack: cur.win ? [...cur.stack, cur.win] : [] },
    )
  }, [])

  const close = useCallback(() => setState({ win: null, stack: [] }), [])

  const back = useCallback(
    () =>
      setState((cur) =>
        cur.stack.length
          ? { win: cur.stack[cur.stack.length - 1], stack: cur.stack.slice(0, -1) }
          : cur,
      ),
    [],
  )

  const canGoBack = stack.length > 0
  const value = useMemo(
    () => ({ win, openApp, close, canGoBack, back }),
    [win, openApp, close, canGoBack, back],
  )
  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
}

export function useWindows(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindows must be used inside <WindowManagerProvider>')
  return ctx
}

/** Window title: the article/thought/notification title for readers, else the app's. */
export function windowTitle(win: OpenWindow): string {
  const slug = typeof win.params?.slug === 'string' ? win.params.slug : undefined
  const get = { article: getArticle, thoughts: getThought, notification: getNotification }[
    win.appId as string
  ] as ((slug: string) => { title: string } | undefined) | undefined
  return (slug && get?.(slug)?.title) || apps[win.appId].title
}
