import type { ComponentType } from 'react'

/** `params` carries per-window data, e.g. `{ slug }` for readers. */
export interface WindowComponentProps {
  params?: Record<string, unknown>
}

export interface AppDefinition {
  // Plain string: AppId is derived from the registry in apps.tsx, which imports this file.
  id: string
  title: string
  /** Deep-linkable by bare id and listed in the sitemap. Default true. */
  launcher?: boolean
  Component: ComponentType<WindowComponentProps>
}
