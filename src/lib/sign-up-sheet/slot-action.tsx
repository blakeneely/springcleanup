import { useCallback } from 'react'

import { format } from './messages/format'
import { useSignUpSheetContext } from './state/context'
import { clampedRemaining, isSlotFull, isUserInSlot } from './state/helpers'
import type { SlotData } from './types'

export type SlotActionProps = {
  /**
   * The slot this action drives. The button's label, busy/disabled
   * state, and click handler are all derived from this plus the
   * surrounding provider context (currentUser, pendingSlotIds,
   * slotErrors, callbacks).
   */
  slot: SlotData
  /** Optional extra classes applied to the action wrapper. */
  className?: string
}

export function SlotAction({ slot, className }: SlotActionProps) {
  const {
    currentUser,
    pendingSlotIds,
    slotErrors,
    messages,
    onSlotJoin,
    onSlotLeave
  } = useSignUpSheetContext()

  const userInSlot = currentUser ? isUserInSlot(slot, currentUser.id) : false
  const full = isSlotFull(slot)
  const pending = pendingSlotIds.has(slot.id)
  const errorMessage = slotErrors[slot.id]

  let label: string
  let ariaBusy = false
  let ariaDisabled = false
  let intent: 'join' | 'leave' = 'join'

  if (pending) {
    ariaBusy = true
    ariaDisabled = true
    if (userInSlot) {
      label = messages.leaving
      intent = 'leave'
    } else {
      label = messages.signingUp
    }
  } else if (userInSlot) {
    label = messages.leave
    intent = 'leave'
  } else if (full) {
    label = messages.signUpFull
    ariaDisabled = true
  } else {
    label = messages.signUp
  }

  const handleClick = useCallback(() => {
    if (ariaDisabled) return
    if (intent === 'join') onSlotJoin?.(slot.id)
    else onSlotLeave?.(slot.id)
  }, [ariaDisabled, intent, onSlotJoin, onSlotLeave, slot.id])

  if (!currentUser) return null

  const remaining = clampedRemaining(slot)
  const remainingTemplate =
    remaining === 1 ? messages.slotsRemainingOne : messages.slotsRemainingOther

  const baseButtonClass =
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1 text-sm font-medium transition-colors aria-disabled:cursor-not-allowed aria-disabled:border-border aria-disabled:bg-fg-muted/20 aria-disabled:text-fg-muted'
  const variantClass = userInSlot
    ? 'border-accent bg-surface-elevated text-accent hover:bg-accent/10'
    : 'border-border bg-accent text-accent-fg hover:bg-accent/90'

  return (
    <div className={className} data-slot-action-wrapper>
      <button
        type="button"
        data-slot-action
        data-state={
          pending
            ? 'pending'
            : userInSlot
              ? 'joined'
              : full
                ? 'full'
                : 'available'
        }
        aria-busy={ariaBusy || undefined}
        aria-disabled={ariaDisabled || undefined}
        onClick={handleClick}
        className={`${baseButtonClass} ${variantClass}`}
      >
        {ariaBusy ? (
          <span
            aria-hidden="true"
            data-slot-action-spinner
            className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        <span>{label}</span>
      </button>
      {errorMessage ? (
        <div
          role="alert"
          data-slot-error
          className="mt-1 rounded-md border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger"
        >
          {intent === 'leave' ? messages.leaveError : messages.joinError}
        </div>
      ) : null}
      <span data-slot-remaining className="sr-only">
        {format(remainingTemplate, { count: remaining })}
      </span>
    </div>
  )
}
