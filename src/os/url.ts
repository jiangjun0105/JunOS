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
  if (win.appId === 'article') {
    const slug = win.params?.slug
    if (typeof slug === 'string') return `/article/${encodeURIComponent(slug)}`
  }
  return `/${win.appId}`
}

/** Parse a pathname into an open-intent, or null for the bare desktop ('/'). */
export function parseWindowPath(pathname: string): { appId: string; slug?: string } | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  if (parts[0] === 'article') {
    // `/article` with no slug is meaningless — ignore it.
    return parts[1] ? { appId: 'article', slug: decodeURIComponent(parts[1]) } : null
  }
  return { appId: parts[0] }
}
