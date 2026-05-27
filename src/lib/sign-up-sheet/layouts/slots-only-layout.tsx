import { SheetHeader } from '../sheet-header'
import { Slot } from '../slot'
import type { SlotColumn } from '../slot'
import { SlotTable } from '../slot-table'
import { useSignUpSheetContext } from '../state/context'
import type { SlotsOnlySheet } from '../types'

export type SlotsOnlyLayoutProps = {
  data: SlotsOnlySheet
  className?: string
}

const COLUMNS: readonly SlotColumn[] = ['slot']

export function SlotsOnlyLayout({ data, className }: SlotsOnlyLayoutProps) {
  const { messages } = useSignUpSheetContext()

  return (
    <div
      data-sign-up-sheet-layout="slots-only"
      className={`flex flex-col ${className ?? ''}`}
    >
      <SheetHeader title={data.title} description={data.description} />
      {data.slots.length === 0 ? (
        <p data-empty-sheet className="px-4 py-3 text-sm text-fg-muted">
          {messages.emptySheet}
        </p>
      ) : (
        <SlotTable columns={COLUMNS} ariaLabel={data.title}>
          {data.slots.map(slot => (
            <Slot key={slot.id} slot={slot} columns={COLUMNS} />
          ))}
        </SlotTable>
      )}
    </div>
  )
}
