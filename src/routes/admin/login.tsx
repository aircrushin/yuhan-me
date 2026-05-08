import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
  head: () => ({ meta: [{ title: 'Admin sign in — aircrushin' }] }),
})

function AdminLogin() {
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        toast.error(m.admin_login_error())
        setPending(false)
        return
      }
      navigate({ to: '/admin' })
    } catch {
      toast.error(m.admin_login_error())
      setPending(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={onSubmit}
        className="surface-card w-full max-w-sm space-y-5 p-8"
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-full text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, var(--lagoon), var(--palm))' }}
          >
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="display-title text-xl font-semibold text-[color:var(--sea-ink)]">
              {m.admin_login_title()}
            </p>
            <p className="text-xs text-[color:var(--sea-ink-soft)]">{m.admin_login_subtitle()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{m.admin_login_password()}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {m.admin_login_submit()}
        </Button>
      </form>
    </div>
  )
}
