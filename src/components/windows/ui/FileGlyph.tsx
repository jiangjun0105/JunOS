import type { ReactNode } from 'react'

/** Page-with-folded-corner glyph; callers pass the size and the inner rule-lines as children. Decorative, so aria-hidden. */
export function FileGlyph({
  width,
  height,
  className,
  children,
}: {
  width: number
  height: number
  className?: string
  children?: ReactNode
}) {
  return (
    <svg viewBox="0 0 19 23" width={width} height={height} aria-hidden className={className}>
      <path
        d="M3 2 h8 l5 5 v13 q0 1-1 1 H4 q-1 0-1-1 Z"
        fill="rgb(var(--file-page))"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 2 v5 h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {children}
    </svg>
  )
}
