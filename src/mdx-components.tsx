import type { MDXComponents } from 'mdx/types'
import { Embed } from '@/components/mdx/Embed'
import { Figure } from '@/components/mdx/Figure'
import { Gallery } from '@/components/mdx/Gallery'
import { Video } from '@/components/mdx/Video'

/**
 * Global MDX component map (App Router convention — this file is auto-discovered
 * by @next/mdx). It does two jobs:
 *
 *  1. Skins the plain Markdown elements (h1, p, a, …) to the cozy theme, so every
 *     article looks consistent without a "prose" plugin. (Reader-window bodies are
 *     wrapped in `.article-prose`; a couple of rules there finish the styling.)
 *  2. Exposes our custom blocks (<Figure>, <Gallery>, <Video>, <Embed>) as bare
 *     tags usable inside ANY .mdx file with no per-file import.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: (props) => <h1 className="mb-2 mt-1 font-display text-2xl font-bold text-ink" {...props} />,
    h2: (props) => <h2 className="mb-2 mt-5 font-display text-xl font-bold text-ink" {...props} />,
    h3: (props) => <h3 className="mb-1.5 mt-4 font-display text-lg font-bold text-ink" {...props} />,
    p: (props) => <p className="my-2.5 text-[15px] leading-relaxed text-ink" {...props} />,
    a: (props) => (
      <a
        className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        {...props}
      />
    ),
    ul: (props) => (
      <ul className="my-2.5 ml-5 list-disc space-y-1 text-[15px] text-ink marker:text-accent" {...props} />
    ),
    ol: (props) => (
      <ol className="my-2.5 ml-5 list-decimal space-y-1 text-[15px] text-ink marker:text-muted" {...props} />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-3 rounded-r-md border-l-[3px] border-accent/50 bg-surface-2/40 px-3 py-1.5 italic text-muted"
        {...props}
      />
    ),
    hr: (props) => <hr className="my-5 border-0 border-t-2 border-dashed border-line/30" {...props} />,
    strong: (props) => <strong className="font-bold text-ink" {...props} />,
    em: (props) => <em className="italic" {...props} />,
    code: (props) => (
      <code
        className="rounded-[5px] border border-line/40 bg-surface-2/60 px-1.5 py-0.5 font-mono text-[13px]"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="my-3 overflow-auto rounded-tile border-2 border-line bg-surface-2/50 p-3 font-mono text-[13px] leading-relaxed"
        {...props}
      />
    ),
    // Plain Markdown images (![alt](src)) render as a bordered block; for captions
    // or sizing, use the richer <Figure> component instead.
    img: (props) => (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img className="my-3 block w-full rounded-tile border-2 border-line" loading="lazy" {...props} />
    ),

    Figure,
    Gallery,
    Video,
    Embed,
  }
}
