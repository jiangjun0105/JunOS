import type { ComponentType } from 'react'

export type NotificationLoader = () => Promise<{ default: ComponentType }>

export interface NotificationMeta {
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  load: NotificationLoader
}

export const notifications: NotificationMeta[] = [
  {
    slug: 'notification-center-live',
    title: 'Notification Center is live',
    date: '2026-06-02',
    load: () => import('./notification-center-live.mdx'),
  },
  {
    slug: 'new-articles-may',
    title: 'New articles in May',
    date: '2026-05-20',
    load: () => import('./new-articles-may.mdx'),
  },
  {
    slug: 'site-launched',
    title: 'JunOS launched',
    date: '2026-05-01',
    load: () => import('./site-launched.mdx'),
  },
]
