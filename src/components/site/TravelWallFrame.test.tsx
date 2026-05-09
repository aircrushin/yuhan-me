// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TravelWallFrame } from './TravelWallFrame'

describe('TravelWallFrame', () => {
  it('renders the configured photo wall as a lazy fullscreen iframe', () => {
    render(
      <TravelWallFrame
        name="大理旅居"
        src="http://localhost:3000/live/-h2hd?embed=1"
      />,
    )

    const frame = screen.getByTitle('大理旅居 LiveDrop live wall')

    expect(frame.getAttribute('src')).toBe('http://localhost:3000/live/-h2hd?embed=1')
    expect(frame.getAttribute('loading')).toBe('lazy')
    expect(frame.hasAttribute('allowfullscreen')).toBe(true)
  })
})
