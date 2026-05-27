import { useCallback, useId, useMemo, useState } from 'react'

import { CapacityPill } from '../primitives/capacity-pill'
import { ParticipantBadge } from '../primitives/participant-badge'
import { format } from './messages/format'
import { SlotAction } from './slot-action'
import { useSignUpSheetContext } from './state/context'
import { filledCount } from './state/helpers'
import type { SlotData } from './types'

export type SlotColumn = 'date' | 'location' | 'time' | 'slot'

export type SlotProps = {
  /** Slot data driving the row's label, capacity, and participant badges. */
  slot: SlotData
  /**
   * Which cells this slot renders, in order. Must match the parent
   * `<SlotTable>`'s `columns` so the grid alignment lines up.
   */
  columns: readonly SlotColumn[]
  /** Optional extra classes applied to the `<li>` element. */
  className?: string
}

const MOBILE_CELL_CLASS =
  'block px-4 py-2 md:px-4 md:py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border md:[&:not(:last-child)]:border-b-0'

export function Slot({ slot, columns, className }: SlotProps) {
  const { currentUser, messages, maxVisibleParticipants } =
    useSignUpSheetContext()
  const [expanded, setExpanded] = useState(false)
  const participantListId = useId()

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  const showOverflow = slot.participants.length > maxVisibleParticipants
  const visibleParticipants = useMemo(() => {
    if (expanded) return slot.participants
    const baseVisible = slot.participants.slice(0, maxVisibleParticipants)
    if (!currentUser) return baseVisible
    if (baseVisible.some(p => p.id === currentUser.id)) return baseVisible
    const userParticipant = slot.participants.find(
      p => p.id === currentUser.id
    )
    if (!userParticipant) return baseVisible
    return [userParticipant, ...baseVisible.slice(0, maxVisibleParticipants - 1)]
  }, [currentUser, expanded, maxVisibleParticipants, slot.participants])
  const hiddenCount = slot.participants.length - maxVisibleParticipants

  const cells = columns.map(col => {
    switch (col) {
      case 'date':
        return (
          <div
            key="date"
            data-slot-cell
            data-slot-column="date"
            className={`${MOBILE_CELL_CLASS} text-sm font-semibold text-fg`}
          >
            <span className="block text-sm font-semibold text-fg">
              {slot.date ?? null}
            </span>
            {slot.weekday ? (
              <span className="block text-xs font-normal text-fg-muted">
                {slot.weekday}
              </span>
            ) : null}
          </div>
        )
      case 'location':
        return (
          <div
            key="location"
            data-slot-cell
            data-slot-column="location"
            className={`${MOBILE_CELL_CLASS} text-sm text-fg-muted`}
          >
            {slot.location ?? null}
          </div>
        )
      case 'time':
        return (
          <div
            key="time"
            data-slot-cell
            data-slot-column="time"
            className={`${MOBILE_CELL_CLASS} text-sm text-fg-muted`}
          >
            {slot.time ?? null}
          </div>
        )
      case 'slot':
        return (
          <div
            key="slot"
            data-slot-cell
            data-slot-column="slot"
            className={`${MOBILE_CELL_CLASS}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-fg">
                    {slot.label}
                  </div>
                  {slot.description ? (
                    <div className="text-xs text-fg-muted">
                      {slot.description}
                    </div>
                  ) : null}
                </div>
                <CapacityPill
                  capacity={slot.capacity}
                  filled={filledCount(slot)}
                  messages={messages}
                />
                {slot.participants.length > 0 ? (
                  <ul
                    id={participantListId}
                    data-slot-participants
                    className="flex flex-wrap gap-1.5"
                  >
                    {visibleParticipants.map(p => (
                      <li key={p.id}>
                        <ParticipantBadge
                          participant={p}
                          isCurrent={
                            currentUser ? p.id === currentUser.id : false
                          }
                          youLabel={messages.you}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {showOverflow ? (
                  <button
                    type="button"
                    data-slot-overflow-toggle
                    aria-expanded={expanded}
                    aria-controls={participantListId}
                    onClick={toggleExpanded}
                    className="self-start text-xs text-accent underline-offset-2 hover:underline"
                  >
                    {expanded
                      ? messages.showFewerParticipants
                      : format(messages.showMoreParticipants, {
                          count: hiddenCount
                        })}
                  </button>
                ) : null}
              </div>
              <div className="md:shrink-0">
                <SlotAction slot={slot} />
              </div>
            </div>
          </div>
        )
    }
  })

  return (
    <li
      data-slot
      data-slot-id={slot.id}
      className={`block border-b border-border last:border-b-0 md:border-b-0 ${className ?? ''}`}
    >
      {cells}
    </li>
  )
}
