/** Placeholder content for the "About me" app. Make it yours! */
export function AboutWindow() {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold">Hi, I&apos;m [Your Name]</h1>
      <p className="text-muted">
        Welcome to my corner of the web. This is a real, draggable, resizable window — grab the
        title bar to move it, and drag the handle in the bottom-right corner to resize.
      </p>
      <p>Replace this with whatever you like: a bio, links, or projects.</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="rounded-md border border-line bg-accent/10 px-3 py-1 text-sm">
          🎨 design
        </span>
        <span className="rounded-md border border-line bg-accent-2/20 px-3 py-1 text-sm">
          💻 code
        </span>
        <span className="rounded-md border border-line bg-accent-3/10 px-3 py-1 text-sm">
          🌐 web
        </span>
      </div>
    </div>
  )
}
