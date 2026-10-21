/**
 * The Books window's engram network, as plain geometry: each book is an input neuron in two
 * zigzag columns on the right, each essay an output neuron on the left at the mean height of
 * the books that fed it. Synapses run flat at the book's height, then bend toward the essay in
 * a gutter; books that share an essay get a faint book↔book link. No DOM, so it's testable.
 */

export type Pt = { x: number; y: number }
/** be: book → essay; bb: book ↔ book (same essay), drawn from the left node to the right one. */
export type Synapse = { d: string; from: number; to: number; kind: 'be' | 'bb' }
export type Net = { books: Pt[]; essays: Pt[]; syns: Synapse[]; dends: { i: number; d: string }[] }

export const R = 36 // neuron ring radius
export const DOCK = 320 // the readout column on the right
const GAP = 28

/** Lay out `bookEssay.length` books (each the index of the essay it fed) in a W×H stage. */
export function layoutNet(W: number, H: number, bookEssay: number[], essayCount: number): Net {
  const n = bookEssay.length
  const net = W - DOCK - GAP
  const top = 58
  const step = (H - 86 - top) / Math.max(1, n - 1)
  const colA = net * 0.5
  const colB = net * 0.82
  const bend = net * 0.33
  const books = bookEssay.map((_, i) => ({ x: i % 2 ? colB : colA, y: top + i * step }))
  const essays = Array.from({ length: essayCount }, (_, j) => {
    const ys = books.filter((_, i) => bookEssay[i] === j).map((p) => p.y)
    return { x: 24, y: ys.length ? ys.reduce((a, b) => a + b) / ys.length : top }
  })

  const syns: Synapse[] = []
  const dends: Net['dends'] = []
  books.forEach((p, i) => {
    const e = essays[bookEssay[i]]
    const d = `M${p.x - R - 7},${p.y} L${bend},${p.y} C${bend - 60},${p.y} ${e.x + 70},${e.y} ${e.x + 12},${e.y}`
    syns.push({ d, from: i, to: bookEssay[i], kind: 'be' })
    // dendrites: short forked strokes, kept off the label (below) and the synapse (left)
    for (const a of [-70, -25, 20, 200]) {
      const r = (a * Math.PI) / 180
      const L = 14 + ((((i * 7 + a) % 9) + 9) % 9)
      const x0 = p.x + Math.cos(r) * (R + 8)
      const y0 = p.y + Math.sin(r) * (R + 8)
      const x1 = p.x + Math.cos(r) * (R + 8 + L)
      const y1 = p.y + Math.sin(r) * (R + 8 + L)
      dends.push({
        i,
        d: `M${x0},${y0} L${x1},${y1} l${Math.cos(r + 0.5) * 7},${Math.sin(r + 0.5) * 7} M${(x0 + x1) / 2},${(y0 + y1) / 2} l${Math.cos(r - 0.7) * 6},${Math.sin(r - 0.7) * 6}`,
      })
    }
  })
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (bookEssay[i] !== bookEssay[j]) continue
      const [l, r] = books[i].x < books[j].x ? [i, j] : [j, i]
      const a = books[l]
      const b = books[r]
      const s = b.y > a.y ? -1 : 1
      const d = `M${a.x + R + 4},${a.y - s * 6} C${a.x + R + 50},${a.y - s * 6} ${b.x - 70},${b.y + s * 12} ${b.x - R - 6},${b.y + s * 8}`
      syns.push({ d, from: l, to: r, kind: 'bb' })
    }
  return { books, essays, syns, dends }
}

/** Amber leader line from book p to the readout panel whose top is at `ty`. */
export function leadPoints(p: Pt, W: number, ty: number): string {
  const dockX = W - DOCK
  const ay = ty + 34
  return `${p.x + R + 8},${p.y} ${dockX - 34},${p.y} ${dockX - 4},${ay} ${dockX},${ay}`
}

/** Keep the readout panel (height ph) inside the stage, near the book's height. */
export const panelTop = (p: Pt, ph: number, H: number) => Math.max(16, Math.min(H - ph, p.y - 80))
