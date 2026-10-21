'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { MdxLoader } from '@/content/articles'
import { TagList } from './TagList'

/** Format an ISO date (YYYY-MM-DD) like "May 20, 2026"; fall back to the raw string. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface MdxReaderProps {
  /** Shown in the not-found message, e.g. "Article". */
  noun: string
  slug?: string
  /** Undefined renders the not-found message. */
  meta?: { date: string; load: MdxLoader; kind?: string; tags?: string[] }
  /** Optional blurb between the header and the body. */
  lead?: string
}

/** Header (date, kind, tags) plus a lazily loaded MDX body. */
export function MdxReader({ noun, slug, meta, lead }: MdxReaderProps) {
  const load = meta?.load
  // Code-split: the body is fetched only when its reader opens.
  const Body = useMemo(
    () =>
      load
        ? dynamic(load, { ssr: false, loading: () => <p className="text-muted">Loading…</p> })
        : null,
    [load],
  )

  if (!meta || !Body) {
    return (
      <div className="space-y-2">
        <h1 className="font-body text-title font-bold">{noun} not found</h1>
        <p className="text-muted">
          No {noun.toLowerCase()} matches “{slug ?? '—'}”.
        </p>
      </div>
    )
  }

  return (
    <div>
      <header className="article-head">
        <div className="article-meta">
          <span className="article-meta-key">LOG</span>
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          {meta.kind && (
            <>
              <span aria-hidden>·</span>
              <span className="capitalize">{meta.kind}</span>
            </>
          )}
        </div>
        {meta.tags && <TagList tags={meta.tags} />}
      </header>

      {lead && <p className="mb-4 text-ui font-medium text-ink">{lead}</p>}

      <article className="article-prose">
        <Body />
      </article>
    </div>
  )
}
