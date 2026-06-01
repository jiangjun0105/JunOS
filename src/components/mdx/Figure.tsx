import Image from 'next/image'

/**
 * A captioned image block for articles.
 *
 *   <Figure src="/media/my-post/diagram.png" alt="…" caption="…" />
 *
 * Uses next/image for automatic optimization (resized/modern-format variants).
 * Article images have no known intrinsic size at author time, so we use the
 * responsive `width={0} height={0} sizes="100vw"` recipe + CSS `height: auto`:
 * next/image then serves a srcset and the browser picks the right variant, while
 * the box still sizes itself from the natural aspect ratio. Images just live
 * under /public (or same-origin), which next/image optimizes with no extra config.
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
      <Image
        src={src}
        alt={alt}
        // Responsive sizing: 0/0 + sizes lets next/image emit a srcset; the
        // inline `width: 100%`/`height: auto` keeps the original look. An
        // optional `width` prop still caps the display size (centered).
        width={0}
        height={0}
        sizes="100vw"
        loading="lazy"
        className="media-img"
        style={
          width
            ? { width: '100%', maxWidth: width, height: 'auto', marginInline: 'auto' }
            : { width: '100%', height: 'auto' }
        }
      />
      {caption ? <figcaption className="media-caption">{caption}</figcaption> : null}
    </figure>
  )
}
