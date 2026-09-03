'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Img } from '@/components/Img'
import { isAppId, launchableApps } from './apps'
import { ICON_POSITIONS_KEY, LEGACY_ICON_POSITIONS_KEY, RESET_ICONS_EVENT } from './constants'
import { DesktopIcon } from './DesktopIcon'
import {
  clampIcon,
  iconDragBounds,
  layoutIcons,
  samePositions,
  type IconPoint,
  type IconPositions,
} from './iconLayout'
import { DEFAULT_WORK_AREA, getWorkArea } from './placement'
import { Wallpaper } from './Wallpaper'
import { useWindows } from './WindowManager'

/** Apps that get a desktop launcher icon (hidden ones — like the article reader — open indirectly). */
const launchers = launchableApps

const launcherIds = launchers.map((app) => app.id)

/**
 * The home "page": cream wallpaper + draggable launcher icons.
 * The menu bar is rendered as chrome in OSRoot (above the window layer), so it
 * lives outside this component.
 *
 * Icon positions come from TWO sources, merged at render time:
 *
 *  - `flowed` — the automatic grid (`layoutIcons`), which fills a column top to
 *    bottom and WRAPS INTO A NEW COLUMN when the work area runs out of height.
 *    Recomputed whenever the viewport changes, so a short screen (or a high
 *    browser zoom) reorganizes the icons instead of hiding the last few below
 *    the fold.
 *  - `placed` — icons the user has dragged somewhere specific. These win over
 *    the flow, and are the only ones persisted. They're stored UNCLAMPED and
 *    clamped for display, so shrinking the viewport pulls an icon into view
 *    without forgetting where it belongs once there's room again.
 */
export function Desktop() {
  const { openApp } = useWindows()

  // First render must be deterministic (it's also the SSR/hydration render), so
  // it flows against the assumed work area; the effect below re-flows against
  // the real viewport as soon as we're on the client.
  const [flowed, setFlowed] = useState<IconPositions>(() =>
    layoutIcons(launcherIds, DEFAULT_WORK_AREA),
  )
  const [placed, setPlaced] = useState<IconPositions>({})
  const [area, setArea] = useState(DEFAULT_WORK_AREA)

  // Load hand-placed positions after hydration (never during render — the
  // server has no localStorage), and retire any pre-reflow v1 blob.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_ICON_POSITIONS_KEY)
      const saved = localStorage.getItem(ICON_POSITIONS_KEY)
      if (saved) setPlaced(JSON.parse(saved) as IconPositions)
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  // Re-flow the auto-placed icons to fit the live work area, on mount and on
  // every viewport change. `samePositions` keeps a resize that doesn't change
  // the grid (most of them) from re-rendering the icon layer at all.
  useEffect(() => {
    function reflow() {
      const next = getWorkArea()
      setArea((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
      setFlowed((prev) => {
        const layout = layoutIcons(launcherIds, next)
        return samePositions(prev, layout) ? prev : layout
      })
    }
    reflow()
    window.addEventListener('resize', reflow)
    return () => window.removeEventListener('resize', reflow)
  }, [])

  // Menu → "Reset icon positions": drop the hand-placed overrides and fall back
  // to the flow, IN PLACE (no page reload, so open windows are never lost).
  useEffect(() => {
    function onReset() {
      try {
        localStorage.removeItem(ICON_POSITIONS_KEY)
      } catch {
        /* ignore */
      }
      setPlaced({})
    }
    window.addEventListener(RESET_ICONS_EVENT, onReset)
    return () => window.removeEventListener(RESET_ICONS_EVENT, onReset)
  }, [])

  const moveIcon = useCallback((id: string, position: IconPoint) => {
    setPlaced((prev) => {
      const next = { ...prev, [id]: position }
      try {
        localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(next))
      } catch {
        /* ignore quota / private-mode errors */
      }
      return next
    })
  }, [])

  // Hand-placed beats flowed, and everything is clamped to the current work
  // area — so no icon can sit off-screen no matter which source it came from.
  const positions = useMemo(() => {
    const merged: IconPositions = {}
    for (const id of launcherIds) merged[id] = clampIcon(placed[id] ?? flowed[id], area)
    return merged
  }, [placed, flowed, area])

  // Live drag limits, from the same work area the flow uses.
  const dragBounds = useMemo(() => iconDragBounds(area), [area])

  return (
    <div className="relative flex h-full w-full flex-col">
      <Wallpaper />

      {/* A family photo tucked into the bottom-right corner — pure decoration,
          so it's aria-hidden and pointer-events-none (it never blocks dragging
          an icon over it). No z-index: it paints above the wallpaper but below
          the z-10 icon layer, so icons always sit on top. */}
      <Img src="/background/family.webp" alt="" aria-hidden draggable={false} className="os-desktop-photo" />

      {/* Icon layer — icons are absolutely positioned and draggable. */}
      <div className="relative z-10 flex-1">
        {launchers.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            position={positions[app.id]}
            dragBounds={dragBounds}
            // `app.id` is typed `string` on AppDefinition (kept loose to avoid a
            // types<->apps cycle); `isAppId` narrows it to the strict `AppId`
            // that `openApp` wants — without a cast. Always true for a registry
            // entry, so it's a type bridge, not a real runtime gate.
            onOpen={() => isAppId(app.id) && openApp(app.id)}
            onMove={(position) => moveIcon(app.id, position)}
          />
        ))}
      </div>
    </div>
  )
}
