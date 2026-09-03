import type { WindowInstance } from './types'

/**
 * URL <-> window mapping. Each window has one canonical path, so the focused
 * window can be mirrored into the address bar (shareable) and pasting that link
 * back re-opens it (deep-linkable):
 *
 *   about / projects / research / files   ->  /about, /projects, ...
 *   an article                            ->  /article/<slug>
 *   a thought (or the Thoughts index)     ->  /thoughts/<slug>, /thoughts
 *   nothing focused (bare desktop)        ->  /
 *
 * Pure functions — no React, no router — so the sync logic (WindowUrlSync) and
 * any future tests can share them.
 */

/**
 * Apps that take a `/<id>/<slug>` sub-path. Shared by both directions so the
 * writer and the parser can't drift apart.
 */
const SLUG_APPS: readonly string[] = ['article', 'thoughts']

/**
 * ...and, of those, the ones whose window is MEANINGLESS without a slug, so the
 * bare path is ignored rather than opened.
 *
 * The two readers differ here, which is easy to miss: `thoughts` is a desktop
 * launcher with its own index window, so `/thoughts` is a real destination —
 * but `article` is opened indirectly (`launcher: false`) and its window renders
 * one specific article, so a bare `/article` names nothing and is treated like
 * an unknown path. Add a slug app to the list above AND decide its entry here.
 */
const SLUG_REQUIRED: readonly string[] = ['article']

/** The canonical path for a window (what the address bar shows when it's focused). */
export function pathForWindow(win: Pick<WindowInstance, 'appId' | 'params'>): string {
  if (SLUG_APPS.includes(win.appId)) {
    const slug = win.params?.slug
    if (typeof slug === 'string') return `/${win.appId}/${encodeURIComponent(slug)}`
  }
  return `/${win.appId}`
}

/** Parse a pathname into an open-intent, or null for the bare desktop ('/'). */
export function parseWindowPath(pathname: string): { appId: string; slug?: string } | null {
  const [appId, slug] = pathname.split('/').filter(Boolean)
  if (!appId) return null
  if (SLUG_APPS.includes(appId)) {
    if (slug) return { appId, slug: decodeURIComponent(slug) }
    return SLUG_REQUIRED.includes(appId) ? null : { appId }
  }
  return { appId }
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
