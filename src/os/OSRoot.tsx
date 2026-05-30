'use client'

import { AnimatePresence } from 'framer-motion'
import { type ReactNode } from 'react'
import { MenuBar } from './MenuBar'
import { Taskbar } from './Taskbar'
import { useWindows } from './WindowManager'
import { Window } from './Window'

/**
 * The persistent desktop shell. It owns the drag-bounds element (so windows
 * stay on-screen) and renders the OS chrome (menu bar + taskbar) ABOVE the
 * window layer, which itself sits above the page content.
 *
 * `children` is the current page (the desktop). Windows live in a separate
 * full-screen layer on top, with `pointer-events-none` so clicks fall through
 * to the desktop everywhere except on an actual window.
 *
 * Minimized windows are NOT mounted in the floating layer — they're parked in
 * the taskbar and re-mount when restored. The menu bar (top) and taskbar
 * (bottom) render above the window layer so windows can't cover them.
 */
export function OSRoot({ children }: { children: ReactNode }) {
  const { windows, constraintsRef } = useWindows()

  return (
    <div ref={constraintsRef} className="relative h-dvh w-screen overflow-hidden">
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

      {/* OS chrome — above the window layer so open windows can't cover it */}
      <div className="absolute inset-x-0 top-0 z-[60]">
        <MenuBar />
      </div>
      <Taskbar />
    </div>
  )
}
