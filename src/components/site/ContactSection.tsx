import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import type { Profile } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { submitContact } from '#/server/public'
import { m } from '#/paraglide/messages'

interface ContactSectionProps {
  profile: Profile | null
}

export function ContactSection({ profile }: ContactSectionProps) {
  const submit = useServerFn(submitContact)
  const [pending, setPending] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    try {
      await submit({ data: { name, email, body } })
      toast.success(m.form_success())
      setName('')
      setEmail('')
      setBody('')
    } catch {
      toast.error(m.form_error())
    } finally {
      setPending(false)
    }
  }

  return (
    <Section
      id="contact"
      kicker={m.section_contact_kicker()}
      title={m.section_contact_title()}
      description={m.section_contact_subtitle()}
    >
      <div className="contact-panel">
        <form onSubmit={onSubmit} className="surface-card space-y-4 p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{m.form_name()}</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={1}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{m.form_email()}</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-body">{m.form_message()}</Label>
            <Textarea
              id="contact-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={5}
              maxLength={5000}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="gap-2 rounded-sm px-6">
              <Send className="h-4 w-4" />
              {m.form_send()}
            </Button>
          </div>
        </form>

        <div className="surface-card flex flex-col gap-4 p-6 md:p-8">
          <p className="display-title text-2xl font-semibold text-[color:var(--sea-ink)]">
            {m.contact_direct_title()}
          </p>
          <p className="text-sm text-[color:var(--sea-ink-soft)]">
            {m.contact_direct_body()}
          </p>
          <div className="contact-fit-list" aria-label={m.contact_fit_aria()}>
            {[m.contact_fit_product(), m.contact_fit_ai(), m.contact_fit_open_source()].map((item) => (
              <div key={item} className="contact-fit-item">
                <CheckCircle2 className="h-4 w-4" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2 text-sm">
            {profile?.email ? (
              <ContactLink
                label={m.contact_label_email()}
                href={`mailto:${profile.email}`}
                value={profile.email}
              />
            ) : null}
            {profile?.github ? (
              <ContactLink
                label={m.contact_label_github()}
                href={profile.github}
                value={profile.github.replace('https://', '')}
              />
            ) : null}
            {profile?.x ? (
              <ContactLink
                label={m.contact_label_x()}
                href={profile.x}
                value={m.contact_label_x()}
              />
            ) : null}
            {profile?.linkedin ? (
              <ContactLink
                label={m.contact_label_linkedin()}
                href={profile.linkedin}
                value={m.contact_label_linkedin()}
              />
            ) : null}
            {profile?.resumeUrl ? (
              <ContactLink
                label={m.contact_label_resume()}
                href={profile.resumeUrl}
                value={m.contact_resume_value()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  )
}

function ContactLink({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-sm border border-[var(--line)] bg-[var(--surface)] px-3 py-2 transition hover:bg-[var(--link-bg-hover)]"
    >
      <span className="text-xs uppercase tracking-[0.16em] text-[color:var(--sea-ink-soft)]">
        {label}
      </span>
      <span className="font-mono text-xs text-[color:var(--sea-ink)]">{value}</span>
    </a>
  )
}
