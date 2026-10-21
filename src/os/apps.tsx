import dynamic from 'next/dynamic'
import { APPS } from '@/city/landmarks'
import type { AppDefinition } from './types'

// To add an app: create a window in src/components/windows/, add it here, and give it a
// landmark (same id) in src/city/landmarks.js, which also supplies its title.
// Windows with no landmark aren't launchable (no bare-id deep link or sitemap entry) and set their own `title`.
// Bodies are code-split with next/dynamic so the registry itself stays light.
const registry = {
  about: {
    Component: dynamic(() => import('@/components/windows/AboutWindow').then((m) => m.AboutWindow)),
  },
  support: {
    Component: dynamic(() =>
      import('@/components/windows/SupportWindow').then((m) => m.SupportWindow),
    ),
  },
  thoughts: {
    Component: dynamic(() =>
      import('@/components/windows/ThoughtsWindow').then((m) => m.ThoughtsWindow),
    ),
  },
  projects: {
    Component: dynamic(() =>
      import('@/components/windows/ProjectsWindow').then((m) => m.ProjectsWindow),
    ),
  },
  research: {
    Component: dynamic(() =>
      import('@/components/windows/ResearchWindow').then((m) => m.ResearchWindow),
    ),
  },
  email: {
    Component: dynamic(() => import('@/components/windows/EmailWindow').then((m) => m.EmailWindow)),
  },
  books: {
    Component: dynamic(() => import('@/components/windows/BooksWindow').then((m) => m.BooksWindow)),
  },
  files: {
    Component: dynamic(() => import('@/components/windows/FilesWindow').then((m) => m.FilesWindow)),
  },
  article: {
    title: 'Article',
    Component: dynamic(() =>
      import('@/components/windows/ArticleWindow').then((m) => m.ArticleWindow),
    ),
  },
  notification: {
    title: 'Notification',
    Component: dynamic(() =>
      import('@/components/windows/NotificationWindow').then((m) => m.NotificationWindow),
    ),
  },
} satisfies Record<string, Omit<AppDefinition, 'id' | 'title'> & { title?: string }>

export type AppId = keyof typeof registry

const landmarkTitle = new Map(APPS.map((a) => [a.id, a.label]))

export const appList = (Object.keys(registry) as AppId[]).map((id) => {
  const def = registry[id]
  return {
    id,
    ...def,
    title: ('title' in def ? def.title : undefined) ?? landmarkTitle.get(id) ?? id,
  }
}) satisfies AppDefinition[]

export const apps = Object.fromEntries(appList.map((app) => [app.id, app])) as Record<
  AppId,
  AppDefinition
>

/** Narrows an untrusted string (e.g. from the URL) to a registered app id. */
export function isAppId(value: string): value is AppId {
  return value in apps
}

/** Deep-linkable by its bare id (`/about`): apps with a landmark; readers need a slug. */
export function isLaunchable(id: AppId): boolean {
  return landmarkTitle.has(id)
}
