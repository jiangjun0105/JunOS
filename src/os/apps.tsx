import dynamic from 'next/dynamic'
import type { AppDefinition } from './types'

/**
 * The app registry. To add a new launchable window:
 *   1. create a component in src/components/windows/
 *   2. add an entry here with an icon + default size (and an optional `image`)
 * The desktop icon and the open/focus logic are handled for you. Set
 * `launcher: false` for a window opened indirectly (see `article`, which the
 * Research index / File Explorer open with an article slug in its params).
 *
 * Each window body is loaded with `next/dynamic`, so opening the desktop pulls in
 * only the registry metadata — every app's code is code-split and fetched on first
 * launch. (No `ssr: false`: OSRoot is a Client Component, so windows only ever
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
 * Icons live in /public/icons. Spares ready for future apps: finance.png, earnings.png.
 */
const registry = {
  about: {
    title: 'About me',
    icon: '🌳', // emoji fallback if the image is unavailable
    image: '/icons/about_me.png',
    toolbar: true,
    defaultSize: { width: 520, height: 400 },
    Component: dynamic(
      () => import('@/components/windows/AboutWindow').then((m) => m.AboutWindow)
    ),
  },
  projects: {
    title: 'Development',
    icon: '🗂️',
    image: '/icons/development.png',
    toolbar: true,
    defaultSize: { width: 500, height: 440 },
    Component: dynamic(
      () => import('@/components/windows/ProjectsWindow').then((m) => m.ProjectsWindow)
    ),
  },
  research: {
    title: 'Research',
    icon: '📚', // emoji fallback if the image is unavailable
    image: '/icons/research.png',
    toolbar: true,
    defaultSize: { width: 560, height: 580 },
    Component: dynamic(
      () => import('@/components/windows/ResearchWindow').then((m) => m.ResearchWindow)
    ),
  },
  support: {
    title: 'Call Me',
    icon: '📞', // emoji fallback if the image is unavailable
    image: '/icons/phone-call.png',
    defaultSize: { width: 470, height: 600 },
    Component: dynamic(
      () => import('@/components/windows/SupportWindow').then((m) => m.SupportWindow)
    ),
  },
  email: {
    title: 'Email',
    icon: '✉️', // emoji fallback if the image is unavailable
    image: '/icons/email.png',
    defaultSize: { width: 540, height: 600 },
    bodyPadding: 'px-5 py-2',
    Component: dynamic(
      () => import('@/components/windows/EmailWindow').then((m) => m.EmailWindow)
    ),
  },
  files: {
    title: 'Files',
    icon: '📁', // emoji fallback
    image: '/icons/folder.png',
    defaultSize: { width: 430, height: 560 },
    Component: dynamic(
      () => import('@/components/windows/FilesWindow').then((m) => m.FilesWindow)
    ),
  },
  books: {
    title: 'Books',
    icon: '📖', // emoji fallback if the image is unavailable
    image: '/icons/books.png',
    toolbar: true,
    defaultSize: { width: 460, height: 560 },
    Component: dynamic(
      () => import('@/components/windows/BooksWindow').then((m) => m.BooksWindow)
    ),
  },
  // Not a desktop launcher — opened from the brand menu ("About JunOS", like
  // macOS's "About This Mac"). No image: it never shows a launcher icon.
  'about-junos': {
    title: 'About JunOS',
    icon: 'ℹ️', // emoji fallback (only ever seen if this window is minimized)
    toolbar: true,
    launcher: false,
    defaultSize: { width: 520, height: 420 },
    Component: dynamic(
      () => import('@/components/windows/AboutJunOSWindow').then((m) => m.AboutJunOSWindow)
    ),
  },
  // Opened from the Research index / File Explorer (not a desktop launcher); the
  // article slug is passed through the window's params.
  article: {
    title: 'Article',
    icon: '📄',
    toolbar: true,
    launcher: false,
    defaultSize: { width: 680, height: 600 },
    Component: dynamic(
      () => import('@/components/windows/ArticleWindow').then((m) => m.ArticleWindow)
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
 * iterate (desktop launchers, the Apps menu).
 */
export const appList: AppDefinition[] = Object.entries(registry).map(([id, def]) => ({
  id,
  ...def,
}))

/**
 * The registry, re-exposed as `Record<AppId, AppDefinition>` so that indexing
 * (`apps[id]`) yields a full `AppDefinition` — including the synthesized `id` and
 * the optional fields (`image` / `toolbar` / `launcher`). Built from `appList`
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

/**
 * The single source of truth for "is this app a desktop launcher". An app shows a
 * desktop icon + an Apps-menu entry unless it opts out with `launcher: false`
 * (windows opened indirectly, e.g. the article reader / About JunOS). Centralized
 * here so the predicate can't drift between the desktop, the menu bar, and the URL
 * sync — all of which previously inlined the same `launcher !== false` check.
 */
export const launchableApps: AppDefinition[] = appList.filter((app) => app.launcher !== false)

/** Predicate form of {@link launchableApps}, for when you have an id (not the app). */
export function isLaunchable(id: AppId): boolean {
  return apps[id]?.launcher !== false
}
