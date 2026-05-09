import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  doublePrecision,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'

export const profile = pgTable('profile', {
  id: integer('id').primaryKey().default(1),
  name: varchar('name', { length: 120 }).notNull().default('aircrushin'),
  headline: text('headline').notNull().default('Building thoughtful tools on the web.'),
  headlineEn: text('headline_en'),
  headlineZh: text('headline_zh'),
  bio: text('bio').notNull().default(''),
  bioEn: text('bio_en'),
  bioZh: text('bio_zh'),
  avatarUrl: text('avatar_url').notNull().default('https://avatars.githubusercontent.com/u/88492452?v=4'),
  location: varchar('location', { length: 120 }).notNull().default('Chengdu, China'),
  currently: text('currently').notNull().default(''),
  currentlyEn: text('currently_en'),
  currentlyZh: text('currently_zh'),
  email: varchar('email', { length: 200 }).notNull().default(''),
  github: varchar('github', { length: 200 }).notNull().default('https://github.com/aircrushin'),
  x: varchar('x', { length: 200 }).notNull().default(''),
  linkedin: varchar('linkedin', { length: 200 }).notNull().default(''),
  resumeUrl: varchar('resume_url', { length: 400 }).notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const repos = pgTable('repos', {
  githubId: bigint('github_id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  fullName: varchar('full_name', { length: 300 }).notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  homepage: text('homepage'),
  language: varchar('language', { length: 80 }),
  stars: integer('stars').notNull().default(0),
  forksCount: integer('forks_count').notNull().default(0),
  topics: jsonb('topics').$type<string[]>().notNull().default([]),
  isFork: boolean('is_fork').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),
  pushedAt: timestamp('pushed_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),

  isVisible: boolean('is_visible').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
  customTitle: varchar('custom_title', { length: 200 }),
  customTitleEn: text('custom_title_en'),
  customTitleZh: text('custom_title_zh'),
  customDescription: text('custom_description'),
  customDescriptionEn: text('custom_description_en'),
  customDescriptionZh: text('custom_description_zh'),
  customCoverUrl: text('custom_cover_url'),
})

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  role: varchar('role', { length: 200 }).notNull(),
  roleEn: text('role_en'),
  roleZh: text('role_zh'),
  company: varchar('company', { length: 200 }).notNull(),
  companyEn: text('company_en'),
  companyZh: text('company_zh'),
  location: varchar('location', { length: 200 }).notNull().default(''),
  locationEn: text('location_en'),
  locationZh: text('location_zh'),
  startDate: varchar('start_date', { length: 32 }).notNull(),
  endDate: varchar('end_date', { length: 32 }),
  description: text('description').notNull().default(''),
  descriptionEn: text('description_en'),
  descriptionZh: text('description_zh'),
  url: varchar('url', { length: 400 }).notNull().default(''),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  nameEn: text('name_en'),
  nameZh: text('name_zh'),
  category: varchar('category', { length: 80 }).notNull().default('Tools'),
  categoryEn: text('category_en'),
  categoryZh: text('category_zh'),
  level: integer('level').notNull().default(3),
  displayOrder: integer('display_order').notNull().default(0),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  locale: varchar('locale', { length: 8 }).notNull().default('en'),
  title: varchar('title', { length: 240 }).notNull(),
  excerpt: text('excerpt').notNull().default(''),
  contentMd: text('content_md').notNull().default(''),
  coverUrl: text('cover_url').notNull().default(''),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  isDraft: boolean('is_draft').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const travelDumps = pgTable('travel_dumps', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  photoWallUrl: text('photo_wall_url').notNull(),
  placeId: text('place_id'),
  locationName: varchar('location_name', { length: 240 }).notNull().default(''),
  formattedAddress: text('formatted_address').notNull().default(''),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  googleMapsUrl: text('google_maps_url').notNull().default(''),
  isVisible: boolean('is_visible').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Profile = typeof profile.$inferSelect
export type Repo = typeof repos.$inferSelect
export type Experience = typeof experience.$inferSelect
export type Skill = typeof skills.$inferSelect
export type Post = typeof posts.$inferSelect
export type Message = typeof messages.$inferSelect
export type TravelDump = typeof travelDumps.$inferSelect
