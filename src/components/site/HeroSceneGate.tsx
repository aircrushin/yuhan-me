import { useState, type CSSProperties, type PointerEvent } from 'react'

import { m } from '#/paraglide/messages'

const LETTERS = 'AIRCRUSHIN'.split('')

export function HeroSceneGate() {
  const foods = [
    m.hero_food_apple(),
    m.hero_food_croissant(),
    m.hero_food_herbs(),
    m.hero_food_fig(),
    m.hero_food_chestnut(),
    m.hero_food_strawberry(),
    m.hero_food_honeycomb(),
    m.hero_food_olive(),
    m.hero_food_cheese(),
    m.hero_food_mushroom(),
  ]
  const [active, setActive] = useState(0)

  const moveLight = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--food-light-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--food-light-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div className="food-word-stage" onPointerMove={moveLight}>
      <div className="food-word" aria-label={`AIRCRUSHIN, ${m.hero_food_word_aria()}`}>
        {LETTERS.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            className="food-letter"
            style={{
              '--food-position': `${(index / (LETTERS.length - 1)) * 100}%`,
              '--food-delay': `${index * 45}ms`,
              '--food-tilt': `${index % 2 ? 1.5 : -1.5}deg`,
            } as CSSProperties}
            aria-label={`${letter}, ${foods[index]}`}
            aria-pressed={active === index}
            onPointerEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="food-word-caption" aria-live="polite">
        <span>{String(active + 1).padStart(2, '0')} / 10</span>
        <strong>{foods[active]}</strong>
      </div>
    </div>
  )
}
