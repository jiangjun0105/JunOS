import type { ReactNode } from 'react'

/**
 * The hand-drawn "page with a folded corner" glyph, shared by the File Explorer
 * and the Books app. Both drew the identical page OUTLINE (the body path + the
 * little dog-eared corner) and only differed in (a) the glyph's pixel size and
 * (b) the colored rule-lines drawn inside it. So the geometry that was duplicated
 * — the page silhouette + folded corner — now lives here exactly once.
 *
 * What stays per-caller (passed in), because it genuinely differs between them:
 *   • `width`/`height` — Files renders it larger (15×18) than Books' file chips
 *     (11×13); the `viewBox` is the same (0 0 19 23), so only the box scales.
 *   • `children` — the inner rule-lines. Files branches on file kind (a csv gets a
 *     little grid; txt/doc/… get horizontal rules) and Books draws its own rules;
 *     each passes its own `<path>`(s), already colored via its kind→token map. The
 *     page `fill` is the `--file-page` token and the outline is `currentColor`
 *     (the surrounding text/ink color), matching both originals byte-for-byte.
 *   • `className` — Books adds `flex-none` (the chip is in a flex row); Files omits
 *     it. Passed through so each keeps its exact class list.
 *
 * `aria-hidden` is always set (it was on both originals — the glyph is decorative;
 * the filename label beside it carries the meaning).
 */
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
