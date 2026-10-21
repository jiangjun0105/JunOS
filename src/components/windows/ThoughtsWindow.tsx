'use client'

import { getDoc } from '@/content'
import { thoughts } from '@/content/thoughts'
import { useWindows } from '@/os/WindowManager'
import type { WindowComponentProps } from '@/os/types'
import { ArticleCard } from './ui/ArticleCard'
import { MdxReader, formatDate } from './ui/MdxReader'
import { WindowHeader } from './ui/WindowHeader'

export function ThoughtsWindow({ slug }: WindowComponentProps) {
  const { openApp } = useWindows()

  if (slug) {
    return (
      <div>
        <button
          type="button"
          className="os-nav-btn mb-3 !w-auto px-2 text-xs"
          onClick={() => openApp('thoughts')}
        >
          All thoughts
        </button>
        <MdxReader noun="Thought" slug={slug} meta={getDoc('thoughts', slug)} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <WindowHeader
        title="Thoughts"
        subtitle="Ten essays on coding with AI, next-generation models, learning, health, and how I make decisions. They share one spine — start from something that works and extend it — which the first one names."
      />
      <ul className="space-y-2">
        {thoughts.map((t) => (
          <li key={t.slug}>
            <ArticleCard
              title={t.title}
              summary={t.summary}
              onClick={() => openApp('thoughts', { slug: t.slug })}
              aside={<span className="text-xs text-muted">{formatDate(t.date)}</span>}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
