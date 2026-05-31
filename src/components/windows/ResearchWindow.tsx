'use client'

import { articles } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'

/**
 * The "Research" app — an index of every article. Clicking a card opens that
 * article in its own reader window (passing the slug + title through params).
 * The list is data-driven from src/content/articles, so new .mdx files show up
 * here automatically.
 */
export function ResearchWindow() {
  const { openApp } = useWindows()

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold">Writing &amp; Research</h1>
      <p className="text-muted">Notes about my work and myself. Click one to open it.</p>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.slug}>
            <button
              type="button"
              className="article-card"
              onClick={() => openApp('article', { params: { slug: a.slug }, title: a.title })}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold">{a.title}</span>
                <span className="article-card-kind">{a.kind}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{a.summary}</p>
              {a.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {a.tags.map((t) => (
                    <span key={t} className="article-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
