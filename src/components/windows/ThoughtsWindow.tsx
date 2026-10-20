'use client'

import { thoughts, getThought } from '@/content/thoughts'
import { useWindows } from '@/os/WindowManager'
import type { WindowComponentProps } from '@/os/types'
import { ArticleCard } from './ui/ArticleCard'
import { MdxReader, formatDate } from './ui/MdxReader'

export function ThoughtsWindow({ params }: WindowComponentProps) {
  const { openApp } = useWindows()
  const slug = typeof params?.slug === 'string' ? params.slug : undefined

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
        <MdxReader noun="Thought" slug={slug} meta={getThought(slug)} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <h1 className="font-body text-lg font-bold">Thoughts</h1>
        <p className="text-sm text-muted">
          Ten essays on coding with AI, next-generation models, learning, health, and how I make
          decisions. They share one spine — start from something that works and extend it — which
          the first one names.
        </p>
      </div>
      <ul className="space-y-2">
        {thoughts.map((t) => (
          <li key={t.slug}>
            <ArticleCard
              title={t.title}
              summary={t.summary}
              onClick={() => openApp('thoughts', { params: { slug: t.slug } })}
              aside={<span className="text-xs text-muted">{formatDate(t.date)}</span>}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
