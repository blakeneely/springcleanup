import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { CurrentUser } from '../../primitives/types'
import type { SignUpSheetData } from '../types'
import {
  appendParticipant,
  findSlot,
  isSlotFull,
  isUserInSlot,
  removeParticipantById,
  updateSlot
} from './helpers'

export type UseSignUpSheetStateOptions = {
  /** The signed-in viewer; required for the hook to drive join/leave. */
  currentUser: CurrentUser
  /**
   * Optional async hook fired when the user clicks "Sign up". Resolve to
   * commit the join; reject to surface a per-slot error. When omitted the
   * hook uses an in-memory simulated-latency stub.
   */
  onJoin?: (slotId: string, user: CurrentUser) => Promise<void>
  /**
   * Optional async hook fired when the user clicks "Leave". Resolve to
   * commit the leave; reject to surface a per-slot error.
   */
  onLeave?: (slotId: string, user: CurrentUser) => Promise<void>
  /**
   * Artificial latency (ms) inserted before the simulated action
   * resolves. Ignored when `onJoin` / `onLeave` are provided. Default 600.
   */
  simulatedLatencyMs?: number
  /**
   * Probability (0-1) that the simulated action throws, producing an
   * inline error row instead of a state mutation. Used by the demo's
   * error-state card. Default 0.
   */
  simulatedErrorRate?: number
  /**
   * Per-slot error messages to seed on mount, keyed by slot ID. Lets a
   * demo (or test) render in the error state without a prior failed
   * action. Cleared by the hook the next time the user retries a slot.
   */
  initialSlotErrors?: Readonly<Record<string, string>>
}

export type UseSignUpSheetStateReturn = {
  /**
   * Current sheet data. Undefined until `initialData` first arrives (mirrors
   * Apollo / React Query's `data` field for async fetches). Pass straight
   * through to `<SignUpSheet data>`, which renders the skeleton while
   * undefined.
   */
  data: SignUpSheetData | undefined
  /** The signed-in viewer (echoed from options). */
  currentUser: CurrentUser
  /** Slot IDs with an in-flight join/leave mutation. */
  pendingSlotIds: ReadonlySet<string>
  /** Per-slot error messages, keyed by slot ID. */
  slotErrors: Readonly<Record<string, string>>
  /** Stable callback that initiates a join. Safe to pass into JSX inline. */
  joinSlot: (slotId: string) => void
  /** Stable callback that initiates a leave. Safe to pass into JSX inline. */
  leaveSlot: (slotId: string) => void
  /** Restores the hook to its initial state and clears pending + errors. */
  reset: () => void
}

type LatestRef = {
  data: SignUpSheetData | undefined
  currentUser: CurrentUser
  onJoin?: (slotId: string, user: CurrentUser) => Promise<void>
  onLeave?: (slotId: string, user: CurrentUser) => Promise<void>
  simulatedLatencyMs: number
  simulatedErrorRate: number
}

const DEFAULT_LATENCY = 600

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function simulateAction(
  latencyMs: number,
  errorRate: number
): Promise<void> {
  await delay(latencyMs)
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new Error('Simulated failure')
  }
}

export function useSignUpSheetState(
  initialData: SignUpSheetData | undefined,
  options: UseSignUpSheetStateOptions
): UseSignUpSheetStateReturn {
  const {
    currentUser,
    onJoin,
    onLeave,
    simulatedLatencyMs = DEFAULT_LATENCY,
    simulatedErrorRate = 0,
    initialSlotErrors
  } = options

  const [data, setData] = useState<SignUpSheetData | undefined>(initialData)
  const [pendingIds, setPendingIds] = useState<readonly string[]>([])
  const [errorsMap, setErrorsMap] = useState<Readonly<Record<string, string>>>(
    () => Object.freeze({ ...(initialSlotErrors ?? {}) })
  )
  const initialDataRef = useRef(initialData)
  const seededRef = useRef(initialData !== undefined)
  const inFlightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!seededRef.current && initialData !== undefined) {
      seededRef.current = true
      initialDataRef.current = initialData
      setData(initialData)
    }
  }, [initialData])

  const latestRef = useRef<LatestRef>({
    data,
    currentUser,
    onJoin,
    onLeave,
    simulatedLatencyMs,
    simulatedErrorRate
  })

  useEffect(() => {
    latestRef.current = {
      data,
      currentUser,
      onJoin,
      onLeave,
      simulatedLatencyMs,
      simulatedErrorRate
    }
  })

  const joinSlot = useCallback((slotId: string) => {
    if (inFlightRef.current.has(slotId)) return
    const latest = latestRef.current
    if (!latest.data) return
    const slot = findSlot(latest.data, slotId)
    if (!slot) return
    const user = latest.currentUser
    if (isUserInSlot(slot, user.id)) return
    if (isSlotFull(slot)) return

    inFlightRef.current.add(slotId)
    setPendingIds(prev => (prev.includes(slotId) ? prev : [...prev, slotId]))
    setErrorsMap(prev => {
      if (!(slotId in prev)) return prev
      const next: Record<string, string> = { ...prev }
      delete next[slotId]
      return Object.freeze(next)
    })

    const runAction = latest.onJoin
      ? latest.onJoin(slotId, user)
      : simulateAction(latest.simulatedLatencyMs, latest.simulatedErrorRate)

    void runAction
      .then(() => {
        setData(prev => {
          if (!prev) return prev
          return updateSlot(prev, slotId, s =>
            isUserInSlot(s, user.id)
              ? s
              : appendParticipant(s, {
                  id: user.id,
                  name: user.name,
                  avatarUrl: user.avatarUrl
                })
          )
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Sign-up failed'
        setErrorsMap(prev => Object.freeze({ ...prev, [slotId]: message }))
      })
      .finally(() => {
        inFlightRef.current.delete(slotId)
        setPendingIds(prev =>
          prev.includes(slotId) ? prev.filter(id => id !== slotId) : prev
        )
      })
  }, [])

  const leaveSlot = useCallback((slotId: string) => {
    if (inFlightRef.current.has(slotId)) return
    const latest = latestRef.current
    if (!latest.data) return
    const slot = findSlot(latest.data, slotId)
    if (!slot) return
    const user = latest.currentUser
    if (!isUserInSlot(slot, user.id)) return

    inFlightRef.current.add(slotId)
    setPendingIds(prev => (prev.includes(slotId) ? prev : [...prev, slotId]))
    setErrorsMap(prev => {
      if (!(slotId in prev)) return prev
      const next: Record<string, string> = { ...prev }
      delete next[slotId]
      return Object.freeze(next)
    })

    const runAction = latest.onLeave
      ? latest.onLeave(slotId, user)
      : simulateAction(latest.simulatedLatencyMs, latest.simulatedErrorRate)

    void runAction
      .then(() => {
        setData(prev => {
          if (!prev) return prev
          return updateSlot(prev, slotId, s =>
            removeParticipantById(s, user.id)
          )
        })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Leave failed'
        setErrorsMap(prev => Object.freeze({ ...prev, [slotId]: message }))
      })
      .finally(() => {
        inFlightRef.current.delete(slotId)
        setPendingIds(prev =>
          prev.includes(slotId) ? prev.filter(id => id !== slotId) : prev
        )
      })
  }, [])

  const reset = useCallback(() => {
    inFlightRef.current.clear()
    setData(initialDataRef.current)
    setPendingIds([])
    setErrorsMap(Object.freeze({}))
  }, [])

  const pendingSlotIds = useMemo<ReadonlySet<string>>(
    () => new Set(pendingIds),
    [pendingIds]
  )

  return {
    data,
    currentUser,
    pendingSlotIds,
    slotErrors: errorsMap,
    joinSlot,
    leaveSlot,
    reset
  }
}
