import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ProjectCard } from '#/components/site/ProjectCard'
import { Section } from '#/components/site/Section'
import { Input } from '#/components/ui/input'
import { getVisibleRepos } from '#/server/public'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/projects')({
  loader: () => getVisibleRepos(),
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: `${m.nav_projects()} — aircrushin` },
      { name: 'description', content: m.projects_page_description() },
      { property: 'og:title', content: `${m.nav_projects()} — aircrushin` },
      { property: 'og:description', content: m.projects_page_description() },
    ],
  }),
})

function ProjectsPage() {
  const repos = Route.useLoaderData()
  const [language, setLanguage] = useState<string>('all')
  const [query, setQuery] = useState('')

  const languages = useMemo(() => {
    const set = new Set<string>()
    for (const r of repos) if (r.language) set.add(r.language)
    return Array.from(set).sort()
  }, [repos])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return repos.filter((r) => {
      if (language !== 'all' && r.language !== language) return false
      if (!q) return true
      const hay = `${r.name} ${r.fullName} ${r.customTitle ?? ''} ${r.description ?? ''} ${r.customDescription ?? ''} ${(r.topics || []).join(' ')}`
      return hay.toLowerCase().includes(q)
    })
  }, [repos, language, query])

  return (
    <Section
      kicker={m.projects_page_kicker()}
      title={m.projects_page_title()}
      description={m.projects_page_description()}
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-active={language === 'all'}
            className="chip"
            onClick={() => setLanguage('all')}
          >
            {m.projects_filter_all()}
            <span className="opacity-60">{repos.length}</span>
          </button>
          {languages.map((lang) => {
            const count = repos.filter((r) => r.language === lang).length
            return (
              <button
                key={lang}
                type="button"
                data-active={language === lang}
                className="chip"
                onClick={() => setLanguage(lang)}
              >
                {lang}
                <span className="opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--sea-ink-soft)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={m.projects_search_placeholder()}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.projects_empty()}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((repo) => (
            <ProjectCard key={repo.githubId} repo={repo} />
          ))}
        </div>
      )}
    </Section>
  )
}
