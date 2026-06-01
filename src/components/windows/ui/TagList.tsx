/**
 * The `#`-prefixed tag chips shown on articles — both the Research index cards
 * and the article reader's header drew the identical guarded wrapper of
 * `.article-tag` spans. Same CSS classes (defined in globals.css), same `#`
 * prefix, same "render nothing when there are no tags" guard. Lives here once;
 * the styling stays in CSS (this only owns the markup, not the look).
 *
 * The wrapper is `.article-tags` (= `flex flex-wrap gap-1`). The Research index
 * additionally spaces it from the summary above with `mt-1.5`, so callers can pass
 * extra wrapper classes via `className`; the article reader passes none, matching
 * its original bare `.article-tags` div exactly.
 */
export function TagList({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null
  return (
    <div className={className ? `article-tags ${className}` : 'article-tags'}>
      {tags.map((t) => (
        <span key={t} className="article-tag">
          #{t}
        </span>
      ))}
    </div>
  )
}
