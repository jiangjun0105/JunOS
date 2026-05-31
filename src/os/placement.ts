import { MENUBAR_HEIGHT } from './constants'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Default breathing room between windows and from the work-area edges. */
const GAP = 16

/**
 * The desktop "work area" — the region below the menu bar, down to the bottom
 * of the viewport. This is the single source of truth for where windows live:
 * maximize, the drag clamp, and new-window placement all derive from it.
 * (Reads the viewport, so call it on the client.)
 */
export function getWorkArea(): Rect {
  if (typeof window === 'undefined') {
    return { x: 0, y: MENUBAR_HEIGHT, width: 1024, height: 768 - MENUBAR_HEIGHT }
  }
  return {
    x: 0,
    y: MENUBAR_HEIGHT,
    width: window.innerWidth,
    height: window.innerHeight - MENUBAR_HEIGHT,
  }
}

/** Axis-aligned overlap test. */
function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

/** Is `r` fully inside `area`? */
function fitsInside(r: Rect, area: Rect): boolean {
  return (
    r.x >= area.x &&
    r.y >= area.y &&
    r.x + r.width <= area.x + area.width &&
    r.y + r.height <= area.y + area.height
  )
}

/** Center a size within the work area. */
function centeredIn(size: { width: number; height: number }, area: Rect): { x: number; y: number } {
  return {
    x: Math.round(area.x + Math.max(0, (area.width - size.width) / 2)),
    y: Math.round(area.y + Math.max(0, (area.height - size.height) / 2)),
  }
}

export interface PlacementInput {
  /** Size of the window being opened. */
  size: { width: number; height: number }
  /** The current (top-most visible) window to place relative to; omit for the first window. */
  anchor?: Rect
  /** Other visible windows, to keep the new one from overlapping. */
  others: Rect[]
  /** The desktop work area (see getWorkArea). */
  workArea: Rect
  /** Gap between windows; defaults to GAP. */
  gap?: number
}

/**
 * Choose where a newly opened window goes.
 *
 *  - No anchor (the first window) → centered in the work area.
 *  - Otherwise try, in order, the slot to the RIGHT of the anchor, then BELOW,
 *    then LEFT. Use the first that fully fits the work area AND overlaps no other
 *    visible window.
 *  - If none qualify → centered (the final fallback; may overlap).
 *
 * Pure and viewport-agnostic: pass the work area in, get a position out — so it's
 * trivial to unit-test and to swap for a different strategy later.
 */
export function placeWindow({
  size,
  anchor,
  others,
  workArea,
  gap = GAP,
}: PlacementInput): { x: number; y: number } {
  if (!anchor) return centeredIn(size, workArea)

  const candidates: Array<{ x: number; y: number }> = [
    { x: anchor.x + anchor.width + gap, y: anchor.y }, // right of the current window
    { x: anchor.x, y: anchor.y + anchor.height + gap }, // below it
    { x: anchor.x - size.width - gap, y: anchor.y }, // left of it
  ]

  for (const candidate of candidates) {
    const rect: Rect = { x: candidate.x, y: candidate.y, width: size.width, height: size.height }
    if (fitsInside(rect, workArea) && !others.some((other) => overlaps(rect, other))) {
      return candidate
    }
  }

  // Nothing clean fits — center it (may overlap), as agreed.
  return centeredIn(size, workArea)
}
