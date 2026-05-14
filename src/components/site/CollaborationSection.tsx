import { ArrowUpRight, Handshake, Rocket, Workflow } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

const collaborationItems = [
  {
    icon: Rocket,
    title: m.collaboration_item_product_title,
    body: m.collaboration_item_product_body,
  },
  {
    icon: Workflow,
    title: m.collaboration_item_ai_title,
    body: m.collaboration_item_ai_body,
  },
  {
    icon: Handshake,
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
      <div className="collaboration-grid">
        {collaborationItems.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title()} className="collaboration-card surface-card">
              <div className="collaboration-card-icon" aria-hidden="true">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="display-title text-xl font-semibold text-[color:var(--sea-ink)]">
                {item.title()}
              </h3>
              <p className="text-sm leading-6 text-[color:var(--sea-ink-soft)]">
                {item.body()}
              </p>
            </article>
          )
        })}
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
