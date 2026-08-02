import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { ArtworkImage } from '#/lib/artwork'
import { filenameFromPathname, formatBytes } from '#/lib/artwork'
import { Button } from '#/components/ui/button'
import { deleteArtworkAdmin, listArtworkAdmin } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/artwork')({
  loader: () => listArtworkAdmin(),
  component: AdminArtwork,
  head: () => ({ meta: [{ title: 'Admin · Artwork' }] }),
})

function AdminArtwork() {
  const initial = Route.useLoaderData()
  const router = useRouter()
  const remove = useServerFn(deleteArtworkAdmin)
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ArtworkImage[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    setItems(initial)
  }, [initial])

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (list.length === 0) {
      toast.error('Choose one or more image files')
      return
    }

    setUploading(true)
    let uploaded = 0
    try {
      for (const file of list) {
        const form = new FormData()
        form.append('file', file)
        const response = await fetch('/api/admin/artwork/upload', {
          method: 'POST',
          body: form,
        })
        const payload = (await response.json().catch(() => null)) as
          | ArtworkImage
          | { error?: string }
          | null
        if (!response.ok) {
          const message =
            payload && 'error' in payload && payload.error
              ? payload.error
              : `Failed to upload ${file.name}`
          throw new Error(message)
        }
        uploaded += 1
      }
      toast.success(uploaded === 1 ? 'Uploaded 1 image' : `Uploaded ${uploaded} images`)
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function onDelete(item: ArtworkImage) {
    if (!confirm(`Delete ${filenameFromPathname(item.pathname)}?`)) return
    try {
      await remove({ data: { url: item.url } })
      toast.success('Deleted')
      await router.invalidate()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-title text-3xl font-semibold text-[color:var(--sea-ink)]">
            Artwork
          </h1>
          <p className="mt-1 text-sm text-[color:var(--sea-ink-soft)]">
            Upload images to Vercel Blob. They appear on the public /artwork masonry wall.
          </p>
        </div>
        <Button
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload images'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files)
          }}
        />
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          if (event.dataTransfer.files.length > 0) {
            void uploadFiles(event.dataTransfer.files)
          }
        }}
        className={`surface-card flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center transition ${
          dragOver ? 'border-[color:var(--lagoon-deep)] bg-[var(--link-bg-hover)]' : ''
        }`}
      >
        <ImagePlus className="h-8 w-8 text-[color:var(--lagoon-deep)]" />
        <div>
          <p className="font-medium text-[color:var(--sea-ink)]">
            Drop images here, or click Upload
          </p>
          <p className="mt-1 text-xs text-[color:var(--sea-ink-soft)]">
            JPEG, PNG, WebP, GIF, AVIF, SVG · max 12MB each
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          No artwork blobs yet. Upload a few images to seed the gallery.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article key={item.url} className="surface-card overflow-hidden">
              <div className="aspect-[4/5] bg-[var(--surface)]">
                <img
                  src={item.url}
                  alt={filenameFromPathname(item.pathname)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[color:var(--sea-ink)]">
                    {filenameFromPathname(item.pathname)}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--sea-ink-soft)]">
                    {formatBytes(item.size)} · {new Date(item.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={uploading}
                  onClick={() => onDelete(item)}
                  aria-label="Delete artwork"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
