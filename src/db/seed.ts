import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { getDb } from './client'
import { profile, skills, experience } from './schema'

async function main() {
  const db = getDb()

  await db
    .insert(profile)
    .values({
      id: 1,
      name: 'aircrushin',
      headline: 'Building thoughtful tools on the web.',
      bio: 'Indie developer based in Chengdu. I design and ship small, opinionated software, from prompt-management platforms to audio-reactive visuals. Currently studying at Monash University.',
      avatarUrl: 'https://avatars.githubusercontent.com/u/88492452?v=4',
      location: 'Chengdu, China',
      currently: 'Open-source · MS @ Monash',
      email: '',
      github: 'https://github.com/aircrushin',
      x: '',
      linkedin: '',
      resumeUrl: '',
    })
    .onConflictDoNothing({ target: profile.id })

  const seedSkills = [
    { name: 'TypeScript', category: 'Languages', level: 5, displayOrder: 1 },
    { name: 'React', category: 'Frameworks', level: 5, displayOrder: 2 },
    { name: 'Next.js', category: 'Frameworks', level: 5, displayOrder: 3 },
    { name: 'TanStack Start', category: 'Frameworks', level: 4, displayOrder: 4 },
    { name: 'Tailwind CSS', category: 'Frameworks', level: 5, displayOrder: 5 },
    { name: 'Node.js', category: 'Languages', level: 4, displayOrder: 6 },
    { name: 'Python', category: 'Languages', level: 4, displayOrder: 7 },
    { name: 'Postgres', category: 'Tools', level: 4, displayOrder: 8 },
    { name: 'Drizzle ORM', category: 'Tools', level: 4, displayOrder: 9 },
    { name: 'Vercel', category: 'Tools', level: 5, displayOrder: 10 },
    { name: 'Vite', category: 'Tools', level: 5, displayOrder: 11 },
    { name: 'LangGraph', category: 'AI', level: 3, displayOrder: 12 },
  ]

  await db.execute(sql`TRUNCATE TABLE skills RESTART IDENTITY`)
  await db.insert(skills).values(seedSkills)

  await db.execute(sql`TRUNCATE TABLE experience RESTART IDENTITY`)
  await db.insert(experience).values([
    {
      role: 'MS, Information Technology',
      company: 'Monash University',
      location: 'Melbourne, Australia',
      startDate: '2024',
      endDate: 'Present',
      description: 'Studying applied AI and software engineering. Building side projects in spare time.',
      url: 'https://www.monash.edu',
      displayOrder: 1,
    },
    {
      role: 'Indie Developer',
      company: 'Self-employed',
      location: 'Remote',
      startDate: '2022',
      endDate: 'Present',
      description: 'Designing and shipping small open-source products focused on AI tooling, prompt management, and creative coding.',
      url: 'https://github.com/aircrushin',
      displayOrder: 2,
    },
  ])

  // eslint-disable-next-line no-console
  console.log('✅ Seed completed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
