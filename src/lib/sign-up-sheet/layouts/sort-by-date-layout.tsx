import { format } from '../messages/format'
import { SheetHeader } from '../sheet-header'
import { Slot } from '../slot'
import type { SlotColumn } from '../slot'
import { SlotGroup } from '../slot-group'
import { SlotTable } from '../slot-table'
import { useSignUpSheetContext } from '../state/context'
import type { SortByDateSheet } from '../types'

export type SortByDateLayoutProps = {
  data: SortByDateSheet
  className?: string
}

const COLUMNS: readonly SlotColumn[] = ['date', 'location', 'time', 'slot']

export function SortByDateLayout({ data, className }: SortByDateLayoutProps) {
  const { messages } = useSignUpSheetContext()
  const sectionCount = data.slotGroups.length

  return (
    <div
      data-sign-up-sheet-layout="sort-by-date"
      className={`flex flex-col ${className ?? ''}`}
    >
      <SheetHeader title={data.title} description={data.description} />
      {sectionCount === 0 ? (
        <p data-empty-sheet className="px-4 py-3 text-sm text-fg-muted">
          {messages.emptySheet}
        </p>
      ) : (
        data.slotGroups.map(group => (
          <SlotGroup
            key={group.id}
            id={group.id}
            label={group.label}
            sectionCount={sectionCount}
          >
            {group.slots.length === 0 ? (
              <p data-empty-group className="px-4 py-3 text-sm text-fg-muted">
                {format(messages.emptyDateGroup, { group: group.label })}
              </p>
            ) : (
              <SlotTable columns={COLUMNS} ariaLabel={group.label}>
                {group.slots.map(slot => (
                  <Slot key={slot.id} slot={slot} columns={COLUMNS} />
                ))}
              </SlotTable>
            )}
          </SlotGroup>
        ))
      )}
    </div>
  )
}
