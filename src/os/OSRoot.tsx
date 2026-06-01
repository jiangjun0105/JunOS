'use client'

import { AnimatePresence, MotionConfig } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { MenuBar } from './MenuBar'
import { useWindows } from './WindowManager'
import { Window } from './Window'
import { WindowUrlSync } from './WindowUrlSync'

/**
 * The persistent desktop shell. It owns the drag-bounds element (so windows
 * stay on-screen) and renders the menu bar ABOVE the window layer, which itself
 * sits above the page content.
 *
 * `children` is the current page (the desktop). Windows live in a separate
 * full-screen layer on top, with `pointer-events-none` so clicks fall through
 * to the desktop everywhere except on an actual window.
 *
 * Minimized windows are NOT mounted in the floating layer — they're parked as
 * small icons in the menu bar's top-right tray and re-mount when restored.
 *
 * MotionConfig reducedMotion="user" makes every Framer animation honor the OS
 * "reduce motion" setting (transforms/scales are dropped, opacity kept).
 */
export function OSRoot({ children }: { children: ReactNode }) {
  const { windows, focusedId, constraintsRef } = useWindows()

  // ACC-4: when the window that HAD focus leaves the visible set (closed or
  // minimized), move keyboard focus to its successor — the new top-most window —
  // by element id. We drive this from the window-state change rather than from
  // `document.activeElement`, because the closing window stays mounted through
  // its exit animation, so the old focus holder lingers and an activeElement
  // check can't fire in time. Gating on "the previously-focused window left"
  // means a normal click/raise (which removes no window) never yanks focus.
  const prev = useRef<{ focusedId: string | undefined; visibleIds: string[] }>({
    focusedId: undefined,
    visibleIds: [],
  })
  useEffect(() => {
    const visibleIds = windows.filter((win) => !win.minimized).map((win) => win.id)
    const prevFocusedLeft =
      prev.current.focusedId !== undefined && !visibleIds.includes(prev.current.focusedId)
    prev.current = { focusedId, visibleIds }
    if (prevFocusedLeft && focusedId) {
      document.getElementById(`window-${focusedId}`)?.focus({ preventScroll: true })
    }
  }, [windows, focusedId])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={constraintsRef} className="relative h-dvh w-screen overflow-hidden">
        {/* keeps the address bar pointed at the focused window (no render) */}
        <WindowUrlSync />
        {children}

        <div className="pointer-events-none absolute inset-0 z-50">
          <AnimatePresence>
            {windows
              .filter((win) => !win.minimized)
              .map((win) => (
                <Window key={win.id} win={win} />
              ))}
          </AnimatePresence>
        </div>

        {/* menu bar — above the window layer so open windows can't cover it */}
        <div className="absolute inset-x-0 top-0 z-[60]">
          <MenuBar />
        </div>
      </div>
    </MotionConfig>
  )
}
