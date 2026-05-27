import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CurrentUser } from '../../../primitives/types'
import type { SignUpSheetData } from '../../types'
import { useSignUpSheetState } from '../use-sign-up-sheet-state'

const currentUser: CurrentUser = { id: 'me', name: 'Me' }

function makeSortByDate(): SignUpSheetData {
  return {
    type: 'sort-by-date',
    title: 'Volunteer day',
    slotGroups: [
      {
        id: 'g1',
        label: 'Saturday',
        slots: [
          {
            id: 'slot-1',
            label: 'Morning shift',
            capacity: 2,
            participants: []
          },
          {
            id: 'slot-2',
            label: 'Afternoon shift',
            capacity: 1,
            participants: [{ id: 'someone', name: 'Someone' }]
          }
        ]
      }
    ]
  }
}

describe('useSignUpSheetState - initial state', () => {
  it('mirrors initialData on first render', () => {
    const initial = makeSortByDate()
    const { result } = renderHook(() =>
      useSignUpSheetState(initial, { currentUser })
    )
    expect(result.current.data).toEqual(initial)
    expect(result.current.currentUser).toEqual(currentUser)
    expect(result.current.pendingSlotIds.size).toBe(0)
    expect(result.current.slotErrors).toEqual({})
  })
})

describe('useSignUpSheetState - join flow', () => {
  it('appends the current user on resolve and clears pending', async () => {
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        simulatedLatencyMs: 0
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })

    expect(result.current.pendingSlotIds.has('slot-1')).toBe(true)

    await waitFor(() => {
      expect(result.current.pendingSlotIds.has('slot-1')).toBe(false)
    })

    if (!result.current.data || result.current.data.type !== 'sort-by-date') {
      throw new Error('type widened')
    }
    const slot = result.current.data.slotGroups[0].slots[0]
    expect(slot.participants.map(p => p.id)).toContain('me')
  })

  it('is a no-op when the user is already in the slot', () => {
    const initial = makeSortByDate()
    if (initial.type !== 'sort-by-date') throw new Error('type widened')
    initial.slotGroups[0].slots[0].participants = [{ id: 'me', name: 'Me' }]

    const { result } = renderHook(() =>
      useSignUpSheetState(initial, {
        currentUser,
        simulatedLatencyMs: 0
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })
    expect(result.current.pendingSlotIds.size).toBe(0)
  })

  it('is a no-op when the slot is full', () => {
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        simulatedLatencyMs: 0
      })
    )

    act(() => {
      result.current.joinSlot('slot-2')
    })
    expect(result.current.pendingSlotIds.size).toBe(0)
  })

  it('rapid double-fire only queues the action once', async () => {
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        simulatedLatencyMs: 20
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
      result.current.joinSlot('slot-1')
      result.current.joinSlot('slot-1')
    })

    expect(result.current.pendingSlotIds.size).toBe(1)

    await waitFor(() => {
      expect(result.current.pendingSlotIds.has('slot-1')).toBe(false)
    })

    if (!result.current.data || result.current.data.type !== 'sort-by-date') {
      throw new Error('type widened')
    }
    const slot = result.current.data.slotGroups[0].slots[0]
    expect(slot.participants.filter(p => p.id === 'me')).toHaveLength(1)
  })
})

describe('useSignUpSheetState - leave flow', () => {
  it('removes the current user on resolve', async () => {
    const initial = makeSortByDate()
    if (initial.type !== 'sort-by-date') throw new Error('type widened')
    initial.slotGroups[0].slots[0].participants = [{ id: 'me', name: 'Me' }]

    const { result } = renderHook(() =>
      useSignUpSheetState(initial, {
        currentUser,
        simulatedLatencyMs: 0
      })
    )

    act(() => {
      result.current.leaveSlot('slot-1')
    })

    await waitFor(() => {
      expect(result.current.pendingSlotIds.has('slot-1')).toBe(false)
    })

    if (!result.current.data || result.current.data.type !== 'sort-by-date') {
      throw new Error('type widened')
    }
    expect(
      result.current.data.slotGroups[0].slots[0].participants
    ).toHaveLength(0)
  })

  it('is a no-op when the user is not in the slot', () => {
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        simulatedLatencyMs: 0
      })
    )

    act(() => {
      result.current.leaveSlot('slot-1')
    })
    expect(result.current.pendingSlotIds.size).toBe(0)
  })
})

describe('useSignUpSheetState - error injection', () => {
  it('records the slot error and leaves participants unchanged', async () => {
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        simulatedLatencyMs: 0,
        simulatedErrorRate: 1
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })

    await waitFor(() => {
      expect(result.current.slotErrors['slot-1']).toBeTruthy()
    })

    if (!result.current.data || result.current.data.type !== 'sort-by-date') {
      throw new Error('type widened')
    }
    expect(
      result.current.data.slotGroups[0].slots[0].participants
    ).toHaveLength(0)
    expect(result.current.pendingSlotIds.size).toBe(0)
  })

  it('clears a prior error when a subsequent action starts', async () => {
    const { result, rerender } = renderHook(
      ({ errRate }: { errRate: number }) =>
        useSignUpSheetState(makeSortByDate(), {
          currentUser,
          simulatedLatencyMs: 0,
          simulatedErrorRate: errRate
        }),
      { initialProps: { errRate: 1 } }
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })
    await waitFor(() => {
      expect(result.current.slotErrors['slot-1']).toBeTruthy()
    })

    rerender({ errRate: 0 })

    act(() => {
      result.current.joinSlot('slot-1')
    })

    await waitFor(() => {
      expect(result.current.slotErrors['slot-1']).toBeUndefined()
    })
  })
})

describe('useSignUpSheetState - onJoin / onLeave wiring', () => {
  it('uses caller-supplied onJoin instead of the simulated path', async () => {
    let receivedSlotId: string | undefined
    let receivedUserId: string | undefined
    const onJoin = (slotId: string, user: CurrentUser): Promise<void> => {
      receivedSlotId = slotId
      receivedUserId = user.id
      return Promise.resolve()
    }

    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), {
        currentUser,
        onJoin
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })

    await waitFor(() => {
      expect(result.current.pendingSlotIds.has('slot-1')).toBe(false)
    })

    expect(receivedSlotId).toBe('slot-1')
    expect(receivedUserId).toBe('me')
  })

  it('records the rejection message on slotErrors', async () => {
    const onJoin = () => Promise.reject(new Error('Boom'))
    const { result } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), { currentUser, onJoin })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })

    await waitFor(() => {
      expect(result.current.slotErrors['slot-1']).toBe('Boom')
    })
  })
})

describe('useSignUpSheetState - reset', () => {
  it('returns state to initialData and clears pending + errors', async () => {
    const initial = makeSortByDate()
    const { result } = renderHook(() =>
      useSignUpSheetState(initial, {
        currentUser,
        simulatedLatencyMs: 0,
        simulatedErrorRate: 1
      })
    )

    act(() => {
      result.current.joinSlot('slot-1')
    })
    await waitFor(() => {
      expect(result.current.slotErrors['slot-1']).toBeTruthy()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toEqual(initial)
    expect(result.current.pendingSlotIds.size).toBe(0)
    expect(result.current.slotErrors).toEqual({})
  })
})

describe('useSignUpSheetState - stable references', () => {
  it('keeps joinSlot / leaveSlot / reset stable across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), { currentUser })
    )
    const before = {
      joinSlot: result.current.joinSlot,
      leaveSlot: result.current.leaveSlot,
      reset: result.current.reset
    }
    rerender()
    expect(result.current.joinSlot).toBe(before.joinSlot)
    expect(result.current.leaveSlot).toBe(before.leaveSlot)
    expect(result.current.reset).toBe(before.reset)
  })

  it('returns the same pendingSlotIds set when nothing changes', () => {
    const { result, rerender } = renderHook(() =>
      useSignUpSheetState(makeSortByDate(), { currentUser })
    )
    const before = result.current.pendingSlotIds
    rerender()
    expect(result.current.pendingSlotIds).toBe(before)
  })
})
