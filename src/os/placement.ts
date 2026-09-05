import { MENUBAR_HEIGHT, MIN_WINDOW_SIZE } from './constants'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Default breathing room between windows and from the work-area edges. */
const GAP = 16

/**
 * How far a window is nudged right + down from the one under it when nothing
 * else fits (the "cascade"). A title bar is ~29px, so 32 leaves the lower
 * window's title fully readable above the new one.
 */
export const CASCADE_STEP = 32

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

/**
 * Shrink a desired window size to fit inside the work area, leaving `margin` on
 * every side — but never below MIN_WINDOW_SIZE. This lets each app declare a
 * generous, readable `defaultSize` while guaranteeing a freshly opened window
 * fits the viewport (so it never opens partly off-screen on a short or narrow
 * display, and the user never has to resize before reading).
 */
export function fitSize(
  size: { width: number; height: number },
  area: Rect,
  margin = GAP
): { width: number; height: number } {
  return {
    width: Math.max(MIN_WINDOW_SIZE.width, Math.min(size.width, area.width - margin * 2)),
    height: Math.max(MIN_WINDOW_SIZE.height, Math.min(size.height, area.height - margin * 2)),
  }
}

/**
 * The responsive default size for a freshly opened window — used for every app
 * that doesn't declare its own `defaultSize`. Three tiers, keyed off the WORK
 * AREA (not the raw viewport):
 *
 *  - compact (narrower than COMPACT_MAX_WIDTH — a phone, a split screen): the
 *    window fills the whole work area, edge to edge, from just under the menu
 *    bar to the bottom. No margins: on a small screen the chrome is the content.
 *  - normal (a laptop / desktop): WIDTH_FRACTION of the work-area width, centered,
 *    so the desktop icons stay visible in the strip on the left (and a matching
 *    strip on the right); HEIGHT_FRACTION of the work-area height.
 *  - wide (a big monitor / ultrawide): the fractions would produce an absurdly
 *    wide reading column, so the size is capped at MAX_WIDTH × MAX_HEIGHT and the
 *    window just sits centered in the extra room.
 *
 * Pure and viewport-agnostic (pass the area in), like the rest of this module.
 * The result always fits the area it was given, so it needs no `fitSize` pass.
 */
export const WINDOW_SIZE = {
  /** Work areas narrower than this get the full-bleed "compact" treatment. */
  COMPACT_MAX_WIDTH: 900,
  /** Normal screens: share of the work-area width / height a new window takes. */
  WIDTH_FRACTION: 0.8,
  HEIGHT_FRACTION: 0.85,
  /** Wide screens: a new window never opens bigger than this. */
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 820,
} as const

export function defaultWindowSize(area: { width: number; height: number }): {
  width: number
  height: number
} {
  if (area.width < WINDOW_SIZE.COMPACT_MAX_WIDTH) {
    return { width: area.width, height: area.height }
  }
  return {
    width: Math.round(Math.min(area.width * WINDOW_SIZE.WIDTH_FRACTION, WINDOW_SIZE.MAX_WIDTH)),
    height: Math.round(Math.min(area.height * WINDOW_SIZE.HEIGHT_FRACTION, WINDOW_SIZE.MAX_HEIGHT)),
  }
}

/**
 * The last-resort slot when no clean side slot exists: step the new window
 * right + down from the anchor by CASCADE_STEP so the two never sit exactly on
 * top of each other (the anchor's title bar and left edge stay visible, the way
 * classic desktops stack documents). Kept inside the work area: if the step
 * would push the window past the right/bottom edge it's clamped back, and if
 * that clamp leaves it sitting exactly on the anchor (the anchor is already in
 * the bottom-right corner, or the window is as big as the area), the cascade
 * wraps round to the area's top-left, one GAP in.
 */
function cascadeFrom(
  anchor: Rect,
  size: { width: number; height: number },
  area: Rect,
  gap: number
): { x: number; y: number } {
  const maxX = area.x + area.width - size.width
  const maxY = area.y + area.height - size.height
  const stepped = {
    x: Math.min(anchor.x + CASCADE_STEP, maxX),
    y: Math.min(anchor.y + CASCADE_STEP, maxY),
  }
  const moved = stepped.x !== anchor.x || stepped.y !== anchor.y
  if (moved) return { x: Math.max(area.x, stepped.x), y: Math.max(area.y, stepped.y) }
  return {
    x: Math.max(area.x, Math.min(area.x + gap, maxX)),
    y: Math.max(area.y, Math.min(area.y + gap, maxY)),
  }
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
 *  - If none qualify → CASCADE: right + down from the anchor by CASCADE_STEP
 *    (may overlap, but never sits exactly on top of the anchor — see cascadeFrom).
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

  // Nothing clean fits — cascade off the anchor (may overlap, never coincides).
  return cascadeFrom(anchor, size, workArea, gap)
}
