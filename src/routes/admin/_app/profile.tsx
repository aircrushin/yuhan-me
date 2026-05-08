import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { getProfile, updateProfile } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/profile')({
  loader: () => getProfile(),
  component: AdminProfile,
  head: () => ({ meta: [{ title: 'Admin · Profile' }] }),
})

function AdminProfile() {
  const initial = Route.useLoaderData()
  const update = useServerFn(updateProfile)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? 'aircrushin',
    headline: initial?.headline ?? '',
    bio: initial?.bio ?? '',
    avatarUrl: initial?.avatarUrl ?? '',
    location: initial?.location ?? 'Chengdu, China',
    currently: initial?.currently ?? '',
    email: initial?.email ?? '',
    github: initial?.github ?? 'https://github.com/aircrushin',
    x: initial?.x ?? '',
    linkedin: initial?.linkedin ?? '',
    resumeUrl: initial?.resumeUrl ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    try {
      await update({ data: form })
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Profile
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            How you appear in the hero, about, and footer.
          </p>
        </div>
        <Button type="submit" disabled={pending} className="gap-2">
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="surface-card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => set('location', e.target.value)} />
            </Field>
            <Field label="Currently" hint="Short status, e.g. 'Open-source · MS @ Monash'" className="sm:col-span-2">
              <Input value={form.currently} onChange={(e) => set('currently', e.target.value)} />
            </Field>
            <Field label="Headline" className="sm:col-span-2">
              <Input value={form.headline} onChange={(e) => set('headline', e.target.value)} />
            </Field>
            <Field label="Bio" className="sm:col-span-2">
              <Textarea
                rows={5}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
            </Field>
            <Field label="Avatar URL" className="sm:col-span-2">
              <Input value={form.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="hello@example.com"
              />
            </Field>
            <Field label="GitHub">
              <Input value={form.github} onChange={(e) => set('github', e.target.value)} />
            </Field>
            <Field label="Twitter / X">
              <Input value={form.x} onChange={(e) => set('x', e.target.value)} placeholder="https://x.com/…" />
            </Field>
            <Field label="LinkedIn">
              <Input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/…" />
            </Field>
            <Field label="Resume URL" className="sm:col-span-2">
              <Input value={form.resumeUrl} onChange={(e) => set('resumeUrl', e.target.value)} placeholder="https://…/resume.pdf" />
            </Field>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card p-6 text-center">
            <Avatar className="mx-auto h-28 w-28 rounded-2xl shadow-md">
              <AvatarImage src={form.avatarUrl} alt={form.name} />
              <AvatarFallback className="rounded-2xl">{form.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="display-title mt-4 text-xl font-semibold text-[color:var(--sea-ink)]">
              {form.name}
            </p>
            <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">{form.headline}</p>
            <p className="mt-3 text-xs text-[color:var(--lagoon-deep)]">{form.location}</p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-[color:var(--sea-ink-soft)]">{hint}</p> : null}
    </div>
  )
}
