import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'

import { getLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'
import { SiteHeader } from '#/components/site/SiteHeader'
import { SiteFooter } from '#/components/site/SiteFooter'
import { NotFoundPage } from '#/components/site/NotFoundPage'
import { Toaster } from '#/components/ui/sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: m.site_title() },
      {
        name: 'description',
        content: m.site_description(),
      },
      { name: 'theme-color', content: '#4fb8b2' },
      { property: 'og:title', content: m.site_title() },
      {
        property: 'og:description',
        content: m.site_description(),
      },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin ? <SiteHeader /> : null}
      <main className="flex-1">{children}</main>
      {!isAdmin ? <SiteFooter /> : null}
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
