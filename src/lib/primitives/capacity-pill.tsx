export type CapacityPillMessages = {
  /** Label shown when the slot is at or above capacity. */
  slotFull?: string
  /** Singular remaining-template ("`{count} spot remaining`"). */
  slotsRemainingOne?: string
  /** Plural remaining-template ("`{count} spots remaining`"). */
  slotsRemainingOther?: string
  /** Filled-summary template ("`{filled} of {total} spots filled`"). */
  slotsFilledOfTotal?: string
}

export type CapacityPillProps = {
  /** Maximum participant units the slot can hold. */
  capacity: number
  /**
   * Currently-filled units (summed across participants, respecting each
   * participant's `quantity`). Values above `capacity` clamp to "Full".
   */
  filled: number
  /**
   * Optional message overrides. Any keys you omit fall back to the
   * English defaults baked into the primitive.
   */
  messages?: CapacityPillMessages
  /** Optional extra classes applied to the pill. */
  className?: string
}

const DEFAULTS = {
  slotFull: 'Full',
  slotsRemainingOne: '{count} spot remaining',
  slotsRemainingOther: '{count} spots remaining',
  slotsFilledOfTotal: '{filled} of {total} spots filled'
} satisfies Required<CapacityPillMessages>

function substitute(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`
  )
}

export function CapacityPill({
  capacity,
  filled,
  messages,
  className
}: CapacityPillProps) {
  const safeFilled = Math.max(0, filled)
  const safeCapacity = Math.max(0, capacity)
  const remaining = Math.max(0, safeCapacity - safeFilled)
  const isFull = remaining === 0

  const merged = { ...DEFAULTS, ...messages }
  const base =
    'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold'

  if (isFull) {
    return (
      <span
        data-capacity-state="full"
        className={`${base} bg-fg-muted/25 text-fg ${className ?? ''}`}
      >
        {merged.slotFull}
      </span>
    )
  }

  const filledOfTotal = substitute(merged.slotsFilledOfTotal, {
    filled: safeFilled,
    total: safeCapacity
  })
  const remainingText = substitute(
    remaining === 1 ? merged.slotsRemainingOne : merged.slotsRemainingOther,
    { count: remaining }
  )

  return (
    <span
      data-capacity-state="open"
      className={`${base} bg-marker text-marker-fg ${className ?? ''}`}
    >
      {filledOfTotal} · {remainingText}
    </span>
  )
}
