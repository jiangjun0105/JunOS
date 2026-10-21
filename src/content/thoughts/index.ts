import type { DocMeta } from '../articles'

/**
 * Essays shown by the Thoughts window. Same shape as the article layer, minus
 * the kind/section folders — Thoughts is one flat, hand-ordered list.
 *
 * Bodies are generated from `kb/refined/thoughts/`, which is the source of
 * truth: edit the .md there and regenerate the .mdx, not the other way round.
 * The order below mirrors `kb/refined/thoughts/INDEX.md` (bottom-up first, then
 * outward), NOT the dates — it reads as a sequence, so keep it deliberate.
 */
export type ThoughtTopic = 'core' | 'ai' | 'brains' | 'learning' | 'decisions' | 'health'

export interface ThoughtMeta extends DocMeta {
  /** Colour group on the Thoughts spine; `core` is the root essay. */
  topic: ThoughtTopic
  /** Read time at ~230 wpm; recount when the body changes. */
  minutes: number
}

export const thoughts: ThoughtMeta[] = [
  {
    slug: 'bottom-up',
    title: 'Bottom-Up',
    date: '2026-09-03',
    topic: 'core',
    minutes: 2,
    summary:
      'The one idea under everything I build — the harness, the brain, how I learn, even how I train. Start from a working model; extend one verified step at a time.',
    load: () => import('./bottom-up.mdx'),
  },
  {
    slug: 'agile-survives-the-agents',
    title: 'Agile Survives the Agents',
    date: '2026-09-05',
    topic: 'ai',
    minutes: 3,
    summary:
      "Someone has to gather requirements from every stakeholder and translate them for the agent. That proxy role is the next programmer — and it's why development stays Agile.",
    load: () => import('./agile-survives-the-agents.mdx'),
  },
  {
    slug: '20-watts-vs-megawatts',
    title: '20 Watts of Carbon vs. Megawatts of Silicon',
    date: '2026-09-05',
    topic: 'brains',
    minutes: 5,
    summary:
      'Backprop is biologically impossible; local rules, growing networks, and learning-during-inference are the way out of the current local minimum.',
    load: () => import('./20-watts-vs-megawatts.mdx'),
  },
  {
    slug: 'will-ai-replace-programmers',
    title: 'Will AI Replace Programmers?',
    date: '2026-09-04',
    topic: 'ai',
    minutes: 5,
    summary:
      'Ask what happened to the human computers and the hand coders. The job vanishes; the role transforms — and an all-AI company needs a different architecture.',
    load: () => import('./will-ai-replace-programmers.mdx'),
  },
  {
    slug: 'build-for-the-next-model',
    title: 'Build for the Next Model, Not This One',
    date: '2026-09-03',
    topic: 'ai',
    minutes: 2,
    summary:
      "Why I stopped building a repo-understanding tool, and the line between tools that compensate for a model's weakness and tools that give it a body.",
    load: () => import('./build-for-the-next-model.mdx'),
  },
  {
    slug: 'learning-by-asking',
    title: 'Learning by Asking',
    date: '2026-09-03',
    topic: 'learning',
    minutes: 3,
    summary:
      'Conversation with AI is how I learn now. Knowledge must attach to what you already know; islands vanish.',
    load: () => import('./learning-by-asking.mdx'),
  },
  {
    slug: 'chemistry-is-the-optimizer',
    title: 'Chemistry Is the Optimizer',
    date: '2026-09-04',
    topic: 'brains',
    minutes: 3,
    summary:
      'Reward chemistry is what rewires a brain; "emotion" is our name for its effect on the body. A reward function does the same job in a robot.',
    load: () => import('./chemistry-is-the-optimizer.mdx'),
  },
  {
    slug: 'why-im-optimistic-about-ai',
    title: "Why I'm Optimistic About the AI Revolution",
    date: '2026-09-03',
    topic: 'ai',
    minutes: 3,
    summary:
      'Every productivity leap frees humans for creative work. AI is the next one, and it will move faster than we did because it inherits across generations.',
    load: () => import('./why-im-optimistic-about-ai.mdx'),
  },
  {
    slug: 'face-reality',
    title: 'Face Reality',
    date: '2026-09-03',
    topic: 'decisions',
    minutes: 2,
    summary:
      "Dalio's first principle — seek truth from facts — in three layers, and the post-mortem habit it gave me.",
    load: () => import('./face-reality.mdx'),
  },
  {
    slug: 'which-layer-is-the-limit',
    title: 'Which Layer Is the Limit?',
    date: '2026-10-20',
    topic: 'brains',
    minutes: 3,
    summary:
      'First principles as a hierarchy: is the limit math, information, physics, or biology — or one we chose? A fixed network architecture is the last kind.',
    load: () => import('./which-layer-is-the-limit.mdx'),
  },
  {
    slug: 'the-body-is-one-system',
    title: 'The Body Is One System',
    date: '2026-09-03',
    topic: 'health',
    minutes: 3,
    summary:
      'What a desk worker actually needs from the gym: not one big muscle, but the whole chain assembled right. Posture is a productivity issue.',
    load: () => import('./the-body-is-one-system.mdx'),
  },
]
