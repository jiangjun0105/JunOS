/**
 * Voice levels for the Call Me window (the twin's swell and the volume bars) — the
 * pure math, kept out of the component so it can be unit-tested without the ElevenLabs SDK.
 *
 * The SDK's `getOutputVolume()` is the mean of the voice-band frequency bins,
 * normalised to 0..1 — but ordinary speech only reaches ~0.1–0.4, so a level
 * driven by the raw value barely moves (the mic's `getInputVolume()` is the same).
 * `voiceLevel` applies GAIN and clamps to 0..1; `smoothLevel` eases frame-to-frame,
 * with a fast attack (the level jumps with a syllable) and a slow release (it
 * settles back gently) so the twin and the bars breathe rather than flicker.
 */

/** Multiplier applied to the raw 0..1 SDK volume before clamping. */
export const VOICE_GAIN = 2.6
/** Per-frame easing toward a LOUDER target (1 = instant). */
export const VOICE_ATTACK = 0.45
/** Per-frame easing toward a QUIETER target. */
export const VOICE_RELEASE = 0.12

/** Raw SDK volume → 0..1 level. */
export function voiceLevel(rawVolume: number): number {
  if (!Number.isFinite(rawVolume)) return 0
  return Math.min(1, Math.max(0, rawVolume * VOICE_GAIN))
}

/** One frame of easing from `current` toward `target` (both 0..1). */
export function smoothLevel(current: number, target: number): number {
  const rate = target > current ? VOICE_ATTACK : VOICE_RELEASE
  const next = current + (target - current) * rate
  // Snap the tail so a settling level actually reaches 0 instead of asymptoting.
  return Math.abs(next - target) < 0.002 ? target : next
}
