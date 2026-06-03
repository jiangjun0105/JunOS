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
  /** Emoji fallback, shown on a clay tile when no `image` is provided. */
  icon: string
  /** Optional path/URL to a real (e.g. 3D-rendered) icon image — shown bare with a soft shadow. */
  image?: string
  /** Show the decorative File / Edit / View / Help toolbar below the title bar. */
  toolbar?: boolean
  /** Show a desktop launcher icon + an Apps-menu entry. Default true; set false
   *  for windows that are opened indirectly (e.g. the article reader). */
  launcher?: boolean
  defaultSize:
    | { width: number; height: number }
    | ((workArea: { width: number; height: number }) => { width: number; height: number })
  /** Padding for the scrollable window body, as Tailwind utilities. Defaults to
   *  `px-10 py-4` (see Window.tsx); override to tighten a specific app's margins
   *  — e.g. Email uses less side padding so the compose form has more room. */
  bodyPadding?: string
  /** The React component rendered inside the window body. */
  Component: ComponentType<WindowComponentProps>
}

/** A live, open window on the desktop. The desktop is just an array of these. */
export interface WindowInstance {
  id: string
  // `string` (not `AppId`) for the same circular-dependency reason as
  // `AppDefinition.id` above; live windows are always created via `openApp`,
  // which already enforces the closed `AppId` set at the call site.
  appId: string
  title: string
  /** Per-window data passed to the app component (e.g. an article `{ slug }`). */
  params?: Record<string, unknown>
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
