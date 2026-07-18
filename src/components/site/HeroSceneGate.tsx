import { useEffect, useState, type CSSProperties, type PointerEvent } from 'react'

import { m } from '#/paraglide/messages'

const LETTERS = 'AIRCRUSHIN'.split('')
const COMPOSITION_INTERVAL = 1600

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
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % LETTERS.length)
      setActive((current) => (current + 1) % LETTERS.length)
    }, COMPOSITION_INTERVAL)

    return () => window.clearInterval(timer)
  }, [])

  const moveLight = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--food-light-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--food-light-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      className="food-word-stage"
      data-food-phase={phase % 2 ? 'odd' : 'even'}
      data-composition={phase}
      onPointerMove={moveLight}
    >
      <div className="food-word" aria-label={`AIRCRUSHIN, ${m.hero_food_word_aria()}`}>
        {LETTERS.map((letter, index) => {
          const ingredient = (index + phase) % foods.length
          const nextIngredient = (ingredient + 1) % foods.length
          const evenIngredient = phase % 2 ? nextIngredient : ingredient
          const oddIngredient = phase % 2 ? ingredient : nextIngredient

          return (
            <button
              key={`${letter}-${index}`}
              type="button"
              className="food-letter"
              style={{
                '--food-position-even': `${(evenIngredient / (LETTERS.length - 1)) * 100}%`,
                '--food-position-odd': `${(oddIngredient / (LETTERS.length - 1)) * 100}%`,
                '--food-delay': `${index * 45}ms`,
                '--food-swap-delay': `${index * 18}ms`,
                '--food-tilt': `${index % 2 ? 1.5 : -1.5}deg`,
              } as CSSProperties}
              aria-label={`${letter}, ${foods[ingredient]}`}
              aria-pressed={active === index}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span className="food-letter-texture food-letter-texture-even" aria-hidden="true">{letter}</span>
              <span className="food-letter-texture food-letter-texture-odd" aria-hidden="true">{letter}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
