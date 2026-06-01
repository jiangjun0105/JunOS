import Image from 'next/image'

/**
 * A simple responsive image grid for articles.
 *
 *   <Gallery
 *     columns={3}
 *     items={[{ src: '/media/post/a.jpg', caption: 'A' }, …]}
 *   />
 *
 * Each cell uses next/image with the responsive `width={0} height={0}` recipe
 * (see Figure.tsx). `sizes` is derived from the column count so next/image can
 * download appropriately small variants for grid thumbnails rather than full-width.
 */
interface GalleryItem {
  src: string
  alt?: string
  caption?: string
}

interface GalleryProps {
  items: GalleryItem[]
  /** Number of columns (default 2). */
  columns?: number
}

export function Gallery({ items, columns = 2 }: GalleryProps) {
  // Each thumbnail is ~1/columns of the viewport — tell next/image so it picks a
  // smaller srcset candidate than the full-width default.
  const sizes = `(max-width: 768px) 100vw, ${Math.round(100 / columns)}vw`
  return (
    <div className="media-gallery" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item, i) => (
        <figure key={i} className="media-figure my-0">
          <Image
            src={item.src}
            alt={item.alt ?? ''}
            width={0}
            height={0}
            sizes={sizes}
            loading="lazy"
            className="media-img"
            style={{ width: '100%', height: 'auto' }}
          />
          {item.caption ? <figcaption className="media-caption">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}
