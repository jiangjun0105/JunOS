/** A little "Projects" app — a few sample cards. Make it yours! */
const projects = [
  { name: 'JunOS', blurb: 'This very site — a desktop OS in the browser.', tag: '🪟 web' },
  { name: 'Acorn Notes', blurb: 'A tiny notes app I am tinkering with.', tag: '📒 app' },
  { name: 'Forest Walks', blurb: 'Photos from hikes near the camphor trees.', tag: '🌲 photo' },
]

export function ProjectsWindow() {
  return (
    <div className="space-y-3">
      <h1 className="font-body text-[22px] font-bold">Projects</h1>
      <p className="text-[18px] text-muted">A few things I have been making.</p>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li
            key={project.name}
            className="rounded-tile border border-line bg-surface-2/50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-body font-bold">{project.name}</span>
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-xs">
                {project.tag}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{project.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
