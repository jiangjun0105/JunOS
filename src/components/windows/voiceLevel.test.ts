import { describe, expect, it } from 'vitest'
import { VOICE_ATTACK, VOICE_GAIN, VOICE_RELEASE, voiceLevel, smoothLevel } from './voiceLevel'

describe('voiceLevel', () => {
  it('boosts ordinary speech volume into a visible range', () => {
    // ~0.3 is a normal spoken level from the SDK; with gain it should be well above half.
    expect(voiceLevel(0.3)).toBeCloseTo(Math.min(1, 0.3 * VOICE_GAIN))
    expect(voiceLevel(0.3)).toBeGreaterThan(0.6)
  })

  it('clamps to 0..1 and ignores garbage', () => {
    expect(voiceLevel(5)).toBe(1)
    expect(voiceLevel(-1)).toBe(0)
    expect(voiceLevel(NaN)).toBe(0)
  })
})

describe('smoothLevel', () => {
  it('attacks faster than it releases', () => {
    expect(VOICE_ATTACK).toBeGreaterThan(VOICE_RELEASE)
    const up = smoothLevel(0, 1)
    const down = 1 - smoothLevel(1, 0)
    expect(up).toBeGreaterThan(down)
  })

  it('settles exactly on the target instead of asymptoting', () => {
    let v = 1
    for (let i = 0; i < 200; i++) v = smoothLevel(v, 0)
    expect(v).toBe(0)
  })
})
