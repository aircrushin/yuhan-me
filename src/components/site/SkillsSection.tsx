import type { Skill } from '#/db/schema'
import type { CSSProperties } from 'react'
import { Section } from '#/components/site/Section'
import { pickLocaleField } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

interface SkillsSectionProps {
  skills: Skill[]
  fallbackLanguages: string[]
}

export function SkillsSection({ skills, fallbackLanguages }: SkillsSectionProps) {
  let groups: Record<string, string[]>
  if (skills.length > 0) {
    groups = skills.reduce<Record<string, string[]>>((acc, s) => {
      const key = pickLocaleField(s, 'category') || m.section_skills_kicker()
      acc[key] ||= []
      acc[key]!.push(pickLocaleField(s, 'name') || s.name)
      return acc
    }, {})
  } else {
    groups = { [m.section_skills_kicker()]: fallbackLanguages }
  }

  if (Object.keys(groups).length === 0 || (fallbackLanguages.length === 0 && skills.length === 0)) {
    return null
  }

  return (
    <Section
      id="skills"
      kicker={m.section_skills_kicker()}
      title={m.section_skills_title()}
    >
      <div className="skill-instrument">
        {Object.entries(groups).map(([cat, names], groupIndex) => (
          <article key={cat} className="skill-instrument-row">
            <div className="skill-instrument-heading">
              <span>{String(groupIndex + 1).padStart(2, '0')}</span>
              <h3>{cat}</h3>
            </div>
            <div className="skill-cloud">
              {names.map((name, skillIndex) => (
                <span
                  key={name}
                  className="skill-node"
                  style={{ '--skill-index': skillIndex } as CSSProperties}
                >
                  {name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
