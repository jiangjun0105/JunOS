import type { ComponentType } from 'react'

export type ThoughtLoader = () => Promise<{ default: ComponentType }>

export interface ThoughtMeta {
  slug: string
  title: string
  date: string
  summary: string
  load: ThoughtLoader
}

export const thoughts: ThoughtMeta[] = [
  {
    slug: '20-watts-vs-megawatts',
    title: '20 Watts of Carbon vs. Megawatts of Silicon',
    date: '2026-06-03',
    summary: 'Why modern AI is trapped in a local minimum, and the paradigm shift that breaks out.',
    load: () => import('./20-watts-vs-megawatts.mdx'),
  },
  {
    slug: 'on-simplicity',
    title: 'On Simplicity',
    date: '2026-05-28',
    summary: 'Why the simplest version is usually the hardest to reach.',
    load: () => import('./on-simplicity.mdx'),
  },
  {
    slug: 'late-night-debugging',
    title: 'Late-Night Debugging',
    date: '2026-05-15',
    summary: 'There is a particular clarity that only shows up past midnight.',
    load: () => import('./late-night-debugging.mdx'),
  },
]

export const thoughtLoaders: Record<string, ThoughtLoader> = Object.fromEntries(
  thoughts.map((t) => [t.slug, t.load]),
)

export function getThought(slug: string): ThoughtMeta | undefined {
  return thoughts.find((t) => t.slug === slug)
}
