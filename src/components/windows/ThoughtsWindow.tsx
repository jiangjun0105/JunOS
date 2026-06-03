'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { thoughts, thoughtLoaders, getThought } from '@/content/thoughts'
import type { WindowComponentProps } from '@/os/types'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function syncUrl(slug: string | null) {
  if (typeof window === 'undefined') return
  const desired = slug ? `/thoughts/${encodeURIComponent(slug)}` : '/thoughts'
  if (window.location.pathname !== desired) {
    window.history.replaceState(window.history.state, '', desired)
  }
}

export function ThoughtsWindow({ params }: WindowComponentProps) {
  const initialSlug = typeof params?.slug === 'string' ? params.slug : null
  const [history, setHistory] = useState<string[]>(initialSlug ? [initialSlug] : [])
  const [historyIndex, setHistoryIndex] = useState(initialSlug ? 0 : -1)

  const currentSlug = historyIndex >= 0 ? history[historyIndex] : null

  useEffect(() => {
    syncUrl(currentSlug)
  }, [currentSlug])

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  const openThought = useCallback(
    (slug: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(slug)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const goBack = useCallback(() => {
    if (canGoBack) setHistoryIndex(historyIndex - 1)
  }, [canGoBack, historyIndex])

  const goForward = useCallback(() => {
    if (canGoForward) setHistoryIndex(historyIndex + 1)
  }, [canGoForward, historyIndex])

  const goHome = useCallback(() => {
    setHistory([])
    setHistoryIndex(-1)
  }, [])

  if (currentSlug) {
    return (
      <ThoughtDetail
        slug={currentSlug}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={goBack}
        onForward={goForward}
        onHome={goHome}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <h1 className="font-body text-lg font-bold">Thoughts</h1>
        <p className="text-sm text-muted">Short reflections and half-formed ideas.</p>
      </div>
      <ul className="space-y-2">
        {thoughts.map((t) => (
          <li key={t.slug}>
            <button
              type="button"
              className="os-card os-card-button"
              onClick={() => openThought(t.slug)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-body font-bold">{t.title}</span>
                <span className="text-xs text-muted">{formatDate(t.date)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{t.summary}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ThoughtDetail({
  slug,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onHome,
}: {
  slug: string
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onForward: () => void
  onHome: () => void
}) {
  const meta = getThought(slug)

  const Body = useMemo(() => {
    const loader = thoughtLoaders[slug]
    if (!loader) return null
    return dynamic(loader, {
      ssr: false,
      loading: () => <p className="text-muted">Loading…</p>,
    })
  }, [slug])

  if (!meta || !Body) {
    return <p className="text-muted">Thought not found.</p>
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1">
        <button
          type="button"
          className="os-nav-btn"
          disabled={!canGoBack}
          onClick={onBack}
          aria-label="Go back"
          title="Back"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <button
          type="button"
          className="os-nav-btn"
          disabled={!canGoForward}
          onClick={onForward}
          aria-label="Go forward"
          title="Forward"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
        <button
          type="button"
          className="os-nav-btn ml-1 !w-auto px-2 text-xs"
          onClick={onHome}
        >
          All thoughts
        </button>
      </div>

      <header className="article-head">
        <div className="article-meta">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
        </div>
      </header>

      <article className="article-prose">
        <Body />
      </article>
    </div>
  )
}
