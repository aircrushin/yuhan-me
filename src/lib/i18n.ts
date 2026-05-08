import type { Post } from '#/db/schema'
import { getLocale } from '#/paraglide/runtime'

export function currentLocale() {
  return getLocale() as 'en' | 'zh'
}

export function formatLocalizedDate(value: Date | string | null | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(currentLocale() === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function localizedPosts<T extends Pick<Post, 'locale'>>(posts: T[]) {
  const locale = currentLocale()
  const matches = posts.filter((post) => post.locale === locale)
  return matches.length > 0 ? matches : posts
}
