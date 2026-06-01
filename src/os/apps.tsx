import { AboutJunOSWindow } from '@/components/windows/AboutJunOSWindow'
import { AboutWindow } from '@/components/windows/AboutWindow'
import { ArticleWindow } from '@/components/windows/ArticleWindow'
import { BooksWindow } from '@/components/windows/BooksWindow'
import { EmailWindow } from '@/components/windows/EmailWindow'
import { FilesWindow } from '@/components/windows/FilesWindow'
import { ProjectsWindow } from '@/components/windows/ProjectsWindow'
import { ResearchWindow } from '@/components/windows/ResearchWindow'
import { SupportWindow } from '@/components/windows/SupportWindow'
import type { AppDefinition } from './types'

/**
 * The app registry. To add a new launchable window:
 *   1. create a component in src/components/windows/
 *   2. add an entry here with an icon + default size (and an optional `image`)
 * The desktop icon and the open/focus logic are handled for you. Set
 * `launcher: false` for a window opened indirectly (see `article`, which the
 * Research index / File Explorer open with an article slug in its params).
 *
 * Icons live in /public/icons. Spares ready for future apps: finance.png, earnings.png.
 */
const registry = {
  about: {
    id: 'about',
    title: 'About me',
    icon: '🌳', // emoji fallback if the image is unavailable
    image: '/icons/about_me.png',
    toolbar: true,
    defaultSize: { width: 520, height: 400 },
    Component: AboutWindow,
  },
  projects: {
    id: 'projects',
    title: 'Development',
    icon: '🗂️',
    image: '/icons/development.png',
    toolbar: true,
    defaultSize: { width: 500, height: 440 },
    Component: ProjectsWindow,
  },
  research: {
    id: 'research',
    title: 'Research',
    icon: '📚', // emoji fallback if the image is unavailable
    image: '/icons/research.png',
    toolbar: true,
    defaultSize: { width: 560, height: 580 },
    Component: ResearchWindow,
  },
  support: {
    id: 'support',
    title: 'Call Me',
    icon: '📞', // emoji fallback if the image is unavailable
    image: '/icons/phone-call.png',
    defaultSize: { width: 470, height: 600 },
    Component: SupportWindow,
  },
  email: {
    id: 'email',
    title: 'Email',
    icon: '✉️', // emoji fallback if the image is unavailable
    image: '/icons/email.png',
    defaultSize: { width: 540, height: 600 },
    Component: EmailWindow,
  },
  files: {
    id: 'files',
    title: 'Files',
    icon: '📁', // emoji fallback
    image: '/icons/folder.png',
    defaultSize: { width: 430, height: 560 },
    Component: FilesWindow,
  },
  books: {
    id: 'books',
    title: 'Books',
    icon: '📖', // emoji fallback if the image is unavailable
    image: '/icons/books.png',
    toolbar: true,
    defaultSize: { width: 460, height: 560 },
    Component: BooksWindow,
  },
  // Not a desktop launcher — opened from the brand menu ("About JunOS", like
  // macOS's "About This Mac"). No image: it never shows a launcher icon.
  'about-junos': {
    id: 'about-junos',
    title: 'About JunOS',
    icon: 'ℹ️', // emoji fallback (only ever seen if this window is minimized)
    toolbar: true,
    launcher: false,
    defaultSize: { width: 520, height: 420 },
    Component: AboutJunOSWindow,
  },
  // Opened from the Research index / File Explorer (not a desktop launcher); the
  // article slug is passed through the window's params.
  article: {
    id: 'article',
    title: 'Article',
    icon: '📄',
    toolbar: true,
    launcher: false,
    defaultSize: { width: 680, height: 600 },
    Component: ArticleWindow,
  },
  // `satisfies` (not `: Record<string, AppDefinition>`) keeps the precise literal
  // key set so `AppId` below can be derived from it, while STILL type-checking
  // every entry against `AppDefinition`.
} satisfies Record<string, AppDefinition>

/**
 * The closed set of valid app ids, derived straight from the registry — adding
 * an app here automatically widens `AppId`, and a typo'd id (`openApp('artcle')`)
 * is a compile error. This is the single source of truth for app ids; it lives
 * here (not in ./types) because ./types is imported by this file, so deriving it
 * there would be circular.
 */
export type AppId = keyof typeof registry

/**
 * The registry, re-exposed as `Record<AppId, AppDefinition>` so that indexing
 * (`apps[id]`) yields a full `AppDefinition` with its optional fields
 * (`image` / `toolbar` / `launcher`) intact. Indexing the bare `satisfies`
 * object would instead give a union of each entry's exact literal type, on which
 * those optional fields don't exist.
 */
export const apps: Record<AppId, AppDefinition> = registry

/**
 * Runtime guard that narrows an untrusted `string` (e.g. an app id parsed out of
 * the URL) to the closed `AppId` set — so callers like `openApp` get a checked
 * value WITHOUT an `as AppId` cast. The `in` operator confirms the key exists on
 * the registry; the `is AppId` predicate threads that proof through to the type.
 */
export function isAppId(value: string): value is AppId {
  return value in apps
}

export const appList: AppDefinition[] = Object.values(apps)
