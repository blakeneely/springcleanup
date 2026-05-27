import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import type { CurrentUser, Participant } from '../../primitives/types'
import { SlotRow } from '../slot-row'
import type { SlotColumn } from '../slot-row'
import { SlotTable } from '../slot-table'
import { SignUpSheetProvider } from '../state/sign-up-sheet-provider'
import type { SlotData } from '../types'

const user: CurrentUser = { id: 'me', name: 'Me' }

function makeSlot(overrides: Partial<SlotData> = {}): SlotData {
  return {
    id: 'slot-1',
    label: 'Saturday morning',
    capacity: 10,
    participants: [],
    ...overrides
  }
}

type HarnessProps = {
  children: ReactNode
  currentUser?: CurrentUser
  maxVisibleParticipants?: number
}

function Harness({
  children,
  currentUser,
  maxVisibleParticipants
}: HarnessProps) {
  return (
    <SignUpSheetProvider
      currentUser={currentUser}
      maxVisibleParticipants={maxVisibleParticipants}
    >
      {children}
    </SignUpSheetProvider>
  )
}

const ALL_COLUMNS: readonly SlotColumn[] = ['date', 'location', 'time', 'slot']
const SLOT_ONLY: readonly SlotColumn[] = ['slot']

describe('SlotRow', () => {
  it('renders the slot label and description in the slot column', () => {
    render(
      <Harness currentUser={user}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({
              label: 'Bring chairs',
              description: 'Folding ones, please'
            })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )
    expect(screen.getByText('Bring chairs')).toBeInTheDocument()
    expect(screen.getByText('Folding ones, please')).toBeInTheDocument()
  })

  it('renders date/location/time cells when those columns are configured', () => {
    render(
      <Harness currentUser={user}>
        <SlotTable columns={ALL_COLUMNS}>
          <SlotRow
            slot={makeSlot({
              date: 'Apr 12',
              weekday: 'Saturday',
              location: 'Bryant Park',
              time: '9:00 AM'
            })}
            columns={ALL_COLUMNS}
          />
        </SlotTable>
      </Harness>
    )
    expect(screen.getByText('Apr 12')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Bryant Park')).toBeInTheDocument()
    expect(screen.getByText('9:00 AM')).toBeInTheDocument()
  })

  it('renders a +N more button when participants exceed maxVisibleParticipants', () => {
    const participants: Participant[] = Array.from({ length: 10 }, (_, i) => ({
      id: `p${String(i)}`,
      name: `Person ${String(i)}`
    }))
    render(
      <Harness currentUser={user} maxVisibleParticipants={6}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({ capacity: 20, participants })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )
    const expander = screen.getByRole('button', {
      name: /Show 4 more participants/
    })
    expect(expander).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands the participant list when the +N more button is clicked', async () => {
    const participants: Participant[] = Array.from({ length: 8 }, (_, i) => ({
      id: `p${String(i)}`,
      name: `Person ${String(i)}`
    }))
    render(
      <Harness currentUser={user} maxVisibleParticipants={6}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({ capacity: 20, participants })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )

    expect(screen.queryByText('Person 6')).toBeNull()
    expect(screen.queryByText('Person 7')).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: /Show 2 more participants/ })
    )

    expect(screen.getByText('Person 6')).toBeInTheDocument()
    expect(screen.getByText('Person 7')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Show fewer participants/ })
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps the current user visible even when they sit past the overflow cut', () => {
    const others: Participant[] = Array.from({ length: 8 }, (_, i) => ({
      id: `p${String(i)}`,
      name: `Person ${String(i)}`
    }))
    const participants: Participant[] = [...others, { id: 'me', name: 'Me' }]
    render(
      <Harness currentUser={user} maxVisibleParticipants={6}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({ capacity: 20, participants })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )
    expect(screen.getByText(/^You$/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Show 3 more participants/ })
    ).toBeInTheDocument()
  })

  it('omits the +N more button when participants do not exceed the cap', () => {
    render(
      <Harness currentUser={user} maxVisibleParticipants={6}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({
              participants: [{ id: 'a', name: 'Anna' }]
            })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )
    expect(
      screen.queryByRole('button', { name: /more participants/ })
    ).toBeNull()
  })

  it('shows the capacity pill reflecting filled/remaining counts', () => {
    render(
      <Harness currentUser={user}>
        <SlotTable columns={SLOT_ONLY}>
          <SlotRow
            slot={makeSlot({
              capacity: 4,
              participants: [
                { id: 'a', name: 'A' },
                { id: 'b', name: 'B' }
              ]
            })}
            columns={SLOT_ONLY}
          />
        </SlotTable>
      </Harness>
    )
    expect(
      screen.getByText('2 of 4 spots filled · 2 spots remaining')
    ).toBeInTheDocument()
  })
})

describe('SlotTable', () => {
  it('renders configured column headers', () => {
    render(
      <Harness currentUser={user}>
        <SlotTable columns={ALL_COLUMNS}>
          <SlotRow slot={makeSlot()} columns={ALL_COLUMNS} />
        </SlotTable>
      </Harness>
    )
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Available Slot')).toBeInTheDocument()
  })
})
