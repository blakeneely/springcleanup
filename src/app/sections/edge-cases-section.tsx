import type { SlotColumn, Theme } from '@component-library/sign-up-sheet'
import {
  DateSection,
  SheetHeader,
  SignUpSheet,
  SignUpSheetProvider,
  SlotRow,
  SlotTable,
  useSignUpSheetState
} from '@component-library/sign-up-sheet'
import { useState } from 'react'

import {
  compoundDemoSheet,
  currentUser,
  emptySheet,
  groupWithNoSlotsSheet,
  overCapacitySheet,
  slotsOnlySheet
} from '../demo-data'
import { Section } from '../section'

const COMPOUND_COLUMNS: readonly SlotColumn[] = ['slot']

const readOnlyPreviewSheet = {
  ...slotsOnlySheet,
  slots: slotsOnlySheet.slots.slice(0, 4)
}

function ReadOnlyCard() {
  return (
    <article
      data-edge-card="read-only"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Read-only mode
      </div>
      <div className="p-3">
        <SignUpSheet data={readOnlyPreviewSheet} />
      </div>
    </article>
  )
}

function ErrorStateCard() {
  const state = useSignUpSheetState(
    {
      type: 'slots-only',
      title: 'Error state',
      slots: [
        {
          id: 'fail-1',
          label: 'Bring deserts',
          capacity: 2,
          participants: []
        }
      ]
    },
    {
      currentUser,
      simulatedLatencyMs: 100,
      simulatedErrorRate: 1,
      initialSlotErrors: { 'fail-1': 'Simulated failure' }
    }
  )
  return (
    <article
      data-edge-card="error"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Inline error
      </div>
      <div className="p-3">
        <SignUpSheet
          data={state.data}
          currentUser={state.currentUser}
          pendingSlotIds={state.pendingSlotIds}
          slotErrors={state.slotErrors}
          onSlotJoin={state.joinSlot}
          onSlotLeave={state.leaveSlot}
        />
      </div>
    </article>
  )
}

function PendingStateCard() {
  const state = useSignUpSheetState(
    {
      type: 'slots-only',
      title: 'Pending state',
      slots: [
        {
          id: 'pending-1',
          label: 'Slow sign-up (3s)',
          capacity: 3,
          participants: []
        }
      ]
    },
    {
      currentUser,
      simulatedLatencyMs: 3000
    }
  )
  return (
    <article
      data-edge-card="pending"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Artificial 3s latency
      </div>
      <div className="p-3">
        <SignUpSheet
          data={state.data}
          currentUser={state.currentUser}
          pendingSlotIds={state.pendingSlotIds}
          slotErrors={state.slotErrors}
          onSlotJoin={state.joinSlot}
          onSlotLeave={state.leaveSlot}
        />
      </div>
    </article>
  )
}

function LoadingStateCard() {
  return (
    <article
      data-edge-card="loading"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Loading skeleton
      </div>
      <div className="p-3">
        <SignUpSheet data={slotsOnlySheet} loading loadingRowCount={4} />
      </div>
    </article>
  )
}

function EmptySheetCard() {
  return (
    <article
      data-edge-card="empty-sheet"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Empty sheet
      </div>
      <div className="p-3">
        <SignUpSheet data={emptySheet} />
      </div>
    </article>
  )
}

function EmptyGroupCard() {
  return (
    <article
      data-edge-card="empty-group"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Empty date group
      </div>
      <div className="p-3">
        <SignUpSheet data={groupWithNoSlotsSheet} defaultExpandedMode="all" />
      </div>
    </article>
  )
}

function OverCapacityCard() {
  return (
    <article
      data-edge-card="over-capacity"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Over-capacity slot (dev console.error)
      </div>
      <div className="p-3">
        <SignUpSheet data={overCapacitySheet} currentUser={currentUser} />
      </div>
    </article>
  )
}

function CompoundApiCard() {
  const state = useSignUpSheetState(compoundDemoSheet, { currentUser })
  if (!state.data || state.data.type !== 'slots-only') return null
  return (
    <article
      data-edge-card="compound"
      className="border border-border bg-surface-elevated"
    >
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Compound API (manual composition)
      </div>
      <div className="p-3">
        <SignUpSheetProvider
          currentUser={state.currentUser}
          pendingSlotIds={state.pendingSlotIds}
          slotErrors={state.slotErrors}
          onSlotJoin={state.joinSlot}
          onSlotLeave={state.leaveSlot}
        >
          <div className="flex flex-col gap-3">
            <SheetHeader
              title={state.data.title}
              description={state.data.description}
            />
            <DateSection
              id="compound-group"
              label="Walk-up volunteers"
              forceOpen
            >
              <SlotTable
                columns={COMPOUND_COLUMNS}
                ariaLabel="Walk-up volunteers"
              >
                {state.data.slots.map(slot => (
                  <SlotRow
                    key={slot.id}
                    slot={slot}
                    columns={COMPOUND_COLUMNS}
                  />
                ))}
              </SlotTable>
            </DateSection>
          </div>
        </SignUpSheetProvider>
      </div>
    </article>
  )
}

export function EdgeCasesSection() {
  const [theme, setTheme] = useState<Theme>('boba')
  return (
    <Section
      title="States &amp; edge cases"
      caption="Read-only, pending, error, loading, empty, over-capacity, and compound API."
      theme={theme}
      onThemeChange={setTheme}
      variant="cards"
    >
      <div className="columns-1 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid lg:columns-2">
        <LoadingStateCard />
        <ErrorStateCard />
        <PendingStateCard />
        <ReadOnlyCard />
        <EmptySheetCard />
        <EmptyGroupCard />
        <OverCapacityCard />
        <CompoundApiCard />
      </div>
    </Section>
  )
}
