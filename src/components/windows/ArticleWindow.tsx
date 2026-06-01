'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { articleLoaders, getArticle } from '@/content/articles'
import type { WindowComponentProps } from '@/os/types'
import { formatKind } from './ui/formatKind'
import { TagList } from './ui/TagList'

/** Format an ISO date (YYYY-MM-DD) like "May 20, 2026"; fall back to the raw string. */
function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * A reader window that renders ONE article. The slug arrives via the window's
 * `params` (set when the File Explorer or Research index opens it). The body is an
 * .mdx module, code-split and fetched on demand — so opening a window only loads
 * that article. Metadata (date, tags) comes from the typed content index.
 */
export function ArticleWindow({ params }: WindowComponentProps) {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const meta = slug ? getArticle(slug) : undefined

  // Build (and memoize) the lazy MDX component for this slug.
  const Body = useMemo(() => {
    const loader = slug ? articleLoaders[slug] : undefined
    if (!loader) return null
    return dynamic(loader, {
      ssr: false,
      loading: () => <p className="text-muted">Loading…</p>,
    })
  }, [slug])

  if (!meta || !Body) {
    return (
      <div className="space-y-2">
        <h1 className="font-body text-[22px] font-bold">Article not found</h1>
        <p className="text-muted">No article matches “{slug ?? '—'}”.</p>
      </div>
    )
  }

  return (
    // Plain wrapper grouping the meta header + prose body. (No `.article` rule
    // exists — the styling lives on `.article-head` / `.article-prose`.)
    <div>
      <header className="article-head">
        <div className="article-meta">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          <span aria-hidden>·</span>
          <span>{formatKind(meta.kind)}</span>
        </div>
        <TagList tags={meta.tags} />
      </header>

      <article className="article-prose">
        <Body />
      </article>
    </div>
  )
}
