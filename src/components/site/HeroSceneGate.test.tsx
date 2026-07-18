// @vitest-environment jsdom

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HeroSceneGate } from './HeroSceneGate'

describe('HeroSceneGate', () => {
  afterEach(() => vi.useRealTimers())

  it('reveals the ingredient behind an interactive letter', () => {
    render(<HeroSceneGate />)
    const honeycomb = screen.getByRole('button', { name: 'S, Honeycomb' })

    fireEvent.click(honeycomb)

    expect(honeycomb.getAttribute('aria-pressed')).toBe('true')
  })

  it('keeps recomposing the food textures', () => {
    vi.useFakeTimers()
    const { container } = render(<HeroSceneGate />)
    const stage = container.querySelector('.food-word-stage')

    expect(stage?.getAttribute('data-composition')).toBe('0')

    act(() => vi.advanceTimersByTime(1600))

    expect(stage?.getAttribute('data-composition')).toBe('1')
  })
})
