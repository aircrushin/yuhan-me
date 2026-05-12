import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Section } from '#/components/site/Section'
import { getPostBySlug } from '#/server/public'
import { formatLocalizedDate } from '#/lib/i18n'
import { m } from '#/paraglide/messages'
import { siteUrl, generateBlogPostingSchema, generateBreadcrumbSchema } from '#/lib/seo'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPostBySlug({ data: { slug: params.slug } })
    if (!post) throw notFound()
    return post
  },
  component: BlogPost,
  head: ({ loaderData: post }) => {
    const title = `${post?.title ?? 'Post'} — aircrushin`
    const description = post?.excerpt || ''
    const postUrl = siteUrl(`/blog/${post?.slug ?? ''}`)
    const coverUrl = post?.coverUrl || siteUrl('/logo512.png')
    const publishedTime = post?.publishedAt ? new Date(post.publishedAt).toISOString() : undefined
    const modifiedTime = post?.updatedAt ? new Date(post.updatedAt).toISOString() : undefined

    return {
      meta: [
        { title },
        ...(description ? [{ name: 'description', content: description }] : []),
        { property: 'og:title', content: title },
        ...(description ? [{ property: 'og:description', content: description }] : []),
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: postUrl },
        { property: 'og:image', content: coverUrl },
        ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
        ...(modifiedTime ? [{ property: 'article:modified_time', content: modifiedTime }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        ...(description ? [{ name: 'twitter:description', content: description }] : []),
        { name: 'twitter:image', content: coverUrl },
      ],
      links: [
        { rel: 'canonical', href: postUrl },
      ],
      scripts: post
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify(generateBlogPostingSchema(post)),
            },
            {
              type: 'application/ld+json',
              children: JSON.stringify(
                generateBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Writing', url: '/blog' },
                  { name: post.title, url: `/blog/${post.slug}` },
                ]),
              ),
            },
          ]
        : [],
    }
  },
})

function BlogPost() {
  const post = Route.useLoaderData()

  return (
    <Section innerClassName="max-w-3xl mx-auto">
      <Link
        to="/blog"
        className="mb-6 inline-block text-sm text-[color:var(--sea-ink-soft)] hover:text-[color:var(--lagoon-deep)]"
      >
        {m.blog_back()}
      </Link>
      {post.coverUrl ? (
        <img
          src={post.coverUrl}
          alt=""
          className="mb-8 aspect-[16/8] w-full rounded-2xl object-cover ring-1 ring-[var(--line)]"
        />
      ) : null}
      <p className="kicker-line">
        {formatLocalizedDate(post.publishedAt)}
      </p>
      <h1 className="display-title text-4xl font-semibold mt-3 max-w-[24ch] text-balance text-[color:var(--sea-ink)]">{post.title}</h1>
      {post.excerpt ? (
        <p className="mt-4 border-l-3 border-[color:var(--lagoon-deep)] pl-4 text-lg italic text-[color:var(--sea-ink-soft)]">{post.excerpt}</p>
      ) : null}

      <article className="prose prose-zinc mt-10 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.contentMd}</ReactMarkdown>
      </article>
    </Section>
  )
}
