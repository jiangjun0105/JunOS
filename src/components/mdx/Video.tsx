'use client'

import { useState } from 'react'

/**
 * A self-hosted video clip for articles — for short clips you keep under
 * /public/media/<slug>/. For long-form video, prefer <Embed> (YouTube/Vimeo) so
 * you don't ship big files or pay for bandwidth.
 *
 *   <Video src="/media/my-post/demo.mp4" caption="…" />
 *
 * If the file is missing it degrades to a friendly placeholder instead of a
 * broken player (handy while you're still recording the clip).
 */
interface VideoProps {
  src: string
  /** Optional poster image shown before playback. */
  poster?: string
  caption?: string
}

export function Video({ src, poster, caption }: VideoProps) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className="media-figure">
      {failed ? (
        <div className="media-fallback">
          <span className="text-2xl" aria-hidden>
            📹
          </span>
          <p className="mt-1 text-sm text-muted">
            Drop a clip at <code className="font-mono">{src}</code>
          </p>
        </div>
      ) : (
        <video
          className="media-video"
          src={src}
          poster={poster}
          controls
          preload="metadata"
          playsInline
          onError={() => setFailed(true)}
        />
      )}
      {caption ? <figcaption className="media-caption">{caption}</figcaption> : null}
    </figure>
  )
}
