import { AboutWindow } from '@/components/windows/AboutWindow'
import { ProjectsWindow } from '@/components/windows/ProjectsWindow'
import type { AppDefinition, AppId } from './types'

/**
 * The app registry. To add a new launchable window:
 *   1. create a component in src/components/windows/
 *   2. add an entry here with an icon + default size (and an optional `image`)
 * The desktop icon and the open/focus logic are handled for you.
 *
 * Icons live in /public/icons. Spares ready for future apps: finance.png, earnings.png.
 */
export const apps: Record<AppId, AppDefinition> = {
  about: {
    id: 'about',
    title: 'About me',
    icon: '🌳', // emoji fallback if the image is unavailable
    image: '/icons/about.png',
    defaultSize: { width: 440, height: 340 },
    Component: AboutWindow,
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    icon: '🗂️',
    image: '/icons/projects.png',
    defaultSize: { width: 440, height: 380 },
    Component: ProjectsWindow,
  },
}

export const appList: AppDefinition[] = Object.values(apps)
