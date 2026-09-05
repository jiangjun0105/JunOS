import type { ComponentType } from 'react'

/**
 * The article content layer. Articles are .mdx files in this folder; their
 * METADATA lives here as typed objects (instead of frontmatter) so it's fully
 * typed and trivial to sort / filter / group for the Research index and the
 * File Explorer.
 *
 * Bodies are generated from the knowledge base in `kb/refined/` — that is the
 * source of truth. To change an article's text, edit the matching file under
 * `kb/refined/` and regenerate the .mdx (see kb/README.md); don't treat the
 * .mdx as the original.
 *
 * To add an article:
 *   1. create `my-slug.mdx` in this folder (write prose; use <Figure>, <Video>,
 *      <Embed>, <Gallery> freely — they're globally available);
 *   2. add a metadata entry to `articles` below (pick a `kind` + `section`),
 *      INCLUDING its `load: () => import('./my-slug.mdx')` — the loader is
 *      co-located on the metadata so a new article is a single object, with no
 *      second parallel map to keep in sync;
 *   3. drop any images / short clips in /public/media/my-slug/.
 * It then appears automatically in the Research window (research articles), the
 * Development window (project articles) and the File Explorer — nested under its
 * `section` sub-folder.
 */

/**
 * An article's top-level folder.
 *   research → the Research window + the "Research" folder
 *   project  → the Development window + the "Projects" folder
 *   personal → the "Personal" folder (surfaced from the About window)
 */
export type ArticleKind = 'research' | 'project' | 'personal'

/**
 * The lazy loader for an article body. Returns the article's .mdx module
 * (code-split, fetched on demand). `articleLoaders` below is derived from these,
 * and `ArticleWindow` feeds the result straight to Next's `dynamic()`.
 */
export type ArticleLoader = () => Promise<{ default: ComponentType }>

export interface ArticleMeta {
  /** Must match the .mdx filename (and so the key in the derived `articleLoaders`). */
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD) — the `updated:` date of the source file in kb/refined/. */
  date: string
  summary: string
  tags: string[]
  /** Top-level folder: research → "Research", project → "Projects", personal → "Personal". */
  kind: ArticleKind
  /** Topic sub-folder within its kind (the second layer of structure). */
  section: string
  /** Optional cover image path under /public (shown by the Research index). */
  cover?: string
  /**
   * Lazy import of this article's .mdx body. Co-located with the rest of the
   * metadata so an article is one self-contained object — `articleLoaders` is
   * derived from these (see below), not maintained as a separate parallel map.
   * The path MUST match `slug` (e.g. slug 'foo' → `() => import('./foo.mdx')`).
   */
  load: ArticleLoader
}

/**
 * Article metadata. Order matters: sections appear in first-seen order, and
 * articles keep their order within a section (see `sectionsByKind`).
 */
export const articles: ArticleMeta[] = [
  // ── Research / Post-transformer models ────────────────────────────────────
  {
    slug: 'snn-overview',
    title: 'Post-Transformer Models via Biological SNNs',
    date: '2026-09-03',
    summary:
      'Why a robot brain has to be small, individual and body-coupled — and the three-stage plan that starts from an uploaded fly connectome.',
    tags: ['snn', 'connectome', 'embodied-ai'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/research.png',
    load: () => import('./snn-overview.mdx'),
  },
  {
    slug: 'why-biology',
    title: 'Why I Look to Biology',
    date: '2026-09-04',
    summary:
      'Indirect observation, hypothesis-first science, and what the brain actually looks like compared with the networks we build.',
    tags: ['epistemology', 'neuroscience', 'method'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/books.png',
    load: () => import('./why-biology.mdx'),
  },
  {
    slug: 'structure-over-weights',
    title: 'Structure Over Weights',
    date: '2026-09-04',
    summary:
      'A whole-fly-brain model moves a body with nothing trained. If structure carries the function, training should search structure.',
    tags: ['snn', 'connectome', 'training'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/gear.png',
    load: () => import('./structure-over-weights.mdx'),
  },
  {
    slug: 'how-im-building-it',
    title: "How I'm Building the Digital Fly",
    date: '2026-09-05',
    summary:
      'The stack: the male-cns v0.9 connectome through neuPrint, Brian2 with GeNN on the GPU, and NeuroMechFly in MuJoCo for the body.',
    tags: ['snn', 'connectome', 'stack'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/development.png',
    load: () => import('./how-im-building-it.mdx'),
  },
  {
    slug: 'learning-mechanisms',
    title: 'How the Digital Fly Learns',
    date: '2026-09-05',
    summary:
      'Four timescales nested inside each other, from millisecond spike timing to evolution — and why one global loss cannot stand in for all of them.',
    tags: ['snn', 'stdp', 'learning'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/research.png',
    load: () => import('./learning-mechanisms.mdx'),
  },
  {
    slug: 'stage-1-current-work',
    title: 'Stage 1 — Moving a Digital Fly',
    date: '2026-09-05',
    summary:
      'Connectome to LIF network to digital body: hunting the sensorimotor loop, and one leg that moves.',
    tags: ['snn', 'lif', 'motor-control'],
    kind: 'research',
    section: 'Post-transformer models',
    cover: '/icons/projects.png',
    load: () => import('./stage-1-current-work.mdx'),
  },

  // ── Research / Track record ───────────────────────────────────────────────
  {
    slug: 'publications',
    title: 'Publications and Patents',
    date: '2026-09-05',
    summary:
      'Six robotics papers from the University of Tokyo, a Toyota patent on in-car gesture search, and five DJI image-processing patents.',
    tags: ['publications', 'patents', 'robotics'],
    kind: 'research',
    section: 'Track record',
    cover: '/icons/folder.png',
    load: () => import('./publications.mdx'),
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  {
    slug: 'agent-harness',
    title: 'Agent Harness',
    date: '2026-09-03',
    summary:
      'Multi-agent SDLC automation built bottom-up: nothing was automated until it had been run by hand and proven.',
    tags: ['agents', 'sdlc', 'developer-velocity'],
    kind: 'project',
    section: 'Projects',
    cover: '/icons/development.png',
    load: () => import('./agent-harness.mdx'),
  },
  {
    slug: 'junos-website',
    title: 'JunOS',
    date: '2026-09-03',
    summary:
      'This site: a desktop OS in the browser. Technically ordinary — which is the point, because design is what made the difference.',
    tags: ['web', 'nextjs', 'design'],
    kind: 'project',
    section: 'Projects',
    cover: '/icons/about.png',
    load: () => import('./junos-website.mdx'),
  },
  {
    slug: 'repo-understanding-tool',
    title: 'Large-Repo Understanding Tool',
    date: '2026-09-03',
    summary:
      'An AST-shaped hierarchical graph of agents that beat Copilot Chat — and why I stopped it before the Bitter Lesson hit.',
    tags: ['archived', 'context-engineering', 'bitter-lesson'],
    kind: 'project',
    section: 'Projects',
    cover: '/icons/earnings.png',
    load: () => import('./repo-understanding-tool.mdx'),
  },

  // ── Personal / Life ───────────────────────────────────────────────────────
  {
    slug: 'about-me',
    title: 'About Me',
    date: '2026-09-03',
    summary:
      'A skateboard in an anime, robotics at the University of Tokyo, chip logic at DJI, LLMs at Toyota, and a voice startup.',
    tags: ['bio', 'robotics', 'ai'],
    kind: 'personal',
    section: 'Life',
    cover: '/icons/about_me.png',
    load: () => import('./about-me.mdx'),
  },

  // ── Personal / Now ────────────────────────────────────────────────────────
  {
    slug: 'what-im-doing-now',
    title: "What I'm Doing Now",
    date: '2026-09-05',
    summary: 'A now-page: what I am building, researching and reading this month.',
    tags: ['now'],
    kind: 'personal',
    section: 'Now',
    cover: '/icons/thoughts.png',
    load: () => import('./what-im-doing-now.mdx'),
  },
]

/**
 * Lazy component loaders, keyed by slug. Each article is code-split and only
 * fetched when its reader window opens (see ArticleWindow).
 *
 * DERIVED from `articles` rather than hand-maintained: each article carries its
 * own `load` (co-located with its metadata), so this map can't drift out of sync
 * with the metadata the way a second hand-written table used to. The exported
 * name, shape, and type are unchanged, so existing consumers (e.g. ArticleWindow's
 * `articleLoaders[slug]`) keep working exactly as before.
 */
export const articleLoaders: Record<string, ArticleLoader> = Object.fromEntries(
  articles.map((a) => [a.slug, a.load]),
)

/** Look up a single article's metadata by slug. */
export function getArticle(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug)
}

/** All articles of a given kind, in `articles` order. */
export function articlesByKind(kind: ArticleKind): ArticleMeta[] {
  return articles.filter((a) => a.kind === kind)
}

/** A topic sub-folder: a section name and the articles under it. */
export interface ArticleSection {
  name: string
  articles: ArticleMeta[]
}

/**
 * Group a kind's articles into ordered sections (the second layer of structure).
 * Sections appear in first-seen order; articles keep their order within each.
 */
export function sectionsByKind(kind: ArticleKind): ArticleSection[] {
  const sections: ArticleSection[] = []
  for (const article of articlesByKind(kind)) {
    let section = sections.find((s) => s.name === article.section)
    if (!section) {
      section = { name: article.section, articles: [] }
      sections.push(section)
    }
    section.articles.push(article)
  }
  return sections
}
