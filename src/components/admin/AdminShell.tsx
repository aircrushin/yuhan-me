import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Briefcase,
  FileText,
  Folder,
  Home,
  Inbox,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

const NAV: Array<{
  to:
    | '/admin'
    | '/admin/projects'
    | '/admin/experience'
    | '/admin/skills'
    | '/admin/blog'
    | '/admin/profile'
    | '/admin/messages'
  label: string
  icon: typeof Home
}> = [
  { to: '/admin', label: 'Dashboard', icon: Home },
  { to: '/admin/projects', label: 'Projects', icon: Folder },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/profile', label: 'Profile', icon: User },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  async function logout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      toast.success('Signed out')
      navigate({ to: '/admin/login' })
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface-strong)] p-4 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--lagoon), var(--palm))' }}
          >
            ac
          </span>
          <span className="display-title text-base">aircrushin</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.to === '/admin'
                ? pathname === '/admin' || pathname === '/admin/'
                : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                  active
                    ? 'bg-[var(--link-bg-hover)] font-medium text-[color:var(--sea-ink)]'
                    : 'text-[color:var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]/60',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Button variant="ghost" size="sm" onClick={logout} className="mt-2 justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="display-title text-base">aircrushin · admin</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2 md:hidden">
          {NAV.map((item) => {
            const active =
              item.to === '/admin'
                ? pathname === '/admin' || pathname === '/admin/'
                : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium',
                  active
                    ? 'bg-[var(--lagoon-deep)] text-white'
                    : 'text-[color:var(--sea-ink-soft)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  )
}
