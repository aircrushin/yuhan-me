import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '#/db/client'
import { posts } from '#/db/schema'
import { siteUrl } from '#/lib/seo'
import { eq } from 'drizzle-orm'

function urlEntry(loc: string, lastmod?: string, changefreq = 'monthly', priority = '0.7') {
  const lm = lastmod
    ? `\n    <lastmod>${lastmod}</lastmod>`
    : ''
  return `  <url>
    <loc>${siteUrl(loc)}</loc>${lm}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: async () => {
        const db = getDb()
        const publishedPosts = await db
          .select({ slug: posts.slug, updatedAt: posts.updatedAt })
          .from(posts)
          .where(eq(posts.isDraft, false))

        const urls = [
          urlEntry('/', undefined, 'weekly', '1.0'),
          urlEntry('/blog', undefined, 'weekly', '0.8'),
          urlEntry('/projects', undefined, 'weekly', '0.8'),
          urlEntry('/artwork', undefined, 'weekly', '0.7'),
          urlEntry('/contact', undefined, 'monthly', '0.5'),
          urlEntry('/travel', undefined, 'monthly', '0.6'),
          ...publishedPosts.map((p) =>
            urlEntry(
              `/blog/${p.slug}`,
              p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
              'monthly',
              '0.9',
            ),
          ),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
        return new Response(xml, {
          status: 200,
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
