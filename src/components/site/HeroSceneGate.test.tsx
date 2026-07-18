// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HeroSceneGate } from './HeroSceneGate'

describe('HeroSceneGate', () => {
  it('reveals the ingredient behind an interactive letter', () => {
    render(<HeroSceneGate />)

    fireEvent.click(screen.getByRole('button', { name: 'S, Honeycomb' }))

    expect(screen.getByText('Honeycomb')).toBeTruthy()
    expect(screen.getByText('07 / 10')).toBeTruthy()
  })
})
