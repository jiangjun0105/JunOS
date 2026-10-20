import { describe, expect, it } from 'vitest'
import { bustPoints } from './hologram'

describe('bustPoints', () => {
  it('turns a silhouette into a centred bust bulging towards the viewer', () => {
    // a 40×60 disc as the alpha mask, flat mid-grey brightness
    const w = 40
    const h = 60
    const a = new Float32Array(w * h)
    const v = new Float32Array(w * h).fill(0.5)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) if ((x - 20) ** 2 + (y - 25) ** 2 < 15 ** 2) a[y * w + x] = 1
    const pts = bustPoints(v, a, w, h)
    expect(pts.length).toBeGreaterThan(1000)
    for (const p of pts) {
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThan(1)
      expect(p.z).toBeGreaterThanOrEqual(0)
      expect(p.e).toBeLessThanOrEqual(1)
      expect(p.b).toBeGreaterThanOrEqual(0)
      expect(p.b).toBeLessThanOrEqual(1)
    }
    // the middle of each row sits closer to the viewer than its edges
    const mid = pts.filter((p) => p.e < 0.2)
    const edge = pts.filter((p) => p.e > 0.9)
    const avg = (q: typeof pts) => q.reduce((s, p) => s + p.z, 0) / q.length
    expect(avg(mid)).toBeGreaterThan(avg(edge))
  })
})
