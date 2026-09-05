import type { ComponentType } from 'react'

/**
 * The notification feed — Jun's changelog for this site. Newest first; the bell
 * in the menu bar renders these in order, and a card is clickable when it has a
 * `load` body.
 */
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
    slug: 'site-relaunched',
    title: 'Site relaunched with real content',
    date: '2026-09-05',
    summary:
      'Every placeholder is gone: About, Research, Development, Thoughts and Books are now written from my own notes — and you can call my AI double.',
    load: () => import('./site-relaunched.mdx'),
  },
]

export const notificationLoaders: Record<string, NotificationLoader> = Object.fromEntries(
  notifications.filter((n) => n.load).map((n) => [n.slug, n.load!]),
)

export function getNotification(slug: string): NotificationMeta | undefined {
  return notifications.find((n) => n.slug === slug)
}
