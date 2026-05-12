import { createFileRoute } from '@tanstack/react-router'

import { TravelSection } from '#/components/site/TravelSection'
import { getVisibleTravelDumps } from '#/server/public'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/travel')({
  loader: () => getVisibleTravelDumps(),
  component: TravelPage,
  head: () => ({
    meta: [
      { title: `${m.nav_travel()} — aircrushin` },
      { name: 'description', content: m.section_travel_description() },
      { property: 'og:title', content: `${m.nav_travel()} — aircrushin` },
      { property: 'og:description', content: m.section_travel_description() },
    ],
  }),
})

function TravelPage() {
  const items = Route.useLoaderData()

  return (
    <div className="pt-12">
      {items.length > 0 ? (
        <TravelSection items={items} />
      ) : (
        <TravelEmptyState />
      )}
    </div>
  )
}

function TravelEmptyState() {
  return (
    <section className="section">
      <div className="page-wrap">
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.travel_empty()}
        </div>
      </div>
    </section>
  )
}
