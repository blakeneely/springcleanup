import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import type { CurrentUser } from '../../primitives/types'
import { defaultMessages } from '../messages/default-messages'
import type {
  DefaultExpandedMode,
  Messages,
  Theme,
  ThemeOverride
} from '../types'
import type { SignUpSheetContextValue } from './context'
import { SignUpSheetContext } from './context'

export type SignUpSheetProviderProps = {
  /** Sheet content. Compose primitives + recipe components freely below. */
  children: ReactNode
  /**
   * The signed-in viewer. When omitted, descendants render in read-only
   * mode (no action buttons; no "You" highlighting on chips).
   */
  currentUser?: CurrentUser
  /**
   * Slot IDs that have an in-flight join/leave mutation. Buttons for
   * these slots render `aria-disabled` + `aria-busy` with a spinner.
   */
  pendingSlotIds?: ReadonlySet<string>
  /**
   * Per-slot error messages, keyed by slot ID. Each entry renders as an
   * inline `role="alert"` row beneath the affected slot.
   */
  slotErrors?: Readonly<Record<string, string>>
  /**
   * Partial override of the library's English strings. Only the keys you
   * provide are replaced; the rest fall back to {@link defaultMessages}.
   */
  messages?: Partial<Messages>
  /**
   * Consumer-supplied timezone label (e.g. "EDT"). When set, the
   * `<SheetHeader>` renders the `messages.timeZoneNote` template.
   */
  timeZone?: string
  /**
   * Maximum participant chips shown inline per slot before the "+N more"
   * expander appears. Default 6.
   */
  maxVisibleParticipants?: number
  /**
   * Initial expansion state for date-grouped layouts: `'all'` opens
   * every section, `'none'` collapses everything, `'auto'` defers to
   * `collapseThreshold`. Default `'auto'`.
   */
  defaultExpandedMode?: DefaultExpandedMode
  /**
   * In `'auto'` mode, sections start open when their count is `<=` this
   * value, collapsed otherwise. Default 5.
   */
  collapseThreshold?: number
  /**
   * Wraps the rendered tree in `<div data-theme={theme}>` so the named
   * theme's tokens apply. Omit to inherit ancestor `data-theme`.
   */
  theme?: Theme
  /**
   * Per-sheet token overrides applied as inline CSS custom properties on
   * the provider root. Override individual semantic tokens without
   * authoring a whole theme.
   */
  themeOverride?: ThemeOverride
  /** Fires when the user clicks a slot's "Sign up" action. */
  onSlotJoin?: (slotId: string) => void
  /** Fires when the user clicks a slot's "Leave" action. */
  onSlotLeave?: (slotId: string) => void
  /** Optional extra classes applied to the provider's root wrapper. */
  className?: string
}

const EMPTY_PENDING: ReadonlySet<string> = new Set()
const EMPTY_ERRORS: Readonly<Record<string, string>> = Object.freeze({})

const TOKEN_VAR_BY_KEY: Record<keyof ThemeOverride, string> = {
  surface: '--color-surface',
  surfaceElevated: '--color-surface-elevated',
  fg: '--color-fg',
  fgMuted: '--color-fg-muted',
  headline: '--color-headline',
  headlineFg: '--color-headline-fg',
  accent: '--color-accent',
  accentFg: '--color-accent-fg',
  marker: '--color-marker',
  markerFg: '--color-marker-fg',
  success: '--color-success',
  danger: '--color-danger',
  border: '--color-border'
}

function themeOverrideToStyle(
  override: ThemeOverride | undefined
): CSSProperties | undefined {
  if (!override) return undefined
  const style: Record<string, string> = {}
  for (const key of Object.keys(override) as (keyof ThemeOverride)[]) {
    const value = override[key]
    if (typeof value === 'string') {
      style[TOKEN_VAR_BY_KEY[key]] = value
    }
  }
  return Object.keys(style).length > 0 ? style : undefined
}

export function SignUpSheetProvider({
  children,
  currentUser,
  pendingSlotIds,
  slotErrors,
  messages: messagesProp,
  timeZone,
  maxVisibleParticipants = 6,
  defaultExpandedMode = 'auto',
  collapseThreshold = 5,
  theme,
  themeOverride,
  onSlotJoin,
  onSlotLeave,
  className
}: SignUpSheetProviderProps) {
  const [announcement, setAnnouncement] = useState('')

  const announce = useCallback((message: string) => {
    setAnnouncement(message)
  }, [])

  const mergedMessages = useMemo<Messages>(
    () => ({ ...defaultMessages, ...messagesProp }),
    [messagesProp]
  )

  const effectivePending = pendingSlotIds ?? EMPTY_PENDING
  const effectiveErrors = slotErrors ?? EMPTY_ERRORS

  const value = useMemo<SignUpSheetContextValue>(
    () => ({
      currentUser,
      pendingSlotIds: effectivePending,
      slotErrors: effectiveErrors,
      messages: mergedMessages,
      timeZone,
      maxVisibleParticipants,
      defaultExpandedMode,
      collapseThreshold,
      onSlotJoin,
      onSlotLeave,
      announce
    }),
    [
      currentUser,
      effectivePending,
      effectiveErrors,
      mergedMessages,
      timeZone,
      maxVisibleParticipants,
      defaultExpandedMode,
      collapseThreshold,
      onSlotJoin,
      onSlotLeave,
      announce
    ]
  )

  const inlineStyle = useMemo(
    () => themeOverrideToStyle(themeOverride),
    [themeOverride]
  )

  return (
    <SignUpSheetContext value={value}>
      <div
        data-sign-up-sheet-root=""
        data-theme={theme}
        style={inlineStyle}
        className={className}
      >
        <div
          data-sign-up-sheet-announcer=""
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
        {children}
      </div>
    </SignUpSheetContext>
  )
}
