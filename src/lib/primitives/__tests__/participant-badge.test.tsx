import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ParticipantBadge } from '../participant-badge'
import type { Participant } from '../types'

const MARY: Participant = { id: '1', name: 'Mary Smith' }
const MARY_QTY_2: Participant = { id: '1', name: 'Mary Smith', quantity: 2 }
const LONG_NAME: Participant = {
  id: '1',
  name: 'A Very Long Participant Name That Will Definitely Truncate'
}

describe('ParticipantBadge', () => {
  it('renders the participant name', () => {
    render(<ParticipantBadge participant={MARY} />)
    expect(screen.getByText('Mary Smith')).toBeInTheDocument()
  })

  it('renders quantity suffix when quantity > 1', () => {
    render(<ParticipantBadge participant={MARY_QTY_2} />)
    expect(screen.getByText('Mary Smith (2)')).toBeInTheDocument()
  })

  it('renders "You" label and aria-current when isCurrent', () => {
    render(<ParticipantBadge participant={MARY} isCurrent />)
    expect(screen.getByText('You')).toBeInTheDocument()
    const chip = screen.getByLabelText('Mary Smith')
    expect(chip.getAttribute('aria-current')).toBe('true')
  })

  it('honors a custom youLabel for "You"', () => {
    render(<ParticipantBadge participant={MARY} isCurrent youLabel="Tú" />)
    expect(screen.getByText('Tú')).toBeInTheDocument()
  })

  it('exposes the full name via aria-label even when visually truncated', () => {
    render(<ParticipantBadge participant={LONG_NAME} />)
    const chip = screen.getByLabelText(LONG_NAME.name)
    expect(chip).toBeInTheDocument()
    expect(chip.getAttribute('title')).toBe(LONG_NAME.name)
  })

  it('keeps the real name in aria-label when isCurrent, so AT users hear who is "You"', () => {
    render(<ParticipantBadge participant={MARY_QTY_2} isCurrent />)
    const chip = screen.getByLabelText('Mary Smith (2)')
    expect(chip).toBeInTheDocument()
  })
})
