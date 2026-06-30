import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  FileText,
  Folder,
  Inbox,
  MapPinned,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { getAdminStatus, syncGithub } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/')({
  loader: () => getAdminStatus(),
  component: Dashboard,
  head: () => ({ meta: [{ title: 'Admin · Dashboard' }] }),
})

function Dashboard() {
  const stats = Route.useLoaderData()
  const router = useRouter()
  const sync = useServerFn(syncGithub)
  const [pending, setPending] = useState(false)

  async function onSync() {
    setPending(true)
    try {
      const result = await sync()
      toast.success(`Synced ${result.synced} repos from GitHub`)
      await router.invalidate()
    } catch (e) {
      toast.error('Sync failed — check the server logs')
      console.error(e)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--lagoon-deep)]">
            Overview
          </p>
          <h1 className="display-title mt-1 text-3xl font-semibold text-[color:var(--sea-ink)]">
            Welcome back.
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Last sync:{' '}
            {stats.repos.last_synced
              ? new Date(stats.repos.last_synced).toLocaleString()
              : 'never'}
          </p>
        </div>
        <Button onClick={onSync} disabled={pending} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
          Sync from GitHub
        </Button>
      </div>

      {!stats.contactForwarding.isConfigured ? (
        <Link
          to="/admin/messages"
          className="surface-card flex items-start gap-3 border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Contact forwarding needs setup before launch.</p>
            <p className="mt-1">
              Missing {stats.contactForwarding.missing.join(' and ')}. Contact submissions will
              be saved, but visitors will see a send error until forwarding is configured.
            </p>
          </div>
        </Link>
      ) : null}

      {stats.messages.failed_forwarding > 0 ? (
        <Link
          to="/admin/messages"
          className="surface-card flex items-start gap-3 border-red-300 bg-red-50 p-4 text-sm text-red-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              {stats.messages.failed_forwarding} contact message
              {stats.messages.failed_forwarding === 1 ? '' : 's'} failed to forward.
            </p>
            <p className="mt-1">
              Review the inbox and Resend configuration before relying on contact-form delivery.
            </p>
          </div>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Folder}
          label="Visible projects"
          value={`${stats.repos.visible}/${stats.repos.total}`}
          to="/admin/projects"
        />
        <StatCard icon={Activity} label="Pinned" value={stats.repos.pinned} to="/admin/projects" />
        <StatCard
          icon={FileText}
          label="Posts"
          value={`${stats.posts.published}+${stats.posts.drafts} draft`}
          to="/admin/blog"
        />
        <StatCard
          icon={Inbox}
          label="Unread messages"
          value={stats.messages.unread}
          to="/admin/messages"
        />
        <StatCard
          icon={MapPinned}
          label="Travel walls"
          value={`${stats.travel.visible}/${stats.travel.total}`}
          to="/admin/travel"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickAction
          icon={Folder}
          title="Curate projects"
          body="Toggle visibility, pin highlights, edit titles or covers."
          to="/admin/projects"
        />
        <QuickAction
          icon={Briefcase}
          title="Update experience"
          body="Add a new role or tweak the timeline."
          to="/admin/experience"
        />
        <QuickAction
          icon={MapPinned}
          title="Share travel walls"
          body="Embed LiveDrop photo walls and pin them to Google Maps places."
          to="/admin/travel"
        />
        <QuickAction
          icon={Sparkles}
          title="Refresh skills"
          body="Add or remove technologies in your toolbelt."
          to="/admin/skills"
        />
        <QuickAction
          icon={FileText}
          title="Write a note"
          body="Draft a new post in markdown with live preview."
          to="/admin/blog"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Folder
  label: string
  value: string | number
  to:
    | '/admin/projects'
    | '/admin/travel'
    | '/admin/experience'
    | '/admin/skills'
    | '/admin/blog'
    | '/admin/profile'
    | '/admin/messages'
}) {
  return (
    <Link to={to} className="surface-card group flex items-start gap-3 p-4 transition hover:-translate-y-0.5">
      <div
        className="grid h-9 w-9 place-items-center rounded-lg text-white"
        style={{ background: 'linear-gradient(135deg, var(--lagoon), var(--palm))' }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--sea-ink-soft)]">
          {label}
        </p>
        <p className="truncate text-lg font-semibold text-[color:var(--sea-ink)]">{value}</p>
      </div>
    </Link>
  )
}

function QuickAction({
  icon: Icon,
  title,
  body,
  to,
}: {
  icon: typeof Folder
  title: string
  body: string
  to:
    | '/admin/projects'
    | '/admin/travel'
    | '/admin/experience'
    | '/admin/skills'
    | '/admin/blog'
    | '/admin/profile'
    | '/admin/messages'
}) {
  return (
    <Link to={to} className="surface-card group flex items-start gap-3 p-5">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--link-bg-hover)] text-[color:var(--lagoon-deep)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[color:var(--sea-ink)]">{title}</p>
          <ArrowRight className="h-4 w-4 text-[color:var(--sea-ink-soft)] transition group-hover:translate-x-0.5" />
        </div>
        <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">{body}</p>
      </div>
    </Link>
  )
}
