import { MENUBAR_HEIGHT } from './constants'
import type { Rect } from './placement'

export interface IconPoint {
  x: number
  y: number
}

export type IconPositions = Record<string, IconPoint>

/**
 * The footprint one launcher icon occupies, in px. Mirrors `.os-icon` in
 * globals.css: `w-24` (96px) wide, and tall enough for the 48px glyph plus a
 * caption that may wrap to two lines — so the fit maths stays honest for a
 * long app title, not just the short ones in the registry today.
 */
export const ICON_SIZE = { width: 96, height: 96 }

/** Breathing room between the first icon and the work-area's top-left corner. */
export const ICON_MARGIN = { x: 24, y: 16 }

/** Grid pitch — the icon footprint plus the gap to its neighbour. */
export const ICON_PITCH = { x: 112, y: 100 }

/**
 * How many icons fit in ONE column of `area`, given the pitch and the icon's
 * own height. Always at least 1: on an absurdly short viewport we'd rather
 * stack a single clamped icon than divide by zero.
 */
export function columnCapacity(area: Rect): number {
  const usable = area.height - ICON_MARGIN.y - ICON_SIZE.height
  return Math.max(1, Math.floor(usable / ICON_PITCH.y) + 1)
}

/**
 * Flow `ids` down the left edge of the work area, wrapping into a NEW COLUMN
 * as soon as the next icon would fall past the bottom — the same reflow a real
 * desktop does. This is what keeps every launcher reachable when the viewport
 * is short (a small screen, a high browser zoom, or a window dragged down to
 * half-height), instead of letting the tail of a single tall column run off
 * the bottom of the screen.
 *
 * Pure and viewport-agnostic — pass the work area in, get positions out — so
 * it unit-tests without a DOM, exactly like `placeWindow`.
 */
export function layoutIcons(ids: string[], area: Rect): IconPositions {
  const perColumn = columnCapacity(area)
  const positions: IconPositions = {}
  ids.forEach((id, i) => {
    const column = Math.floor(i / perColumn)
    const row = i % perColumn
    positions[id] = clampIcon(
      {
        x: area.x + ICON_MARGIN.x + column * ICON_PITCH.x,
        y: area.y + ICON_MARGIN.y + row * ICON_PITCH.y,
      },
      area,
    )
  })
  return positions
}

/**
 * Keep one icon inside the work area — never under the menu bar, never past an
 * edge. Applied to the auto-flow (so an overflowing column still lands
 * on-screen) AND to hand-placed icons every time the viewport changes, so a
 * position saved on a big screen can't strand an icon off a small one.
 */
export function clampIcon(pos: IconPoint, area: Rect): IconPoint {
  const maxX = Math.max(area.x, area.x + area.width - ICON_SIZE.width)
  const maxY = Math.max(area.y, area.y + area.height - ICON_SIZE.height)
  return {
    x: Math.min(Math.max(pos.x, area.x), maxX),
    y: Math.min(Math.max(pos.y, Math.max(area.y, MENUBAR_HEIGHT)), maxY),
  }
}

/**
 * The drag bounds for a single icon, as a Framer `dragConstraints` OBJECT (in
 * the icon layer's coordinate space, whose origin is the viewport's).
 *
 * Deliberately NOT the shared `constraintsRef`: with a *ref*, Framer re-measures
 * the bounds element on every window resize and rescales each dragged element's
 * position PROPORTIONALLY inside it — which silently overwrote the reflow's
 * coordinates and left icons overlapping at fractional offsets. Object
 * constraints skip that rescale, so the reflow stays the only thing positioning
 * an icon. Derived from `clampIcon` so the live drag limit and the layout clamp
 * are the same rule.
 */
export function iconDragBounds(area: Rect): {
  left: number
  top: number
  right: number
  bottom: number
} {
  const min = clampIcon({ x: area.x, y: area.y }, area)
  const max = clampIcon({ x: area.x + area.width, y: area.y + area.height }, area)
  return { left: min.x, top: min.y, right: max.x, bottom: max.y }
}

/** True when two position maps hold the same ids at the same coordinates. */
export function samePositions(a: IconPositions, b: IconPositions): boolean {
  const ids = Object.keys(a)
  if (ids.length !== Object.keys(b).length) return false
  return ids.every((id) => b[id] && a[id].x === b[id].x && a[id].y === b[id].y)
}
