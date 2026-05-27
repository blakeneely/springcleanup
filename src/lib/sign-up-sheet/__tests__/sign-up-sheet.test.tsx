import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { CurrentUser } from '../../primitives/types'
import { SheetHeader } from '../sheet-header'
import { SignUpSheet } from '../sign-up-sheet'
import { SlotRow } from '../slot-row'
import type { SlotColumn } from '../slot-row'
import { SlotTable } from '../slot-table'
import { SignUpSheetProvider } from '../state/sign-up-sheet-provider'
import type {
  Messages,
  SignUpSheetData,
  SlotsOnlySheet,
  SortByDateSheet,
  Theme,
  ThemeOverride
} from '../types'

const user: CurrentUser = { id: 'me', name: 'Me' }

const SLOT_COLUMNS: readonly SlotColumn[] = ['slot']

const PENDING_SET: ReadonlySet<string> = new Set(['slot-1'])

const THEME_OVERRIDE: ThemeOverride = Object.freeze({
  accent: '#abcdef',
  headline: '#123456'
})

const PARTIAL_MESSAGES: Partial<Messages> = Object.freeze({
  signUp: 'Volunteer'
})

function makeSortByDate(): SortByDateSheet {
  return {
    type: 'sort-by-date',
    title: 'Spring Cleanup',
    description: 'Bring gloves',
    timeZone: 'EDT',
    slotGroups: [
      {
        id: 'g1',
        label: 'Saturday',
        slots: [
          {
            id: 'slot-1',
            label: 'Morning shift',
            capacity: 2,
            weekday: 'Sat',
            date: 'Apr 12',
            time: '9-11',
            location: 'Field',
            participants: []
          }
        ]
      }
    ]
  }
}

function makeSortByDateLarge(sectionCount: number): SortByDateSheet {
  const slotGroups = Array.from({ length: sectionCount }, (_, i) => ({
    id: `g${String(i)}`,
    label: `Section ${String(i)}`,
    slots: [
      {
        id: `slot-${String(i)}`,
        label: `Item ${String(i)}`,
        capacity: 5,
        weekday: 'Sat',
        date: `Apr ${String(i + 1)}`,
        time: '9-11',
        location: 'X',
        participants: []
      }
    ]
  }))
  return {
    type: 'sort-by-date',
    title: 'Large sheet',
    slotGroups
  }
}

function makeSlotsOnly(): SlotsOnlySheet {
  return {
    type: 'slots-only',
    title: 'Supplies',
    slots: [
      {
        id: 'supply-1',
        label: 'Water cases',
        capacity: 4,
        participants: [{ id: 'p-a', name: 'Anna', quantity: 2 }]
      }
    ]
  }
}

describe('SignUpSheet - dispatch', () => {
  it('renders the sort-by-date layout when data.type is sort-by-date', () => {
    render(<SignUpSheet data={makeSortByDate()} />)
    expect(
      document.querySelector('[data-sign-up-sheet-layout="sort-by-date"]')
    ).not.toBeNull()
  })

  it('renders the slots-only layout when data.type is slots-only', () => {
    render(<SignUpSheet data={makeSlotsOnly()} />)
    expect(
      document.querySelector('[data-sign-up-sheet-layout="slots-only"]')
    ).not.toBeNull()
  })
})

describe('SignUpSheet - join / leave flow (via callbacks)', () => {
  it('fires onSlotJoin when the user clicks an available slot', async () => {
    const onSlotJoin = vi.fn()
    render(
      <SignUpSheet
        data={makeSortByDate()}
        currentUser={user}
        onSlotJoin={onSlotJoin}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(onSlotJoin).toHaveBeenCalledWith('slot-1')
  })

  it('fires onSlotLeave when the user clicks a slot they are in', async () => {
    const onSlotLeave = vi.fn()
    const data = makeSortByDate()
    data.slotGroups[0].slots[0].participants = [{ id: 'me', name: 'Me' }]
    render(
      <SignUpSheet data={data} currentUser={user} onSlotLeave={onSlotLeave} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(onSlotLeave).toHaveBeenCalledWith('slot-1')
  })

  it('does not invoke join when the button is at capacity (aria-disabled)', async () => {
    const onSlotJoin = vi.fn()
    const data = makeSortByDate()
    data.slotGroups[0].slots[0].participants = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' }
    ]
    render(
      <SignUpSheet data={data} currentUser={user} onSlotJoin={onSlotJoin} />
    )
    const btn = screen.getByRole('button', { name: 'Sign up (full)' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(btn)
    expect(onSlotJoin).not.toHaveBeenCalled()
  })
})

describe('SignUpSheet - pending state', () => {
  it('renders Signing up... with aria-busy when slot is in pendingSlotIds', () => {
    render(
      <SignUpSheet
        data={makeSortByDate()}
        currentUser={user}
        pendingSlotIds={PENDING_SET}
      />
    )
    const btn = screen.getByRole('button', { name: /Signing up/ })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('SignUpSheet - capacity / quantity arithmetic', () => {
  it('respects participant.quantity when computing remaining', () => {
    render(<SignUpSheet data={makeSlotsOnly()} currentUser={user} />)
    expect(
      screen.getByText('2 of 4 spots filled · 2 spots remaining')
    ).toBeInTheDocument()
  })

  it('shows Full and disables the action when filled equals capacity', () => {
    const data = makeSlotsOnly()
    data.slots[0].participants = [{ id: 'a', name: 'A', quantity: 4 }]
    render(<SignUpSheet data={data} currentUser={user} />)
    expect(screen.getByText('Full')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Sign up (full)' })
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('SignUpSheet - theme prop', () => {
  it('sets data-theme on the sheet root when theme is provided', () => {
    render(
      <SignUpSheet data={makeSortByDate()} currentUser={user} theme="mando" />
    )
    const root = document.querySelector(
      '[data-sign-up-sheet-root]'
    ) as HTMLElement
    expect(root.dataset.theme).toBe('mando')
  })

  it('inherits page-level data-theme when theme prop is not set', () => {
    render(
      <div data-theme="dark">
        <SignUpSheet data={makeSortByDate()} currentUser={user} />
      </div>
    )
    const root = document.querySelector(
      '[data-sign-up-sheet-root]'
    ) as HTMLElement
    expect(root.hasAttribute('data-theme')).toBe(false)
  })

  it('applies themeOverride as inline CSS custom properties', () => {
    render(
      <SignUpSheet
        data={makeSortByDate()}
        currentUser={user}
        themeOverride={THEME_OVERRIDE}
      />
    )
    const root = document.querySelector(
      '[data-sign-up-sheet-root]'
    ) as HTMLElement
    expect(root.style.getPropertyValue('--color-accent')).toBe('#abcdef')
    expect(root.style.getPropertyValue('--color-headline')).toBe('#123456')
  })
})

describe('SignUpSheet - messages override', () => {
  it('renders consumer-supplied templates in place of defaults', () => {
    render(
      <SignUpSheet
        data={makeSortByDate()}
        currentUser={user}
        messages={PARTIAL_MESSAGES}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Volunteer' })
    ).toBeInTheDocument()
  })
})

describe('SignUpSheet - loading state', () => {
  it('renders the skeleton with aria-busy when loading is true', () => {
    render(<SignUpSheet data={makeSortByDate()} loading />)
    const status = screen.getByRole('status', { busy: true })
    expect(status).toBeInTheDocument()
    expect(document.querySelector('[data-sign-up-sheet-layout]')).toBeNull()
  })
})

describe('SignUpSheet - accordion default', () => {
  it('opens all sections when sectionCount is at or under threshold', () => {
    render(
      <SignUpSheet
        data={makeSortByDateLarge(3)}
        currentUser={user}
        collapseThreshold={5}
      />
    )
    const details = document.querySelectorAll(
      'details[data-collapsible-section]'
    )
    details.forEach(d => {
      expect((d as HTMLDetailsElement).open).toBe(true)
    })
  })

  it('closes all sections when sectionCount exceeds threshold', () => {
    render(
      <SignUpSheet
        data={makeSortByDateLarge(8)}
        currentUser={user}
        collapseThreshold={5}
      />
    )
    const details = document.querySelectorAll(
      'details[data-collapsible-section]'
    )
    details.forEach(d => {
      expect((d as HTMLDetailsElement).open).toBe(false)
    })
  })
})

describe('SignUpSheet - overflow expander', () => {
  it('shows the first N participants and a +K more button', async () => {
    const data: SortByDateSheet = makeSortByDate()
    data.slotGroups[0].slots[0].capacity = 20
    data.slotGroups[0].slots[0].participants = Array.from(
      { length: 10 },
      (_, i) => ({ id: `p${String(i)}`, name: `Person ${String(i)}` })
    )
    render(
      <SignUpSheet data={data} currentUser={user} maxVisibleParticipants={6} />
    )
    expect(screen.queryByText('Person 7')).toBeNull()
    await userEvent.click(
      screen.getByRole('button', { name: /Show 4 more participants/ })
    )
    expect(screen.getByText('Person 7')).toBeInTheDocument()
  })
})

describe('SignUpSheet - live region', () => {
  it("announces only the current user's own join in the polite region", async () => {
    function Wrapper({ data }: { data: SignUpSheetData }) {
      return <SignUpSheet data={data} currentUser={user} timeZone="EDT" />
    }
    const initial = makeSortByDate()
    const { rerender } = render(<Wrapper data={initial} />)

    const announcer = document.querySelector(
      '[data-sign-up-sheet-announcer]'
    ) as HTMLElement
    expect(announcer.textContent).toBe('')

    const next: SortByDateSheet = makeSortByDate()
    next.slotGroups[0].slots[0].participants = [{ id: 'me', name: 'Me' }]
    rerender(<Wrapper data={next} />)

    await waitFor(() => {
      expect(announcer.textContent).toContain('Signed up for Morning shift')
    })
  })

  it('does NOT announce when a different participant joins a slot', async () => {
    function Wrapper({ data }: { data: SignUpSheetData }) {
      return <SignUpSheet data={data} currentUser={user} />
    }
    const initial = makeSortByDate()
    const { rerender } = render(<Wrapper data={initial} />)

    const announcer = document.querySelector(
      '[data-sign-up-sheet-announcer]'
    ) as HTMLElement

    const next: SortByDateSheet = makeSortByDate()
    next.slotGroups[0].slots[0].participants = [
      { id: 'someone-else', name: 'Else' }
    ]
    rerender(<Wrapper data={next} />)

    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    expect(announcer.textContent).toBe('')
  })
})

describe('SignUpSheet - compound API parity', () => {
  it('manually composed children produce the same observable behavior as the dispatcher', () => {
    const data = makeSlotsOnly()
    render(
      <SignUpSheetProvider currentUser={user}>
        <SheetHeader title={data.title} />
        <SlotTable columns={SLOT_COLUMNS} ariaLabel={data.title}>
          {data.slots.map(slot => (
            <SlotRow key={slot.id} slot={slot} columns={SLOT_COLUMNS} />
          ))}
        </SlotTable>
      </SignUpSheetProvider>
    )
    expect(
      screen.getByRole('heading', { name: 'Supplies' })
    ).toBeInTheDocument()
    expect(screen.getByText('Water cases')).toBeInTheDocument()
    expect(
      screen.getByText('2 of 4 spots filled · 2 spots remaining')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })
})

describe('SignUpSheet - read-only mode', () => {
  it('omits action buttons when currentUser is absent', () => {
    render(<SignUpSheet data={makeSlotsOnly()} />)
    expect(screen.queryByRole('button', { name: /Sign up|Leave/ })).toBeNull()
  })
})

const THEMES: readonly Theme[] = ['light', 'dark', 'mando', 'boba']

describe('SignUpSheet - jest-axe a11y sweep', () => {
  for (const theme of THEMES) {
    it(`passes axe in the ${theme} theme`, async () => {
      const data = makeSortByDate()
      data.slotGroups[0].slots[0].participants = [{ id: 'me', name: 'Me' }]
      const { container } = render(
        <SignUpSheet data={data} currentUser={user} theme={theme} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})

describe('SignUpSheet - column rendering (regression)', () => {
  it('renders sort-by-date columns in the header row', () => {
    render(<SignUpSheet data={makeSortByDate()} currentUser={user} />)
    const header = document.querySelector(
      '[data-slot-table-header]'
    ) as HTMLElement
    expect(within(header).getByText('Date')).toBeInTheDocument()
    expect(within(header).getByText('Location')).toBeInTheDocument()
    expect(within(header).getByText('Time')).toBeInTheDocument()
    expect(within(header).getByText('Available Slot')).toBeInTheDocument()
  })
})
