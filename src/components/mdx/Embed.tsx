/**
 * A responsive 16:9 video embed for articles — the recommended way to include
 * long-form video (streams from the host's CDN, nothing to store yourself).
 *
 *   <Embed src="https://youtu.be/aqz-KE-bpKQ" title="…" />
 *   <Embed src="https://vimeo.com/76979871" />
 *
 * Accepts a YouTube/Vimeo URL (watch, short, youtu.be, /shorts/, /live/), a bare
 * YouTube id, or any ready-made embed URL.
 */
interface EmbedProps {
  src: string
  title?: string
}

/** Normalize common YouTube/Vimeo URL forms (or a bare id) to an embeddable URL. */
function toEmbedUrl(src: string): string {
  const s = src.trim()
  // Already an embed / iframe-ready URL.
  if (/\/embed\/|player\.vimeo\.com/.test(s)) return s
  // YouTube: watch?v=, youtu.be/, /shorts/, /live/.
  const yt = s.match(/(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo: vimeo.com/<id> or vimeo.com/video/<id>.
  const vimeo = s.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  // Bare id — assume YouTube.
  if (/^[\w-]{6,}$/.test(s)) return `https://www.youtube.com/embed/${s}`
  return s
}

export function Embed({ src, title = 'Embedded video' }: EmbedProps) {
  return (
    <figure className="media-figure">
      <div className="media-embed">
        <iframe
          src={toEmbedUrl(src)}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </figure>
  )
}
