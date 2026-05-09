import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Skill } from '#/db/schema'
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
import { deleteSkill, listSkillsAdmin, upsertSkill } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/skills')({
  loader: () => listSkillsAdmin(),
  component: AdminSkills,
  head: () => ({ meta: [{ title: 'Admin · Skills' }] }),
})

type Draft = Omit<Skill, 'id'> & {
  id?: number
  nameEn: string
  nameZh: string
  categoryEn: string
  categoryZh: string
}
const EMPTY: Draft = { name: '', nameEn: '', nameZh: '', category: 'Tools', categoryEn: '', categoryZh: '', level: 3, displayOrder: 0 }

function AdminSkills() {
  const items = Route.useLoaderData()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  const upsert = useServerFn(upsertSkill)
  const remove = useServerFn(deleteSkill)

  const grouped = useMemo(() => {
    const m = new Map<string, Skill[]>()
    for (const s of items) {
      if (!m.has(s.category)) m.set(s.category, [])
      m.get(s.category)!.push(s)
    }
    return Array.from(m.entries())
  }, [items])

  function startNew() {
    setDraft({ ...EMPTY, displayOrder: items.length })
    setOpen(true)
  }

  function startEdit(s: Skill) {
    setDraft({ id: s.id, name: s.name, nameEn: s.nameEn ?? '', nameZh: s.nameZh ?? '', category: s.category, categoryEn: s.categoryEn ?? '', categoryZh: s.categoryZh ?? '', level: s.level, displayOrder: s.displayOrder })
    setOpen(true)
  }

  async function save() {
    try {
      await upsert({ data: draft })
      toast.success('Saved')
      setOpen(false)
      await router.invalidate()
    } catch {
      toast.error('Failed to save')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this skill?')) return
    await remove({ data: { id } })
    await router.invalidate()
    toast.success('Deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Skills
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            What you'd like the world to know you work with.
          </p>
        </div>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grouped.map(([cat, list]) => (
          <div key={cat} className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--lagoon-deep)]">
              {cat}
            </p>
            <ul className="mt-3 space-y-1.5">
              {list.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--link-bg-hover)]"
                >
                  <span className="text-sm text-[color:var(--sea-ink)]">{s.name}</span>
                  <span className="font-mono text-xs text-[color:var(--sea-ink-soft)]">
                    L{s.level}
                  </span>
                  <div className="ml-auto hidden gap-1 group-hover:flex">
                    <Button size="icon-xs" variant="ghost" onClick={() => startEdit(s)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon-xs" variant="ghost" onClick={() => onDelete(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="surface-card col-span-full p-8 text-center text-sm text-[color:var(--sea-ink-soft)]">
            No skills yet. Add the technologies and tools you work with.
          </div>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit skill' : 'New skill'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 max-h-[50vh] overflow-y-auto p-1">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name (default)</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name (EN)</Label>
              <Input
                value={draft.nameEn}
                onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
                placeholder={draft.name}
              />
            </div>
            <div className="space-y-2">
              <Label>Name (ZH)</Label>
              <Input
                value={draft.nameZh}
                onChange={(e) => setDraft({ ...draft, nameZh: e.target.value })}
                placeholder={draft.name}
              />
            </div>
            <div className="space-y-2">
              <Label>Category (default)</Label>
              <Input
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                list="skill-categories"
              />
              <datalist id="skill-categories">
                {Array.from(new Set(items.map((s) => s.category))).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Category (EN)</Label>
              <Input
                value={draft.categoryEn}
                onChange={(e) => setDraft({ ...draft, categoryEn: e.target.value })}
                placeholder={draft.category}
              />
            </div>
            <div className="space-y-2">
              <Label>Category (ZH)</Label>
              <Input
                value={draft.categoryZh}
                onChange={(e) => setDraft({ ...draft, categoryZh: e.target.value })}
                placeholder={draft.category}
              />
            </div>
            <div className="space-y-2">
              <Label>Level (1–5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={draft.level}
                onChange={(e) =>
                  setDraft({ ...draft, level: Math.max(1, Math.min(5, Number(e.target.value || 1))) })
                }
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
