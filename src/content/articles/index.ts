import type { ComponentType } from 'react'

/**
 * The article content layer. Articles are .mdx files in this folder; their
 * METADATA lives here as typed objects (instead of frontmatter) so it's fully
 * typed and trivial to sort / filter / group for the Research index and the
 * File Explorer.
 *
 * To add an article:
 *   1. create `my-slug.mdx` in this folder (write prose; use <Figure>, <Video>,
 *      <Embed>, <Gallery> freely — they're globally available);
 *   2. add a metadata entry to `articles` below (pick a `kind` + `section`),
 *      INCLUDING its `load: () => import('./my-slug.mdx')` — the loader is
 *      co-located on the metadata so a new article is a single object, with no
 *      second parallel map to keep in sync;
 *   3. drop any images / short clips in /public/media/my-slug/.
 * It then appears automatically in the Research window and the File Explorer —
 * nested under its `section` sub-folder.
 */

export type ArticleKind = 'research' | 'personal'

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
  /** ISO date (YYYY-MM-DD) — used for sorting + display. */
  date: string
  summary: string
  tags: string[]
  /** Top-level folder: research → "Research", personal → "Personal". */
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
  // ── Research / Attention & Transformers ───────────────────────────────────
  {
    slug: 'field-notes-on-attention',
    title: 'Field Notes on Attention',
    date: '2026-05-20',
    summary: 'Half-formed thoughts on what attention is actually doing — with a diagram and a clip.',
    tags: ['ml', 'notes'],
    kind: 'research',
    section: 'Attention & Transformers',
    cover: '/icons/projects.png',
    load: () => import('./field-notes-on-attention.mdx'),
  },
  {
    slug: 'positional-encodings',
    title: 'Positional Encodings, Three Ways',
    date: '2026-05-18',
    summary: 'Sinusoidal vs. learned vs. rotary — when I reach for each, and why.',
    tags: ['ml', 'transformers'],
    kind: 'research',
    section: 'Attention & Transformers',
    cover: '/icons/finance.png',
    load: () => import('./positional-encodings.mdx'),
  },
  {
    slug: 'kv-cache-notes',
    title: 'KV-Cache Notes',
    date: '2026-05-12',
    summary: 'The memory-for-compute trade behind fast autoregressive generation.',
    tags: ['ml', 'systems'],
    kind: 'research',
    section: 'Attention & Transformers',
    cover: '/icons/earnings.png',
    load: () => import('./kv-cache-notes.mdx'),
  },

  // ── Research / Systems & Tooling ──────────────────────────────────────────
  {
    slug: 'building-junos',
    title: 'Building JunOS',
    date: '2026-05-10',
    summary: 'Why I turned my personal site into a tiny desktop OS, and how the window manager works.',
    tags: ['web', 'devlog'],
    kind: 'research',
    section: 'Systems & Tooling',
    cover: '/icons/about.png',
    load: () => import('./building-junos.mdx'),
  },
  {
    slug: 'a-tiny-window-manager',
    title: 'Anatomy of a Tiny Window Manager',
    date: '2026-05-08',
    summary: 'One array of window objects, and why focus is derived rather than stored.',
    tags: ['web', 'react'],
    kind: 'research',
    section: 'Systems & Tooling',
    cover: '/icons/projects.png',
    load: () => import('./a-tiny-window-manager.mdx'),
  },
  {
    slug: 'notes-on-build-pipelines',
    title: 'Notes on Build Pipelines',
    date: '2026-05-02',
    summary: 'A reminder to myself about where build time actually goes.',
    tags: ['tooling', 'ci'],
    kind: 'research',
    section: 'Systems & Tooling',
    cover: '/icons/support.svg',
    load: () => import('./notes-on-build-pipelines.mdx'),
  },

  // ── Research / Theory & Reading ───────────────────────────────────────────
  {
    slug: 'scaling-laws-reading-group',
    title: 'Reading Group: Scaling Laws',
    date: '2026-04-26',
    summary: 'Notes from a session on how loss scales with parameters, data, and compute.',
    tags: ['ml', 'reading'],
    kind: 'research',
    section: 'Theory & Reading',
    cover: '/icons/earnings.png',
    load: () => import('./scaling-laws-reading-group.mdx'),
  },
  {
    slug: 'on-generalization',
    title: 'On Generalization',
    date: '2026-04-20',
    summary: 'A grab-bag of intuitions I trust more than I can prove.',
    tags: ['ml', 'theory'],
    kind: 'research',
    section: 'Theory & Reading',
    cover: '/icons/about.png',
    load: () => import('./on-generalization.mdx'),
  },
  {
    slug: 'open-problems',
    title: 'Open Problems I Keep a List Of',
    date: '2026-04-14',
    summary: 'A living list of questions that keep me up at night.',
    tags: ['ml', 'notes'],
    kind: 'research',
    section: 'Theory & Reading',
    cover: '/icons/finance.png',
    load: () => import('./open-problems.mdx'),
  },

  // ── Personal / Life ───────────────────────────────────────────────────────
  {
    slug: 'about-me',
    title: 'About Me',
    date: '2026-04-30',
    summary: 'Who I am, what I am poking at lately, and a few pictures from the forest.',
    tags: ['bio'],
    kind: 'personal',
    section: 'Life',
    cover: '/icons/about.png',
    load: () => import('./about-me.mdx'),
  },
  {
    slug: 'forest-walks',
    title: 'Forest Walks',
    date: '2026-04-22',
    summary: 'Photos and half-thoughts from walks near the camphor trees.',
    tags: ['photos'],
    kind: 'personal',
    section: 'Life',
    cover: '/icons/projects.png',
    load: () => import('./forest-walks.mdx'),
  },

  // ── Personal / Now ────────────────────────────────────────────────────────
  {
    slug: 'what-im-doing-now',
    title: "What I'm Doing Now",
    date: '2026-04-10',
    summary: 'A now-page — what has my attention lately.',
    tags: ['now'],
    kind: 'personal',
    section: 'Now',
    cover: '/media/support-agent.svg',
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
