import type { Theme } from '@component-library/sign-up-sheet'
import {
  SignUpSheet,
  useSignUpSheetState
} from '@component-library/sign-up-sheet'
import { useState } from 'react'

import { currentUser } from '../demo-data'
import { mockApi } from '../mock-api'
import { Section } from '../section'
import { useFetchSlotsOnlySheet } from '../use-fetch-sheet'

export function SlotsOnlySection() {
  const [theme, setTheme] = useState<Theme>('mando')
  const { data, loading } = useFetchSlotsOnlySheet()
  const state = useSignUpSheetState(data, {
    currentUser,
    onJoin: (slotId, user) => mockApi.joinSlot(slotId, user.id),
    onLeave: (slotId, user) => mockApi.leaveSlot(slotId, user.id)
  })

  return (
    <Section
      title="Slots-only layout"
      caption="Flat list, no date columns. Participants with quantity > 1 occupy multiple capacity units."
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
        onSlotJoin={state.joinSlot}
        onSlotLeave={state.leaveSlot}
      />
    </Section>
  )
}
