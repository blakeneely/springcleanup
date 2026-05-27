import type { Theme } from '@component-library/sign-up-sheet'
import {
  SignUpSheet,
  useSignUpSheetState
} from '@component-library/sign-up-sheet'
import { useEffect, useState } from 'react'

import { currentUser, slotsOnlySheet } from '../demo-data'
import { Section } from '../section'

export function SlotsOnlySection() {
  const [theme, setTheme] = useState<Theme>('mando')
  const [loading, setLoading] = useState(true)
  const state = useSignUpSheetState(slotsOnlySheet, { currentUser })

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timeout)
  }, [])

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
        loadingRowCount={5}
        onSlotJoin={state.joinSlot}
        onSlotLeave={state.leaveSlot}
      />
    </Section>
  )
}
