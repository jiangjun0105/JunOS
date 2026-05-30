'use client'

import { useEffect, useState } from 'react'
import { appList } from './apps'
import { DesktopIcon } from './DesktopIcon'
import { useWindows } from './WindowManager'

type IconPositions = Record<string, { x: number; y: number }>

const STORAGE_KEY = 'cozy-os:icon-positions'

/** A tidy starting column down the left edge. */
function defaultPositions(): IconPositions {
  const positions: IconPositions = {}
  appList.forEach((app, i) => {
    positions[app.id] = { x: 24, y: 20 + i * 100 }
  })
  return positions
}

/** The home "page": slim menu bar, cream wallpaper, and draggable launcher icons. */
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
      <div aria-hidden className="os-wallpaper" />

      <div className="os-menubar relative z-10">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-3 w-3 rounded-sm"
            style={{ background: 'rgb(var(--accent))' }}
          />
          cozy-os
        </span>
        <span className="font-medium text-muted">Help</span>
      </div>

      {/* Icon layer — icons are absolutely positioned and draggable. */}
      <div className="relative z-10 flex-1">
        {appList.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            position={positions[app.id] ?? { x: 24, y: 20 }}
            constraintsRef={constraintsRef}
            onOpen={() => openApp(app.id)}
            onMove={(position) => moveIcon(app.id, position)}
          />
        ))}
      </div>
    </div>
  )
}
