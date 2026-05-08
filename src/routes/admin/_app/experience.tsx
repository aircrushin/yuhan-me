import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import type { Experience } from '#/db/schema'
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
import { Textarea } from '#/components/ui/textarea'
import { deleteExperience, listExperience, upsertExperience } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/experience')({
  loader: () => listExperience(),
  component: AdminExperience,
  head: () => ({ meta: [{ title: 'Admin · Experience' }] }),
})

type Draft = Omit<Experience, 'id' | 'createdAt'> & { id?: number }

const EMPTY_DRAFT: Draft = {
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  url: '',
  displayOrder: 0,
}

function AdminExperience() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const upsert = useServerFn(upsertExperience)
  const remove = useServerFn(deleteExperience)

  function startNew() {
    setDraft({ ...EMPTY_DRAFT, displayOrder: items.length })
    setOpen(true)
  }

  function startEdit(item: Experience) {
    setDraft({
      id: item.id,
      role: item.role,
      company: item.company,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      description: item.description,
      url: item.url,
      displayOrder: item.displayOrder,
    })
    setOpen(true)
  }

  async function save() {
    try {
      await upsert({
        data: {
          ...draft,
          endDate: draft.endDate?.trim() ? draft.endDate : null,
        },
      })
      toast.success('Saved')
      setOpen(false)
      await router.invalidate()
    } catch {
      toast.error('Failed to save')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this entry?')) return
    try {
      await remove({ data: { id } })
      await router.invalidate()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Experience
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            The timeline shown on the public homepage.
          </p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add entry
        </Button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="display-title text-lg font-semibold text-[color:var(--sea-ink)]">
                {item.role}
              </p>
              <p className="text-sm text-[color:var(--lagoon-deep)]">
                {item.company}
                {item.location ? ` · ${item.location}` : ''}
              </p>
              <p className="mt-1 font-mono text-xs text-[color:var(--sea-ink-soft)]">
                {item.startDate} → {item.endDate || 'Present'}
              </p>
              {item.description ? (
                <p className="mt-2 text-sm text-[color:var(--sea-ink-soft)]">{item.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="icon-sm" variant="ghost" onClick={() => startEdit(item)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="surface-card p-8 text-center text-sm text-[color:var(--sea-ink-soft)]">
            No experience yet. Click "Add entry" to start your timeline.
          </li>
        ) : null}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit experience' : 'New experience'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Role</Label>
              <Input
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Start (YYYY or YYYY-MM)</Label>
              <Input
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End (or "Present" / blank)</Label>
              <Input
                value={draft.endDate ?? ''}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>URL</Label>
              <Input
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Display order</Label>
              <Input
                type="number"
                value={draft.displayOrder}
                onChange={(e) =>
                  setDraft({ ...draft, displayOrder: Number(e.target.value || 0) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
