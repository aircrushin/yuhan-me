import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

interface SectionProps {
  id?: string
  kicker?: string
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  innerClassName?: string
}

export function Section({ id, kicker, title, description, children, className, innerClassName }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      <div className={cn('page-wrap', innerClassName)}>
        {(kicker || title) && (
          <div className="section-heading">
            <div>{kicker ? <div className="kicker-line">{kicker}</div> : null}</div>
            <div>
              {title ? <h2 className="section-title">{title}</h2> : null}
              {description ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--sea-ink-soft)]">{description}</p>
              ) : null}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
