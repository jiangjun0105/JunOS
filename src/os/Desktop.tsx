'use client'

import { useCallback, useEffect, useState } from 'react'
import { appList } from './apps'
import { ICON_POSITIONS_KEY, MENUBAR_HEIGHT, RESET_ICONS_EVENT } from './constants'
import { DesktopIcon } from './DesktopIcon'
import { Wallpaper } from './Wallpaper'
import { useWindows } from './WindowManager'

/** Apps that get a desktop launcher icon (hidden ones — like the article reader — open indirectly). */
const launchers = appList.filter((app) => app.launcher !== false)

type IconPositions = Record<string, { x: number; y: number }>

const ICON_COL_X = 24
const ICON_TOP = MENUBAR_HEIGHT + 16 // first icon sits clear below the menu bar
const ICON_ROW_PITCH = 100

/** A tidy starting column down the left edge (clear of the top menu bar). */
function defaultPositions(): IconPositions {
  const positions: IconPositions = {}
  launchers.forEach((app, i) => {
    positions[app.id] = { x: ICON_COL_X, y: ICON_TOP + i * ICON_ROW_PITCH }
  })
  return positions
}

/** Keep an icon inside the work area — never under the menu bar, never off-screen. */
function clampIcon(pos: { x: number; y: number }): { x: number; y: number } {
  if (typeof window === 'undefined') return pos
  const maxX = Math.max(ICON_COL_X, window.innerWidth - 96)
  const maxY = Math.max(ICON_TOP, window.innerHeight - 104)
  return {
    x: Math.min(Math.max(pos.x, 0), maxX),
    y: Math.min(Math.max(pos.y, MENUBAR_HEIGHT), maxY),
  }
}

/**
 * The home "page": cream wallpaper + draggable launcher icons.
 * The menu bar is rendered as chrome in OSRoot (above the window layer), so it
 * lives outside this component.
 */
export function Desktop() {
  const { openApp, constraintsRef } = useWindows()
  const [positions, setPositions] = useState<IconPositions>(defaultPositions)

  // Load saved positions after hydration, CLAMPED — so a stale layout that was
  // saved under the menu bar (from before the clamp existed) self-heals.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ICON_POSITIONS_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as IconPositions
      setPositions((prev) => {
        const merged: IconPositions = { ...prev, ...parsed }
        for (const id of Object.keys(merged)) merged[id] = clampIcon(merged[id])
        return merged
      })
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  // Menu → "Reset icon positions": clear storage and restore defaults IN PLACE
  // (no page reload, so open windows are never lost).
  useEffect(() => {
    function onReset() {
      try {
        localStorage.removeItem(ICON_POSITIONS_KEY)
      } catch {
        /* ignore */
      }
      setPositions(defaultPositions())
    }
    window.addEventListener(RESET_ICONS_EVENT, onReset)
    return () => window.removeEventListener(RESET_ICONS_EVENT, onReset)
  }, [])

  const moveIcon = useCallback((id: string, position: { x: number; y: number }) => {
    const clamped = clampIcon(position)
    setPositions((prev) => {
      const next = { ...prev, [id]: clamped }
      try {
        localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(next))
      } catch {
        /* ignore quota / private-mode errors */
      }
      return next
    })
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col">
      <Wallpaper />

      {/* A family photo tucked into the bottom-right corner — pure decoration,
          so it's aria-hidden and pointer-events-none (it never blocks dragging
          an icon over it). No z-index: it paints above the wallpaper but below
          the z-10 icon layer, so icons always sit on top. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/background/family.webp" alt="" aria-hidden draggable={false} className="os-desktop-photo" />

      {/* Icon layer — icons are absolutely positioned and draggable. */}
      <div className="relative z-10 flex-1">
        {launchers.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            position={positions[app.id] ?? { x: ICON_COL_X, y: ICON_TOP }}
            constraintsRef={constraintsRef}
            onOpen={() => openApp(app.id)}
            onMove={(position) => moveIcon(app.id, position)}
          />
        ))}
      </div>
    </div>
  )
}
