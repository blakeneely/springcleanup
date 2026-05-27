import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { CurrentUser } from '../../primitives/types'
import { SlotAction } from '../slot-action'
import { SignUpSheetProvider } from '../state/sign-up-sheet-provider'
import type { SlotData } from '../types'

const user: CurrentUser = { id: 'me', name: 'Me' }
const SLOT_ERRORS: Readonly<Record<string, string>> = Object.freeze({
  'slot-1': 'Network error'
})

function makeSlot(overrides: Partial<SlotData> = {}): SlotData {
  return {
    id: 'slot-1',
    label: 'Test slot',
    capacity: 3,
    participants: [],
    ...overrides
  }
}

type HarnessProps = {
  children: ReactNode
  currentUser?: CurrentUser
  pendingSlotIds?: ReadonlySet<string>
  slotErrors?: Readonly<Record<string, string>>
  onSlotJoin?: (slotId: string) => void
  onSlotLeave?: (slotId: string) => void
}

function Harness({
  children,
  currentUser,
  pendingSlotIds,
  slotErrors,
  onSlotJoin,
  onSlotLeave
}: HarnessProps) {
  return (
    <SignUpSheetProvider
      currentUser={currentUser}
      pendingSlotIds={pendingSlotIds}
      slotErrors={slotErrors}
      onSlotJoin={onSlotJoin}
      onSlotLeave={onSlotLeave}
    >
      {children}
    </SignUpSheetProvider>
  )
}

describe('SlotAction', () => {
  it('renders nothing when there is no currentUser (read-only mode)', () => {
    const { container } = render(
      <Harness>
        <SlotAction slot={makeSlot()} />
      </Harness>
    )
    expect(container.querySelector('[data-slot-action]')).toBeNull()
  })

  it('shows "Sign up" when slot is available and user is not in it', () => {
    render(
      <Harness currentUser={user}>
        <SlotAction slot={makeSlot()} />
      </Harness>
    )
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('shows "Leave" when user is already in the slot', () => {
    render(
      <Harness currentUser={user}>
        <SlotAction
          slot={makeSlot({
            participants: [{ id: 'me', name: 'Me' }]
          })}
        />
      </Harness>
    )
    expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument()
  })

  it('shows "Sign up (full)" and aria-disabled when slot is full', () => {
    render(
      <Harness currentUser={user}>
        <SlotAction
          slot={makeSlot({
            capacity: 1,
            participants: [{ id: 'someone', name: 'Someone' }]
          })}
        />
      </Harness>
    )
    const btn = screen.getByRole('button', { name: 'Sign up (full)' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows "Signing up..." with aria-busy/aria-disabled when pending join', () => {
    const pending = new Set(['slot-1'])
    render(
      <Harness currentUser={user} pendingSlotIds={pending}>
        <SlotAction slot={makeSlot()} />
      </Harness>
    )
    const btn = screen.getByRole('button', { name: /Signing up/ })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows "Leaving..." with aria-busy/aria-disabled when pending leave', () => {
    const pending = new Set(['slot-1'])
    render(
      <Harness currentUser={user} pendingSlotIds={pending}>
        <SlotAction
          slot={makeSlot({
            participants: [{ id: 'me', name: 'Me' }]
          })}
        />
      </Harness>
    )
    const btn = screen.getByRole('button', { name: /Leaving/ })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders an inline alert when slotErrors has a message for the slot', () => {
    render(
      <Harness currentUser={user} slotErrors={SLOT_ERRORS}>
        <SlotAction slot={makeSlot()} />
      </Harness>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('does not invoke onSlotJoin when the button is aria-disabled', async () => {
    const onSlotJoin = vi.fn()
    render(
      <Harness currentUser={user} onSlotJoin={onSlotJoin}>
        <SlotAction
          slot={makeSlot({
            capacity: 1,
            participants: [{ id: 'someone', name: 'Someone' }]
          })}
        />
      </Harness>
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Sign up (full)' })
    )
    expect(onSlotJoin).not.toHaveBeenCalled()
  })

  it('invokes onSlotJoin when clicking an available slot', async () => {
    const onSlotJoin = vi.fn()
    render(
      <Harness currentUser={user} onSlotJoin={onSlotJoin}>
        <SlotAction slot={makeSlot()} />
      </Harness>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(onSlotJoin).toHaveBeenCalledWith('slot-1')
  })

  it('invokes onSlotLeave when clicking on a joined slot', async () => {
    const onSlotLeave = vi.fn()
    render(
      <Harness currentUser={user} onSlotLeave={onSlotLeave}>
        <SlotAction
          slot={makeSlot({
            participants: [{ id: 'me', name: 'Me' }]
          })}
        />
      </Harness>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(onSlotLeave).toHaveBeenCalledWith('slot-1')
  })
})
