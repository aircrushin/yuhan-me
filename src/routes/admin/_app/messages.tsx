import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AlertTriangle, CheckCircle2, Mail, MailOpen, Trash2 } from 'lucide-react'
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
  const data = Route.useLoaderData()
  const messages = data.messages
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

      {!data.contactForwarding.isConfigured ? (
        <div className="surface-card border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Contact forwarding is not configured.</p>
              <p className="mt-1">
                Public submissions are saved in this inbox, but visitors now see a send error
                until {data.contactForwarding.missing.join(' and ')} are set.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {data.failedCount > 0 ? (
        <div className="surface-card border-red-300 bg-red-50 p-4 text-sm text-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                {data.failedCount} message{data.failedCount === 1 ? '' : 's'} failed to forward.
              </p>
              <p className="mt-1">
                These submissions are visible here, but the sender was not shown a success toast.
              </p>
            </div>
          </div>
        </div>
      ) : null}

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
                <ForwardingBadge status={m.forwardStatus} />
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
              {m.forwardStatus === 'failed' && m.forwardError ? (
                <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-900">
                  {m.forwardError}
                </p>
              ) : null}
              {m.forwardStatus === 'not_configured' ? (
                <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  Saved while Resend forwarding was unavailable.
                </p>
              ) : null}
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

function ForwardingBadge({ status }: { status: string }) {
  if (status === 'sent') {
    return (
      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">
        <CheckCircle2 className="h-3 w-3" />
        forwarded
      </Badge>
    )
  }

  if (status === 'failed') {
    return (
      <Badge variant="outline" className="border-red-300 bg-red-50 text-red-900">
        <AlertTriangle className="h-3 w-3" />
        forward failed
      </Badge>
    )
  }

  if (status === 'pending') {
    return <Badge variant="secondary">forwarding</Badge>
  }

  if (status === 'unknown') {
    return <Badge variant="outline">forwarding unknown</Badge>
  }

  return (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-950">
      <AlertTriangle className="h-3 w-3" />
      not forwarded
    </Badge>
  )
}
