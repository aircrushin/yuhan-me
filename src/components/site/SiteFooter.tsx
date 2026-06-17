import type { Profile } from '#/db/schema'
import { ProfileSocialLinks } from '#/components/site/ProfileSocialLinks'
import { m } from '#/paraglide/messages'

export function SiteFooter({ profile }: { profile: Profile | null }) {
  const year = new Date().getFullYear()
  const siteName = profile?.name || 'aircrushin'

  return (
    <footer className="site-footer mt-24">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <p className="text-xs text-[color:var(--sea-ink-soft)]">
          © {year} {siteName} · {m.footer_built()}
        </p>
        <ProfileSocialLinks profile={profile} includeEmail />
      </div>
    </footer>
  )
}
