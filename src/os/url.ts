// URL <-> window mapping: `/<appId>`, `/article/<slug>`, `/thoughts/<slug>`, and `/` for no window.

export function pathForWindow(win: { appId: string; slug?: string }): string {
  if (win.slug && (win.appId === 'article' || win.appId === 'thoughts'))
    return `/${win.appId}/${encodeURIComponent(win.slug)}`
  return `/${win.appId}`
}

/** Null for the bare desktop. */
export function parseWindowPath(pathname: string): { appId: string; slug?: string } | null {
  const [appId, slug] = pathname.split('/').filter(Boolean)
  if (!appId) return null
  return slug && (appId === 'article' || appId === 'thoughts')
    ? { appId, slug: decodeURIComponent(slug) }
    : { appId }
}

/** Window identity: app id plus slug. */
export function windowKey(appId: string, slug?: string): string {
  return `${appId}/${slug ?? ''}`
}
