import { createFileRoute } from '@tanstack/react-router'

import { ArtworkGallery } from '#/components/site/ArtworkGallery'
import { getArtworkImages } from '#/server/public'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/artwork')({
  loader: () => getArtworkImages(),
  component: ArtworkPage,
  head: () => ({
    meta: [
      { title: `${m.nav_artwork()} — aircrushin` },
      { name: 'description', content: m.artwork_page_description() },
      { property: 'og:title', content: `${m.nav_artwork()} — aircrushin` },
      { property: 'og:description', content: m.artwork_page_description() },
    ],
  }),
})

function ArtworkPage() {
  const items = Route.useLoaderData()

  return (
    <div className="pt-12">
      {items.length > 0 ? (
        <ArtworkGallery items={items} />
      ) : (
        <ArtworkEmptyState />
      )}
    </div>
  )
}

function ArtworkEmptyState() {
  return (
    <section className="section">
      <div className="page-wrap">
        <div className="section-heading mb-8">
          <div>
            <div className="kicker-line">{m.artwork_page_kicker()}</div>
          </div>
          <div>
            <h2 className="section-title">{m.artwork_page_title()}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--sea-ink-soft)]">
              {m.artwork_page_description()}
            </p>
          </div>
        </div>
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.artwork_empty()}
        </div>
      </div>
    </section>
  )
}
