import type { ComponentType } from 'react'

/**
 * Essays shown by the Thoughts window. Same shape as the article layer, minus
 * the kind/section folders — Thoughts is one flat, hand-ordered list.
 *
 * Bodies are generated from `kb/refined/thoughts/`, which is the source of
 * truth: edit the .md there and regenerate the .mdx, not the other way round.
 * The order below mirrors `kb/refined/thoughts/INDEX.md` (bottom-up first, then
 * outward), NOT the dates — it reads as a sequence, so keep it deliberate.
 */
export type ThoughtLoader = () => Promise<{ default: ComponentType }>

export interface ThoughtMeta {
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD) — the `updated:` date of the source file in kb/refined/. */
  date: string
  summary: string
  load: ThoughtLoader
}

export const thoughts: ThoughtMeta[] = [
  {
    slug: 'bottom-up',
    title: 'Bottom-Up',
    date: '2026-09-03',
    summary:
      'The one idea under everything I build — the harness, the brain, how I learn, even how I train. Start from a working model; extend one verified step at a time.',
    load: () => import('./bottom-up.mdx'),
  },
  {
    slug: 'agile-survives-the-agents',
    title: 'Agile Survives the Agents',
    date: '2026-09-05',
    summary:
      "Someone has to gather requirements from every stakeholder and translate them for the agent. That proxy role is the next programmer — and it's why development stays Agile.",
    load: () => import('./agile-survives-the-agents.mdx'),
  },
  {
    slug: '20-watts-vs-megawatts',
    title: '20 Watts of Carbon vs. Megawatts of Silicon',
    date: '2026-09-05',
    summary:
      'Backprop is biologically impossible; local rules, growing networks, and learning-during-inference are the way out of the current local minimum.',
    load: () => import('./20-watts-vs-megawatts.mdx'),
  },
  {
    slug: 'will-ai-replace-programmers',
    title: 'Will AI Replace Programmers?',
    date: '2026-09-04',
    summary:
      'Ask what happened to the human computers and the hand coders. The job vanishes; the role transforms — and an all-AI company needs a different architecture.',
    load: () => import('./will-ai-replace-programmers.mdx'),
  },
  {
    slug: 'build-for-the-next-model',
    title: 'Build for the Next Model, Not This One',
    date: '2026-09-03',
    summary:
      "Why I stopped building a repo-understanding tool, and the line between tools that compensate for a model's weakness and tools that give it a body.",
    load: () => import('./build-for-the-next-model.mdx'),
  },
  {
    slug: 'learning-by-asking',
    title: 'Learning by Asking',
    date: '2026-09-03',
    summary:
      'Conversation with AI is how I learn now. Knowledge must attach to what you already know; islands vanish.',
    load: () => import('./learning-by-asking.mdx'),
  },
  {
    slug: 'chemistry-is-the-optimizer',
    title: 'Chemistry Is the Optimizer',
    date: '2026-09-04',
    summary:
      'Reward chemistry is what rewires a brain; "emotion" is our name for its effect on the body. A reward function does the same job in a robot.',
    load: () => import('./chemistry-is-the-optimizer.mdx'),
  },
  {
    slug: 'why-im-optimistic-about-ai',
    title: "Why I'm Optimistic About the AI Revolution",
    date: '2026-09-03',
    summary:
      'Every productivity leap frees humans for creative work. AI is the next one, and it will move faster than we did because it inherits across generations.',
    load: () => import('./why-im-optimistic-about-ai.mdx'),
  },
  {
    slug: 'face-reality',
    title: 'Face Reality',
    date: '2026-09-03',
    summary:
      "Dalio's first principle — seek truth from facts — in three layers, and the post-mortem habit it gave me.",
    load: () => import('./face-reality.mdx'),
  },
  {
    slug: 'the-body-is-one-system',
    title: 'The Body Is One System',
    date: '2026-09-03',
    summary:
      'What a desk worker actually needs from the gym: not one big muscle, but the whole chain assembled right. Posture is a productivity issue.',
    load: () => import('./the-body-is-one-system.mdx'),
  },
]

export const thoughtLoaders: Record<string, ThoughtLoader> = Object.fromEntries(
  thoughts.map((t) => [t.slug, t.load]),
)

export function getThought(slug: string): ThoughtMeta | undefined {
  return thoughts.find((t) => t.slug === slug)
}
