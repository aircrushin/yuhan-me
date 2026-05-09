import { Link } from '@tanstack/react-router'
import { ArrowRight, Compass, Home, SearchX } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { m } from '#/paraglide/messages'

const QUICK_LINKS: Array<{ to: '/' | '/projects' | '/blog' | '/contact'; label: () => string }> = [
  { to: '/', label: () => m.nav_home() },
  { to: '/projects', label: () => m.nav_projects() },
  { to: '/blog', label: () => m.nav_blog() },
  { to: '/contact', label: () => m.nav_contact() },
]

export function NotFoundPage() {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-24 lg:py-28">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,var(--hero-a),transparent_68%)]"
        aria-hidden="true"
      />
      <div className="page-wrap">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]">
          <div className="rise-in max-w-3xl">
            <div className="kicker-line">{m.not_found_kicker()}</div>
            <h1 className="hero-title mt-5 max-w-[9ch] text-balance">{m.not_found_title()}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--sea-ink-soft)] sm:text-lg">
              {m.not_found_description()}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-sm px-6">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  {m.not_found_home()}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-sm px-6">
                <Link to="/projects">
                  <Compass className="h-4 w-4" />
                  {m.not_found_projects()}
                </Link>
              </Button>
            </div>
          </div>

          <aside
            className="surface-card rise-in relative overflow-hidden p-5 sm:p-6"
            style={{ animationDelay: '180ms' }}
            aria-label={m.not_found_panel_aria()}
          >
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,var(--hero-b),transparent_42%),radial-gradient(circle_at_12%_78%,var(--hero-a),transparent_44%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--kicker)]">
                    {m.not_found_status_label()}
                  </p>
                  <p className="display-title mt-1 text-4xl text-[color:var(--sea-ink)]">404</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-sm border border-[var(--line)] bg-[var(--chip-bg)] text-[color:var(--lacquer)]">
                  <SearchX className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {QUICK_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-center justify-between gap-4 rounded-sm border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface-strong)_74%,transparent)] px-4 py-3 text-sm font-medium text-[color:var(--sea-ink)] no-underline hover:border-[color-mix(in_oklab,var(--lagoon-deep)_36%,var(--line))] hover:bg-[var(--link-bg-hover)]"
                  >
                    <span>{item.label()}</span>
                    <ArrowRight className="h-4 w-4 text-[color:var(--sea-ink-soft)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--sea-ink)]" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
