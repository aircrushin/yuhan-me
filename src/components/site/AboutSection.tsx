import { MapPin, Sparkles } from 'lucide-react'

import type { Profile } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { m } from '#/paraglide/messages'

interface AboutSectionProps {
  profile: Profile | null
}

export function AboutSection({ profile }: AboutSectionProps) {
  const bio = cleanPublicCopy(
    profile?.bio?.trim() ||
      "I'm an indie developer who likes building small, opinionated tools, usually around AI tooling, prompt management, and creative coding. Most of my work is open-source.",
  )

  return (
    <Section
      id="about"
      kicker={m.section_about_kicker()}
      title={m.section_about_title()}
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
            {profile?.currently ? (
              <p className="flex items-center gap-1.5 text-sm text-[color:var(--sea-ink-soft)]">
                <Sparkles className="h-3.5 w-3.5" />
                {profile.currently}
              </p>
            ) : null}
          </div>
        </div>

        <div className="about-copy prose prose-zinc max-w-none text-[color:var(--sea-ink-soft)]">
          <p className="max-w-3xl text-2xl leading-10 text-[color:var(--sea-ink)]">
            {bio}
          </p>
          <p className="mt-6 max-w-2xl">
            I work mostly with TypeScript, React, and Postgres. When I'm not shipping side projects,
            I'm reading papers, listening to ambient mixes, or hunting for obscure cafés.
          </p>
        </div>
      </div>
    </Section>
  )
}

function cleanPublicCopy(value: string) {
  return value.replace(/\s+\u2014\s+/g, ', ')
}
