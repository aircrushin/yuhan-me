import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import type { Repo } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { ProjectCard } from '#/components/site/ProjectCard'
import { m } from '#/paraglide/messages'

interface ProjectsPreviewProps {
  repos: Repo[]
}

export function ProjectsPreview({ repos }: ProjectsPreviewProps) {
  if (repos.length === 0) {
    return (
      <Section
        id="projects"
        kicker={m.section_projects_kicker()}
        title={m.section_projects_title()}
      >
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.projects_preview_empty()}
        </div>
      </Section>
    )
  }
  const [lead, ...rest] = repos.slice(0, 4)

  return (
    <Section
      id="projects"
      kicker={m.section_projects_kicker()}
      title={m.section_projects_title()}
    >
      <div className="projects-showcase">
        {lead ? <ProjectCard repo={lead} featured /> : null}
        <div className="projects-stack">
          {rest.map((repo) => (
            <ProjectCard key={repo.githubId} repo={repo} compact />
          ))}
        </div>
      </div>
      <div className="mt-10 flex justify-start">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-sm border border-[var(--line)] bg-[var(--surface-strong)] px-6 py-3 text-sm font-medium text-[color:var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
        >
          {m.section_projects_view_all()}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  )
}
