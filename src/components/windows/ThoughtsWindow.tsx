'use client'

import type { CSSProperties } from 'react'
import { getDoc } from '@/content'
import { thoughts, type ThoughtMeta } from '@/content/thoughts'
import { useWindows } from '@/os/WindowManager'
import type { WindowComponentProps } from '@/os/types'
import { MdxReader } from './ui/MdxReader'

/** Label and theme.css colour token per topic; the token feeds the spine's --t. */
const TOPIC: Record<ThoughtMeta['topic'], { label: string; token: string }> = {
  core: { label: 'Core', token: 'accent' },
  ai: { label: 'AI · Work', token: 'cyan' },
  brains: { label: 'Brains', token: 'accent-2' },
  learning: { label: 'Learning', token: 'violet' },
  decisions: { label: 'Decisions', token: 'accent-3' },
  health: { label: 'Health', token: 'pink' },
}

// Inline rather than a class: Tailwind would purge a class name built at runtime.
const tint = (t: ThoughtMeta) => ({ '--t': `var(--${TOPIC[t.topic].token})` }) as CSSProperties

/** "TH-03 · 2026-09-04 · 3 min" — index is the essay's place on the spine. */
function metaLine(t: ThoughtMeta, i: number) {
  return `TH-${String(i).padStart(2, '0')} · ${t.date} · ${t.minutes} min`
}

/** Thoughts index: the first essay is the root of a spine, the rest branch off it in reading order. */
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

  const open = (t: ThoughtMeta) => openApp('thoughts', { slug: t.slug })
  const [root, ...rest] = thoughts

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Essays on coding with AI, next-generation models, learning, health, and how I make
        decisions. They share one spine — start from something that works and extend it.
      </p>

      <div className="spine">
        <button
          type="button"
          className="spine-card spine-root"
          style={tint(root)}
          onClick={() => open(root)}
        >
          <span className="font-display text-xs font-semibold uppercase tracking-widest">
            Start here
          </span>
          <span className="mt-1 block font-body text-lg font-bold">{root.title}</span>
          <span className="mt-1 block text-sm opacity-85">{root.summary}</span>
          <span className="mt-1.5 block font-mono text-[11px] uppercase opacity-80">
            {metaLine(root, 0)}
          </span>
        </button>

        <ul>
          {rest.map((t, i) => (
            <li key={t.slug} className={`spine-row ${i % 2 ? 'right' : ''}`} style={tint(t)}>
              <button type="button" className="spine-card" onClick={() => open(t)}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-body font-bold text-ink">{t.title}</span>
                  <span className="spine-tag">{TOPIC[t.topic].label}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{t.summary}</span>
                <span className="mt-1.5 block font-mono text-[11px] uppercase text-[rgb(var(--t))]">
                  {metaLine(t, i + 1)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
