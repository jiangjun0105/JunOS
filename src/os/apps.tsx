import { AboutWindow } from '@/components/windows/AboutWindow'
import { ArticleWindow } from '@/components/windows/ArticleWindow'
import { FilesWindow } from '@/components/windows/FilesWindow'
import { ProjectsWindow } from '@/components/windows/ProjectsWindow'
import { ResearchWindow } from '@/components/windows/ResearchWindow'
import { SupportWindow } from '@/components/windows/SupportWindow'
import type { AppDefinition, AppId } from './types'

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
export const apps: Record<AppId, AppDefinition> = {
  about: {
    id: 'about',
    title: 'About me',
    icon: '🌳', // emoji fallback if the image is unavailable
    image: '/icons/about.png',
    toolbar: true,
    defaultSize: { width: 440, height: 340 },
    Component: AboutWindow,
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    icon: '🗂️',
    image: '/icons/projects.png',
    toolbar: true,
    defaultSize: { width: 440, height: 380 },
    Component: ProjectsWindow,
  },
  research: {
    id: 'research',
    title: 'Research',
    icon: '📚', // emoji fallback if the image is unavailable
    image: '/icons/research.png',
    toolbar: true,
    defaultSize: { width: 480, height: 420 },
    Component: ResearchWindow,
  },
  support: {
    id: 'support',
    title: 'Call Me',
    icon: '📞', // emoji fallback if the image is unavailable
    image: '/icons/phone-call.png',
    defaultSize: { width: 320, height: 360 },
    Component: SupportWindow,
  },
  files: {
    id: 'files',
    title: 'Files',
    icon: '📁', // emoji fallback
    image: '/icons/folder.svg',
    defaultSize: { width: 300, height: 360 },
    Component: FilesWindow,
  },
  // Opened from the Research index / File Explorer (not a desktop launcher); the
  // article slug is passed through the window's params.
  article: {
    id: 'article',
    title: 'Article',
    icon: '📄',
    toolbar: true,
    launcher: false,
    defaultSize: { width: 560, height: 520 },
    Component: ArticleWindow,
  },
}

export const appList: AppDefinition[] = Object.values(apps)
