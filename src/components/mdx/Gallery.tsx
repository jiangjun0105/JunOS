/**
 * A simple responsive image grid for articles.
 *
 *   <Gallery
 *     columns={3}
 *     items={[{ src: '/media/post/a.jpg', caption: 'A' }, …]}
 *   />
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
  return (
    <div className="media-gallery" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item, i) => (
        <figure key={i} className="media-figure my-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.alt ?? ''} loading="lazy" className="media-img" />
          {item.caption ? <figcaption className="media-caption">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}
