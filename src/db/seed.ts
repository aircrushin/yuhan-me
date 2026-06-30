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
      headlineEn: 'Building thoughtful tools on the web.',
      headlineZh: '用心打磨工具，慢慢做出好东西。',
      bio: 'Indie developer based in Chengdu. I design and ship small, opinionated software, from prompt-management platforms to audio-reactive visuals. Currently studying at Monash University.',
      bioEn: 'Indie developer based in Chengdu. I design and ship small, opinionated software, from prompt-management platforms to audio-reactive visuals. Currently studying at Monash University.',
      bioZh: '独立开发者，坐标成都。我设计和发布小而精的软件，从提示词管理平台到音频驱动的视觉创意项目。目前在蒙纳士大学读研究生。',
      avatarUrl: 'https://avatars.githubusercontent.com/u/88492452?v=4',
      location: 'Chengdu, China',
      currently: 'Open-source · MS @ Monash',
      currentlyEn: 'Open-source · MS @ Monash',
      currentlyZh: '开源 · 蒙纳士大学研究生',
      email: '',
      github: 'https://github.com/aircrushin',
      xiaohongshu: '',
      linkedin: '',
      resumeUrl: '',
    })
    .onConflictDoNothing({ target: profile.id })

  const seedSkills = [
    { name: 'TypeScript', nameEn: 'TypeScript', nameZh: 'TypeScript', category: 'Languages', categoryEn: 'Languages', categoryZh: '编程语言', level: 5, displayOrder: 1 },
    { name: 'React', nameEn: 'React', nameZh: 'React', category: 'Frameworks', categoryEn: 'Frameworks', categoryZh: '框架', level: 5, displayOrder: 2 },
    { name: 'Next.js', nameEn: 'Next.js', nameZh: 'Next.js', category: 'Frameworks', categoryEn: 'Frameworks', categoryZh: '框架', level: 5, displayOrder: 3 },
    { name: 'TanStack Start', nameEn: 'TanStack Start', nameZh: 'TanStack Start', category: 'Frameworks', categoryEn: 'Frameworks', categoryZh: '框架', level: 4, displayOrder: 4 },
    { name: 'Tailwind CSS', nameEn: 'Tailwind CSS', nameZh: 'Tailwind CSS', category: 'Frameworks', categoryEn: 'Frameworks', categoryZh: '框架', level: 5, displayOrder: 5 },
    { name: 'Node.js', nameEn: 'Node.js', nameZh: 'Node.js', category: 'Languages', categoryEn: 'Languages', categoryZh: '编程语言', level: 4, displayOrder: 6 },
    { name: 'Python', nameEn: 'Python', nameZh: 'Python', category: 'Languages', categoryEn: 'Languages', categoryZh: '编程语言', level: 4, displayOrder: 7 },
    { name: 'Postgres', nameEn: 'Postgres', nameZh: 'Postgres', category: 'Tools', categoryEn: 'Tools', categoryZh: '工具', level: 4, displayOrder: 8 },
    { name: 'Drizzle ORM', nameEn: 'Drizzle ORM', nameZh: 'Drizzle ORM', category: 'Tools', categoryEn: 'Tools', categoryZh: '工具', level: 4, displayOrder: 9 },
    { name: 'Vercel', nameEn: 'Vercel', nameZh: 'Vercel', category: 'Tools', categoryEn: 'Tools', categoryZh: '工具', level: 5, displayOrder: 10 },
    { name: 'Vite', nameEn: 'Vite', nameZh: 'Vite', category: 'Tools', categoryEn: 'Tools', categoryZh: '工具', level: 5, displayOrder: 11 },
    { name: 'LangGraph', nameEn: 'LangGraph', nameZh: 'LangGraph', category: 'AI', categoryEn: 'AI', categoryZh: 'AI', level: 3, displayOrder: 12 },
  ]

  await db.execute(sql`TRUNCATE TABLE skills RESTART IDENTITY`)
  await db.insert(skills).values(seedSkills)

  await db.execute(sql`TRUNCATE TABLE experience RESTART IDENTITY`)
  await db.insert(experience).values([
    {
      role: 'MS, Information Technology',
      roleEn: 'MS, Information Technology',
      roleZh: '信息技术硕士',
      company: 'Monash University',
      companyEn: 'Monash University',
      companyZh: '蒙纳士大学',
      location: 'Melbourne, Australia',
      locationEn: 'Melbourne, Australia',
      locationZh: '澳大利亚，墨尔本',
      startDate: '2024',
      endDate: 'Present',
      description: 'Studying applied AI and software engineering. Building side projects in spare time.',
      descriptionEn: 'Studying applied AI and software engineering. Building side projects in spare time.',
      descriptionZh: '学习应用人工智能和软件工程方向，课余时间持续构建副项目。',
      url: 'https://www.monash.edu',
      displayOrder: 1,
    },
    {
      role: 'Indie Developer',
      roleEn: 'Indie Developer',
      roleZh: '独立开发者',
      company: 'Self-employed',
      companyEn: 'Self-employed',
      companyZh: '自由职业',
      location: 'Remote',
      locationEn: 'Remote',
      locationZh: '远程',
      startDate: '2022',
      endDate: 'Present',
      description: 'Designing and shipping small open-source products focused on AI tooling, prompt management, and creative coding.',
      descriptionEn: 'Designing and shipping small open-source products focused on AI tooling, prompt management, and creative coding.',
      descriptionZh: '设计和发布小而精的开源产品，专注于AI工具、提示词管理和创意编程。',
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
