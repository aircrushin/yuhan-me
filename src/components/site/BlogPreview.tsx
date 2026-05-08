import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import type { Post } from '#/db/schema'
import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

interface BlogPreviewProps {
  posts: Post[]
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  if (posts.length === 0) return null
  return (
    <Section
      id="blog"
      kicker={m.section_blog_kicker()}
      title={m.section_blog_title()}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="surface-card group flex flex-col gap-3 p-6"
          >
            {post.coverUrl ? (
              <img
                src={post.coverUrl}
                alt=""
                className="h-32 w-full rounded-sm object-cover ring-1 ring-[var(--line)]"
              />
            ) : null}
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--sea-ink-soft)]">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </p>
            <h3 className="display-title text-lg font-semibold text-[color:var(--sea-ink)]">
              {post.title}
            </h3>
            <p className="line-clamp-3 text-sm text-[color:var(--sea-ink-soft)]">{post.excerpt}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[color:var(--lagoon-deep)]">
              read <ArrowUpRight className="h-3 w-3 transition group-hover:-translate-y-0.5" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex justify-start">
        <Link
          to="/blog"
          className="text-sm font-medium text-[color:var(--lagoon-deep)] hover:underline"
        >
          {m.section_blog_view_all()}
        </Link>
      </div>
    </Section>
  )
}
