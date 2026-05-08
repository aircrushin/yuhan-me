import { Languages } from 'lucide-react'

import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { m } from '#/paraglide/messages'

const LABEL: Record<string, string> = {
  en: 'English',
  zh: '中文',
}

export function LocaleSwitcher() {
  const current = getLocale()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={m.language_switcher_aria()}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-[var(--line)] px-3 text-xs font-medium text-[color:var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[color:var(--sea-ink)]"
      >
        <Languages className="h-3.5 w-3.5" />
        {(LABEL[current] || current).slice(0, 2).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => setLocale(loc)}
            className={current === loc ? 'font-semibold' : ''}
          >
            {LABEL[loc] || loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
