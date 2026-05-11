import { createFileRoute, Link, Outlet, useChildMatches } from '@tanstack/react-router'

import { Section } from '#/components/site/Section'
import { getPublishedPosts } from '#/server/public'
import { formatLocalizedDate, localizedPosts } from '#/lib/i18n'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/blog')({
  loader: () => getPublishedPosts(),
  component: BlogIndex,
  head: () => ({ meta: [{ title: `${m.nav_blog()} — aircrushin` }] }),
})

function BlogIndex() {
  const children = useChildMatches()
  const posts = localizedPosts(Route.useLoaderData())

  if (children.length > 0) {
    return <Outlet />
  }

  return (
    <Section
      kicker={m.section_blog_kicker()}
      title={m.blog_page_title()}
      description={m.blog_page_description()}
    >
      {posts.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-[color:var(--sea-ink-soft)]">
          {m.blog_empty()}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="surface-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5"
            >
              {post.coverUrl ? (
                <img
                  src={post.coverUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/9] w-full bg-[color:var(--mint-fresh)]" />
              )}
              <div className="flex flex-col gap-2 p-6">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[color:var(--sea-ink-soft)]">
                  {formatLocalizedDate(post.publishedAt)}
                </p>
                <h3 className="display-title text-xl font-semibold text-[color:var(--sea-ink)] group-hover:text-[color:var(--lagoon-deep)]">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="line-clamp-2 text-sm text-[color:var(--sea-ink-soft)]">{post.excerpt}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
