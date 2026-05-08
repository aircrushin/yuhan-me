import { createFileRoute, Link } from '@tanstack/react-router'

import { Section } from '#/components/site/Section'
import { getPublishedPosts } from '#/server/public'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/blog')({
  loader: () => getPublishedPosts(),
  component: BlogIndex,
  head: () => ({ meta: [{ title: 'Writing — aircrushin' }] }),
})

function BlogIndex() {
  const posts = Route.useLoaderData()

  return (
    <Section
      kicker={m.section_blog_kicker()}
      title="Notes from the workshop."
      description="Short essays on building things, prompt engineering, and the occasional rabbit hole."
    >
      {posts.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.blog_empty()}
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="surface-card group flex flex-col gap-2 p-6 transition hover:-translate-y-0.5 md:flex-row md:items-baseline md:justify-between"
              >
                <div className="space-y-1">
                  <h3 className="display-title text-2xl font-semibold text-[color:var(--sea-ink)] group-hover:text-[color:var(--lagoon-deep)]">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="text-sm text-[color:var(--sea-ink-soft)]">{post.excerpt}</p>
                  ) : null}
                </div>
                <p className="font-mono text-xs text-[color:var(--sea-ink-soft)]">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
