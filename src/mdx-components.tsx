import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { GithubLink } from '@/components/windows/ui/GithubLink'
import { Flow } from '@/components/mdx/Flow'
import { Gallery } from '@/components/mdx/Gallery'
import { MdxLink } from '@/components/mdx/MdxLink'

/**
 * Global MDX component map (auto-discovered by @next/mdx): styles the plain
 * Markdown elements (via .article-prose) so articles need no "prose" plugin, and exposes <Gallery>
 * in every .mdx file without an import.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Plain elements (h1–h3, p, lists, quote, code…) are styled by
    // `.article-prose` in globals.css. Internal cross-references
    // (`/article/<slug>`, `/thoughts/<slug>`) open the matching window
    // instead of navigating away; see MdxLink.
    a: MdxLink,
    // Markdown gives no intrinsic size, so use next/image's responsive
    // width={0} height={0} recipe with CSS `height: auto`.
    img: ({ src, alt, ...rest }) =>
      typeof src === 'string' ? (
        // a span, since Markdown puts images inside a <p>
        <span className="article-figure">
          <Image
            src={src}
            alt={typeof alt === 'string' ? alt : ''}
            width={0}
            height={0}
            sizes="100vw"
            loading="lazy"
            className="block"
            style={{ width: '100%', height: 'auto' }}
            {...rest}
          />
        </span>
      ) : null,

    Flow,
    Gallery,
    GithubLink,
  }
}
