import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '#/components/site/Hero'
import { AboutSection } from '#/components/site/AboutSection'
import { SkillsSection } from '#/components/site/SkillsSection'
import { ProjectsPreview } from '#/components/site/ProjectsPreview'
import { ExperienceSection } from '#/components/site/ExperienceSection'
import { TravelSection } from '#/components/site/TravelSection'
import { BlogPreview } from '#/components/site/BlogPreview'
import { ContactSection } from '#/components/site/ContactSection'
import { getHomeData } from '#/server/public'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  component: Home,
})

function Home() {
  const data = Route.useLoaderData()
  const fallbackLanguages = Array.from(
    new Set(data.repos.map((r) => r.language).filter((v): v is string => Boolean(v))),
  ).slice(0, 8)

  return (
    <>
      <Hero profile={data.profile} stats={data.stats} />
      <AboutSection profile={data.profile} />
      <SkillsSection skills={data.skills} fallbackLanguages={fallbackLanguages} />
      <ProjectsPreview repos={data.featured} />
      <TravelSection items={data.travelDumps} preview />
      <ExperienceSection items={data.experience} />
      <BlogPreview posts={data.posts} />
      <ContactSection profile={data.profile} />
    </>
  )
}
