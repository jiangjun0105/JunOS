import Image from 'next/image'

/**
 * Wallpaper — the desktop background image (a hand-painted Ghibli meadow).
 *
 * Rendered full-bleed with Next's optimized <Image>: it resizes/compresses the
 * large source PNG and serves modern formats (WebP/AVIF) at the right size,
 * instead of shipping the raw multi-MB file. Purely decorative and behind
 * everything (aria-hidden, sits in the desktop's base layer).
 *
 * To change the wallpaper later, drop a new file in /public/wallpaper/ and
 * update the `src` below.
 */
export function Wallpaper() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Image
        src="/wallpaper/ghibli_running.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </div>
  )
}
