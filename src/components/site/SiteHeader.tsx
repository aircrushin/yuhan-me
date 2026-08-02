import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import type { Profile } from '#/db/schema'
import { cn } from '#/lib/utils'
import { LocaleSwitcher } from '#/components/site/LocaleSwitcher'
import { ProfileSocialLinks } from '#/components/site/ProfileSocialLinks'
import { ThemeToggle } from '#/components/site/ThemeToggle'
import { m } from '#/paraglide/messages'

const NAV: Array<{
  to: '/' | '/projects' | '/artwork' | '/travel' | '/blog' | '/contact'
  label: () => string
}> = [
  { to: '/', label: () => m.nav_home() },
  { to: '/projects', label: () => m.nav_projects() },
  { to: '/artwork', label: () => m.nav_artwork() },
  { to: '/travel', label: () => m.nav_travel() },
  { to: '/blog', label: () => m.nav_blog() },
  { to: '/contact', label: () => m.nav_contact() },
]

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const avatarUrl = profile?.avatarUrl || ''
  const siteName = profile?.name || 'aircrushin'

  return (
    <header className="site-header sticky top-0 z-30">
      <div className="page-wrap flex h-16 items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-2 text-base font-semibold">
          <span
            aria-hidden
            className="brand-mark block h-8 w-8 overflow-hidden rounded-full"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[var(--link-bg-hover)] text-xs text-[color:var(--sea-ink)]">
                {siteName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </span>
          <span className="display-title text-lg">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn('nav-link text-sm', pathname === item.to && 'is-active')}
            >
              {item.label()}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ProfileSocialLinks
            profile={profile}
            className="hidden items-center gap-2 sm:flex"
          />
          <ThemeToggle />
          <LocaleSwitcher />
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--sea-ink-soft)] md:hidden"
            aria-label={m.menu_toggle_aria()}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden">
          <div
            className="page-wrap flex flex-col gap-1 border-t py-3"
            style={{ borderColor: 'var(--line)' }}
          >
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm transition',
                  pathname === item.to
                    ? 'bg-[var(--link-bg-hover)] text-[color:var(--sea-ink)]'
                    : 'text-[color:var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]',
                )}
              >
                {item.label()}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
