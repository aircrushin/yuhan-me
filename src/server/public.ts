import { createServerFn } from '@tanstack/react-start'
import { and, desc, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '#/db/client'
import { profile, repos, experience, skills, posts, messages, travelDumps } from '#/db/schema'

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

export const getVisibleTravelDumps = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return db
    .select()
    .from(travelDumps)
    .where(eq(travelDumps.isVisible, true))
    .orderBy(asc(travelDumps.displayOrder), desc(travelDumps.id))
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

const resendEndpoint = 'https://api.resend.com/emails'

function getContactForwardingConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_FORWARD_TO
  const from = process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>'

  return {
    apiKey,
    to,
    from,
    isConfigured: Boolean(apiKey && to),
  }
}

async function readErrorBody(response: Response) {
  try {
    const body = await response.text()
    return body.slice(0, 1000)
  } catch {
    return ''
  }
}

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator(contactInput)
  .handler(async ({ data }) => {
    const db = getDb()
    const [message] = await db
      .insert(messages)
      .values({
        ...data,
        forwardStatus: 'pending',
      })
      .returning({ id: messages.id })

    const messageId = message!.id
    const forwarding = getContactForwardingConfig()

    if (!forwarding.isConfigured) {
      await db
        .update(messages)
        .set({
          forwardStatus: 'not_configured',
          forwardError: 'Missing RESEND_API_KEY or CONTACT_FORWARD_TO',
        })
        .where(eq(messages.id, messageId))

      return {
        ok: false,
        status: 'not_configured' as const,
      }
    }

    try {
      const response = await fetch(resendEndpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${forwarding.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: forwarding.from,
          to: forwarding.to,
          subject: `New message from ${data.name}`,
          reply_to: data.email,
          text: `${data.body}\n\n- ${data.name} <${data.email}>`,
        }),
      })

      if (!response.ok) {
        const errorBody = await readErrorBody(response)
        const forwardError = errorBody || `Resend returned ${response.status}`
        await db
          .update(messages)
          .set({
            forwardStatus: 'failed',
            forwardError,
          })
          .where(eq(messages.id, messageId))

        return {
          ok: false,
          status: 'failed' as const,
        }
      }

      await db
        .update(messages)
        .set({
          forwardStatus: 'sent',
          forwardError: null,
          forwardedAt: new Date(),
        })
        .where(eq(messages.id, messageId))

      return {
        ok: true,
        status: 'sent' as const,
      }
    } catch (error) {
      await db
        .update(messages)
        .set({
          forwardStatus: 'failed',
          forwardError: error instanceof Error ? error.message : 'Unknown Resend transport error',
        })
        .where(eq(messages.id, messageId))

      return {
        ok: false,
        status: 'failed' as const,
      }
    }
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
    .limit(12)
  const visibleTravelDumps = await db
    .select()
    .from(travelDumps)
    .where(eq(travelDumps.isVisible, true))
    .orderBy(asc(travelDumps.displayOrder), desc(travelDumps.id))

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
    featured: visibleRepos.slice(0, 4),
    skills: skillRows,
    experience: experienceRows,
    posts: recentPosts,
    travelDumps: visibleTravelDumps,
    stats: (stats.rows[0] as { visible_repos: number; total_stars: number }) ?? {
      visible_repos: 0,
      total_stars: 0,
    },
  }
})
