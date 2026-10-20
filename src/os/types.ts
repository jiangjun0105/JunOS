import type { ComponentType } from 'react'

/**
 * Props every window-body component receives. `params` carries per-window data —
 * e.g. which article a reader window should render (`{ slug }`).
 */
export interface WindowComponentProps {
  params?: Record<string, unknown>
}

/**
 * A registered "application" that can be launched into a window.
 * Add new apps in src/os/apps.tsx.
 */
export interface AppDefinition {
  // Loose `string` here (rather than `AppId`) is deliberate: `AppId` is derived
  // from the `apps` registry (`keyof typeof apps`), and `apps.tsx` imports this
  // type — so referencing `AppId` here would be a circular dependency. The
  // strict, closed-set typing lives at the call boundaries (e.g. `openApp`).
  id: string
  title: string
  /** Deep-linkable by its bare id and listed in the sitemap. Default true; false
   *  for windows that are opened indirectly (e.g. the article reader). */
  launcher?: boolean
  /** The React component rendered inside the window body. */
  Component: ComponentType<WindowComponentProps>
}
