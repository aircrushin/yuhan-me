import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Eye, Pencil, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import type { Post } from '#/db/schema'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { deletePost, upsertPost } from '#/server/admin'

interface PostEditorProps {
  initial: Post | null
}

export function PostEditor({ initial }: PostEditorProps) {
  const navigate = useNavigate()
  const upsert = useServerFn(upsertPost)
  const remove = useServerFn(deletePost)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [locale, setLocale] = useState<'en' | 'zh'>((initial?.locale as 'en' | 'zh') ?? 'en')
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '')
  const [contentMd, setContentMd] = useState(initial?.contentMd ?? '')
  const [isDraft, setIsDraft] = useState(initial?.isDraft ?? true)
  const [pending, setPending] = useState(false)

  function autoSlug(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80)
  }

  async function save(opts: { andClose?: boolean } = {}) {
    if (!title.trim() || !slug.trim()) {
      toast.error('Title and slug are required')
      return
    }
    setPending(true)
    try {
      const result = await upsert({
        data: {
          id: initial?.id,
          title: title.trim(),
          slug: slug.trim(),
          locale,
          excerpt,
          coverUrl,
          contentMd,
          isDraft,
        },
      })
      toast.success('Saved')
      if (opts.andClose) {
        navigate({ to: '/admin/blog' })
      } else if (!initial) {
        navigate({ to: '/admin/blog/$id', params: { id: result.id.toString() } })
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setPending(false)
    }
  }

  async function onDelete() {
    if (!initial) return
    if (!confirm('Delete this post permanently?')) return
    try {
      await remove({ data: { id: initial.id } })
      navigate({ to: '/admin/blog' })
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            {initial ? 'Edit post' : 'New post'}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Markdown body supports GitHub-flavored markdown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {initial ? (
            <Button variant="ghost" onClick={onDelete} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => save({ andClose: true })} disabled={pending}>
            Save & close
          </Button>
          <Button onClick={() => save()} disabled={pending} className="gap-2">
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!initial && (slug === '' || slug === autoSlug(title))) {
                  setSlug(autoSlug(e.target.value))
                }
              }}
              placeholder="A clear, search-friendly title"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One-line summary for cards and meta description"
            />
          </div>

          <Tabs defaultValue="write" className="space-y-3">
            <TabsList>
              <TabsTrigger value="write" className="gap-2">
                <Pencil className="h-3.5 w-3.5" /> Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-3.5 w-3.5" /> Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <Textarea
                rows={26}
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                className="font-mono text-sm"
                placeholder="# Hello, world\n\nWrite something..."
              />
            </TabsContent>
            <TabsContent value="preview">
              <article className="prose prose-zinc max-w-none rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contentMd || '_Nothing to preview yet._'}
                </ReactMarkdown>
              </article>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <div className="surface-card space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[color:var(--sea-ink)]">Status</p>
                <p className="text-xs text-[color:var(--sea-ink-soft)]">
                  Drafts are hidden from the public site.
                </p>
              </div>
              <Switch checked={!isDraft} onCheckedChange={(v) => setIsDraft(!v)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Locale</Label>
              <div className="flex gap-2">
                {(['en', 'zh'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    data-active={locale === l}
                    className="chip uppercase"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover image URL</Label>
              <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
