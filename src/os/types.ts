import type { ComponentType } from 'react'

/** `slug` picks the document for reader windows. */
export interface WindowComponentProps {
  slug?: string
}

export interface AppDefinition {
  // Plain string: AppId is derived from the registry in apps.tsx, which imports this file.
  id: string
  title: string
  Component: ComponentType<WindowComponentProps>
}
