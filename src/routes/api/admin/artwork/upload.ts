import { createFileRoute } from '@tanstack/react-router'

import { ADMIN_COOKIE, getCookie, verifySession } from '#/lib/admin-auth'
import { toArtworkImage } from '#/lib/artwork'
import { uploadArtwork } from '#/lib/blob'

const MAX_BYTES = 12 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
])

export const Route = createFileRoute('/api/admin/artwork/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = getCookie(cookieHeader, ADMIN_COOKIE)
        const session = await verifySession(token)
        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let form: FormData
        try {
          form = await request.formData()
        } catch {
          return Response.json({ error: 'Invalid form data' }, { status: 400 })
        }

        const file = form.get('file')
        if (!(file instanceof File)) {
          return Response.json({ error: 'Missing file' }, { status: 400 })
        }
        if (!ALLOWED_TYPES.has(file.type)) {
          return Response.json(
            { error: `Unsupported type: ${file.type || 'unknown'}` },
            { status: 400 },
          )
        }
        if (file.size <= 0 || file.size > MAX_BYTES) {
          return Response.json(
            { error: `File must be between 1 byte and ${MAX_BYTES / (1024 * 1024)}MB` },
            { status: 400 },
          )
        }

        try {
          const uploaded = await uploadArtwork(file.name, file, {
            contentType: file.type,
            addRandomSuffix: true,
          })
          return Response.json(toArtworkImage(uploaded))
        } catch (error) {
          console.error('Artwork upload failed', error)
          return Response.json(
            {
              error:
                error instanceof Error ? error.message : 'Failed to upload artwork',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
