import { createFileRoute } from '@tanstack/react-router'

import { ContactSection } from '#/components/site/ContactSection'
import { getPublicProfile } from '#/server/public'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/contact')({
  loader: () => getPublicProfile(),
  component: ContactPage,
  head: () => ({ meta: [{ title: `${m.nav_contact()} — aircrushin` }] }),
})

function ContactPage() {
  const profile = Route.useLoaderData()
  return (
    <div className="pt-12">
      <ContactSection profile={profile} />
    </div>
  )
}
