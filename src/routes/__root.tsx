import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'

import { getLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'
import { SiteHeader } from '#/components/site/SiteHeader'
import { SiteFooter } from '#/components/site/SiteFooter'
import { NotFoundPage } from '#/components/site/NotFoundPage'
import { Toaster } from '#/components/ui/sonner'
import { siteUrl } from '#/lib/seo'
import { getPublicProfile } from '#/server/public'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  loader: () => getPublicProfile(),

  beforeLoad: async () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: ({ matches }: { matches: Array<{ pathname?: string }> }) => {
    const pathname = matches[matches.length - 1]?.pathname ?? '/'
    const url = siteUrl(pathname)
    const ogImage = siteUrl('/logo512.png')
    const title = m.site_title()
    const description = m.site_description()

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' },
        { title },
        { name: 'description', content: description },
        { name: 'theme-color', content: '#4fb8b2' },

        { property: 'og:site_name', content: 'aircrushin' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '512' },
        { property: 'og:image:height', content: '512' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'zh_CN' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: url },
        { rel: 'alternate', hrefLang: 'en', href: url },
        { rel: 'alternate', hrefLang: 'zh', href: url },
        { rel: 'alternate', hrefLang: 'x-default', href: url },
      ],
    }
  },

  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const profile = Route.useLoaderData()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin ? <SiteHeader profile={profile} /> : null}
      <main className="flex-1">{children}</main>
      {!isAdmin ? <SiteFooter profile={profile} /> : null}
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
        <Toaster richColors closeButton position="top-right" />
        <Scripts />
      </body>
    </html>
  )
}
