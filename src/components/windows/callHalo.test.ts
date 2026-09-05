import { describe, expect, it } from 'vitest'
import { HALO_ATTACK, HALO_GAIN, HALO_RELEASE, haloLevel, haloScales, smoothHalo } from './callHalo'

describe('haloLevel', () => {
  it('boosts ordinary speech volume into a visible range', () => {
    // ~0.3 is a normal spoken level from the SDK; with gain it should be well above half.
    expect(haloLevel(0.3)).toBeCloseTo(Math.min(1, 0.3 * HALO_GAIN))
    expect(haloLevel(0.3)).toBeGreaterThan(0.6)
  })

  it('clamps to 0..1 and ignores garbage', () => {
    expect(haloLevel(5)).toBe(1)
    expect(haloLevel(-1)).toBe(0)
    expect(haloLevel(NaN)).toBe(0)
  })
})

describe('smoothHalo', () => {
  it('attacks faster than it releases', () => {
    expect(HALO_ATTACK).toBeGreaterThan(HALO_RELEASE)
    const up = smoothHalo(0, 1)
    const down = 1 - smoothHalo(1, 0)
    expect(up).toBeGreaterThan(down)
  })

  it('settles exactly on the target instead of asymptoting', () => {
    let v = 1
    for (let i = 0; i < 200; i++) v = smoothHalo(v, 0)
    expect(v).toBe(0)
  })
})

describe('haloScales', () => {
  it('hugs the photo at rest and grows the glow more than the ring', () => {
    expect(haloScales(0)).toEqual({ ring: 1, glow: 1 })
    const loud = haloScales(1)
    expect(loud.glow).toBeGreaterThan(loud.ring)
    expect(loud.ring).toBeGreaterThan(1)
  })
})
