import { useEffect, useRef, useState, type ReactNode } from 'react'

import { m } from '#/paraglide/messages'

import './ImmersiveHome.css'

const HOME_SECTIONS = [
  { id: 'home', label: () => m.nav_home() },
  { id: 'about', label: () => m.section_about_kicker() },
  { id: 'collaboration', label: () => m.section_collaboration_kicker() },
  { id: 'projects', label: () => m.section_projects_kicker() },
  { id: 'music', label: () => m.section_music_kicker() },
  { id: 'contact', label: () => m.section_contact_kicker() },
] as const

export function HomeExperience({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    let pointerFrame = 0
    let scrollFrame = 0

    const updateScrollProgress = () => {
      if (scrollFrame) return
      scrollFrame = window.requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - window.innerHeight
        const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0
        root.style.setProperty('--home-progress', progress.toString())
        scrollFrame = 0
      })
    }

    const updatePointer = (event: PointerEvent) => {
      if (!finePointer.matches || pointerFrame) return
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${event.clientX}px`)
        root.style.setProperty('--pointer-y', `${event.clientY}px`)
        pointerFrame = 0
      })
    }

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-home-reveal]'))
    const sectionTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-home-section]'))
    let revealObserver: IntersectionObserver | undefined

    if (!reduceMotion.matches) {
      root.classList.add('is-enhanced')
      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.setAttribute('data-visible', 'true')
            revealObserver?.unobserve(entry.target)
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
      )
      for (const target of revealTargets) revealObserver.observe(target)
    } else {
      for (const target of revealTargets) target.setAttribute('data-visible', 'true')
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const id = visible?.target.getAttribute('data-home-section')
        if (id) setActiveSection(id)
      },
      { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.2, 0.5, 0.8] },
    )
    for (const target of sectionTargets) sectionObserver.observe(target)

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    root.addEventListener('pointermove', updatePointer, { passive: true })
    updateScrollProgress()

    return () => {
      revealObserver?.disconnect()
      sectionObserver.disconnect()
      window.removeEventListener('scroll', updateScrollProgress)
      root.removeEventListener('pointermove', updatePointer)
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
    }
  }, [])

  return (
    <div ref={rootRef} className="home-experience">
      <a href="#home" className="home-skip-link">
        {m.home_skip_to_content()}
      </a>

      <nav className="home-section-nav" aria-label={m.home_experience_nav_aria()}>
        <span className="home-section-progress" aria-hidden="true">
          <span />
        </span>
        <ol>
          {HOME_SECTIONS.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={activeSection === section.id ? 'is-active' : undefined}
                aria-current={activeSection === section.id ? 'location' : undefined}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{section.label()}</strong>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="home-experience-content">{children}</div>
    </div>
  )
}
