import { Github, Mail, Twitter } from 'lucide-react'

import { m } from '#/paraglide/messages'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer mt-24">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <p className="text-xs text-[color:var(--sea-ink-soft)]">
          © {year} aircrushin · {m.footer_built()}
        </p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/aircrushin"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[color:var(--sea-ink)]"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[color:var(--sea-ink)]"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="mailto:hello@example.com"
            aria-label="Email"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[color:var(--sea-ink)]"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
