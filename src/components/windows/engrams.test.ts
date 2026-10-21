import { describe, expect, it } from 'vitest'
import { books } from '../../content/books'
import { DOCK, R, layoutNet, panelTop } from './engrams'

// index of the essay each real book fed
const keys = books.map((b) => `${b.essay.app}:${b.essay.slug}`)
const FED = keys.map((k) => [...new Set(keys)].indexOf(k))

describe('layoutNet', () => {
  const W = 860
  const H = 560
  const net = layoutNet(W, H, FED, new Set(keys).size)

  it('keeps every neuron inside the stage, clear of the readout dock', () => {
    for (const p of net.books) {
      expect(p.x - R).toBeGreaterThan(0)
      expect(p.x + R).toBeLessThan(W - DOCK)
      expect(p.y - R).toBeGreaterThan(0)
      expect(p.y + R).toBeLessThan(H)
    }
  })

  it('puts each essay at the mean height of the books that fed it', () => {
    expect(net.essays[0].y).toBeCloseTo((net.books[0].y + net.books[1].y) / 2)
    expect(net.essays[1].y).toBeCloseTo(net.books[2].y)
  })

  it('wires one synapse per book plus one link per pair sharing an essay', () => {
    expect(net.syns.filter((s) => s.kind === 'be')).toHaveLength(books.length)
    const bb = net.syns.filter((s) => s.kind === 'bb')
    expect(bb.map((s) => [s.from, s.to].sort())).toEqual([
      [0, 1],
      [3, 4],
    ])
    for (const s of bb) expect(net.books[s.from].x).toBeLessThan(net.books[s.to].x)
  })
})

describe('panelTop', () => {
  it('clamps the readout into the stage', () => {
    expect(panelTop({ x: 0, y: 0 }, 300, 560)).toBe(16)
    expect(panelTop({ x: 0, y: 550 }, 300, 560)).toBe(260)
  })
})
