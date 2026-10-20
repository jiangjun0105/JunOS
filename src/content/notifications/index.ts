import type { MdxLoader } from '../articles'

/**
 * The notification feed — Jun's changelog for this site. Newest first.
 */
export interface NotificationMeta {
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  /** Short blurb shown in the notification card. */
  summary: string
  /** Long MDX body shown in the reader window. */
  load: MdxLoader
}

export const notifications: NotificationMeta[] = [
  {
    slug: 'site-relaunched',
    title: 'Site relaunched with real content',
    date: '2026-09-05',
    summary:
      'Every placeholder is gone: About, Research, Development, Thoughts and Books are now written from my own notes — and you can call my AI double.',
    load: () => import('./site-relaunched.mdx'),
  },
]

export function getNotification(slug: string): NotificationMeta | undefined {
  return notifications.find((n) => n.slug === slug)
}
