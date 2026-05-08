import type { Skill } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

interface SkillsSectionProps {
  skills: Skill[]
  fallbackLanguages: string[]
}

export function SkillsSection({ skills, fallbackLanguages }: SkillsSectionProps) {
  let groups: Record<string, string[]>
  if (skills.length > 0) {
    groups = skills.reduce<Record<string, string[]>>((acc, s) => {
      const key = s.category || m.section_skills_kicker()
      acc[key] ||= []
      acc[key]!.push(s.name)
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
      <div className="skill-matrix">
        {Object.entries(groups).map(([cat, names]) => (
          <div key={cat} className="skill-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--lacquer)]">
              {cat}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {names.map((name) => (
                <span key={name} className="chip">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
