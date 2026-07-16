import { ArrowUpRight, ExternalLink, Star } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useRef } from 'react'

import type { Repo } from '#/db/schema'
import { cn } from '#/lib/utils'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

const LANG_ACCENT: Record<string, string> = {
  TypeScript: 'oklch(0.58 0.15 250)',
  JavaScript: 'oklch(0.82 0.14 94)',
  Python: 'oklch(0.54 0.11 245)',
  Rust: 'oklch(0.63 0.12 55)',
  Go: 'oklch(0.74 0.12 205)',
  Java: 'oklch(0.58 0.13 50)',
  Vue: 'oklch(0.68 0.14 150)',
  Svelte: 'oklch(0.62 0.19 35)',
  CSS: 'oklch(0.48 0.12 305)',
  HTML: 'oklch(0.62 0.18 35)',
  Shell: 'oklch(0.74 0.15 135)',
  Ruby: 'oklch(0.44 0.14 25)',
  C: 'oklch(0.45 0.02 204)',
}

export function ProjectCard({
  repo,
  featured = false,
  compact = false,
  interactive = false,
}: {
  repo: Repo
  featured?: boolean
  compact?: boolean
  interactive?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const accent = (repo.language && LANG_ACCENT[repo.language]) || 'oklch(0.72 0.085 185)'
  const title = pickLocaleField(repo, 'customTitle') || repo.name
  const description = pickLocaleField(repo, 'customDescription') || repo.description

  return (
    <article
      ref={ref}
      className={cn(
        'project-card group flex flex-col gap-4 p-6 sm:p-7',
        featured && 'project-card-featured',
        compact && 'project-card-compact',
        interactive && 'project-card-interactive',
      )}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        el.style.setProperty('--mx', `${x}%`)
        el.style.setProperty('--my', `${y}%`)
        if (interactive && e.pointerType === 'mouse') {
          el.style.setProperty('--card-rx', `${((50 - y) / 50) * 3.2}deg`)
          el.style.setProperty('--card-ry', `${((x - 50) / 50) * 4.2}deg`)
        }
      }}
      onPointerLeave={() => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--card-rx', '0deg')
        el.style.setProperty('--card-ry', '0deg')
      }}
    >
      <a
        href={repo.htmlUrl}
        target="_blank"
        rel="noreferrer"
        className="flex flex-1 flex-col gap-4 no-underline"
      >
        {!compact && repo.customCoverUrl ? (
          <img
            src={repo.customCoverUrl}
            alt=""
            className={cn(
              'w-full rounded-sm object-cover ring-1 ring-[var(--line)]',
              featured ? 'h-56' : 'h-32',
            )}
          />
        ) : !compact ? (
          <div
            className={cn(
              'project-cover relative w-full overflow-hidden rounded-sm ring-1 ring-[var(--line)]',
              featured ? 'h-56' : 'h-28',
            )}
            aria-hidden
            style={{
              '--project-accent': accent,
            } as CSSProperties}
          >
            <div className="project-cover-glow project-cover-glow-a" />
            <div className="project-cover-glow project-cover-glow-b" />
            <div className="project-cover-sheen" />
            <div className="project-cover-grain" />
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn(
              'display-title font-semibold text-[color:var(--sea-ink)]',
              featured ? 'text-3xl' : 'text-xl',
            )}
          >
            {title}
          </h3>
          <ArrowUpRight className="mt-1 h-4 w-4 text-[color:var(--sea-ink-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--lagoon-deep)]" />
        </div>

        <p
          className={cn(
            'line-clamp-3 text-sm leading-6 text-[color:var(--sea-ink-soft)]',
            !compact && 'min-h-[3.6em]',
          )}
        >
          {description || m.project_details_soon()}
        </p>
      </a>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-[color:var(--sea-ink-soft)]">
        {repo.language ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: accent }} />
            {repo.language}
          </span>
        ) : null}
        {repo.stars > 0 ? (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stars}
          </span>
        ) : null}
        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-[color:var(--lagoon-deep)] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {m.project_live_link()}
          </a>
        ) : null}
      </div>
    </article>
  )
}
