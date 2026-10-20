/** `#`-prefixed article tags; renders nothing when empty. `className` adds wrapper classes. */
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
