import type { DocMeta } from '../articles'

/** The notification feed — Jun's changelog for this site. Newest first. */
export const notifications: DocMeta[] = [
  {
    slug: 'site-relaunched',
    title: 'Site relaunched with real content',
    date: '2026-09-05',
    summary:
      'Every placeholder is gone: About, Research, Development, Thoughts and Books are now written from my own notes — and you can call my AI double.',
    load: () => import('./site-relaunched.mdx'),
  },
]
