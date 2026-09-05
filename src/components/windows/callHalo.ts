/**
 * The "breathing" halo around Jun's photo in the Call Me window — the pure math,
 * kept out of the component so it can be unit-tested without the ElevenLabs SDK.
 *
 * The SDK's `getOutputVolume()` is the mean of the voice-band frequency bins,
 * normalised to 0..1 — but ordinary speech only reaches ~0.1–0.4, so a halo
 * driven by the raw value barely moves. `haloLevel` applies GAIN and clamps to
 * 0..1; `smoothHalo` eases frame-to-frame, with a fast attack (the halo jumps
 * out with a syllable) and a slow release (it settles back gently, like a
 * breath out) so it reads as breathing rather than flickering.
 */

/** Multiplier applied to the raw 0..1 SDK volume before clamping. */
export const HALO_GAIN = 2.6
/** Per-frame easing toward a LOUDER target (1 = instant). */
export const HALO_ATTACK = 0.45
/** Per-frame easing toward a QUIETER target. */
export const HALO_RELEASE = 0.12

/** Raw SDK volume → 0..1 halo level. */
export function haloLevel(rawVolume: number): number {
  if (!Number.isFinite(rawVolume)) return 0
  return Math.min(1, Math.max(0, rawVolume * HALO_GAIN))
}

/** One frame of easing from `current` toward `target` (both 0..1). */
export function smoothHalo(current: number, target: number): number {
  const rate = target > current ? HALO_ATTACK : HALO_RELEASE
  const next = current + (target - current) * rate
  // Snap the tail so a settling halo actually reaches 0 instead of asymptoting.
  return Math.abs(next - target) < 0.002 ? target : next
}

/**
 * The two halo layers' transforms for a given level: an inner wash that grows
 * a little and a fainter outer wash that grows more, so the swell has depth.
 * Both are soft fills — no hard outline, which read as a dark circle drawn
 * round the photo. Each is a `scale()` of a disc already a few px outside the
 * photo, so at level 0 they hug it (and are invisible).
 */
export function haloScales(level: number): { inner: number; outer: number } {
  return { inner: 1 + level * 0.16, outer: 1 + level * 0.32 }
}
