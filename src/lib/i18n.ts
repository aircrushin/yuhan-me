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

/**
 * Pick a locale-specific field from a database row.
 * Locale field key is camelCase: field + Locale (e.g. headlineZh)
 * Tries: field{Locale} → field → fieldEn → ''
 */
export function pickLocaleField<T extends Record<string, unknown>>(
  row: T | null | undefined,
  field: string,
): string {
  if (!row) return ''
  const locale = currentLocale()

  const localeKey = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as keyof T
  const localeVal = row[localeKey]
  if (typeof localeVal === 'string' && localeVal.length > 0) return localeVal

  const baseVal = row[field as keyof T]
  if (typeof baseVal === 'string' && baseVal.length > 0) return baseVal

  const enVal = row[`${field}En` as keyof T]
  if (typeof enVal === 'string' && enVal.length > 0) return enVal

  return ''
}
