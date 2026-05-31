'use client'

import { sectionsByKind, type ArticleKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'

/** Top-level groups, shown in this order. */
const KINDS: ArticleKind[] = ['research', 'personal']

/**
 * The "Research" app — an index of every article, grouped by section (the same
 * two-layer structure as the File Explorer). Clicking a card opens that article
 * in its own reader window. Data-driven from src/content/articles, so new .mdx
 * files appear here automatically.
 */
export function ResearchWindow() {
  const { openApp } = useWindows()

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-body text-[22px] font-bold">Writing &amp; Research</h1>
        <p className="text-[18px] text-muted">Notes about my work and myself. Click one to open it.</p>
      </div>

      {KINDS.flatMap((kind) =>
        sectionsByKind(kind).map((section) => (
          <section key={`${kind}:${section.name}`} className="space-y-2">
            <h2 className="font-body text-sm font-bold uppercase tracking-wide text-muted">
              {section.name}
            </h2>
            <ul className="space-y-2">
              {section.articles.map((a) => (
                <li key={a.slug}>
                  <button
                    type="button"
                    className="article-card"
                    onClick={() => openApp('article', { params: { slug: a.slug }, title: a.title })}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body font-bold">{a.title}</span>
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
          </section>
        ))
      )}
    </div>
  )
}
