import { ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

const collaborationItems = [
  {
    title: m.collaboration_item_product_title,
    body: m.collaboration_item_product_body,
  },
  {
    title: m.collaboration_item_ai_title,
    body: m.collaboration_item_ai_body,
  },
  {
    title: m.collaboration_item_partner_title,
    body: m.collaboration_item_partner_body,
  },
]

export function CollaborationSection() {
  return (
    <Section
      id="collaboration"
      kicker={m.section_collaboration_kicker()}
      title={m.section_collaboration_title()}
      description={m.section_collaboration_subtitle()}
      className="collaboration-section"
    >
      <div className="collaboration-stack">
        {collaborationItems.map((item, index) => (
          <article
            key={item.title()}
            className="collaboration-row"
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              event.currentTarget.style.setProperty('--row-x', `${event.clientX - rect.left}px`)
              event.currentTarget.style.setProperty('--row-y', `${event.clientY - rect.top}px`)
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.removeProperty('--row-x')
              event.currentTarget.style.removeProperty('--row-y')
            }}
          >
            <span className="collaboration-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="collaboration-row-copy">
              <h3 className="display-title text-2xl font-semibold">
                {item.title()}
              </h3>
              <p>
                {item.body()}
              </p>
            </div>
            <div className="collaboration-row-object" aria-hidden="true">
              <span />
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </article>
        ))}
      </div>
      <div className="collaboration-note">
        <p>{m.collaboration_note()}</p>
        <Link to="/contact" className="collaboration-link">
          {m.collaboration_cta()}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  )
}
