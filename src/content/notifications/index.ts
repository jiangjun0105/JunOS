import type { ComponentType } from 'react'

export type NotificationLoader = () => Promise<{ default: ComponentType }>

export interface NotificationMeta {
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Short blurb shown in the notification card. */
  summary: string
  /** Long MDX body shown in the reader window. If absent, clicking does nothing. */
  load?: NotificationLoader
}

export const notifications: NotificationMeta[] = [
  {
    slug: 'notification-center-live',
    title: 'Notification Center is live',
    date: '2026-06-02',
    summary: 'Click the bell icon any time to see what\'s new on this site.',
    load: () => import('./notification-center-live.mdx'),
  },
  {
    slug: 'new-articles-may',
    title: 'New articles in May',
    date: '2026-05-20',
    summary: 'Three new research notes landed — attention, positional encodings, and KV caches.',
    load: () => import('./new-articles-may.mdx'),
  },
  {
    slug: 'site-launched',
    title: 'JunOS launched',
    date: '2026-05-01',
    summary: 'Welcome to JunOS — a tiny desktop OS in your browser.',
    load: () => import('./site-launched.mdx'),
  },
]

export const notificationLoaders: Record<string, NotificationLoader> = Object.fromEntries(
  notifications.filter((n) => n.load).map((n) => [n.slug, n.load!]),
)

export function getNotification(slug: string): NotificationMeta | undefined {
  return notifications.find((n) => n.slug === slug)
}
