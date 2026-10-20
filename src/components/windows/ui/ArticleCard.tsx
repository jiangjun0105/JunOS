import type { ReactNode } from 'react'

/** Clickable list card: bold title, muted summary, optional `aside` beside the title and extras below. */
export function ArticleCard({
  title,
  summary,
  onClick,
  aside,
  children,
}: {
  title: string
  summary: string
  onClick: () => void
  aside?: ReactNode
  children?: ReactNode
}) {
  const heading = <span className="font-body font-bold">{title}</span>
  return (
    <button type="button" className="os-card os-card-button" onClick={onClick}>
      {aside ? (
        <div className="flex items-center justify-between gap-2">
          {heading}
          {aside}
        </div>
      ) : (
        heading
      )}
      <p className="mt-1 text-sm text-muted">{summary}</p>
      {children}
    </button>
  )
}
