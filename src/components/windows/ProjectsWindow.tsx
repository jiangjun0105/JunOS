'use client'

import { articlesByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { WindowHeader } from './ui/WindowHeader'

/**
 * The "Development" app — one card per project, opening its write-up in the
 * article reader. Data-driven from the `project` articles in
 * src/content/articles (generated from kb/refined/projects/), so a new project
 * appears here, in the Files tree and in the sitemap from a single entry.
 *
 * The little pills are per-project, so they live here rather than in the
 * content index — they're presentation for this window, not article metadata.
 */
const TAGS: Record<string, string> = {
  'agent-harness': '🧰 agents',
  'junos-website': '🪟 web',
  'repo-understanding-tool': '🌳 archived',
}

export function ProjectsWindow() {
  const { openApp } = useWindows()
  const projects = articlesByKind('project')

  return (
    <div className="space-y-4">
      <WindowHeader
        title="Development"
        subtitle="What I have been building. Click one to read the write-up."
      />

      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <button
              type="button"
              className="os-card os-card-button"
              onClick={() =>
                openApp('article', { params: { slug: project.slug }, title: project.title })
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-body font-bold">{project.title}</span>
                {TAGS[project.slug] && <span className="os-pill flex-none">{TAGS[project.slug]}</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{project.summary}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
