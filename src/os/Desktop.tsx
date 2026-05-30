'use client'

import { useEffect, useState } from 'react'
import { appList } from './apps'
import { DesktopIcon } from './DesktopIcon'
import { Wallpaper } from './Wallpaper'
import { useWindows } from './WindowManager'

type IconPositions = Record<string, { x: number; y: number }>

const STORAGE_KEY = 'cozy-os:icon-positions'

/** A tidy starting column down the left edge (clear of the top menu bar). */
function defaultPositions(): IconPositions {
  const positions: IconPositions = {}
  appList.forEach((app, i) => {
    positions[app.id] = { x: 24, y: 56 + i * 100 }
  })
  return positions
}

/**
 * The home "page": cream wallpaper + draggable launcher icons.
 * The menu bar and taskbar are rendered as chrome in OSRoot (above the window
 * layer), so they live outside this component.
 */
export function Desktop() {
  const { openApp, constraintsRef } = useWindows()
  const [positions, setPositions] = useState<IconPositions>(defaultPositions)

  // Load saved positions AFTER hydration, so SSR and the first client render match.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setPositions((prev) => ({ ...prev, ...JSON.parse(saved) }))
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  function moveIcon(id: string, position: { x: number; y: number }) {
    setPositions((prev) => {
      const next = { ...prev, [id]: position }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore quota / private-mode errors */
      }
      return next
    })
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <Wallpaper />

      {/* Icon layer — icons are absolutely positioned and draggable. */}
      <div className="relative z-10 flex-1">
        {appList.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            position={positions[app.id] ?? { x: 24, y: 56 }}
            constraintsRef={constraintsRef}
            onOpen={() => openApp(app.id)}
            onMove={(position) => moveIcon(app.id, position)}
          />
        ))}
      </div>
    </div>
  )
}
