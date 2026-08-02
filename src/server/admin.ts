import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { eq, sql, desc, asc } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '#/db/client'
import { profile, repos, experience, skills, posts, messages, travelDumps } from '#/db/schema'
import {
  ADMIN_COOKIE,
  getCookie,
  verifySession,
} from '#/lib/admin-auth'
import { toArtworkImage } from '#/lib/artwork'
import { deleteArtwork, listArtwork } from '#/lib/blob'
import { fetchAllUserRepos } from '#/lib/github'

async function assertAdmin() {
  const cookieHeader = getRequestHeader('cookie') || ''
  const token = getCookie(cookieHeader, ADMIN_COOKIE)
  const session = await verifySession(token)
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
}

function getContactForwardingHealth() {
  const missing = [
    ['RESEND_API_KEY', process.env.RESEND_API_KEY],
    ['CONTACT_FORWARD_TO', process.env.CONTACT_FORWARD_TO],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  return {
    isConfigured: missing.length === 0,
    missing,
    from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
    to: process.env.CONTACT_FORWARD_TO || null,
  }
}

// ─── Status / health ────────────────────────────────────────────────────────

export const getAdminStatus = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  const [repoStats, postStats, messageStats, travelStats] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_visible)::int AS visible,
        COUNT(*) FILTER (WHERE is_pinned)::int AS pinned,
        MAX(fetched_at) AS last_synced
      FROM repos
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_draft)::int AS drafts,
        COUNT(*) FILTER (WHERE NOT is_draft)::int AS published
      FROM posts
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE NOT is_read)::int AS unread,
        COUNT(*) FILTER (WHERE forward_status = 'failed')::int AS failed_forwarding,
        COUNT(*) FILTER (WHERE forward_status = 'not_configured')::int AS not_configured_forwarding
      FROM messages
    `),
    db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_visible)::int AS visible
      FROM travel_dumps
    `),
  ])

  return {
    repos: repoStats.rows[0] as {
      total: number
      visible: number
      pinned: number
      last_synced: string | null
    },
    posts: postStats.rows[0] as { total: number; drafts: number; published: number },
    messages: messageStats.rows[0] as {
      total: number
      unread: number
      failed_forwarding: number
      not_configured_forwarding: number
    },
    travel: travelStats.rows[0] as { total: number; visible: number },
    contactForwarding: getContactForwardingHealth(),
  }
})

// ─── GitHub sync ────────────────────────────────────────────────────────────

export const syncGithub = createServerFn({ method: 'POST' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  const fetched = await fetchAllUserRepos()

  for (const r of fetched) {
    await db
      .insert(repos)
      .values({
        githubId: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        htmlUrl: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stars: r.stargazers_count,
        forksCount: r.forks_count,
        topics: r.topics ?? [],
        isFork: r.fork,
        isArchived: r.archived,
        pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
      })
      .onConflictDoUpdate({
        target: repos.githubId,
        set: {
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          htmlUrl: r.html_url,
          homepage: r.homepage,
          language: r.language,
          stars: r.stargazers_count,
          forksCount: r.forks_count,
          topics: r.topics ?? [],
          isFork: r.fork,
          isArchived: r.archived,
          pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
          fetchedAt: new Date(),
        },
      })
  }
  return { synced: fetched.length }
})

// ─── Repos ──────────────────────────────────────────────────────────────────

export const listAllRepos = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  const rows = await db
    .select()
    .from(repos)
    .orderBy(desc(repos.isPinned), asc(repos.displayOrder), desc(repos.stars), desc(repos.pushedAt))
  return rows
})

const repoUpdateInput = z.object({
  githubId: z.number(),
  isVisible: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  customTitle: z.string().nullable().optional(),
  customTitleEn: z.string().nullable().optional(),
  customTitleZh: z.string().nullable().optional(),
  customDescription: z.string().nullable().optional(),
  customDescriptionEn: z.string().nullable().optional(),
  customDescriptionZh: z.string().nullable().optional(),
  customCoverUrl: z.string().nullable().optional(),
})

export const updateRepo = createServerFn({ method: 'POST' })
  .inputValidator(repoUpdateInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    const { githubId, ...rest } = data
    await db.update(repos).set(rest).where(eq(repos.githubId, githubId))
    return { ok: true }
  })

const reorderInput = z.object({
  ids: z.array(z.number()),
})

export const reorderRepos = createServerFn({ method: 'POST' })
  .inputValidator(reorderInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    for (let i = 0; i < data.ids.length; i++) {
      await db
        .update(repos)
        .set({ displayOrder: i })
        .where(eq(repos.githubId, data.ids[i]!))
    }
    return { ok: true }
  })

// ─── Profile ────────────────────────────────────────────────────────────────

const profileInput = z.object({
  name: z.string().min(1),
  headline: z.string(),
  headlineEn: z.string().nullable().optional(),
  headlineZh: z.string().nullable().optional(),
  bio: z.string(),
  bioEn: z.string().nullable().optional(),
  bioZh: z.string().nullable().optional(),
  avatarUrl: z.string().url().or(z.literal('')),
  location: z.string(),
  currently: z.string(),
  currentlyEn: z.string().nullable().optional(),
  currentlyZh: z.string().nullable().optional(),
  email: z.string().email().or(z.literal('')),
  github: z.string(),
  xiaohongshu: z.string().optional(),
  x: z.string().optional(),
  linkedin: z.string(),
  resumeUrl: z.string(),
}).transform(({ x, xiaohongshu, ...data }) => ({
  ...data,
  xiaohongshu: xiaohongshu ?? x ?? '',
}))

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator(profileInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db
      .insert(profile)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({
        target: profile.id,
        set: { ...data, updatedAt: new Date() },
      })
    return { ok: true }
  })

export const getProfile = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  const [row] = await db.select().from(profile).where(eq(profile.id, 1))
  return row ?? null
})

// ─── Experience ─────────────────────────────────────────────────────────────

const experienceInput = z.object({
  id: z.number().optional(),
  role: z.string().min(1),
  roleEn: z.string().nullable().optional(),
  roleZh: z.string().nullable().optional(),
  company: z.string().min(1),
  companyEn: z.string().nullable().optional(),
  companyZh: z.string().nullable().optional(),
  location: z.string().default(''),
  locationEn: z.string().nullable().optional(),
  locationZh: z.string().nullable().optional(),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  description: z.string().default(''),
  descriptionEn: z.string().nullable().optional(),
  descriptionZh: z.string().nullable().optional(),
  url: z.string().default(''),
  displayOrder: z.number().int().default(0),
})

export const listExperience = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  return db.select().from(experience).orderBy(asc(experience.displayOrder), desc(experience.id))
})

export const upsertExperience = createServerFn({ method: 'POST' })
  .inputValidator(experienceInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    if (data.id) {
      const { id, ...rest } = data
      await db.update(experience).set(rest).where(eq(experience.id, id))
      return { id }
    }
    const [row] = await db.insert(experience).values(data).returning({ id: experience.id })
    return { id: row!.id }
  })

export const deleteExperience = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.delete(experience).where(eq(experience.id, data.id))
    return { ok: true }
  })

// ─── Skills ─────────────────────────────────────────────────────────────────

const skillInput = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  nameEn: z.string().nullable().optional(),
  nameZh: z.string().nullable().optional(),
  category: z.string().default('Tools'),
  categoryEn: z.string().nullable().optional(),
  categoryZh: z.string().nullable().optional(),
  level: z.number().int().min(1).max(5).default(3),
  displayOrder: z.number().int().default(0),
})

export const listSkillsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  return db.select().from(skills).orderBy(asc(skills.displayOrder), asc(skills.id))
})

export const upsertSkill = createServerFn({ method: 'POST' })
  .inputValidator(skillInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    if (data.id) {
      const { id, ...rest } = data
      await db.update(skills).set(rest).where(eq(skills.id, id))
      return { id }
    }
    const [row] = await db.insert(skills).values(data).returning({ id: skills.id })
    return { id: row!.id }
  })

export const deleteSkill = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.delete(skills).where(eq(skills.id, data.id))
    return { ok: true }
  })

// ─── Travel dumps ───────────────────────────────────────────────────────────

const travelDumpInput = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  photoWallUrl: z.string().url(),
  placeId: z.string().nullable().optional(),
  locationName: z.string().default(''),
  formattedAddress: z.string().default(''),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUrl: z.string().default(''),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
})

export const listTravelDumpsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  return db.select().from(travelDumps).orderBy(asc(travelDumps.displayOrder), desc(travelDumps.id))
})

export const upsertTravelDump = createServerFn({ method: 'POST' })
  .inputValidator(travelDumpInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    if (data.id) {
      const { id, ...rest } = data
      await db.update(travelDumps).set({ ...rest, updatedAt: new Date() }).where(eq(travelDumps.id, id))
      return { id }
    }
    const [row] = await db.insert(travelDumps).values(data).returning({ id: travelDumps.id })
    return { id: row!.id }
  })

export const deleteTravelDump = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.delete(travelDumps).where(eq(travelDumps.id, data.id))
    return { ok: true }
  })

export const reorderTravelDumps = createServerFn({ method: 'POST' })
  .inputValidator(reorderInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    for (let i = 0; i < data.ids.length; i++) {
      await db
        .update(travelDumps)
        .set({ displayOrder: i, updatedAt: new Date() })
        .where(eq(travelDumps.id, data.ids[i]!))
    }
    return { ok: true }
  })

// ─── Posts ──────────────────────────────────────────────────────────────────

const postInput = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  locale: z.enum(['en', 'zh']).default('en'),
  title: z.string().min(1),
  excerpt: z.string().default(''),
  contentMd: z.string().default(''),
  coverUrl: z.string().default(''),
  isDraft: z.boolean().default(true),
  publishedAt: z.string().nullable().optional(),
})

export const listPostsAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  return db.select().from(posts).orderBy(desc(posts.updatedAt))
})

export const getPostAdmin = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    const [row] = await db.select().from(posts).where(eq(posts.id, data.id))
    return row ?? null
  })

export const upsertPost = createServerFn({ method: 'POST' })
  .inputValidator(postInput)
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    if (data.id) {
      const { id, publishedAt: _ignored, ...rest } = data
      void _ignored
      const [existing] = await db.select().from(posts).where(eq(posts.id, id))
      const publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : data.isDraft
          ? null
          : existing?.publishedAt ?? new Date()
      await db
        .update(posts)
        .set({ ...rest, publishedAt, updatedAt: new Date() })
        .where(eq(posts.id, id))
      return { id }
    }
    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : !data.isDraft ? new Date() : null
    const { publishedAt: _ignored, ...rest } = data
    void _ignored
    const [row] = await db
      .insert(posts)
      .values({ ...rest, publishedAt })
      .returning({ id: posts.id })
    return { id: row!.id }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.delete(posts).where(eq(posts.id, data.id))
    return { ok: true }
  })

// ─── Messages ───────────────────────────────────────────────────────────────

export const listMessages = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const db = getDb()
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt))

  return {
    messages: rows,
    contactForwarding: getContactForwardingHealth(),
    failedCount: rows.filter((message) => message.forwardStatus === 'failed').length,
    notConfiguredCount: rows.filter((message) => message.forwardStatus === 'not_configured').length,
  }
})

export const markMessageRead = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number(), isRead: z.boolean() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.update(messages).set({ isRead: data.isRead }).where(eq(messages.id, data.id))
    return { ok: true }
  })

export const deleteMessage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    const db = getDb()
    await db.delete(messages).where(eq(messages.id, data.id))
    return { ok: true }
  })

// ─── Artwork (Vercel Blob) ──────────────────────────────────────────────────

export const listArtworkAdmin = createServerFn({ method: 'GET' }).handler(async () => {
  await assertAdmin()
  const { blobs } = await listArtwork()
  return blobs
    .map(toArtworkImage)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
})

export const deleteArtworkAdmin = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    await assertAdmin()
    await deleteArtwork(data.url)
    return { ok: true }
  })
