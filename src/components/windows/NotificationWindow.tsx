'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { getNotification, notificationLoaders } from '@/content/notifications'
import type { WindowComponentProps } from '@/os/types'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function NotificationWindow({ params }: WindowComponentProps) {
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const meta = slug ? getNotification(slug) : undefined

  const Body = useMemo(() => {
    const loader = slug ? notificationLoaders[slug] : undefined
    if (!loader) return null
    return dynamic(loader, {
      ssr: false,
      loading: () => <p className="text-muted">Loading…</p>,
    })
  }, [slug])

  if (!meta) {
    return (
      <div className="space-y-2">
        <h1 className="font-body text-[22px] font-bold">Notification not found</h1>
        <p className="text-muted">No notification matches &ldquo;{slug ?? '—'}&rdquo;.</p>
      </div>
    )
  }

  return (
    <div>
      <header className="article-head">
        <div className="article-meta">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
        </div>
      </header>

      <p className="mb-4 text-[15px] font-medium text-ink">{meta.summary}</p>

      {Body && (
        <article className="article-prose">
          <Body />
        </article>
      )}
    </div>
  )
}
