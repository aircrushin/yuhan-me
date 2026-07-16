import { Link } from '@tanstack/react-router'
import { ArrowUpRight, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'

import type { Repo } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { ProjectCard } from '#/components/site/ProjectCard'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface ProjectsPreviewProps {
  repos: Repo[]
}

export function ProjectsPreview({ repos }: ProjectsPreviewProps) {
  const [view, setView] = useState<'spatial' | 'ledger'>('spatial')

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
      <div className="project-view-toolbar">
        <p>{m.projects_view_hint()}</p>
        <div role="group" aria-label={m.projects_view_aria()}>
          <button
            type="button"
            aria-pressed={view === 'spatial'}
            onClick={() => setView('spatial')}
          >
            <LayoutGrid className="h-4 w-4" />
            {m.projects_view_spatial()}
          </button>
          <button
            type="button"
            aria-pressed={view === 'ledger'}
            onClick={() => setView('ledger')}
          >
            <List className="h-4 w-4" />
            {m.projects_view_ledger()}
          </button>
        </div>
      </div>

      {view === 'spatial' ? (
        <div className="projects-showcase" data-project-view="spatial">
          {lead ? <ProjectCard repo={lead} featured interactive /> : null}
          <div className="projects-stack">
            {rest.map((repo) => (
              <ProjectCard key={repo.githubId} repo={repo} compact interactive />
            ))}
          </div>
        </div>
      ) : (
        <div className="projects-ledger" data-project-view="ledger">
          {repos.slice(0, 4).map((repo, index) => (
            <a key={repo.githubId} href={repo.htmlUrl} target="_blank" rel="noreferrer">
              <span className="projects-ledger-index">{String(index + 1).padStart(2, '0')}</span>
              <strong>{pickLocaleField(repo, 'customTitle') || repo.name}</strong>
              <span>{repo.language || m.project_type_fallback()}</span>
              <span>{repo.stars > 0 ? `★ ${repo.stars}` : m.projects_ledger_open()}</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}
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
