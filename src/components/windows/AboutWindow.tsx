'use client'

import { Img } from '@/components/Img'
import { useWindows } from '@/os/WindowManager'

const LINKEDIN = 'https://www.linkedin.com/in/jiangjun0105'
const PHOTO = '/media/jun.jpeg'

const BIO =
  "Intelligent machines have fascinated me for as long as I can remember. That took me to robotics at the University of Tokyo, where I learned the hard part is the mind, not the machine. At DJI I learned how photons become pixels; at Woven by Toyota I turn generative-AI ideas into prototypes people actually use. Now I build agents that write software and hold real-time conversations, and in my free time I put a fly's brain into a digital body to see how real neurons learn. Bay Area, after ten years in Japan."

// Leader lines from each callout to the photo ring, in the stage's 600×360 box; order matches POS.
const LEADS = [
  '200,60 240,60 268,128',
  '400,60 360,60 332,128',
  '200,300 240,300 268,232',
  '400,300 360,300 332,232',
]
const POS = ['tl', 'tr', 'bl', 'br'] as const

/**
 * "Jarvis callouts": the photo in rotating rings, the four main things on amber leader lines
 * (like the city's landmark icons), then a one-paragraph bio. Long copy lives in about-me.mdx.
 */
export function AboutWindow() {
  const { openApp } = useWindows()

  function openArticle(slug: string) {
    openApp('article', { slug })
  }

  // The Digital Double is the stealth startup's product: describe the project, never the company.
  const callouts: { title: string; desc: string; onClick?: () => void }[] = [
    {
      title: 'Agent harness',
      desc: 'Agents that plan, code, review and test a feature from spec to PR.',
      onClick: () => openArticle('agent-harness'),
    },
    {
      title: 'Brain in a body',
      desc: "A fly's connectome as a spiking network in a simulated body.",
      onClick: () => openApp('research'),
    },
    {
      title: 'Digital Double',
      desc: 'Real-time voice clone of an expert you can interrupt. Stanford GSB.',
    },
    {
      title: 'Zero to one',
      desc: "Gen-AI prototypes at Woven; one made Toyota's production roadmap.",
    },
  ]

  return (
    <div className="about">
      <div className="about-ident">
        <div className="about-k">Target acquired</div>
        <h1 className="about-name">
          Jun Jiang
          <a
            className="about-li"
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z" />
            </svg>
          </a>
        </h1>
        <div className="about-role">AI engineer · Woven by Toyota · Bay Area</div>
      </div>

      <div className="about-stage">
        <svg
          className="about-leads"
          viewBox="0 0 600 360"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {LEADS.map((points, i) => (
            <polyline key={points} data-lead={i} points={points} />
          ))}
        </svg>
        <div className="about-photo">
          <span className="about-face">
            <Img src={PHOTO} alt="Jun Jiang" draggable={false} />
          </span>
          <svg className="about-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" strokeDasharray="30 6 2 6" />
          </svg>
          <svg className="about-ring about-ring-2" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="43" strokeDasharray="60 210" />
          </svg>
        </div>
        {callouts.map(({ title, desc, onClick }, i) => {
          const left = i % 2 === 0
          const body = (
            <>
              <div className="about-co-t">{left ? `${title} ▸` : `◂ ${title}`}</div>
              <div className="about-co-d">{desc}</div>
              {onClick && <div className="about-co-go">Open ▸</div>}
            </>
          )
          return onClick ? (
            <button
              key={title}
              type="button"
              className="about-co"
              data-co={i}
              data-pos={POS[i]}
              onClick={onClick}
            >
              {body}
            </button>
          ) : (
            <div key={title} className="about-co" data-co={i} data-pos={POS[i]}>
              {body}
            </div>
          )
        })}
      </div>

      <p className="about-bio">{BIO}</p>

      <div className="about-links">
        <button type="button" onClick={() => openArticle('publications')}>
          Publications &amp; patents ▸
        </button>
        {/* opening a window flies the city to its landmark (Sutro Tower, Golden Gate Bridge) */}
        <button type="button" onClick={() => openApp('support')}>
          Talk to AI Jun ▸
        </button>
        <button type="button" onClick={() => openApp('email')}>
          Contact real Jun ▸
        </button>
      </div>
    </div>
  )
}
