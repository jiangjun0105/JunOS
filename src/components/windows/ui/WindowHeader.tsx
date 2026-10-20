import type { ReactNode } from 'react'

/** Window title plus optional muted intro line. */
export function WindowHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="space-y-1">
      <h1 className="font-body text-title font-bold">{title}</h1>
      {subtitle !== undefined && <p className="text-prose text-muted">{subtitle}</p>}
    </div>
  )
}
