import type { ReactNode } from 'react'

/**
 * The heading pair that opens almost every app window: a bold title and an
 * optional muted intro line. Nearly every window hand-inlined this exact
 * `<h1>`/`<p>` pair (same classes, same sizes), so it lives here once.
 *
 * The wrapper is `space-y-1` to match the windows that group the pair in their
 * own block (Books, Research). Windows whose whole body is a single `space-y-3`
 * stack (the two About windows, Development) used to let the `<h1>`/`<p>` be
 * direct children of that stack — wrapping them in this `space-y-1` div changes
 * the gap between the title and its subtitle from `space-y-3` (12px) to
 * `space-y-1` (4px). That tighter title→subtitle gap is the SAME spacing the
 * other windows already use, so adopting it makes the family consistent; it is a
 * deliberate, uniform tightening of just that one gap, not a per-window redesign.
 *
 * `subtitle` is a ReactNode (not just string) so callers can pass markup with
 * entities (e.g. `&amp;`) exactly as they wrote it inline.
 */
export function WindowHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="space-y-1">
      <h1 className="font-body text-[22px] font-bold">{title}</h1>
      {subtitle !== undefined && <p className="text-[18px] text-muted">{subtitle}</p>}
    </div>
  )
}
