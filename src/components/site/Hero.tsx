import { useState, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, MapPin } from 'lucide-react'

import type { Profile, Repo } from '#/db/schema'
import { Button } from '#/components/ui/button'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface HeroProps {
  profile: Profile | null
  stats: { visible_repos: number; total_stars: number }
}

export function Hero({ profile, stats }: HeroProps) {
  const headline = pickLocaleField(profile, 'headline') || m.hero_title()
  const kicker = m.hero_kicker()
  const location = profile?.location || 'Chengdu'
  const focus = pickLocaleField(profile, 'currently') || m.hero_focus_fallback()
  const bio = cleanPublicCopy(pickLocaleField(profile, 'bio') || m.hero_subtitle())

  const [glowPos, setGlowPos] = useState({ x: 50, y: 40 })
  const visualRef = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  return (
    <section className="hero-section">
      <div className="hero-bg-ambient" aria-hidden="true" />
      <div className="page-wrap">
        <div className="hero-shell">
          <figure
            ref={visualRef}
            className="hero-visual rise-in"
            aria-label={headline}
            onMouseMove={handleMouseMove}
            style={
              {
                '--mx': `${glowPos.x}%`,
                '--my': `${glowPos.y}%`,
              } as React.CSSProperties
            }
          >
            <div className="hero-visual-ambient hero-visual-ambient-a" aria-hidden="true" />
            <div className="hero-visual-ambient hero-visual-ambient-b" aria-hidden="true" />
            <div className="hero-visual-glow" aria-hidden="true" />
            <img src="/atelier-hero.png" alt="" className="hero-image" />
            <div className="hero-visual-grain" aria-hidden="true" />
            <div className="hero-visual-sheen" aria-hidden="true" />
            <figcaption className="hero-caption">
              <div className="kicker-line stagger-item">{kicker}</div>
              <h1 className="hero-title stagger-item">{headline}</h1>
              <p className="stagger-item">{bio}</p>
              <div className="hero-actions stagger-item">
                <Button asChild size="lg" className="gap-2 rounded-sm px-6">
                  <Link to="/projects">
                    {m.hero_cta_primary()}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-sm px-6">
                  <Link to="/contact">{m.hero_cta_secondary()}</Link>
                </Button>
              </div>
              <div className="hero-signals stagger-item" aria-label={m.hero_signals_aria()}>
                <span>{m.hero_signal_product()}</span>
                <span>{m.hero_signal_ai()}</span>
                <span>{m.hero_signal_collaboration()}</span>
              </div>
            </figcaption>
          </figure>

          <aside
            className="hero-ledger rise-in"
            style={{ animationDelay: '350ms' }}
            aria-label="Portfolio index"
          >
            <div className="hero-place">
              <MapPin className="h-4 w-4 text-[color:var(--lacquer)]" />
              {location}
            </div>
            <Stat label={m.stats_repos()} value={stats.visible_repos.toString()} />
            <Stat label={m.stats_stars()} value={stats.total_stars.toString()} />
            <Stat label={m.stats_focus()} value={focus} />
            <Stat label={m.stats_mode()} value={m.stats_mode_value()} />
          </aside>
        </div>
      </div>
    </section>
  )
}

function cleanPublicCopy(value: string) {
  return value.replace(/\s+\u2014\s+/g, ', ')
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ledger-row">
      <div className="ledger-label">{label}</div>
      <div className="ledger-value">{value}</div>
    </div>
  )
}

interface RepoTeaserListProps {
  repos: Repo[]
}

export function HeroRepoTeasers({ repos }: RepoTeaserListProps) {
  if (repos.length === 0) return null
  return (
    <section className="page-wrap mt-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {repos.slice(0, 4).map((repo) => (
          <Link
            key={repo.githubId}
            to="/projects"
            className="surface-card group flex flex-col gap-2 px-4 py-3 text-sm"
          >
            <span className="font-medium text-[color:var(--sea-ink)]">
              {pickLocaleField(repo, 'customTitle') || repo.name}
            </span>
            <span className="line-clamp-2 text-xs text-[color:var(--sea-ink-soft)]">
              {pickLocaleField(repo, 'customDescription') || repo.description || m.project_details_soon()}
            </span>
            <span className="mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-[color:var(--lagoon-deep)] opacity-80 group-hover:opacity-100">
              {repo.language || m.project_type_fallback()} <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
