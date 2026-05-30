'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { apps } from './apps'
import type { AppId, WindowInstance } from './types'

/**
 * The window manager: a single React context that owns ONE array of window
 * objects plus the actions to open / close / focus / move / resize them.
 *
 * Key ideas (the same patterns posthog.com uses):
 *  - The desktop is just `windows: WindowInstance[]` in state.
 *  - "Focus" is DERIVED — it's whichever window has the highest zIndex, so we
 *    never store a separate `focusedId` that could drift out of sync.
 *  - Focusing re-packs zIndex into a dense 1..N range so it never balloons.
 */
interface WindowManagerValue {
  windows: WindowInstance[]
  focusedId: string | undefined
  /** Shared drag-bounds element so windows can't be dragged off the desktop. */
  constraintsRef: RefObject<HTMLDivElement | null>
  openApp: (appId: AppId) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindow: (id: string, patch: Partial<Pick<WindowInstance, 'position' | 'size'>>) => void
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

/** Monotonic id source (avoids Math.random/Date.now so SSR + client stay aligned). */
let windowCounter = 0

/** Push `id` to the top and shift everything that was above it down by one. */
function raise(windows: WindowInstance[], id: string): WindowInstance[] {
  const target = windows.find((w) => w.id === id)
  if (!target || target.zIndex === windows.length) return windows // already on top
  return windows.map((w) => ({
    ...w,
    zIndex: w.id === id ? windows.length : w.zIndex < target.zIndex ? w.zIndex : w.zIndex - 1,
  }))
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([])
  const constraintsRef = useRef<HTMLDivElement>(null)

  // focus == the window with the highest zIndex (derived, never stored separately)
  const focusedId = useMemo(
    () =>
      windows.reduce<WindowInstance | undefined>(
        (hi, w) => (w.zIndex > (hi?.zIndex ?? -1) ? w : hi),
        undefined
      )?.id,
    [windows]
  )

  const focusWindow = useCallback((id: string) => {
    setWindows((ws) => raise(ws, id))
  }, [])

  const openApp = useCallback((appId: AppId) => {
    const def = apps[appId]
    if (!def) return
    setWindows((ws) => {
      // Already open? Just focus it instead of spawning a duplicate.
      const existing = ws.find((w) => w.appId === appId)
      if (existing) return raise(ws, existing.id)

      // Otherwise create a fresh window, cascaded a little so stacks don't overlap exactly.
      windowCounter += 1
      const offset = (ws.length % 6) * 26
      const instance: WindowInstance = {
        id: `win-${windowCounter}`,
        appId,
        title: def.title,
        zIndex: ws.length + 1,
        position: { x: 140 + offset, y: 96 + offset },
        size: { ...def.defaultSize },
      }
      return [...ws, instance]
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => {
      const remaining = ws.filter((w) => w.id !== id)
      // re-pack zIndex so it stays a dense 1..N range
      const order = [...remaining].sort((a, b) => a.zIndex - b.zIndex)
      return remaining.map((w) => ({ ...w, zIndex: order.indexOf(w) + 1 }))
    })
  }, [])

  const updateWindow = useCallback<WindowManagerValue['updateWindow']>((id, patch) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }, [])

  const value = useMemo<WindowManagerValue>(
    () => ({ windows, focusedId, constraintsRef, openApp, closeWindow, focusWindow, updateWindow }),
    [windows, focusedId, openApp, closeWindow, focusWindow, updateWindow]
  )

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
}

export function useWindows(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindows must be used inside <WindowManagerProvider>')
  return ctx
}
