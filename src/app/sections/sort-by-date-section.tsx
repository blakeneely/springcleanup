import type { Theme } from '@component-library/sign-up-sheet'
import {
  SignUpSheet,
  useSignUpSheetState
} from '@component-library/sign-up-sheet'
import { useState } from 'react'

import { currentUser } from '../demo-data'
import { mockApi } from '../mock-api'
import { Section } from '../section'
import { useFetchSortByDateSheet } from '../use-fetch-sheet'

export function SortByDateSection() {
  const [theme, setTheme] = useState<Theme>('default')
  const { data, loading } = useFetchSortByDateSheet()
  const state = useSignUpSheetState(data, {
    currentUser,
    onJoin: (slotId, user) => mockApi.joinSlot(slotId, user.id),
    onLeave: (slotId, user) => mockApi.leaveSlot(slotId, user.id)
  })

  return (
    <Section
      title="Sort-by-date layout"
      caption="Wired-up table layout with realistic data, live join/leave, and the live a11y region."
      theme={theme}
      onThemeChange={setTheme}
    >
      <SignUpSheet
        data={state.data}
        currentUser={state.currentUser}
        pendingSlotIds={state.pendingSlotIds}
        slotErrors={state.slotErrors}
        loading={loading}
        loadingRowCount={8}
        timeZone="EDT"
        onSlotJoin={state.joinSlot}
        onSlotLeave={state.leaveSlot}
      />
    </Section>
  )
}
