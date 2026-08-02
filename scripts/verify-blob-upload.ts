import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { listArtwork, uploadArtwork } from '../src/lib/blob'

async function main() {
  const fixturePath = resolve('scripts/fixtures/artwork-smoke.svg')
  const body = readFileSync(fixturePath)

  const uploaded = await uploadArtwork('smoke-test.svg', body, {
    contentType: 'image/svg+xml',
    addRandomSuffix: true,
  })

  console.log('Upload OK')
  console.log(`  pathname: ${uploaded.pathname}`)
  console.log(`  url: ${uploaded.url}`)
  console.log(`  contentType: ${uploaded.contentType}`)

  const listed = await listArtwork()
  const found = listed.blobs.some((blob) => blob.url === uploaded.url)
  if (!found) {
    throw new Error('Uploaded blob was not found in listArtwork()')
  }

  const response = await fetch(uploaded.url)
  if (!response.ok) {
    throw new Error(`Public fetch failed with status ${response.status}`)
  }

  const text = await response.text()
  if (!text.includes('artwork-smoke')) {
    throw new Error('Public blob content did not match the uploaded SVG')
  }

  console.log('Public fetch OK')
  console.log(`  listed: ${listed.blobs.length} artwork blob(s)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
