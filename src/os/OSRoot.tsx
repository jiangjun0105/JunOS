'use client'

import { AnimatePresence } from 'framer-motion'
import { type ReactNode } from 'react'
import { useWindows } from './WindowManager'
import { Window } from './Window'

/**
 * The persistent desktop shell. It owns the drag-bounds element (so windows
 * stay on-screen) and renders the window layer ABOVE the page content.
 *
 * `children` is the current page (the desktop). Windows live in a separate
 * full-screen layer on top, with `pointer-events-none` so clicks fall through
 * to the desktop everywhere except on an actual window.
 */
export function OSRoot({ children }: { children: ReactNode }) {
  const { windows, constraintsRef } = useWindows()

  return (
    <div ref={constraintsRef} className="relative h-dvh w-screen overflow-hidden">
      {children}

      <div className="pointer-events-none absolute inset-0 z-50">
        <AnimatePresence>
          {windows.map((win) => (
            <Window key={win.id} win={win} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
