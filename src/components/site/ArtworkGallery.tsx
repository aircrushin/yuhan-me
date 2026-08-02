import type { ArtworkImage } from '#/lib/artwork'
import { filenameFromPathname } from '#/lib/artwork'
import { Section } from '#/components/site/Section'
import { m } from '#/paraglide/messages'

interface ArtworkGalleryProps {
  items: ArtworkImage[]
}

export function ArtworkGallery({ items }: ArtworkGalleryProps) {
  return (
    <Section
      kicker={m.artwork_page_kicker()}
      title={m.artwork_page_title()}
      description={m.artwork_page_description()}
      innerClassName="max-w-none w-[min(1400px,calc(100%-clamp(1rem,4vw,1.5rem)))]"
    >
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 xl:columns-5 [column-gap:0.75rem]">
        {items.map((item) => {
          const alt = filenameFromPathname(item.pathname)
          return (
            <figure key={item.url} className="mb-3 break-inside-avoid">
              <img
                src={item.url}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="block w-full bg-[var(--surface)]"
              />
            </figure>
          )
        })}
      </div>
    </Section>
  )
}
