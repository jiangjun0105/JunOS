// URL <-> window mapping: `/<appId>`, `/article/<slug>`, `/thoughts/<slug>`, and `/` for no window.

export function pathForWindow(win: { appId: string; params?: Record<string, unknown> }): string {
  if (win.appId === 'article' || win.appId === 'thoughts') {
    const slug = win.params?.slug
    if (typeof slug === 'string') return `/${win.appId}/${encodeURIComponent(slug)}`
  }
  return `/${win.appId}`
}

/** Null for the bare desktop, and for `/article` (a reader needs a slug). */
export function parseWindowPath(pathname: string): { appId: string; slug?: string } | null {
  const [appId, slug] = pathname.split('/').filter(Boolean)
  if (!appId) return null
  if (appId === 'article' && !slug) return null
  return slug && (appId === 'article' || appId === 'thoughts')
    ? { appId, slug: decodeURIComponent(slug) }
    : { appId }
}

/** Window identity: app id plus params, independent of param key order. */
export function windowKey(appId: string, params?: Record<string, unknown>): string {
  if (!params) return appId
  return appId + JSON.stringify(Object.fromEntries(Object.entries(params).sort()))
}
