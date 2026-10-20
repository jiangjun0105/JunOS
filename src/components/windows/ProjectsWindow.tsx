'use client'

import { articlesByKind } from '@/content/articles'
import { useWindows } from '@/os/WindowManager'
import { ArticleCard } from './ui/ArticleCard'
import { WindowHeader } from './ui/WindowHeader'

/**
 * One card per `project` article. The pills are presentation for this window,
 * not article metadata, so they live here.
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
            <ArticleCard
              title={project.title}
              summary={project.summary}
              onClick={() => openApp('article', { params: { slug: project.slug } })}
              aside={
                TAGS[project.slug] && (
                  <span className="os-pill flex-none">{TAGS[project.slug]}</span>
                )
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
