import type { ComponentPropsWithoutRef } from 'react'

/** Plain <img> for small fixed-size images where next/image's overhead buys nothing; owns the lint exception. */
export function Img(props: ComponentPropsWithoutRef<'img'>) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />
}
