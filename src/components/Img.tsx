import type { ComponentPropsWithoutRef } from 'react'

/**
 * Thin wrapper over a native <img> that owns the single
 * `@next/next/no-img-element` lint exception (REUSE-7) instead of repeating an
 * eslint-disable at every call site. For small, fixed-size CHROME images (desktop
 * icons, the wallpaper photo, menu-bar glyphs, the contact photo) a plain <img> is
 * the right tool — next/image's wrapper/optimization overhead buys nothing there.
 * Article media (which can be large) uses next/image instead — see the MDX blocks.
 */
export function Img(props: ComponentPropsWithoutRef<'img'>) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />
}
