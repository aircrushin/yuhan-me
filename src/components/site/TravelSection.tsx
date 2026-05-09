import { Link } from '@tanstack/react-router'
import { ArrowUpRight, MapPin } from 'lucide-react'

import type { TravelDump } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { TravelWallFrame } from '#/components/site/TravelWallFrame'
import { m } from '#/paraglide/messages'

interface TravelSectionProps {
  items: TravelDump[]
  preview?: boolean
}

export function TravelSection({ items, preview = false }: TravelSectionProps) {
  const visibleItems = preview ? items.slice(0, 1) : items
  if (visibleItems.length === 0) return null

  return (
    <Section
      id="travel"
      kicker={m.section_travel_kicker()}
      title={m.section_travel_title()}
      description={preview ? m.section_travel_description() : undefined}
    >
      <div className="space-y-8">
        {visibleItems.map((item) => (
          <article key={item.id} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="display-title text-2xl font-semibold text-[color:var(--sea-ink)]">
                  {item.name}
                </h3>
                <TravelLocation item={item} />
              </div>
              {preview ? (
                <Link
                  to="/travel"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--lagoon-deep)] hover:underline"
                >
                  {m.section_travel_view_all()}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="travel-frame-shell">
              <TravelWallFrame name={item.name} src={item.photoWallUrl} className="travel-frame" />
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function TravelLocation({ item }: { item: TravelDump }) {
  const label = item.locationName || item.formattedAddress
  if (!label) return null

  const body = (
    <>
      <MapPin className="h-3.5 w-3.5" />
      <span>{label}</span>
      {item.formattedAddress && item.formattedAddress !== label ? (
        <span className="text-[color:var(--sea-ink-soft)]">· {item.formattedAddress}</span>
      ) : null}
    </>
  )

  if (item.googleMapsUrl) {
    return (
      <a
        href={item.googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-[color:var(--lagoon-deep)] hover:underline"
      >
        {body}
      </a>
    )
  }

  return (
    <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-[color:var(--sea-ink-soft)]">
      {body}
    </p>
  )
}
