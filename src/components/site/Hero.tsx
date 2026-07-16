import { useState, type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUpRight, MapPin, MousePointer2 } from 'lucide-react'

import type { Profile, Repo } from '#/db/schema'
import { Button } from '#/components/ui/button'
import { HeroSceneGate } from '#/components/site/HeroSceneGate'
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
  const [activeMode, setActiveMode] = useState(0)
  const modes = [
    m.hero_signal_product(),
    m.hero_signal_ai(),
    m.hero_signal_collaboration(),
  ]
  const activeModeLabel = modes[activeMode] ?? modes[0]

  return (
    <section id="home" className="hero-section kinetic-hero" aria-labelledby="home-title">
      <div className="hero-bg-ambient" aria-hidden="true" />
      <div className="page-wrap">
        <div className="kinetic-hero-shell">
          <div className="kinetic-hero-grid">
            <div className="kinetic-hero-copy">
              <div className="kicker-line kinetic-reveal" style={{ '--i': 0 } as CSSProperties}>
                {kicker}
              </div>
              <h1
                id="home-title"
                className="hero-title kinetic-reveal"
                style={{ '--i': 1 } as CSSProperties}
              >
                {headline}
              </h1>
              <p className="kinetic-hero-intro kinetic-reveal" style={{ '--i': 2 } as CSSProperties}>
                {bio}
              </p>

              <div className="hero-actions kinetic-reveal" style={{ '--i': 3 } as CSSProperties}>
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

              <div
                className="hero-mode-selector kinetic-reveal"
                style={{ '--i': 4 } as CSSProperties}
                role="group"
                aria-label={m.hero_scene_modes_aria()}
              >
                <div className="hero-mode-heading">
                  <span>{m.hero_scene_modes_label()}</span>
                  <strong aria-live="polite">{activeModeLabel}</strong>
                </div>
                <div className="hero-mode-list">
                  {modes.map((mode, index) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={activeMode === index}
                      onClick={() => setActiveMode(index)}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <a href="#about" className="hero-scroll-cue kinetic-reveal" style={{ '--i': 5 } as CSSProperties}>
                <ArrowDown className="h-4 w-4" />
                {m.hero_scroll_cue()}
              </a>
            </div>

            <div className="kinetic-hero-stage kinetic-reveal" style={{ '--i': 2 } as CSSProperties}>
              <HeroSceneGate mode={activeMode} />
              <div className="hero-stage-hud hero-stage-hud-top" aria-hidden="true">
                <span>{m.hero_scene_label()}</span>
                <span>0{activeMode + 1} / 03</span>
              </div>
              <div className="hero-stage-hud hero-stage-hud-bottom">
                <span className="hero-stage-instruction">
                  <MousePointer2 className="h-3.5 w-3.5" />
                  {m.hero_scene_instruction()}
                </span>
                <span>{activeModeLabel}</span>
              </div>
            </div>
          </div>

          <aside className="hero-ledger kinetic-reveal" style={{ '--i': 5 } as CSSProperties} aria-label={m.hero_ledger_aria()}>
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
