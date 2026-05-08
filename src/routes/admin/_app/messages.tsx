import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { deleteMessage, listMessages, markMessageRead } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/messages')({
  loader: () => listMessages(),
  component: AdminMessages,
  head: () => ({ meta: [{ title: 'Admin · Messages' }] }),
})

function AdminMessages() {
  const messages = Route.useLoaderData()
  const router = useRouter()
  const mark = useServerFn(markMessageRead)
  const remove = useServerFn(deleteMessage)

  async function toggleRead(id: number, isRead: boolean) {
    try {
      await mark({ data: { id, isRead } })
      await router.invalidate()
    } catch {
      toast.error('Failed to update')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this message?')) return
    try {
      await remove({ data: { id } })
      await router.invalidate()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
          Inbox
        </h1>
        <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
          Submissions from the public contact form.
        </p>
      </div>

      <ul className="space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between ${
              m.isRead ? 'opacity-70' : ''
            }`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {m.isRead ? null : <Badge>new</Badge>}
                <span className="font-medium text-[color:var(--sea-ink)]">{m.name}</span>
                <a
                  href={`mailto:${m.email}`}
                  className="font-mono text-xs text-[color:var(--lagoon-deep)] hover:underline"
                >
                  {m.email}
                </a>
                <span className="ml-auto font-mono text-xs text-[color:var(--sea-ink-soft)]">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[color:var(--sea-ink-soft)]">{m.body}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => toggleRead(m.id, !m.isRead)}
                aria-label={m.isRead ? 'Mark unread' : 'Mark read'}
              >
                {m.isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDelete(m.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
        {messages.length === 0 ? (
          <li className="surface-card p-8 text-center text-sm text-[color:var(--sea-ink-soft)]">
            No messages yet.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
