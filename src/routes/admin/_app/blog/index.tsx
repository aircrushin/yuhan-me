import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { deletePost, listPostsAdmin } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/blog/')({
  loader: () => listPostsAdmin(),
  component: BlogIndex,
  head: () => ({ meta: [{ title: 'Admin · Blog' }] }),
})

function BlogIndex() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const remove = useServerFn(deletePost)

  async function onDelete(id: number) {
    if (!confirm('Delete this post?')) return
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
            Writing
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Markdown posts displayed under <code>/blog</code>.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/blog/new">
            <Plus className="h-4 w-4" /> New post
          </Link>
        </Button>
      </div>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {post.isDraft ? <Badge variant="outline">draft</Badge> : <Badge>published</Badge>}
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {post.locale}
                </Badge>
                <span className="font-mono text-xs text-[color:var(--sea-ink-soft)]">/{post.slug}</span>
              </div>
              <p className="mt-2 display-title text-lg font-semibold text-[color:var(--sea-ink)]">
                {post.title}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-[color:var(--sea-ink-soft)]">
                {post.excerpt || '—'}
              </p>
              <p className="mt-1 text-xs text-[color:var(--sea-ink-soft)]">
                Updated {new Date(post.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild size="sm" variant="ghost" className="gap-1">
                <Link to="/admin/blog/$id" params={{ id: post.id.toString() }}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => onDelete(post.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="surface-card p-8 text-center text-sm text-[color:var(--sea-ink-soft)]">
            No posts yet. Click "New post" to start writing.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
