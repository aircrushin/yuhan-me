import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '#/components/site/Hero'
import { AboutSection } from '#/components/site/AboutSection'
import { CollaborationSection } from '#/components/site/CollaborationSection'
import { SkillsSection } from '#/components/site/SkillsSection'
import { ProjectsPreview } from '#/components/site/ProjectsPreview'
import { ExperienceSection } from '#/components/site/ExperienceSection'
import { BlogPreview } from '#/components/site/BlogPreview'
import { ContactSection } from '#/components/site/ContactSection'
import { getHomeData } from '#/server/public'
import { m } from '#/paraglide/messages'
import { siteUrl, generateWebsiteSchema, generatePersonSchema } from '#/lib/seo'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: ({ loaderData }) => ({
    meta: [
      { title: m.site_title() },
      { name: 'description', content: m.site_description() },
      { property: 'og:title', content: m.site_title() },
      { property: 'og:description', content: m.site_description() },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(generateWebsiteSchema()),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(generatePersonSchema(loaderData.profile)),
      },
    ],
  }),
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
      <CollaborationSection />
      <SkillsSection skills={data.skills} fallbackLanguages={fallbackLanguages} />
      <ProjectsPreview repos={data.featured} />
      <ExperienceSection items={data.experience} />
      <BlogPreview posts={data.posts} />
      <ContactSection profile={data.profile} />
    </>
  )
}
