'use client'

import { Img } from '@/components/Img'
import { useWindows } from '@/os/WindowManager'
import { ChipRow } from './ui/ChipRow'
import { WindowHeader } from './ui/WindowHeader'

/** Short bio with buttons into the two personal articles; the long copy lives in src/content/articles/about-me.mdx. */
export function AboutWindow() {
  const { openApp } = useWindows()

  function openArticle(slug: string) {
    openApp('article', { params: { slug } })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <Img
          src="/icons/jun_photo.webp"
          alt="Jun Jiang"
          draggable={false}
          className="hidden h-24 w-24 flex-none rounded-full object-cover shadow-soft sm:block"
        />
        <WindowHeader
          title="Hi, I'm Jun"
          subtitle="AI engineer at Woven by Toyota, rebuilding the software development lifecycle around agents."
        />
      </div>

      <p className="text-prose">
        I&apos;ve shipped LLM-powered products end to end there and as CTO of a voice-AI startup I
        co-founded, and I design multi-agent harnesses that plan, implement, review, and test real
        coding work with a human in the loop. In my free time I study spiking neural networks by
        putting uploaded biological brains into digital bodies.
      </p>
      <p className="text-prose">
        I&apos;m based in the San Francisco Bay Area, California, after about ten years in Japan; I
        grew up in a small town in North China, and I speak Chinese, Japanese, and English.
      </p>

      <ChipRow
        items={[
          '🤖 robotics → AI',
          '🪰 fly brain',
          '🧰 agent harness',
          '🐶 Mochi & Peanuts',
          '🗼 Japan → Bay Area',
        ]}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" className="os-action-btn" onClick={() => openArticle('about-me')}>
          Read the full story →
        </button>
        <button
          type="button"
          className="os-action-btn"
          onClick={() => openArticle('what-im-doing-now')}
        >
          What I&apos;m doing now →
        </button>
      </div>
    </div>
  )
}
