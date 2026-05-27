import type { Participant } from '../primitives/types'

export type SlotData = {
  /** Stable identifier - used as React key and join/leave callback arg. */
  id: string
  /** Primary slot label (e.g. `'Trail clearing'`). */
  label: string
  /** Optional supporting copy shown beneath the label. */
  description?: string
  /** Maximum participant units the slot can hold. */
  capacity: number
  /** Current participants. Capacity = sum of each participant's `quantity ?? 1`. */
  participants: Participant[]
  /** Pre-formatted date string (date-aware layouts only). */
  date?: string
  /** Pre-formatted weekday string (date-aware layouts only). */
  weekday?: string
  /** Pre-formatted time string. */
  time?: string
  /** Free-form location label. */
  location?: string
}

export type SlotGroupData = {
  /** Stable identifier for the group. */
  id: string
  /** Group heading text (often a formatted date). */
  label: string
  /** Slots belonging to this group, in display order. */
  slots: SlotData[]
}

export type SortByDateSheet = {
  /** Discriminator. Selects the `<SortByDateLayout>` renderer. */
  type: 'sort-by-date'
  /** Sheet title. */
  title: string
  /** Optional sheet description. */
  description?: string
  /** Slot groups, each typically a date heading + its slots. */
  slotGroups: SlotGroupData[]
  /** Optional timezone label rendered in the header note. */
  timeZone?: string
}

export type SlotsOnlySheet = {
  /** Discriminator. Selects the `<SlotsOnlyLayout>` renderer. */
  type: 'slots-only'
  /** Sheet title. */
  title: string
  /** Optional sheet description. */
  description?: string
  /** Flat list of slots - no date grouping. */
  slots: SlotData[]
}

/**
 * Discriminated union of every sheet shape the library can render. The
 * top-level `<SignUpSheet>` dispatches on `type`.
 */
export type SignUpSheetData = SortByDateSheet | SlotsOnlySheet

/** Named theme - selects a set of `[data-theme="..."]` token values. */
export type Theme = 'light' | 'dark' | 'mando' | 'boba'

/**
 * Per-sheet token overrides applied as inline CSS custom properties.
 * Every field is optional; only the ones you supply override the active
 * theme's tokens for the wrapped sheet instance.
 */
export type ThemeOverride = {
  /** `--color-surface` */
  surface?: string
  /** `--color-surface-elevated` */
  surfaceElevated?: string
  /** `--color-fg` */
  fg?: string
  /** `--color-fg-muted` */
  fgMuted?: string
  /** `--color-headline` */
  headline?: string
  /** `--color-headline-fg` */
  headlineFg?: string
  /** `--color-accent` */
  accent?: string
  /** `--color-accent-fg` */
  accentFg?: string
  /** `--color-success` */
  success?: string
  /** `--color-danger` */
  danger?: string
  /** `--color-border` */
  border?: string
}

/**
 * Initial section-expansion behavior for date-grouped layouts.
 * `'all'` opens everything; `'none'` collapses everything; `'auto'`
 * defers to `collapseThreshold`.
 */
export type DefaultExpandedMode = 'all' | 'none' | 'auto'

/**
 * Every consumer-overridable string the library produces. Each value is a
 * template that may contain `{name}` placeholders the library substitutes
 * at render time. Provide a `Partial<Messages>` to override individual
 * keys; missing keys fall back to the English defaults.
 */
export type Messages = {
  /** Header note. Placeholders: `{timeZone}`. */
  timeZoneNote: string
  /** Capacity-pill label when the slot is at or above capacity. */
  slotFull: string
  /** Capacity-pill remaining template (singular). Placeholders: `{count}`. */
  slotsRemainingOne: string
  /** Capacity-pill remaining template (plural). Placeholders: `{count}`. */
  slotsRemainingOther: string
  /** Capacity-pill filled summary. Placeholders: `{filled}`, `{total}`. */
  slotsFilledOfTotal: string
  /** Action label when the slot is available. */
  signUp: string
  /** Action label when the slot is full (button is `aria-disabled`). */
  signUpFull: string
  /** Action label when the current user is already in the slot. */
  leave: string
  /** Pending join label (action is `aria-busy`). */
  signingUp: string
  /** Pending leave label (action is `aria-busy`). */
  leaving: string
  /** Inline error message when a join fails. */
  joinError: string
  /** Inline error message when a leave fails. */
  leaveError: string
  /** Live-region announcement on self-join. Placeholders: `{slotLabel}`, `{remaining}`. */
  signedUpAnnouncement: string
  /** Live-region announcement on self-leave. Placeholders: `{slotLabel}`. */
  leftAnnouncement: string
  /** Overflow expander label. Placeholders: `{count}`. */
  showMoreParticipants: string
  /** Label that collapses the participant overflow back to the cap. */
  showFewerParticipants: string
  /** Empty-state message when the sheet has no slots. */
  emptySheet: string
  /** Empty-state message for an empty group. */
  emptyGroup: string
  /** Empty-state message for an empty date group. Placeholders: `{group}`. */
  emptyDateGroup: string
  /** Loading-skeleton live-region label. */
  loadingSheet: string
  /** "You" pill label shown in place of the current user's name. */
  you: string
}
