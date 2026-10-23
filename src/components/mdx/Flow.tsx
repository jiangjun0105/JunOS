type Step = string | { text: string; via?: string }
interface Column {
  label?: string
  steps: Step[]
  /** Highlight the column (the "winning" side of a comparison). */
  accent?: boolean
}

/**
 * A small diagram for articles: columns of boxes joined by down arrows, so it fits the
 * reading column without scrolling sideways. Steps line up across columns.
 *
 *   <Flow title="…" columns={[{ label: 'Silicon', steps: ['a', 'b'] }, { label: 'Carbon', accent: true, steps: ['c', 'd'] }]} />
 *
 * `via` on a step labels the arrow leading into it.
 */
export function Flow({ title, columns }: { title?: string; columns: Column[] }) {
  const depth = Math.max(...columns.map((c) => c.steps.length))
  const levels = Array.from({ length: depth }, (_, i) => i)
  return (
    <div className="my-5 border border-line bg-surface-2/60 p-3 font-mono text-meta leading-snug">
      {title && <div className="mb-2.5 uppercase tracking-widest text-muted">{title}</div>}
      <div
        className="grid gap-x-3"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.some((c) => c.label) &&
          columns.map((c, k) => (
            <div
              key={`h${k}`}
              className={`mb-1.5 text-[11px] font-semibold uppercase tracking-widest ${c.accent ? 'text-cyan' : 'text-ink opacity-80'}`}
            >
              {c.label ?? ' '}
            </div>
          ))}
        {levels.map((i) =>
          columns.map((c, k) => {
            const s = c.steps[i]
            if (s === undefined) return <div key={`${i}-${k}`} />
            const { text, via } = typeof s === 'string' ? { text: s, via: undefined } : s
            return (
              <div key={`${i}-${k}`} className={c.accent ? 'text-cyan' : 'text-ink'}>
                {i > 0 && (
                  <div className="py-1 pl-3 text-muted">
                    ↓{via && <span className="ml-2 italic">{via}</span>}
                  </div>
                )}
                <div
                  className={`border bg-bg/50 px-2.5 py-1 ${c.accent ? 'border-cyan/60' : 'border-line'}`}
                >
                  {text}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
