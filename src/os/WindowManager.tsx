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
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [win, setWin] = useState<OpenWindow | null>(null)

  const openApp = useCallback<WindowManagerValue['openApp']>((appId, opts) => {
    if (!apps[appId]) return
    const params = opts?.params
    setWin((cur) =>
      cur && windowKey(cur.appId, cur.params) === windowKey(appId, params)
        ? cur
        : { appId, params },
    )
  }, [])

  const close = useCallback(() => setWin(null), [])

  const value = useMemo(() => ({ win, openApp, close }), [win, openApp, close])
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
