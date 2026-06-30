import type { Post, Profile } from '#/db/schema'

function getSiteUrl() {
  if (typeof window !== 'undefined') return 'https://aircrushin.com'
  return process.env.SITE_URL || 'https://aircrushin.com'
}

export function siteUrl(path?: string) {
  const base = getSiteUrl().replace(/\/+$/, '')
  const p = path ? `/${path.replace(/^\/+/, '')}` : ''
  return `${base}${p}`
}

export function canonicalUrl(pathname: string) {
  return siteUrl(pathname)
}

// ---- Structured data generators ----

export function generateWebsiteSchema() {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'aircrushin',
    url,
    description: 'Indie developer building thoughtful, useful tools for the web.',
    inLanguage: ['en', 'zh'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/projects?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generatePersonSchema(profile: Profile | null) {
  const url = getSiteUrl()
  if (!profile) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'aircrushin',
      url,
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url,
    description: profile.headline,
    email: profile.email || undefined,
    address: profile.location
      ? { '@type': 'PostalAddress', addressLocality: profile.location }
      : undefined,
    sameAs: [
      profile.github || undefined,
      profile.linkedin || undefined,
      profile.xiaohongshu || undefined,
    ].filter(Boolean),
    image: profile.avatarUrl || undefined,
  }
}

export function generateBlogPostingSchema(post: Post) {
  const url = siteUrl(`/blog/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    url,
    image: post.coverUrl || undefined,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: {
      '@type': 'Person',
      name: 'aircrushin',
      url: getSiteUrl(),
    },
    publisher: {
      '@type': 'Person',
      name: 'aircrushin',
      url: getSiteUrl(),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: post.locale === 'zh' ? 'zh' : 'en',
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${base}${item.url}`,
    })),
  }
}
