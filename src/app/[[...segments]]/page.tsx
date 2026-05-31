import { Desktop } from '@/os/Desktop'

/**
 * The home route IS the desktop — and so is every other path. This optional
 * catch-all lets deep links like `/article/<slug>` or `/projects` resolve to the
 * desktop instead of 404ing; the client (`WindowUrlSync`) reads the path and
 * opens the matching window. Windows live in the layout, so they persist across
 * navigation and the page body never needs the segments itself.
 */
export default function Home() {
  return <Desktop />
}
