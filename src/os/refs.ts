import type { RefObject } from 'react'

/**
 * ARCH-6: Framer Motion's `dragConstraints` is typed `RefObject<Element>`, but our
 * bounds element is a `<div>` held in a `RefObject<HTMLDivElement | null>`. The
 * nullable, more-specific React ref isn't assignable to Framer's non-null `Element`
 * ref, even though it's safe at runtime (Framer only reads `.current` once the node
 * is mounted). This one helper centralizes that single cast so both the window frame
 * and the desktop icons share it instead of repeating the `as unknown as` workaround.
 */
export function asElementRef(ref: RefObject<HTMLElement | null>): RefObject<Element> {
  return ref as unknown as RefObject<Element>
}
