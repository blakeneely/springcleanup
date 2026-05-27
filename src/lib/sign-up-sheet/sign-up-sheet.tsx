import { useEffect, useRef } from 'react'

import type { CurrentUser } from '../primitives/types'
import { SlotsOnlyLayout } from './layouts/slots-only-layout'
import { SortByDateLayout } from './layouts/sort-by-date-layout'
import { format } from './messages/format'
import { SheetHeader } from './sheet-header'
import { SignUpSheetSkeleton } from './sign-up-sheet-skeleton'
import { useSignUpSheetContext } from './state/context'
import { clampedRemaining, getAllSlots } from './state/helpers'
import { SignUpSheetProvider } from './state/sign-up-sheet-provider'
import type {
  DefaultExpandedMode,
  Messages,
  SignUpSheetData,
  Theme,
  ThemeOverride
} from './types'

export type SignUpSheetProps = {
  /**
   * The sign-up sheet payload. Its `type` discriminator selects the
   * matching layout (`sort-by-date` or `slots-only`). Callers own this -
   * update it in response to `onSlotJoin` / `onSlotLeave` callbacks.
   */
  data: SignUpSheetData
  /**
   * The signed-in viewer. When omitted, the sheet renders in read-only
   * mode: no action buttons, and participants are not highlighted as "You".
   */
  currentUser?: CurrentUser
  /**
   * Slot IDs that have an in-flight join/leave mutation. Buttons for these
   * slots render `aria-disabled` + `aria-busy` and show a spinner.
   */
  pendingSlotIds?: ReadonlySet<string>
  /**
   * Per-slot error messages, keyed by slot ID. Each entry renders as an
   * inline `role="alert"` row beneath the affected slot.
   */
  slotErrors?: Readonly<Record<string, string>>
  /** Renders the library's loading skeleton instead of the data. */
  loading?: boolean
  /** Number of placeholder rows in the loading skeleton. Default 3. */
  loadingRowCount?: number
  /**
   * Wraps the sheet in `<div data-theme={theme}>` so the named theme's
   * tokens apply. Omit to inherit the nearest ancestor's `data-theme`.
   */
  theme?: Theme
  /**
   * Per-sheet token overrides applied as inline CSS custom properties on
   * the sheet root. Useful for per-event brand colors without authoring a
   * new named theme.
   */
  themeOverride?: ThemeOverride
  /**
   * Partial override of the library's English strings. Only the keys you
   * provide are replaced; the rest fall back to {@link defaultMessages}.
   */
  messages?: Partial<Messages>
  /**
   * Consumer-supplied timezone label (e.g. "EDT"). When present, the
   * header renders the `messages.timeZoneNote` template with this value.
   */
  timeZone?: string
  /**
   * Maximum participant chips shown inline per slot before the "+N more"
   * expander appears. Default 6.
   */
  maxVisibleParticipants?: number
  /**
   * Initial expansion state for date-grouped layouts: `'all'` opens every
   * section, `'none'` collapses everything, `'auto'` defers to
   * `collapseThreshold`. Default `'auto'`.
   */
  defaultExpandedMode?: DefaultExpandedMode
  /**
   * In `'auto'` mode, sections start open when their count is `<=` this
   * value, collapsed otherwise. Default 5.
   */
  collapseThreshold?: number
  /** Fires when the user clicks a slot's "Sign up" action. */
  onSlotJoin?: (slotId: string) => void
  /** Fires when the user clicks a slot's "Leave" action. */
  onSlotLeave?: (slotId: string) => void
  /** Optional extra classes applied to the sheet's root wrapper. */
  className?: string
}

function Layout({ data }: { data: SignUpSheetData }) {
  switch (data.type) {
    case 'sort-by-date':
      return <SortByDateLayout data={data} />
    case 'slots-only':
      return <SlotsOnlyLayout data={data} />
  }
}

function SelfActionAnnouncer({ data }: { data: SignUpSheetData }) {
  const { currentUser, messages, announce } = useSignUpSheetContext()
  const prevDataRef = useRef(data)

  useEffect(() => {
    const prev = prevDataRef.current
    prevDataRef.current = data
    if (!currentUser) return
    if (prev === data) return

    const prevSlots = new Map(getAllSlots(prev).map(s => [s.id, s] as const))
    for (const slot of getAllSlots(data)) {
      const prevSlot = prevSlots.get(slot.id)
      if (!prevSlot) continue
      const wasIn = prevSlot.participants.some(p => p.id === currentUser.id)
      const isIn = slot.participants.some(p => p.id === currentUser.id)
      if (!wasIn && isIn) {
        const remaining = clampedRemaining(slot)
        const remainingPhrase = format(
          remaining === 1
            ? messages.slotsRemainingOne
            : messages.slotsRemainingOther,
          { count: remaining }
        )
        announce(
          format(messages.signedUpAnnouncement, {
            slotLabel: slot.label,
            remaining: remainingPhrase
          })
        )
      } else if (wasIn && !isIn) {
        announce(format(messages.leftAnnouncement, { slotLabel: slot.label }))
      }
    }
  }, [data, currentUser, messages, announce])

  return null
}

export function SignUpSheet({
  data,
  currentUser,
  pendingSlotIds,
  slotErrors,
  loading = false,
  loadingRowCount = 3,
  theme,
  themeOverride,
  messages,
  timeZone,
  maxVisibleParticipants = 6,
  defaultExpandedMode = 'auto',
  collapseThreshold = 5,
  onSlotJoin,
  onSlotLeave,
  className
}: SignUpSheetProps) {
  return (
    <SignUpSheetProvider
      currentUser={currentUser}
      pendingSlotIds={pendingSlotIds}
      slotErrors={slotErrors}
      messages={messages}
      timeZone={timeZone}
      maxVisibleParticipants={maxVisibleParticipants}
      defaultExpandedMode={defaultExpandedMode}
      collapseThreshold={collapseThreshold}
      onSlotJoin={onSlotJoin}
      onSlotLeave={onSlotLeave}
      theme={theme}
      themeOverride={themeOverride}
      className={className}
    >
      {loading ? (
        <>
          <SheetHeader
            loading
            title={data.title}
            description={data.description}
          />
          <SignUpSheetSkeleton rowCount={loadingRowCount} />
        </>
      ) : (
        <>
          <SelfActionAnnouncer data={data} />
          <Layout data={data} />
        </>
      )}
    </SignUpSheetProvider>
  )
}
