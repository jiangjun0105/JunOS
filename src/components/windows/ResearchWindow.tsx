'use client'

import { sectionsByKind, type ArticleKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { formatKind } from './ui/formatKind'
import { TagList } from './ui/TagList'
import { WindowHeader } from './ui/WindowHeader'

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
      <WindowHeader
        title="Writing & Research"
        subtitle="Notes about my work and myself. Click one to open it."
      />

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
                    className="os-card os-card-button"
                    onClick={() => openApp('article', { params: { slug: a.slug }, title: a.title })}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body font-bold">{a.title}</span>
                      <span className="os-pill">{formatKind(a.kind)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{a.summary}</p>
                    <TagList tags={a.tags} className="mt-1.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )),
      )}
    </div>
  )
}
