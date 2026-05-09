import { MapPin, Sparkles } from 'lucide-react'

import type { Profile } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface AboutSectionProps {
  profile: Profile | null
}

export function AboutSection({ profile }: AboutSectionProps) {
  const bio = cleanPublicCopy(
    pickLocaleField(profile, 'bio') || m.about_fallback_bio(),
  )
  const currently = pickLocaleField(profile, 'currently')

  return (
    <Section
      id="about"
      kicker={m.section_about_kicker()}
      title={<AboutLanguageTitle />}
    >
      <div className="about-layout">
        <div className="profile-plate">
          <Avatar className="h-32 w-32 rounded-sm shadow-md">
            <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.name || 'avatar'} />
            <AvatarFallback className="rounded-sm">AC</AvatarFallback>
          </Avatar>
          <div className="mt-5 space-y-2">
            <p className="display-title text-xl font-semibold text-[color:var(--sea-ink)]">
              {profile?.name || 'aircrushin'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-[color:var(--sea-ink-soft)]">
              <MapPin className="h-3.5 w-3.5" />
              {profile?.location || 'Chengdu, China'}
            </p>
            {currently ? (
              <p className="flex items-center gap-1.5 text-sm text-[color:var(--sea-ink-soft)]">
                <Sparkles className="h-3.5 w-3.5" />
                {currently}
              </p>
            ) : null}
          </div>
        </div>

        <div className="about-copy prose prose-zinc max-w-none text-[color:var(--sea-ink-soft)]">
          <p className="max-w-3xl text-2xl leading-10 text-[color:var(--sea-ink)]">
            {bio}
          </p>
          <p className="mt-6 max-w-2xl">
            {m.about_work_note()}
          </p>
        </div>
      </div>
    </Section>
  )
}

function AboutLanguageTitle() {
  return (
    <span className="about-language-title" aria-label={`${m.section_about_title_primary()} / ${m.section_about_title_secondary()}`}>
      <span className="language-tag" aria-hidden="true">{m.section_about_title_tag()}</span>
      <span className="language-switch-copy">
        <span className="language-copy-main">{m.section_about_title_primary()}</span>
        <span className="language-copy-alt" aria-hidden="true">{m.section_about_title_secondary()}</span>
      </span>
    </span>
  )
}

function cleanPublicCopy(value: string) {
  return value.replace(/\s+\u2014\s+/g, ', ')
}
