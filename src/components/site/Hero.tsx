import { type CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowUpRight } from 'lucide-react'

import type { Profile, Repo } from '#/db/schema'
import { Button } from '#/components/ui/button'
import { HeroSceneGate } from '#/components/site/HeroSceneGate'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface HeroProps {
  profile: Profile | null
}

export function Hero({ profile }: HeroProps) {
  const headline = pickLocaleField(profile, 'headline') || m.hero_title()
  const bio = cleanPublicCopy(pickLocaleField(profile, 'bio') || m.hero_subtitle())

  return (
    <section id="home" className="hero-section kinetic-hero" aria-labelledby="home-title">
      <div className="hero-bg-ambient" aria-hidden="true" />
      <div className="page-wrap">
        <div className="kinetic-hero-shell">
          <div className="kinetic-hero-stage kinetic-reveal" style={{ '--i': 0 } as CSSProperties}>
            <HeroSceneGate />
          </div>

          <div className="kinetic-hero-copy">
            <div className="kinetic-hero-heading kinetic-reveal" style={{ '--i': 1 } as CSSProperties}>
              <div className="kicker-line">{m.hero_kicker()}</div>
              <h1 id="home-title" className="hero-title">{headline}</h1>
            </div>

            <div className="kinetic-hero-intro-wrap kinetic-reveal" style={{ '--i': 2 } as CSSProperties}>
              <p className="kinetic-hero-intro">{bio}</p>
              <div className="hero-actions">
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
              <a href="#about" className="hero-scroll-cue">
                <ArrowDown className="h-4 w-4" />
                {m.hero_scroll_cue()}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function cleanPublicCopy(value: string) {
  return value.replace(/\s+\u2014\s+/g, ', ')
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
          <Link key={repo.githubId} to="/projects" className="surface-card group flex flex-col gap-2 px-4 py-3 text-sm">
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
