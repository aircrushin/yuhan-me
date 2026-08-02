export type ArtworkImage = {
  url: string
  pathname: string
  contentType: string | null
  size: number
  uploadedAt: string
}

export function toArtworkImage(blob: {
  url: string
  pathname: string
  contentType?: string
  size?: number
  uploadedAt?: Date | string
}): ArtworkImage {
  const uploadedAt = blob.uploadedAt
    ? blob.uploadedAt instanceof Date
      ? blob.uploadedAt.toISOString()
      : new Date(blob.uploadedAt).toISOString()
    : new Date().toISOString()

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType ?? null,
    size: blob.size ?? 0,
    uploadedAt,
  }
}

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|svg|webp)$/i

export function filenameFromPathname(pathname: string) {
  const parts = pathname.split('/')
  return parts[parts.length - 1] || pathname
}

export function isArtworkImagePath(pathname: string) {
  return IMAGE_EXT.test(pathname)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
