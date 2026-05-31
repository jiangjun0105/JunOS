import type { ComponentType } from 'react'

/**
 * The article content layer. Articles are .mdx files in this folder; their
 * METADATA lives here as typed objects (instead of frontmatter) so it's fully
 * typed and trivial to sort / filter for the Research index and File Explorer.
 *
 * To add an article:
 *   1. create `my-slug.mdx` in this folder (write prose; use <Figure>, <Video>,
 *      <Embed>, <Gallery> freely — they're globally available);
 *   2. add a metadata entry to `articles` below (newest first);
 *   3. add a matching loader to `articleLoaders`;
 *   4. drop any images / short clips in /public/media/my-slug/.
 * It then appears automatically in the Research window and the File Explorer.
 */

export type ArticleKind = 'research' | 'personal'

export interface ArticleMeta {
  /** Must match the .mdx filename and the key in `articleLoaders`. */
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD) — used for sorting + display. */
  date: string
  summary: string
  tags: string[]
  /** Which File Explorer folder it lands in (research → "Research", personal → "Personal"). */
  kind: ArticleKind
  /** Optional cover image path under /public (shown by the Research index). */
  cover?: string
}

/** Article metadata, newest first. */
export const articles: ArticleMeta[] = [
  {
    slug: 'field-notes-on-attention',
    title: 'Field Notes on Attention',
    date: '2026-05-20',
    summary: 'Half-formed thoughts on what attention is actually doing — with a diagram and a clip.',
    tags: ['ml', 'notes'],
    kind: 'research',
    cover: '/icons/projects.png',
  },
  {
    slug: 'building-junos',
    title: 'Building JunOS',
    date: '2026-05-10',
    summary: 'Why I turned my personal site into a tiny desktop OS, and how the window manager works.',
    tags: ['web', 'devlog'],
    kind: 'research',
    cover: '/icons/about.png',
  },
  {
    slug: 'about-me',
    title: 'About Me',
    date: '2026-04-30',
    summary: 'Who I am, what I am poking at lately, and a few pictures from the forest.',
    tags: ['bio'],
    kind: 'personal',
    cover: '/icons/about.png',
  },
]

/**
 * Lazy component loaders, keyed by slug. Each article is code-split and only
 * fetched when its reader window opens (see ArticleWindow).
 */
export const articleLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  'field-notes-on-attention': () => import('./field-notes-on-attention.mdx'),
  'building-junos': () => import('./building-junos.mdx'),
  'about-me': () => import('./about-me.mdx'),
}

/** Look up a single article's metadata by slug. */
export function getArticle(slug: string): ArticleMeta | undefined {
  return articles.find((a) => a.slug === slug)
}

/** All articles of a given kind, in `articles` order (newest first). */
export function articlesByKind(kind: ArticleKind): ArticleMeta[] {
  return articles.filter((a) => a.kind === kind)
}
