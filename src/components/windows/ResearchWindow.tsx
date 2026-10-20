'use client'

import { sectionsByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { ArticleCard } from './ui/ArticleCard'
import { TagList } from './ui/TagList'
import { WindowHeader } from './ui/WindowHeader'

/** Short version of kb/refined/research/INDEX.md's "ideas underneath"; orients the cards below. */
const IDEAS: string[] = [
  'Learn the principles, not the mechanism — we don’t build airplanes that flap.',
  'Indirect observation: build a model of how the thing works, then design the cheap experiment.',
  'The hierarchy of sciences bottoms out in math, so the brain is a math problem.',
  'Structure over weights — a fly brain moves a body with nothing trained.',
  'Backprop is a biological myth; local rules and growing networks are the alternative.',
]

/** Index of `research` articles by section; projects and personal writing live elsewhere. */
export function ResearchWindow() {
  const { openApp } = useWindows()

  return (
    <div className="space-y-4">
      <WindowHeader
        title="Research"
        subtitle={
          <>
            Transformers are too big and too hungry to live inside a robot, and they can&apos;t
            absorb experience into themselves. Biological brains do both — and a biological brain is
            structurally a spiking neural network. This is a free-time, small-GPU project that
            starts from an uploaded fruit-fly connectome, puts it in a digital body, and tries to
            make it learn.
          </>
        }
      />

      <div className="os-card">
        <p className="os-label">The ideas underneath</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-muted marker:text-accent">
          {IDEAS.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      </div>

      {sectionsByKind('research').map((section) => (
        <section key={section.name} className="space-y-2">
          <h2 className="os-label">{section.name}</h2>
          <ul className="space-y-2">
            {section.articles.map((a) => (
              <li key={a.slug}>
                <ArticleCard
                  title={a.title}
                  summary={a.summary}
                  onClick={() => openApp('article', { params: { slug: a.slug } })}
                >
                  <TagList tags={a.tags} className="mt-1.5" />
                </ArticleCard>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
