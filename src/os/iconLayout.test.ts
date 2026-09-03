import { describe, expect, it } from 'vitest'
import { MENUBAR_HEIGHT } from './constants'
import {
  clampIcon,
  columnCapacity,
  iconDragBounds,
  ICON_MARGIN,
  ICON_PITCH,
  ICON_SIZE,
  layoutIcons,
  samePositions,
} from './iconLayout'
import type { Rect } from './placement'

/**
 * The icon layout is pure (work area in, positions out), so — like the
 * placement suite — this runs in plain node with no DOM.
 */

/** A roomy desktop: every launcher fits in one column. */
const TALL: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 1440, height: 900 - MENUBAR_HEIGHT }

/** The reported repro: a small screen at high zoom — 1100x620 CSS px. */
const SHORT: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 1100, height: 620 - MENUBAR_HEIGHT }

const IDS = ['about', 'projects', 'research', 'support', 'email', 'files', 'books', 'thoughts']

/** True when the icon at `pos` sits entirely within `area`. */
function onScreen(pos: { x: number; y: number }, area: Rect): boolean {
  return (
    pos.x >= area.x &&
    pos.y >= area.y &&
    pos.x + ICON_SIZE.width <= area.x + area.width &&
    pos.y + ICON_SIZE.height <= area.y + area.height
  )
}

describe('columnCapacity', () => {
  it('fits every launcher in one column on a tall desktop', () => {
    expect(columnCapacity(TALL)).toBeGreaterThanOrEqual(IDS.length)
  })

  it('drops to what actually fits on a short viewport', () => {
    // 580px of work area: 16 top margin + 4*100 pitch + 96 icon = 512 ✓, a
    // sixth would need 612 ✗.
    expect(columnCapacity(SHORT)).toBe(5)
  })

  it('never returns less than one, even on an absurdly short viewport', () => {
    expect(columnCapacity({ x: 0, y: MENUBAR_HEIGHT, width: 800, height: 20 })).toBe(1)
  })
})

describe('layoutIcons', () => {
  it('lays a single column down the left edge when there is room', () => {
    const positions = layoutIcons(IDS, TALL)
    for (const [i, id] of IDS.entries()) {
      expect(positions[id]).toEqual({
        x: TALL.x + ICON_MARGIN.x,
        y: TALL.y + ICON_MARGIN.y + i * ICON_PITCH.y,
      })
    }
  })

  it('keeps every icon fully on-screen on the short viewport that hid them', () => {
    const positions = layoutIcons(IDS, SHORT)
    for (const id of IDS) expect(onScreen(positions[id], SHORT)).toBe(true)
  })

  it('wraps into a second column instead of running off the bottom', () => {
    const positions = layoutIcons(IDS, SHORT)
    const perColumn = columnCapacity(SHORT)
    // The icon just past the first column's capacity starts a new column, back
    // at the top row.
    expect(positions[IDS[perColumn]]).toEqual({
      x: SHORT.x + ICON_MARGIN.x + ICON_PITCH.x,
      y: SHORT.y + ICON_MARGIN.y,
    })
    expect(new Set(IDS.map((id) => positions[id].x)).size).toBe(2)
  })

  it('never puts two icons in the same cell', () => {
    const positions = layoutIcons(IDS, SHORT)
    const cells = IDS.map((id) => `${positions[id].x},${positions[id].y}`)
    expect(new Set(cells).size).toBe(IDS.length)
  })

  it('reflows back to one column when the viewport grows again', () => {
    expect(layoutIcons(IDS, TALL)).toEqual(layoutIcons(IDS, TALL))
    const columnsWhenShort = new Set(IDS.map((id) => layoutIcons(IDS, SHORT)[id].x)).size
    const columnsWhenTall = new Set(IDS.map((id) => layoutIcons(IDS, TALL)[id].x)).size
    expect(columnsWhenTall).toBeLessThan(columnsWhenShort)
  })

  it('keeps icons on-screen even when the area is smaller than one icon', () => {
    const tiny: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 60, height: 50 }
    const positions = layoutIcons(IDS, tiny)
    for (const id of IDS) {
      expect(positions[id].x).toBe(tiny.x)
      expect(positions[id].y).toBe(tiny.y)
    }
  })
})

describe('clampIcon', () => {
  it('leaves a position that already fits untouched', () => {
    expect(clampIcon({ x: 200, y: 300 }, TALL)).toEqual({ x: 200, y: 300 })
  })

  it('pulls an icon saved on a big screen back onto a small one', () => {
    const clamped = clampIcon({ x: 1300, y: 820 }, SHORT)
    expect(onScreen(clamped, SHORT)).toBe(true)
    expect(clamped).toEqual({
      x: SHORT.width - ICON_SIZE.width,
      y: SHORT.y + SHORT.height - ICON_SIZE.height,
    })
  })

  it('never lets an icon slide under the menu bar', () => {
    expect(clampIcon({ x: 24, y: 0 }, TALL).y).toBe(MENUBAR_HEIGHT)
    expect(clampIcon({ x: 24, y: -500 }, TALL).y).toBe(MENUBAR_HEIGHT)
  })
})

describe('iconDragBounds', () => {
  it('matches what clampIcon would allow, so drag and layout share one rule', () => {
    for (const area of [TALL, SHORT]) {
      const bounds = iconDragBounds(area)
      expect(bounds).toEqual({
        left: area.x,
        top: area.y,
        right: area.x + area.width - ICON_SIZE.width,
        bottom: area.y + area.height - ICON_SIZE.height,
      })
      // The extremes of the drag box are exactly the clamp's fixed points.
      expect(clampIcon({ x: bounds.left, y: bounds.top }, area)).toEqual({
        x: bounds.left,
        y: bounds.top,
      })
      expect(clampIcon({ x: bounds.right, y: bounds.bottom }, area)).toEqual({
        x: bounds.right,
        y: bounds.bottom,
      })
    }
  })

  it('collapses to a point rather than inverting on a tiny work area', () => {
    const tiny: Rect = { x: 0, y: MENUBAR_HEIGHT, width: 60, height: 50 }
    const bounds = iconDragBounds(tiny)
    expect(bounds.right).toBe(bounds.left)
    expect(bounds.bottom).toBe(bounds.top)
  })
})

describe('samePositions', () => {
  it('is true for equal maps and false when anything differs', () => {
    const a = { about: { x: 24, y: 56 }, files: { x: 24, y: 156 } }
    expect(samePositions(a, { ...a })).toBe(true)
    expect(samePositions(a, { about: { x: 24, y: 56 }, files: { x: 24, y: 256 } })).toBe(false)
    expect(samePositions(a, { about: { x: 24, y: 56 } })).toBe(false)
  })
})
