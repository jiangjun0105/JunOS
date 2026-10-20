import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { Gallery } from '@/components/mdx/Gallery'
import { MdxLink } from '@/components/mdx/MdxLink'

/**
 * Global MDX component map (auto-discovered by @next/mdx): styles the plain
 * Markdown elements so articles need no "prose" plugin, and exposes <Gallery>
 * in every .mdx file without an import.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: (props) => <h1 className="mb-2 mt-1 font-body text-title font-bold text-ink" {...props} />,
    h2: (props) => <h2 className="mb-2 mt-5 font-body text-xl font-bold text-ink" {...props} />,
    h3: (props) => <h3 className="mb-1.5 mt-4 font-body text-lg font-bold text-ink" {...props} />,
    p: (props) => <p className="my-2.5 text-prose leading-relaxed text-ink" {...props} />,
    // Internal cross-references (`/article/<slug>`, `/thoughts/<slug>`) open the
    // matching window instead of navigating away; see MdxLink.
    a: MdxLink,
    ul: (props) => (
      <ul
        className="my-2.5 ml-5 list-disc space-y-1 text-prose text-ink marker:text-accent"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="my-2.5 ml-5 list-decimal space-y-1 text-prose text-ink marker:text-muted"
        {...props}
      />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-3 rounded-r-md border-l-[3px] border-accent/50 bg-surface-2/40 px-3 py-1.5 italic text-muted"
        {...props}
      />
    ),
    hr: (props) => (
      <hr className="my-5 border-0 border-t-2 border-dashed border-line/30" {...props} />
    ),
    strong: (props) => <strong className="font-bold text-ink" {...props} />,
    em: (props) => <em className="italic" {...props} />,
    code: (props) => (
      <code
        className="rounded-btn border border-line/40 bg-surface-2/60 px-1.5 py-0.5 font-mono text-meta"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="my-3 overflow-auto rounded-tile border-2 border-line bg-surface-2/50 p-3 font-mono text-meta leading-relaxed"
        {...props}
      />
    ),
    // Markdown gives no intrinsic size, so use next/image's responsive
    // width={0} height={0} recipe with CSS `height: auto`.
    img: ({ src, alt, ...rest }) =>
      typeof src === 'string' ? (
        <Image
          src={src}
          alt={typeof alt === 'string' ? alt : ''}
          width={0}
          height={0}
          sizes="100vw"
          loading="lazy"
          className="my-3 block rounded-tile border-2 border-line"
          style={{ width: '100%', height: 'auto' }}
          {...rest}
        />
      ) : null,

    Gallery,
  }
}
