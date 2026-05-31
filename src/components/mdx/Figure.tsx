/**
 * A captioned image block for articles.
 *
 *   <Figure src="/media/my-post/diagram.png" alt="…" caption="…" />
 *
 * Uses a plain <img> to stay zero-config (images just live under /public). If you
 * later want automatic optimization, swap this for next/image — you'll need to
 * pass width/height (or use `fill` inside a sized wrapper).
 */
interface FigureProps {
  src: string
  alt?: string
  caption?: string
  /** Optional max display width in px — keeps small images from stretching full-bleed. */
  width?: number
}

export function Figure({ src, alt = '', caption, width }: FigureProps) {
  return (
    <figure className="media-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="media-img"
        style={width ? { maxWidth: width, marginInline: 'auto' } : undefined}
      />
      {caption ? <figcaption className="media-caption">{caption}</figcaption> : null}
    </figure>
  )
}
