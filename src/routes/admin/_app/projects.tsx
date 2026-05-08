import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Pencil,
  Pin,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Repo } from '#/db/schema'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import {
  listAllRepos,
  reorderRepos,
  syncGithub,
  updateRepo,
} from '#/server/admin'

export const Route = createFileRoute('/admin/_app/projects')({
  loader: () => listAllRepos(),
  component: AdminProjects,
  head: () => ({ meta: [{ title: 'Admin · Projects' }] }),
})

function AdminProjects() {
  const initial = Route.useLoaderData()
  const router = useRouter()
  const [items, setItems] = useState<Repo[]>(initial)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden' | 'pinned'>('all')
  const [editing, setEditing] = useState<Repo | null>(null)
  const [syncing, setSyncing] = useState(false)

  const update = useServerFn(updateRepo)
  const reorder = useServerFn(reorderRepos)
  const sync = useServerFn(syncGithub)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((r) => {
      if (filter === 'visible' && !r.isVisible) return false
      if (filter === 'hidden' && r.isVisible) return false
      if (filter === 'pinned' && !r.isPinned) return false
      if (!q) return true
      const hay = `${r.name} ${r.fullName} ${r.description ?? ''} ${r.customTitle ?? ''} ${(r.topics || []).join(' ')}`
      return hay.toLowerCase().includes(q)
    })
  }, [items, query, filter])

  function localPatch(id: number, patch: Partial<Repo>) {
    setItems((rows) => rows.map((r) => (r.githubId === id ? { ...r, ...patch } : r)))
  }

  async function toggleVisible(repo: Repo, value: boolean) {
    localPatch(repo.githubId, { isVisible: value })
    try {
      await update({ data: { githubId: repo.githubId, isVisible: value } })
    } catch {
      toast.error('Failed to update')
      localPatch(repo.githubId, { isVisible: repo.isVisible })
    }
  }

  async function togglePinned(repo: Repo, value: boolean) {
    localPatch(repo.githubId, { isPinned: value })
    try {
      await update({ data: { githubId: repo.githubId, isPinned: value } })
    } catch {
      toast.error('Failed to update')
      localPatch(repo.githubId, { isPinned: repo.isPinned })
    }
  }

  async function move(repo: Repo, direction: -1 | 1) {
    const ordered = [...items]
    const idx = ordered.findIndex((r) => r.githubId === repo.githubId)
    if (idx === -1) return
    const swap = idx + direction
    if (swap < 0 || swap >= ordered.length) return
    ;[ordered[idx], ordered[swap]] = [ordered[swap]!, ordered[idx]!]
    setItems(ordered)
    try {
      await reorder({ data: { ids: ordered.map((r) => r.githubId) } })
    } catch {
      toast.error('Failed to reorder')
      setItems(items)
    }
  }

  async function onSync() {
    setSyncing(true)
    try {
      const r = await sync()
      toast.success(`Synced ${r.synced} repos`)
      await router.invalidate()
      setItems(initial)
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Toggle visibility, pin highlights, override titles or covers. Hidden repos never appear
            on the public site.
          </p>
        </div>
        <Button onClick={onSync} disabled={syncing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync now
        </Button>
      </div>

      <div className="surface-card flex flex-wrap items-center gap-2 p-3">
        {(['all', 'visible', 'hidden', 'pinned'] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-active={filter === f}
            onClick={() => setFilter(f)}
            className="chip capitalize"
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--sea-ink-soft)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, topic, language…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface)] text-left text-[11px] uppercase tracking-[0.14em] text-[color:var(--sea-ink-soft)]">
            <tr>
              <th className="w-14 px-3 py-3">Order</th>
              <th className="px-3 py-3">Repo</th>
              <th className="px-3 py-3">Lang</th>
              <th className="px-3 py-3">Stars</th>
              <th className="w-20 px-3 py-3 text-center">Visible</th>
              <th className="w-20 px-3 py-3 text-center">Pinned</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((repo, i) => (
              <tr key={repo.githubId} className="border-t border-[var(--line)]">
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(repo, -1)}
                      disabled={i === 0}
                      className="rounded border border-[var(--line)] p-1 text-[color:var(--sea-ink-soft)] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(repo, 1)}
                      disabled={i === filtered.length - 1}
                      className="rounded border border-[var(--line)] p-1 text-[color:var(--sea-ink-soft)] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[color:var(--sea-ink)] hover:underline"
                    >
                      {repo.customTitle?.trim() || repo.name}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                    <span className="line-clamp-1 text-xs text-[color:var(--sea-ink-soft)]">
                      {repo.customDescription?.trim() || repo.description || '—'}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {repo.isFork ? <Badge variant="outline">fork</Badge> : null}
                      {repo.isArchived ? <Badge variant="outline">archived</Badge> : null}
                      {(repo.topics || []).slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle text-xs">{repo.language || '—'}</td>
                <td className="px-3 py-3 align-middle">
                  <span className="inline-flex items-center gap-1 text-xs text-[color:var(--sea-ink-soft)]">
                    <Star className="h-3 w-3" />
                    {repo.stars}
                  </span>
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  <Switch
                    checked={repo.isVisible}
                    onCheckedChange={(v) => toggleVisible(repo, v)}
                  />
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => togglePinned(repo, !repo.isPinned)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                      repo.isPinned
                        ? 'border-transparent bg-[var(--lagoon-deep)] text-white'
                        : 'border-[var(--line)] text-[color:var(--sea-ink-soft)]'
                    }`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                </td>
                <td className="px-3 py-3 align-middle">
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(repo)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-sm text-[color:var(--sea-ink-soft)]">
                  Nothing matches this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editing ? (
        <EditRepoDialog
          key={editing.githubId}
          repo={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            localPatch(editing.githubId, patch)
            try {
              await update({ data: { githubId: editing.githubId, ...patch } })
              toast.success('Saved')
              setEditing(null)
            } catch {
              toast.error('Failed to save')
            }
          }}
        />
      ) : null}
    </div>
  )
}

function EditRepoDialog({
  repo,
  onClose,
  onSave,
}: {
  repo: Repo
  onClose: () => void
  onSave: (patch: { customTitle: string | null; customDescription: string | null; customCoverUrl: string | null }) => Promise<void>
}) {
  const [title, setTitle] = useState(repo.customTitle ?? '')
  const [description, setDescription] = useState(repo.customDescription ?? '')
  const [cover, setCover] = useState(repo.customCoverUrl ?? '')

  return (
    <Dialog open={!!repo} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {repo.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Custom title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={repo.name}
            />
          </div>
          <div className="space-y-2">
            <Label>Custom description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={repo.description ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label>Custom cover image URL</Label>
            <Input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                customTitle: title.trim() || null,
                customDescription: description.trim() || null,
                customCoverUrl: cover.trim() || null,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
