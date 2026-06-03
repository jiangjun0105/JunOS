import type { WindowInstance } from './types'

/**
 * URL <-> window mapping. Each window has one canonical path, so the focused
 * window can be mirrored into the address bar (shareable) and pasting that link
 * back re-opens it (deep-linkable):
 *
 *   about / projects / research / files   ->  /about, /projects, ...
 *   an article                            ->  /article/<slug>
 *   nothing focused (bare desktop)        ->  /
 *
 * Pure functions — no React, no router — so the sync logic (WindowUrlSync) and
 * any future tests can share them.
 */

/** The canonical path for a window (what the address bar shows when it's focused). */
export function pathForWindow(win: Pick<WindowInstance, 'appId' | 'params'>): string {
  if (win.appId === 'article' || win.appId === 'thoughts') {
    const slug = win.params?.slug
    if (typeof slug === 'string') return `/${win.appId}/${encodeURIComponent(slug)}`
  }
  return `/${win.appId}`
}

/** Parse a pathname into an open-intent, or null for the bare desktop ('/'). */
export function parseWindowPath(pathname: string): { appId: string; slug?: string } | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts[0] === 'article' || parts[0] === 'thoughts') {
    return parts[1] ? { appId: parts[0], slug: decodeURIComponent(parts[1]) } : { appId: parts[0] }
  }
  return { appId: parts[0] }
}

/**
 * A window's identity key: its app id PLUS its params. Two different articles
 * (`{ slug: 'a' }` vs `{ slug: 'b' }`) get different keys and so open as two
 * windows, while re-opening the same one yields the same key — that's how the
 * WindowManager dedupes/focuses instead of spawning a duplicate.
 *
 * We sort the param keys before stringifying so identity is key-ORDER-agnostic:
 * `{ a, b }` and `{ b, a }` describe the same window and must produce the same
 * key (plain `JSON.stringify` would not guarantee that). Lives here next to
 * `pathForWindow` because both encode "which window is this".
 */
export function windowKey(appId: string, params?: Record<string, unknown>): string {
  if (!params) return appId
  // Stable key order → stable string regardless of how the params object was built.
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = params[k]
      return acc
    }, {})
  return appId + JSON.stringify(sorted)
}
