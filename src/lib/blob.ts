import { del, list, put, type PutBlobResult } from '@vercel/blob'

const ARTWORK_PREFIX = 'artwork'

function assertBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is missing. Pull it with `vercel env pull .env.local --yes`.',
    )
  }
}

export function artworkPath(filename: string) {
  const cleaned = filename.replace(/^\/+/, '').replace(/\.\./g, '')
  return `${ARTWORK_PREFIX}/${cleaned}`
}

export async function uploadArtwork(
  filename: string,
  body: Parameters<typeof put>[1],
  options?: {
    contentType?: string
    addRandomSuffix?: boolean
    allowOverwrite?: boolean
  },
): Promise<PutBlobResult> {
  assertBlobToken()

  return put(artworkPath(filename), body, {
    access: 'public',
    contentType: options?.contentType,
    addRandomSuffix: options?.addRandomSuffix ?? true,
    allowOverwrite: options?.allowOverwrite,
  })
}

export async function listArtwork(limit = 100) {
  assertBlobToken()
  return list({ prefix: `${ARTWORK_PREFIX}/`, limit })
}

export async function deleteArtwork(urlOrPathname: string | string[]) {
  assertBlobToken()
  return del(urlOrPathname)
}
