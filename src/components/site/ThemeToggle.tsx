import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { m } from '#/paraglide/messages'

const STORAGE_KEY = 'aircrushin-theme'

function getInitial(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const t = getInitial()
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return (
    <button
      type="button"
      aria-label={m.theme_toggle_aria()}
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[color:var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[color:var(--sea-ink)]"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
