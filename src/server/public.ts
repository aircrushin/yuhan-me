import { createServerFn } from '@tanstack/react-start'
import { and, desc, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '#/db/client'
import { profile, repos, experience, skills, posts, messages } from '#/db/schema'

export const getPublicProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const [row] = await db.select().from(profile).where(eq(profile.id, 1))
  return row ?? null
})

export const getVisibleRepos = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db
    .select()
    .from(repos)
    .where(eq(repos.isVisible, true))
    .orderBy(desc(repos.isPinned), asc(repos.displayOrder), desc(repos.stars), desc(repos.pushedAt))
})

export const getPublicSkills = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db.select().from(skills).orderBy(asc(skills.displayOrder), asc(skills.id))
})

export const getPublicExperience = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db.select().from(experience).orderBy(asc(experience.displayOrder), desc(experience.id))
})

export const getPublishedPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.isDraft, false)))
    .orderBy(desc(posts.publishedAt))
})

export const getPostBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const db = getDb()
    const [row] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, data.slug), eq(posts.isDraft, false)))
    return row ?? null
  })

const contactInput = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  body: z.string().min(5).max(5000),
})

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator(contactInput)
  .handler(async ({ data }) => {
    const db = getDb()
    await db.insert(messages).values(data)

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.CONTACT_FORWARD_TO
    if (apiKey && to) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
            to,
            subject: `New message from ${data.name}`,
            reply_to: data.email,
            text: `${data.body}\n\n— ${data.name} <${data.email}>`,
          }),
        })
      } catch {
        // ignore email transport errors; message is already in the DB
      }
    }

    return { ok: true }
  })

export const getHomeData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const [profileRow] = await db.select().from(profile).where(eq(profile.id, 1))
  const visibleRepos = await db
    .select()
    .from(repos)
    .where(eq(repos.isVisible, true))
    .orderBy(desc(repos.isPinned), asc(repos.displayOrder), desc(repos.stars), desc(repos.pushedAt))
  const skillRows = await db.select().from(skills).orderBy(asc(skills.displayOrder), asc(skills.id))
  const experienceRows = await db
    .select()
    .from(experience)
    .orderBy(asc(experience.displayOrder), desc(experience.id))
  const recentPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.isDraft, false))
    .orderBy(desc(posts.publishedAt))
    .limit(3)

  const stats = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE is_visible)::int AS visible_repos,
      COALESCE(SUM(stars) FILTER (WHERE is_visible), 0)::int AS total_stars
    FROM repos
  `)

  return {
    profile: profileRow ?? null,
    repos: visibleRepos,
    pinned: visibleRepos.filter((r) => r.isPinned).slice(0, 6),
    featured: visibleRepos.slice(0, 6),
    skills: skillRows,
    experience: experienceRows,
    posts: recentPosts,
    stats: (stats.rows[0] as { visible_repos: number; total_stars: number }) ?? {
      visible_repos: 0,
      total_stars: 0,
    },
  }
})
