import type { ReactNode } from 'react'

import type { SlotColumn } from './slot'

export type SlotTableProps = {
  /**
   * The columns to render, in order. Drives both the visible header row
   * and the desktop grid template. `['slot']` produces a single-column
   * table; `['date', 'location', 'time', 'slot']` produces the
   * sort-by-date layout.
   */
  columns: readonly SlotColumn[]
  /**
   * Optional per-column header label overrides. Any key you omit falls
   * back to the English default (e.g. `"Date"`, `"Available Slot"`).
   */
  headers?: Partial<Record<SlotColumn, string>>
  /** `<Slot>` children that make up the table body. */
  children: ReactNode
  /** Optional extra classes applied to the table wrapper. */
  className?: string
  /**
   * Accessible label applied to the inner `<ul>` so screen readers can
   * announce the list's purpose.
   */
  ariaLabel?: string
}

const DEFAULT_HEADERS: Record<SlotColumn, string> = {
  date: 'Date',
  location: 'Location',
  time: 'Time',
  slot: 'Available Slot'
}

export function SlotTable({
  columns,
  headers,
  children,
  className,
  ariaLabel
}: SlotTableProps) {
  const columnsKey = columns.join(',')
  return (
    <div data-slot-table className={className ?? undefined}>
      <div
        data-slot-table-header
        data-columns={columnsKey}
        aria-hidden="true"
        className="hidden border-b border-border bg-surface text-fg-muted md:block"
      >
        {columns.map(col => (
          <div
            key={col}
            data-slot-column-header={col}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          >
            {headers?.[col] ?? DEFAULT_HEADERS[col]}
          </div>
        ))}
      </div>
      <ul
        data-slot-table-body
        data-columns={columnsKey}
        aria-label={ariaLabel}
        className="m-0 list-none p-0"
      >
        {children}
      </ul>
    </div>
  )
}
