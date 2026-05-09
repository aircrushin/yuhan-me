import { ExternalLink } from 'lucide-react'

import type { Experience } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface ExperienceSectionProps {
  items: Experience[]
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
  if (items.length === 0) return null
  return (
    <Section
      id="experience"
      kicker={m.section_experience_kicker()}
      title={m.section_experience_title()}
    >
      <ol className="timeline-rail relative space-y-6 pl-10">
        {items.map((item) => {
          const role = pickLocaleField(item, 'role') || item.role
          const company = pickLocaleField(item, 'company') || item.company
          const location = pickLocaleField(item, 'location') || item.location
          const description = pickLocaleField(item, 'description') || item.description
          return (
          <li key={item.id} className="relative">
            <span className="timeline-dot" />
            <div className="surface-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="display-title text-lg font-semibold text-[color:var(--sea-ink)]">
                  {role}
                </p>
                <p className="font-mono text-xs text-[color:var(--sea-ink-soft)]">
                  {item.startDate} → {item.endDate || m.experience_present()}
                </p>
              </div>
              <p className="mt-1 text-sm font-medium text-[color:var(--lagoon-deep)]">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {company}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  company
                )}
                {location ? (
                  <span className="text-[color:var(--sea-ink-soft)]"> · {location}</span>
                ) : null}
              </p>
              {description ? (
                <p className="mt-3 text-sm text-[color:var(--sea-ink-soft)]">{description}</p>
              ) : null}
            </div>
          </li>
          )
        })}
      </ol>
    </Section>
  )
}
