/**
 * Wallpaper — the desktop background.
 *
 * A warm-yellow gradient from the "Hand-drawn OS — Cozy" design. The actual
 * colors live as tokens in src/styles/theme.css (--desktop-*), applied by the
 * `.os-wallpaper` skin class, so the whole background reskins from one place.
 */
export function Wallpaper() {
  return <div aria-hidden className="os-wallpaper" />
}
