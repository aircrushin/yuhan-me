import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '#/components/site/Hero'
import { AboutSection } from '#/components/site/AboutSection'
import { CollaborationSection } from '#/components/site/CollaborationSection'
import { SkillsSection } from '#/components/site/SkillsSection'
import { ProjectsPreview } from '#/components/site/ProjectsPreview'
import { ExperienceSection } from '#/components/site/ExperienceSection'
import { BlogPreview } from '#/components/site/BlogPreview'
import { ContactSection } from '#/components/site/ContactSection'
import { HomeExperience } from '#/components/site/HomeExperience'
import { getHomeData } from '#/server/public'
import { m } from '#/paraglide/messages'
import { generateWebsiteSchema, generatePersonSchema } from '#/lib/seo'

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
        children: JSON.stringify(generatePersonSchema(loaderData?.profile ?? null)),
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
    <HomeExperience>
      <div data-home-section="home">
        <Hero profile={data.profile} />
      </div>
      <div data-home-section="about" data-home-reveal>
        <AboutSection profile={data.profile} />
      </div>
      <div data-home-section="collaboration" data-home-reveal>
        <CollaborationSection />
      </div>
      <div data-home-reveal>
        <SkillsSection skills={data.skills} fallbackLanguages={fallbackLanguages} />
      </div>
      <div data-home-section="projects" data-home-reveal>
        <ProjectsPreview repos={data.featured} />
      </div>
      <div data-home-reveal>
        <ExperienceSection items={data.experience} />
      </div>
      <div data-home-reveal>
        <BlogPreview posts={data.posts} />
      </div>
      <div data-home-section="contact" data-home-reveal>
        <ContactSection profile={data.profile} />
      </div>
    </HomeExperience>
  )
}
