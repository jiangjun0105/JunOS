import type { ComponentType } from 'react'

export type AppId = string

/**
 * A registered "application" that can be launched into a window.
 * Add new apps in src/os/apps.tsx.
 */
export interface AppDefinition {
  id: AppId
  title: string
  /** Emoji fallback, shown on a clay tile when no `image` is provided. */
  icon: string
  /** Optional path/URL to a real (e.g. 3D-rendered) icon image — shown bare with a soft shadow. */
  image?: string
  /** Show the decorative File / Edit / View / Help toolbar below the title bar. */
  toolbar?: boolean
  defaultSize: { width: number; height: number }
  /** The React component rendered inside the window body. */
  Component: ComponentType
}

/** A live, open window on the desktop. The desktop is just an array of these. */
export interface WindowInstance {
  id: string
  appId: AppId
  title: string
  /** Stacking order. Highest zIndex == the focused window (focus is derived from this). */
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
  /** Hidden from the desktop (still open, parked in the taskbar). */
  minimized: boolean
  /** Filling the desktop work area (between the menu bar and taskbar). */
  maximized: boolean
  /** Position + size to restore to when un-maximizing. */
  prevRect?: {
    position: { x: number; y: number }
    size: { width: number; height: number }
  }
}
