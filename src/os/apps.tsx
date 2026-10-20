import dynamic from 'next/dynamic'
import type { AppDefinition } from './types'

/**
 * The app registry. To add a new launchable window:
 *   1. create a component in src/components/windows/
 *   2. add an entry here
 *   3. give it a landmark in src/city/landmarks.js (same id)
 * Set `launcher: false` for a window opened indirectly (see `article`, which the
 * Research index / File Explorer open with an article slug in its params).
 *
 * Each window body is loaded with `next/dynamic`, so opening the desktop pulls in
 * only the registry metadata — every app's code is code-split and fetched on first
 * launch. (No `ssr: false`: the desktop is a Client Component, so windows only ever
 * render client-side anyway, and `ssr: false` is disallowed now that a Server
 * Component — the catch-all page — imports this registry for static params.)
 * This also decouples the `os/` core from the leaf window components: nothing here
 * statically imports them, it just names a loader.
 * (Same pattern the article reader already uses for its per-slug MDX bodies.)
 *
 * The `id` is NOT stored on each literal: it's the registry KEY, and repeating it
 * would let the two drift. It's synthesized once below (`appList` / `apps`) from
 * `Object.entries`, so an entry's `id` is guaranteed to equal its key.
 *
 * Launchers first; non-launcher windows (`launcher: false`) last.
 */
const registry = {
  about: {
    title: 'About me',
    Component: dynamic(
      () => import('@/components/windows/AboutWindow').then((m) => m.AboutWindow)
    ),
  },
  support: {
    title: 'Call Me',
    Component: dynamic(
      () => import('@/components/windows/SupportWindow').then((m) => m.SupportWindow)
    ),
  },
  thoughts: {
    title: 'Thoughts',
    Component: dynamic(
      () => import('@/components/windows/ThoughtsWindow').then((m) => m.ThoughtsWindow)
    ),
  },
  projects: {
    title: 'Development',
    Component: dynamic(
      () => import('@/components/windows/ProjectsWindow').then((m) => m.ProjectsWindow)
    ),
  },
  research: {
    title: 'Research',
    Component: dynamic(
      () => import('@/components/windows/ResearchWindow').then((m) => m.ResearchWindow)
    ),
  },
  email: {
    title: 'Email',
    Component: dynamic(
      () => import('@/components/windows/EmailWindow').then((m) => m.EmailWindow)
    ),
  },
  books: {
    title: 'Books',
    Component: dynamic(
      () => import('@/components/windows/BooksWindow').then((m) => m.BooksWindow)
    ),
  },
  files: {
    title: 'Files',
    Component: dynamic(
      () => import('@/components/windows/FilesWindow').then((m) => m.FilesWindow)
    ),
  },
  // Opened from the Research index / File Explorer (not a desktop launcher); the
  // article slug is passed through the window's params.
  article: {
    title: 'Article',
    launcher: false,
    Component: dynamic(
      () => import('@/components/windows/ArticleWindow').then((m) => m.ArticleWindow)
    ),
  },
  // Opened from the Notification panel or File Explorer; the notification slug
  // is passed through the window's params.
  notification: {
    title: 'Notification',
    launcher: false,
    Component: dynamic(
      () =>
        import('@/components/windows/NotificationWindow').then((m) => m.NotificationWindow)
    ),
  },
  // `satisfies` (not `: Record<string, AppDefinition>`) keeps the precise literal
  // key set so `AppId` below can be derived from it, while STILL type-checking
  // every entry against `AppDefinition`. (Each literal omits `id`; it's added
  // back below — `AppDefinition` still declares `id`, so the entries satisfy a
  // *partial* of it. We assert the full shape on `apps`/`appList` once `id` is on.)
} satisfies Record<string, Omit<AppDefinition, 'id'>>

/**
 * The closed set of valid app ids, derived straight from the registry — adding
 * an app here automatically widens `AppId`, and a typo'd id (`openApp('artcle')`)
 * is a compile error. This is the single source of truth for app ids; it lives
 * here (not in ./types) because ./types is imported by this file, so deriving it
 * there would be circular.
 */
export type AppId = keyof typeof registry

/**
 * The registry as an array of full `AppDefinition`s, with each entry's `id`
 * synthesized from its key (so `id` can never drift from the key it's filed
 * under). This — not the bare `registry` — is the id-bearing source consumers
 * iterate (static params, the sitemap).
 */
export const appList: AppDefinition[] = Object.entries(registry).map(([id, def]) => ({
  id,
  ...def,
}))

/**
 * The registry, re-exposed as `Record<AppId, AppDefinition>` so that indexing
 * (`apps[id]`) yields a full `AppDefinition` — including the synthesized `id` and
 * the optional `launcher`. Built from `appList`
 * (rather than aliasing the bare `satisfies` object) so the `id` is present at
 * runtime too, and so indexing yields one `AppDefinition` instead of a union of
 * each entry's exact literal type (on which the optional fields wouldn't exist).
 */
export const apps: Record<AppId, AppDefinition> = Object.fromEntries(
  appList.map((app) => [app.id, app]),
) as Record<AppId, AppDefinition>

/**
 * Runtime guard that narrows an untrusted `string` (e.g. an app id parsed out of
 * the URL) to the closed `AppId` set — so callers like `openApp` get a checked
 * value WITHOUT an `as AppId` cast. The `in` operator confirms the key exists on
 * the registry; the `is AppId` predicate threads that proof through to the type.
 */
export function isAppId(value: string): value is AppId {
  return value in apps
}

/** Is this app deep-linkable by its bare id (`/about`)? Everything but `launcher: false` windows (e.g. the article reader). */
export function isLaunchable(id: AppId): boolean {
  return apps[id]?.launcher !== false
}
