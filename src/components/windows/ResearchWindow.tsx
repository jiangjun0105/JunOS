'use client'

import { sectionsByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { TagList } from './ui/TagList'
import { WindowHeader } from './ui/WindowHeader'

/**
 * The ideas the three research stages add up to — the short version of
 * kb/refined/research/INDEX.md's "ideas underneath" list. Shown above the cards
 * as an orientation block; each card below is the long form of one or more of
 * these.
 */
const IDEAS: string[] = [
  'Learn the principles, not the mechanism — we don’t build airplanes that flap.',
  'Indirect observation: build a model of how the thing works, then design the cheap experiment.',
  'The hierarchy of sciences bottoms out in math, so the brain is a math problem.',
  'Structure over weights — a fly brain moves a body with nothing trained.',
  'Backprop is a biological myth; local rules and growing networks are the alternative.',
]

/**
 * The "Research" app — an index of the research articles, grouped by section
 * (the same two-layer structure as the File Explorer). Clicking a card opens
 * that article in its own reader window. Data-driven from the `research`
 * articles in src/content/articles, so new .mdx files appear here automatically.
 *
 * Projects live in the Development window and personal writing is reached from
 * About / Files, so this window shows the `research` kind only.
 */
export function ResearchWindow() {
  const { openApp } = useWindows()

  return (
    <div className="space-y-4">
      <WindowHeader
        title="Research"
        subtitle={
          <>
            Transformers are too big and too hungry to live inside a robot, and they can&apos;t
            absorb experience into themselves. Biological brains do both — and a biological brain
            is structurally a spiking neural network. This is a free-time, small-GPU project that
            starts from an uploaded fruit-fly connectome, puts it in a digital body, and tries to
            make it learn.
          </>
        }
      />

      <div className="os-card">
        <p className="font-body text-sm font-bold uppercase tracking-wide text-muted">
          The ideas underneath
        </p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-muted marker:text-accent">
          {IDEAS.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      </div>

      {sectionsByKind('research').map((section) => (
        <section key={section.name} className="space-y-2">
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
                  <span className="font-body font-bold">{a.title}</span>
                  <p className="mt-1 text-sm text-muted">{a.summary}</p>
                  <TagList tags={a.tags} className="mt-1.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
