'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apps, type AppId } from './apps'
import { windowKey } from './url'

/**
 * The city desktop shows ONE window at a time. Opening another app (from a
 * landmark, the Files tree, an article link) swaps the window's content in place;
 * re-opening what's already shown is a no-op, so the URL sync can call it freely.
 */
export interface OpenWindow {
  appId: AppId
  title: string
  params?: Record<string, unknown>
}

interface WindowManagerValue {
  win: OpenWindow | null
  openApp: (appId: AppId, opts?: { params?: Record<string, unknown>; title?: string }) => void
  close: () => void
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [win, setWin] = useState<OpenWindow | null>(null)

  const openApp = useCallback<WindowManagerValue['openApp']>((appId, opts) => {
    const def = apps[appId]
    if (!def) return
    const params = opts?.params
    setWin((cur) =>
      cur && windowKey(cur.appId, cur.params) === windowKey(appId, params)
        ? cur
        : { appId, params, title: opts?.title ?? def.title }
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

/** Like {@link useWindows}, but `null` outside a provider (for MDX links, which could in principle render anywhere). */
export function useWindowsOptional(): WindowManagerValue | null {
  return useContext(WindowManagerContext)
}
