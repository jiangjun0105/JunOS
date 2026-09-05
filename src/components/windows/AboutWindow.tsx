'use client'

import { Img } from '@/components/Img'
import { getArticle } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { ChipRow } from './ui/ChipRow'

/**
 * The "About me" app — the short version of Jun's bio, with buttons into the two
 * personal articles (the full story and the Now page). The long copy lives in
 * src/content/articles/about-me.mdx, generated from kb/refined/about-me.md.
 */
export function AboutWindow() {
  const { openApp } = useWindows()

  function openArticle(slug: string) {
    openApp('article', { params: { slug }, title: getArticle(slug)?.title })
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
        <div className="space-y-1">
          <h1 className="font-body text-[22px] font-bold">Hi, I&apos;m Jun</h1>
          <p className="text-[18px] text-muted">
            An AI engineer rebuilding the software development lifecycle around agents.
          </p>
        </div>
      </div>

      <p className="text-[18px]">
        I&apos;ve shipped LLM-powered products end to end at Toyota and as CTO of a voice-AI
        startup, and I design multi-agent harnesses that plan, implement, review, and test real
        coding work with a human in the loop. In my free time I study spiking neural networks by
        putting uploaded insect brains into digital bodies.
      </p>
      <p className="text-[18px]">
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
        <button type="button" className="os-action-btn" onClick={() => openArticle('what-im-doing-now')}>
          What I&apos;m doing now →
        </button>
      </div>
    </div>
  )
}
