import { afterEach, describe, expect, it } from 'vitest'
import { MENUBAR_HEIGHT, MIN_WINDOW_SIZE } from './constants'
import { CASCADE_STEP, defaultWindowSize, fitSize, getWorkArea, placeWindow, type Rect, WINDOW_SIZE } from './placement'

/**
 * Tests for the placement helpers. `fitSize` and `placeWindow` (called with an
 * explicit `workArea`) are pure — no DOM — so most of this file runs in plain
 * node. Only `getWorkArea` reads `window`; rather than pull in jsdom, we stub a
 * minimal `globalThis.window` for just those cases and delete it afterward,
 * keeping the suite dependency-free and the default node environment.
 */

const GAP = 16 // mirrors the module-private default gap/margin in placement.ts

/** A roomy work area used by most placement cases. */
const AREA: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 1000, height: 700 }

/** True when `r` sits fully inside `area` (re-implemented here; the real one is private). */
function fitsInside(r: Rect, area: Rect): boolean {
  return (
    r.x >= area.x &&
    r.y >= area.y &&
    r.x + r.width <= area.x + area.width &&
    r.y + r.height <= area.y + area.height
  )
}

describe('fitSize', () => {
  it('leaves a size that already fits unchanged', () => {
    const size = { width: 500, height: 400 }
    expect(fitSize(size, AREA)).toEqual(size)
  })

  it('clamps a too-big size into a small work area (minus margin on each side)', () => {
    const small: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 600, height: 500 }
    const fitted = fitSize({ width: 9999, height: 9999 }, small)
    expect(fitted.width).toBe(small.width - GAP * 2)
    expect(fitted.height).toBe(small.height - GAP * 2)
  })

  it('never shrinks below MIN_WINDOW_SIZE, even when the area is tiny', () => {
    // Area smaller than the minimum window → the floor wins over the clamp.
    const tiny: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 100, height: 100 }
    const fitted = fitSize({ width: 800, height: 600 }, tiny)
    expect(fitted).toEqual(MIN_WINDOW_SIZE)
  })

  it('honors a custom margin', () => {
    const fitted = fitSize({ width: 9999, height: 9999 }, AREA, 50)
    expect(fitted.width).toBe(AREA.width - 50 * 2)
    expect(fitted.height).toBe(AREA.height - 50 * 2)
  })
})

describe('defaultWindowSize', () => {
  it('fills the whole work area, edge to edge, on a compact screen', () => {
    const area = { width: 800, height: 700 }
    expect(defaultWindowSize(area)).toEqual({ width: 800, height: 700 })
  })

  it('takes 80% of the width (icons stay visible) and 85% of the height on a laptop', () => {
    const area = { width: 1366, height: 728 }
    expect(defaultWindowSize(area)).toEqual({
      width: Math.round(1366 * WINDOW_SIZE.WIDTH_FRACTION),
      height: Math.round(728 * WINDOW_SIZE.HEIGHT_FRACTION),
    })
  })

  it('caps at MAX_WIDTH × MAX_HEIGHT on a wide screen', () => {
    const area = { width: 2560, height: 1400 }
    expect(defaultWindowSize(area)).toEqual({
      width: WINDOW_SIZE.MAX_WIDTH,
      height: WINDOW_SIZE.MAX_HEIGHT,
    })
  })

  it('always fits the area it was given', () => {
    for (const area of [
      { width: 320, height: 500 },
      { width: 900, height: 600 },
      { width: 1440, height: 860 },
      { width: 3440, height: 1400 },
    ]) {
      const size = defaultWindowSize(area)
      expect(size.width).toBeLessThanOrEqual(area.width)
      expect(size.height).toBeLessThanOrEqual(area.height)
    }
  })
})

describe('placeWindow', () => {
  const size = { width: 400, height: 300 }

  it('centers the first window (no anchor) within the work area', () => {
    const pos = placeWindow({ size, others: [], workArea: AREA })
    const rect: Rect = { ...pos, ...size }
    expect(fitsInside(rect, AREA)).toBe(true)
    // Centered: equal margins left/right and top/bottom (within the area).
    expect(pos.x).toBe(Math.round(AREA.x + (AREA.width - size.width) / 2))
    expect(pos.y).toBe(Math.round(AREA.y + (AREA.height - size.height) / 2))
  })

  it('offsets to the RIGHT of the anchor when that slot is free', () => {
    const anchor: Rect = { x: 100, y: 100, width: 400, height: 300 }
    const pos = placeWindow({ size, anchor, others: [anchor], workArea: AREA })
    expect(pos).toEqual({ x: anchor.x + anchor.width + GAP, y: anchor.y })
    expect(fitsInside({ ...pos, ...size }, AREA)).toBe(true)
  })

  it('falls BELOW the anchor when the right slot would overflow the work area', () => {
    // Anchor pushed so far right that "right of it" can't fit; below still fits.
    const anchor: Rect = { x: AREA.width - 420, y: MENUBAR_HEIGHT, width: 400, height: 300 }
    const pos = placeWindow({ size, anchor, others: [anchor], workArea: AREA })
    expect(pos).toEqual({ x: anchor.x, y: anchor.y + anchor.height + GAP })
    expect(fitsInside({ ...pos, ...size }, AREA)).toBe(true)
  })

  it('falls to the LEFT when both right and below are blocked by other windows', () => {
    const anchor: Rect = { x: 450, y: MENUBAR_HEIGHT, width: 400, height: 300 }
    // Occupy the right slot and the below slot so only the left remains clean.
    const right: Rect = { x: anchor.x + anchor.width + GAP, y: anchor.y, ...size }
    const below: Rect = { x: anchor.x, y: anchor.y + anchor.height + GAP, ...size }
    const pos = placeWindow({ size, anchor, others: [anchor, right, below], workArea: AREA })
    expect(pos).toEqual({ x: anchor.x - size.width - GAP, y: anchor.y })
    expect(fitsInside({ ...pos, ...size }, AREA)).toBe(true)
  })

  it('returns a rect that overlaps NONE of the others when a clean slot exists', () => {
    const anchor: Rect = { x: 100, y: 100, width: 400, height: 300 }
    const pos = placeWindow({ size, anchor, others: [anchor], workArea: AREA })
    const placed: Rect = { ...pos, ...size }
    const overlaps = (a: Rect, b: Rect) =>
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    expect(overlaps(placed, anchor)).toBe(false)
  })

  it('CASCADES right + down off the anchor when the area is crowded and no slot fits cleanly', () => {
    // One giant window covering essentially the whole work area: right/below/left
    // all either overflow or overlap, so placement steps off the anchor instead.
    const anchor: Rect = { x: 0, y: MENUBAR_HEIGHT, width: AREA.width, height: AREA.height }
    const pos = placeWindow({ size, anchor, others: [anchor], workArea: AREA })
    expect(pos).toEqual({ x: anchor.x + CASCADE_STEP, y: anchor.y + CASCADE_STEP })
    expect(fitsInside({ ...pos, ...size }, AREA)).toBe(true)
  })

  it('never lands exactly on the anchor: two same-size centered windows are offset', () => {
    // The everyday case on a big screen: the first window is the responsive
    // default, centered; the second is the same size, so no side slot fits.
    const big = { width: 800, height: 600 }
    const first = placeWindow({ size: big, others: [], workArea: AREA })
    const anchor: Rect = { ...first, ...big }
    const second = placeWindow({ size: big, anchor, others: [anchor], workArea: AREA })
    expect(second).not.toEqual(first)
    expect(second).toEqual({ x: first.x + CASCADE_STEP, y: first.y + CASCADE_STEP })
    expect(fitsInside({ ...second, ...big }, AREA)).toBe(true)
  })

  it('clamps the cascade to the work area when the anchor is near the bottom-right', () => {
    const anchor: Rect = { x: AREA.width - size.width - 10, y: MENUBAR_HEIGHT + AREA.height - size.height - 10, ...size }
    // Fill the area so every side slot is blocked, forcing the cascade.
    const blocker: Rect = { x: 0, y: MENUBAR_HEIGHT, width: AREA.width, height: AREA.height }
    const pos = placeWindow({ size, anchor, others: [anchor, blocker], workArea: AREA })
    expect(fitsInside({ ...pos, ...size }, AREA)).toBe(true)
    expect(pos).toEqual({ x: AREA.width - size.width, y: MENUBAR_HEIGHT + AREA.height - size.height })
  })

  it('wraps the cascade to the top-left when the anchor already sits in the bottom-right corner', () => {
    const anchor: Rect = { x: AREA.width - size.width, y: MENUBAR_HEIGHT + AREA.height - size.height, ...size }
    const blocker: Rect = { x: 0, y: MENUBAR_HEIGHT, width: AREA.width, height: AREA.height }
    const pos = placeWindow({ size, anchor, others: [anchor, blocker], workArea: AREA })
    expect(pos).toEqual({ x: AREA.x + GAP, y: AREA.y + GAP })
  })

  it('keeps a full-bleed (compact) window inside the area even though it cannot cascade', () => {
    const full = { width: AREA.width, height: AREA.height }
    const anchor: Rect = { x: AREA.x, y: AREA.y, ...full }
    const pos = placeWindow({ size: full, anchor, others: [anchor], workArea: AREA })
    expect(fitsInside({ ...pos, ...full }, AREA)).toBe(true)
  })
})

describe('getWorkArea', () => {
  // Stub a minimal window for the DOM-reading branch, then remove it so other
  // suites still see the SSR (typeof window === 'undefined') branch.
  afterEach(() => {
    // @ts-expect-error — test-only teardown of the stubbed global.
    delete globalThis.window
  })

  it('reads window dimensions and offsets by the menu bar height', () => {
    // @ts-expect-error — minimal stub; only innerWidth/innerHeight are read.
    globalThis.window = { innerWidth: 1280, innerHeight: 800 }
    expect(getWorkArea()).toEqual({
      x: 0,
      y: MENUBAR_HEIGHT,
      width: 1280,
      height: 800 - MENUBAR_HEIGHT,
    })
  })

  it('returns a sensible SSR default when there is no window', () => {
    // No stub set in this test (afterEach cleared any prior one).
    expect(getWorkArea()).toEqual({
      x: 0,
      y: MENUBAR_HEIGHT,
      width: 1024,
      height: 768 - MENUBAR_HEIGHT,
    })
  })
})
