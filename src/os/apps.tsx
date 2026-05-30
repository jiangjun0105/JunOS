import { AboutWindow } from '@/components/windows/AboutWindow'
import type { AppDefinition, AppId } from './types'

/**
 * The app registry. To add a new launchable window:
 *   1. create a component in src/components/windows/
 *   2. add an entry here with an icon + default size
 * The desktop icon and the open/focus logic are handled for you.
 */
export const apps: Record<AppId, AppDefinition> = {
  about: {
    id: 'about',
    title: 'About me',
    icon: '☕',
    // image: '/icons/about.png', // ← drop a real 3D-render PNG in /public/icons to replace the emoji tile
    defaultSize: { width: 440, height: 340 },
    Component: AboutWindow,
  },
}

export const appList: AppDefinition[] = Object.values(apps)
